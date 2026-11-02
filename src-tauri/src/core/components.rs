//! Private, immutable Python environments. Frontend supplies profile IDs, never commands.
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    process::Stdio,
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, LazyLock,
    },
};
use tauri::{AppHandle, Manager, Runtime};
use tokio::{
    process::Command,
    sync::{Mutex, OwnedRwLockReadGuard, RwLock},
};

pub static USE: LazyLock<Arc<RwLock<()>>> = LazyLock::new(|| Arc::new(RwLock::new(())));
static JOB: LazyLock<Mutex<Option<Operation>>> = LazyLock::new(|| Mutex::new(None));
const PYTHON: &str = "3.12.12";
const SCHEMA: u32 = 1;

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Profile {
    id: &'static str,
    family: &'static str,
    backend: &'static str,
    python: &'static str,
    download_bytes: u64,
    required_bytes: u64,
    supported: bool,
    #[serde(skip)]
    lock: &'static str,
    #[serde(skip)]
    probe: &'static str,
}
fn profiles() -> Vec<Profile> {
    let supported = cfg!(all(target_os = "windows", target_arch = "x86_64"));
    macro_rules! p {
        ($id:literal,$family:literal,$backend:literal,$gib:expr,$probe:literal) => {
            Profile {
                id: $id,
                family: $family,
                backend: $backend,
                python: PYTHON,
                download_bytes: $gib * 1024 * 1024 * 1024,
                required_bytes: ($gib * 4 + 1) * 1024 * 1024 * 1024,
                supported,
                lock: include_str!(concat!("../../components/", $id, ".txt")),
                probe: $probe,
            }
        };
    }
    vec![
        p!("transformers-cpu","transformers","cpu",2,"import torch, transformers, safetensors, peft; assert torch.ones(2).sum().item()==2"),
        p!("transformers-cuda","transformers","cu130",5,"import torch, transformers, safetensors, peft, bitsandbytes, comfy_kitchen; assert torch.ones(2,device='cuda').sum().item()==2"),
        p!("diffusers-cpu","media","cpu",2,"import torch, diffusers, transformers, safetensors, gguf, imageio_ffmpeg; from PIL import Image; assert torch.ones(2).sum().item()==2; imageio_ffmpeg.get_ffmpeg_version()"),
        p!("diffusers-cuda","media","cu130",5,"import torch, diffusers, transformers, safetensors, gguf, comfy_kitchen, imageio_ffmpeg; from PIL import Image; assert torch.ones(2,device='cuda').sum().item()==2; imageio_ffmpeg.get_ffmpeg_version()"),
        p!("onnx-cpu","onnx","cpu",1,"import onnx, onnxruntime as ort, numpy as np; m=onnx.helper.make_model(onnx.helper.make_graph([onnx.helper.make_node('Identity',['x'],['y'])],'probe',[onnx.helper.make_tensor_value_info('x',onnx.TensorProto.FLOAT,[1])],[onnx.helper.make_tensor_value_info('y',onnx.TensorProto.FLOAT,[1])]),opset_imports=[onnx.helper.make_opsetid('',18)],ir_version=9); s=ort.InferenceSession(m.SerializeToString(),providers=['CPUExecutionProvider']); assert s.run(None,{'x':np.array([7],dtype=np.float32)})[0][0]==7"),
        p!("onnx-genai","onnx","cpu",1,"import onnxruntime_genai, onnxruntime, onnx, numpy"),
        p!("video-export","video","cpu",1,"import imageio, imageio_ffmpeg; imageio_ffmpeg.get_ffmpeg_version()"),
        p!("upscale-cpu","upscale","cpu",2,"import torch, numpy; from PIL import Image; assert torch.ones(2).sum().item()==2"),
        p!("upscale-cuda","upscale","cu130",5,"import torch, numpy; from PIL import Image; assert torch.ones(2,device='cuda').sum().item()==2"),
        p!("exllama","transformers","cu128",5,"import torch, exllamav2_ext, exllamav3_ext, transformers, exllamav2, exllamav3; assert torch.ones(2,device='cuda').sum().item()==2"),
    ]
}
fn profile(id: &str) -> Result<Profile, String> {
    profiles()
        .into_iter()
        .find(|p| p.id == id)
        .ok_or_else(|| "COMPONENT_PROFILE".into())
}
fn hash(bytes: &[u8]) -> String {
    format!("{:x}", Sha256::digest(bytes))
}
fn root<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    // Independent of movable model folders and installation location.
    let path = crate::core::app::paths::app_local_data_dir_for(app)
        .map_err(|_| "COMPONENT_STORAGE")?
        .join("components-v1");
    plain(&path)?;
    std::fs::create_dir_all(&path).map_err(|_| "COMPONENT_STORAGE")?;
    plain(&path)?;
    path.canonicalize().map_err(|_| "COMPONENT_STORAGE".into())
}
fn plain(path: &Path) -> Result<(), String> {
    for ancestor in path.ancestors() {
        let Ok(meta) = std::fs::symlink_metadata(ancestor) else {
            continue;
        };
        if meta.file_type().is_symlink() {
            return Err("COMPONENT_STORAGE_LINK".into());
        }
        #[cfg(windows)]
        {
            use std::os::windows::fs::MetadataExt;
            if meta.file_attributes() & 0x400 != 0 {
                return Err("COMPONENT_STORAGE_LINK".into());
            }
        }
    }
    Ok(())
}
fn owned(root: &Path, path: &Path) -> Result<(), String> {
    plain(path)?;
    let resolved = path.canonicalize().map_err(|_| "COMPONENT_STORAGE")?;
    if resolved == root || !resolved.starts_with(root) {
        return Err("COMPONENT_STORAGE".into());
    }
    Ok(())
}
fn python(path: &Path) -> PathBuf {
    if cfg!(windows) {
        path.join("Scripts/python.exe")
    } else {
        path.join("bin/python")
    }
}
fn free_space(path: &Path) -> u64 {
    sysinfo::Disks::new_with_refreshed_list()
        .list()
        .iter()
        .filter(|d| {
            path.starts_with(
                d.mount_point()
                    .canonicalize()
                    .unwrap_or_else(|_| d.mount_point().to_owned()),
            )
        })
        .max_by_key(|d| d.mount_point().as_os_str().len())
        .map(|d| d.available_space())
        .unwrap_or(0)
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Receipt {
    schema: u32,
    platform: String,
    architecture: String,
    python_version: String,
    app_version: String,
    installed_bytes: u64,
    profile: String,
    generation: String,
    lock_hash: String,
    python_hash: String,
    installed_at: u64,
    packages: serde_json::Value,
}
fn receipt(root: &Path, p: &Profile) -> Result<Receipt, String> {
    let r: Receipt = serde_json::from_slice(
        &std::fs::read(root.join(format!("{}.json", p.id))).map_err(|_| "COMPONENT_REQUIRED")?,
    )
    .map_err(|_| "COMPONENT_RECEIPT")?;
    if r.schema != SCHEMA
        || r.platform != std::env::consts::OS
        || r.architecture != std::env::consts::ARCH
        || r.python_version != p.python
        || r.profile != p.id
        || uuid::Uuid::parse_str(&r.generation).is_err()
        || r.lock_hash != hash(p.lock.as_bytes())
    {
        return Err("COMPONENT_RECEIPT".into());
    }
    let dir = root.join(p.id).join(&r.generation);
    owned(root, &dir)?;
    let exe = python(&dir);
    owned(root, &exe)?;
    if hash(&std::fs::read(exe).map_err(|_| "COMPONENT_REQUIRED")?) != r.python_hash {
        return Err("COMPONENT_RECEIPT".into());
    }
    Ok(r)
}
fn write_json(path: &Path, value: &impl Serialize) -> Result<(), String> {
    let tmp = path.with_extension(format!("{}.tmp", uuid::Uuid::new_v4()));
    std::fs::write(
        &tmp,
        serde_json::to_vec_pretty(value).map_err(|_| "COMPONENT_STORAGE")?,
    )
    .map_err(|_| "COMPONENT_STORAGE")?;
    std::fs::rename(tmp, path).map_err(|_| "COMPONENT_STORAGE".into())
}
fn selection(root: &Path) -> HashMap<String, String> {
    std::fs::read(root.join("selection.json"))
        .ok()
        .and_then(|b| serde_json::from_slice(&b).ok())
        .unwrap_or_default()
}
pub async fn lease() -> Result<OwnedRwLockReadGuard<()>, String> {
    USE.clone()
        .try_read_owned()
        .map_err(|_| "COMPONENT_BUSY".into())
}
pub fn configure_python(command: &mut Command, exe: &str) {
    command.env_remove("NOVERA_MANAGED_COMPONENTS");
    if Path::new(exe)
        .ancestors()
        .any(|p| p.file_name().is_some_and(|n| n == "components-v1"))
    {
        command
            .env_remove("PYTHONHOME")
            .env_remove("PYTHONPATH")
            .env_remove("IMAGEIO_FFMPEG_EXE")
            .env("PYTHONUTF8", "1")
            .env("PYTHONNOUSERSITE", "1")
            .env("NOVERA_MANAGED_COMPONENTS", "1");
    }
}
pub fn resolve<R: Runtime>(
    app: &AppHandle<R>,
    external: &str,
    family: &str,
) -> Result<String, String> {
    let value = external.trim();
    if !value.is_empty()
        && !matches!(value, "python" | "python.exe" | "auto")
        && !value.starts_with("managed:")
    {
        // A pre-existing custom interpreter remains an explicit advanced override.
        return Ok(value.into());
    }
    resolve_at(&root(app)?, external, family)
}
fn resolve_at(root: &Path, external: &str, family: &str) -> Result<String, String> {
    let value = external.trim();
    if !value.is_empty()
        && !matches!(value, "python" | "python.exe" | "auto")
        && !value.starts_with("managed:")
    {
        return Ok(value.into());
    }
    let selected = selection(&root);
    let fallback = match family {
        "transformers" => "transformers-cpu",
        "onnx" => "onnx-cpu",
        "video" => "video-export",
        "upscale" => "upscale-cpu",
        _ => "diffusers-cpu",
    };
    let id = value
        .strip_prefix("managed:")
        .unwrap_or_else(|| selected.get(family).map(String::as_str).unwrap_or(fallback));
    let p = profile(id)?;
    if p.family != family {
        return Err("COMPONENT_PROFILE".into());
    }
    let r = receipt(root, &p)?;
    Ok(python(&root.join(p.id).join(r.generation))
        .to_string_lossy()
        .into_owned())
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Snapshot {
    id: String,
    profile: String,
    action: String,
    phase: String,
    error: Option<String>,
    running: bool,
}
struct Operation {
    state: Snapshot,
    cancel: Arc<AtomicBool>,
    root: PathBuf,
}
async fn phase(id: &str, phase: &str) {
    if let Some(job) = JOB.lock().await.as_mut() {
        if job.state.id == id {
            job.state.phase = phase.into();
            let _ = write_json(&job.root.join("operation.json"), &job.state);
        }
    }
}
fn uv<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    let base = app
        .path()
        .resource_dir()
        .map_err(|_| "COMPONENT_UV_MISSING")?;
    let name = if cfg!(windows) { "uv.exe" } else { "uv" };
    [
        base.join(name),
        base.join("resources/bin").join(name),
        base.join("resources/bin/uv-x86_64-pc-windows-msvc.exe"),
    ]
    .into_iter()
    .find(|p| p.is_file())
    .ok_or_else(|| "COMPONENT_UV_MISSING".into())
}
fn command(exe: &Path, root: &Path) -> Command {
    let mut c = Command::new(exe);
    c.kill_on_drop(true)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());
    // Never inherit package indexes, activation or Python injection from the host.
    for (key, _) in std::env::vars_os() {
        let name = key.to_string_lossy();
        if name.starts_with("UV_")
            || name.starts_with("PIP_")
            || name.starts_with("PYTHON")
            || matches!(name.as_ref(), "VIRTUAL_ENV" | "CONDA_PREFIX")
        {
            c.env_remove(key);
        }
    }
    c.env_remove("IMAGEIO_FFMPEG_EXE")
        .env("NOVERA_MANAGED_COMPONENTS", "1")
        .env("PYTHONUTF8", "1")
        .env("UV_PYTHON_INSTALL_DIR", root.join("python"))
        .env("UV_PYTHON_BIN_DIR", root.join("bin"))
        .env("UV_CACHE_DIR", root.join("cache"))
        .env("UV_NO_PROGRESS", "1")
        .env("UV_CONCURRENT_DOWNLOADS", "2")
        .env("UV_CONCURRENT_INSTALLS", "2")
        .env("UV_CONCURRENT_BUILDS", "1")
        .env("PYTHONNOUSERSITE", "1")
        .env("HF_HUB_OFFLINE", "1")
        .env("TRANSFORMERS_OFFLINE", "1");
    #[cfg(windows)]
    c.creation_flags(0x08000000);
    c
}
async fn run(mut c: Command, cancel: &AtomicBool, root: &Path) -> Result<(), String> {
    use tokio::io::AsyncReadExt;
    c.stderr(Stdio::piped());
    let mut child = c.spawn().map_err(|_| "COMPONENT_PROCESS")?;
    let mut stderr = child.stderr.take().ok_or("COMPONENT_PROCESS")?;
    let log = root.join("operation.log");
    plain(&log)?;
    let reader = tokio::spawn(async move {
        let mut tail = Vec::new();
        let mut chunk = [0u8; 4096];
        while let Ok(n) = stderr.read(&mut chunk).await {
            if n == 0 {
                break;
            }
            tail.extend_from_slice(&chunk[..n]);
            if tail.len() > 65536 {
                tail.drain(..tail.len() - 65536);
            }
        }
        let _ = tokio::fs::write(log, tail).await;
    });
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_secs(3600);
    loop {
        if cancel.load(Ordering::SeqCst) || tokio::time::Instant::now() > deadline {
            let _ = child.kill().await;
            let _ = child.wait().await;
            let _ = reader.await;
            return Err(if cancel.load(Ordering::SeqCst) {
                "COMPONENT_CANCELLED"
            } else {
                "COMPONENT_TIMEOUT"
            }
            .into());
        }
        if let Some(status) = child.try_wait().map_err(|_| "COMPONENT_PROCESS")? {
            let _ = reader.await;
            return if status.success() {
                Ok(())
            } else {
                Err("COMPONENT_FAILED".into())
            };
        }
        tokio::time::sleep(std::time::Duration::from_millis(150)).await;
    }
}
async fn verify(
    root: &Path,
    dir: &Path,
    p: &Profile,
    uv: &Path,
    cancel: &AtomicBool,
) -> Result<serde_json::Value, String> {
    owned(root, dir)?;
    let exe = python(dir);
    owned(root, &exe)?;
    let mut check = command(uv, root);
    check
        .args(["--no-config", "pip", "check", "--python"])
        .arg(&exe);
    run(check, cancel, root).await?;
    let mut probe = command(&exe, root);
    probe.args([
        "-I",
        "-B",
        "-c",
        &format!(
            "import sys; assert sys.version_info[:3]==(3,12,12); {}",
            p.probe
        ),
    ]);
    run(probe, cancel, root).await?;
    let inventory = dir.join("novera-packages.json");
    let mut c = command(&exe, root);
    c.args(["-I","-B","-c","import importlib.metadata as m,json,sys; from pathlib import Path; Path(sys.argv[1]).write_text(json.dumps(dict(sorted((d.metadata['Name'],d.version) for d in m.distributions()))),encoding='utf-8')"]).arg(&inventory);
    run(c, cancel, root).await?;
    serde_json::from_slice(&std::fs::read(inventory).map_err(|_| "COMPONENT_PROBE")?)
        .map_err(|_| "COMPONENT_PROBE".into())
}
fn installed_size(path: &Path) -> Result<u64, String> {
    plain(path)?;
    let mut size = 0u64;
    for entry in std::fs::read_dir(path).map_err(|_| "COMPONENT_STORAGE")? {
        let path = entry.map_err(|_| "COMPONENT_STORAGE")?.path();
        plain(&path)?;
        let meta = std::fs::metadata(&path).map_err(|_| "COMPONENT_STORAGE")?;
        size = size
            .checked_add(if meta.is_dir() {
                installed_size(&path)?
            } else {
                meta.len()
            })
            .ok_or("COMPONENT_STORAGE")?;
    }
    Ok(size)
}
async fn perform_at(
    root: PathBuf,
    uv: PathBuf,
    p: &Profile,
    action: &str,
    id: &str,
    cancel: &AtomicBool,
) -> Result<(), String> {
    let _guard = USE.try_write().map_err(|_| "COMPONENT_BUSY")?;
    plain(&root)?;
    // Cross-process lock is OS-held and automatically released after a crash.
    let lock = std::fs::OpenOptions::new()
        .create(true)
        .truncate(false)
        .write(true)
        .open(root.join("operation.lock"))
        .map_err(|_| "COMPONENT_STORAGE")?;
    let _file_lock = lock.try_lock().map_err(|_| "COMPONENT_BUSY")?;
    if action == "uninstall" {
        let dir = root.join(p.id);
        if dir.exists() {
            owned(&root, &dir)?;
            std::fs::remove_dir_all(&dir).map_err(|_| "COMPONENT_STORAGE")?;
        }
        for name in [format!("{}.json", p.id), format!("{}.previous.json", p.id)] {
            let receipt = root.join(name);
            if receipt.exists() {
                std::fs::remove_file(receipt).map_err(|_| "COMPONENT_STORAGE")?;
            }
        }
        let mut selected = selection(&root);
        selected.retain(|_, id| id != p.id);
        write_json(&root.join("selection.json"), &selected)?;
        return Ok(());
    }
    if action == "rollback" {
        let previous = root.join(format!("{}.previous.json", p.id));
        let r: Receipt =
            serde_json::from_slice(&std::fs::read(&previous).map_err(|_| "COMPONENT_RECEIPT")?)
                .map_err(|_| "COMPONENT_RECEIPT")?;
        if r.profile != p.id
            || r.schema != SCHEMA
            || r.lock_hash != hash(p.lock.as_bytes())
            || uuid::Uuid::parse_str(&r.generation).is_err()
        {
            return Err("COMPONENT_RECEIPT".into());
        }
        let packages = verify(&root, &root.join(p.id).join(&r.generation), p, &uv, cancel).await?;
        if packages != r.packages {
            return Err("COMPONENT_RECEIPT".into());
        }
        write_json(&root.join(format!("{}.json", p.id)), &r)?;
        return Ok(());
    }
    if matches!(action, "verify" | "select") {
        let r = receipt(&root, p)?;
        let packages = verify(&root, &root.join(p.id).join(&r.generation), p, &uv, cancel).await?;
        if packages != r.packages {
            return Err("COMPONENT_RECEIPT".into());
        }
    } else {
        if !p.supported {
            return Err("COMPONENT_PLATFORM".into());
        }
        if action == "install" && receipt(&root, p).is_ok() {
            return Ok(());
        }
        if free_space(&root) < p.required_bytes {
            return Err("COMPONENT_SPACE".into());
        }
        let generation = uuid::Uuid::new_v4().to_string();
        let dir = root.join(p.id).join(&generation);
        plain(&dir)?;
        std::fs::create_dir_all(&dir).map_err(|_| "COMPONENT_STORAGE")?;
        owned(&root, &dir)?;
        let result: Result<(), String> = async {
            phase(id, "python").await;
            let mut install = command(&uv, &root);
            install.args(["--no-config", "python", "install", PYTHON, "--no-bin"]);
            run(install, cancel, &root).await?;
            let mut venv = command(&uv, &root);
            venv.args([
                "--no-config",
                "venv",
                "--managed-python",
                "--python",
                PYTHON,
            ])
            .arg(&dir);
            run(venv, cancel, &root).await?;
            phase(id, "installing").await;
            let req = dir.join("requirements.txt");
            std::fs::write(&req, p.lock).map_err(|_| "COMPONENT_STORAGE")?;
            let mut install = command(&uv, &root);
            install
                .args(["--no-config", "pip", "install", "--python"])
                .arg(python(&dir))
                .args([
                    "--only-binary",
                    ":all:",
                    "--require-hashes",
                    "--no-deps",
                    "--default-index",
                    "https://pypi.org/simple",
                ]);
            if p.backend != "cpu" || p.lock.contains("+cpu") {
                install.args([
                    "--index",
                    &format!("https://download.pytorch.org/whl/{}", p.backend),
                    "--index-strategy",
                    "unsafe-best-match",
                ]);
            }
            install.arg("-r").arg(req);
            run(install, cancel, &root).await?;
            phase(id, "verifying").await;
            let packages = verify(&root, &dir, p, &uv, cancel).await?;
            if cancel.load(Ordering::SeqCst) {
                return Err("COMPONENT_CANCELLED".into());
            }
            let r = Receipt {
                schema: SCHEMA,
                platform: std::env::consts::OS.into(),
                architecture: std::env::consts::ARCH.into(),
                python_version: p.python.into(),
                app_version: env!("CARGO_PKG_VERSION").into(),
                installed_bytes: installed_size(&dir)?,
                profile: p.id.into(),
                generation: generation.clone(),
                lock_hash: hash(p.lock.as_bytes()),
                python_hash: hash(&std::fs::read(python(&dir)).map_err(|_| "COMPONENT_PROBE")?),
                installed_at: std::time::SystemTime::now()
                    .duration_since(std::time::UNIX_EPOCH)
                    .unwrap_or_default()
                    .as_secs(),
                packages,
            };
            // Environment stays at its original location: venvs are not relocatable.
            if let Ok(previous) = receipt(&root, p) {
                write_json(&root.join(format!("{}.previous.json", p.id)), &previous)?;
            }
            write_json(&root.join(format!("{}.json", p.id)), &r)
        }
        .await;
        if result.is_err() {
            if owned(&root, &dir).is_ok() {
                let _ = std::fs::remove_dir_all(&dir);
            }
            return result;
        }
    }
    if matches!(action, "select" | "install") {
        let mut selected = selection(&root);
        selected.insert(p.family.into(), p.id.into());
        write_json(&root.join("selection.json"), &selected)?;
    }
    Ok(())
}

#[tauri::command]
pub async fn components_status<R: Runtime>(app: AppHandle<R>) -> Result<serde_json::Value, String> {
    let root = root(&app)?;
    let selected = selection(&root);
    let entries=profiles().iter().map(|p|{
        let r=receipt(&root,p);
        let old=std::fs::read(root.join(format!("{}.json",p.id))).ok().and_then(|b|serde_json::from_slice::<Receipt>(&b).ok());
        let state=if r.is_ok(){"ready"}else if old.is_some_and(|r|r.lock_hash!=hash(p.lock.as_bytes())){"outdated"}else if root.join(format!("{}.json",p.id)).exists(){"error"}else{"absent"};
        let can_rollback=root.join(format!("{}.previous.json",p.id)).is_file();
        serde_json::json!({"profile":p,"state":state,"selected":selected.get(p.family).is_some_and(|id|id==p.id),"receipt":r.ok(),"canRollback":can_rollback})
    }).collect::<Vec<_>>();
    let current = JOB.lock().await.as_ref().map(|j| j.state.clone());
    let operation = current.or_else(|| {
        std::fs::read(root.join("operation.json"))
            .ok()
            .and_then(|b| serde_json::from_slice::<Snapshot>(&b).ok())
            .map(|mut s| {
                if s.running {
                    s.running = false;
                    s.phase = "error".into();
                    s.error = Some("COMPONENT_INTERRUPTED".into())
                }
                s
            })
    });
    Ok(serde_json::json!({"profiles":entries,"freeBytes":free_space(&root),"operation":operation}))
}
#[tauri::command]
pub async fn components_action<R: Runtime>(
    app: AppHandle<R>,
    profile_id: String,
    action: String,
) -> Result<String, String> {
    if action == "cancel" {
        if let Some(j) = JOB.lock().await.as_ref() {
            j.cancel.store(true, Ordering::SeqCst);
        }
        return Ok(String::new());
    }
    if !matches!(
        action.as_str(),
        "install" | "verify" | "repair" | "update" | "select" | "uninstall" | "rollback"
    ) {
        return Err("COMPONENT_ACTION".into());
    }
    let p = profile(&profile_id)?;
    let mut job = JOB.lock().await;
    if job.as_ref().is_some_and(|j| j.state.running) {
        return Err("COMPONENT_BUSY".into());
    }
    let id = uuid::Uuid::new_v4().to_string();
    let cancel = Arc::new(AtomicBool::new(false));
    let root = root(&app)?;
    *job = Some(Operation {
        state: Snapshot {
            id: id.clone(),
            profile: profile_id,
            action: action.clone(),
            phase: "preparing".into(),
            error: None,
            running: true,
        },
        cancel: cancel.clone(),
        root: root.clone(),
    });
    write_json(&root.join("operation.json"), &job.as_ref().unwrap().state)?;
    let job_id = id.clone();
    tauri::async_runtime::spawn(async move {
        let result = match if action == "uninstall" {
            Ok(PathBuf::new())
        } else {
            uv(&app)
        } {
            Ok(uv) => perform_at(root, uv, &p, &action, &job_id, &cancel).await,
            Err(e) => Err(e),
        };
        if let Some(job) = JOB.lock().await.as_mut() {
            if job.state.id == job_id {
                job.state.running = false;
                job.state.phase = if result.is_ok() {
                    "ready"
                } else if cancel.load(Ordering::SeqCst) {
                    "cancelled"
                } else {
                    "error"
                }
                .into();
                job.state.error = result.err();
                let _ = write_json(&job.root.join("operation.json"), &job.state);
            }
        }
    });
    Ok(id)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn rejects_unknown_profiles_and_paths() {
        assert!(profile("../python").is_err());
        assert!(profile("anything").is_err());
        let tmp = tempfile::tempdir().unwrap();
        assert!(owned(tmp.path(), tmp.path()).is_err());
    }
    #[test]
    fn independent_locks_and_binary_only_profiles() {
        let ps = profiles();
        assert_eq!(ps.len(), 10);
        for p in &ps {
            assert!(p.lock.contains("--hash=sha256:"));
            assert!(!p.lock.contains("--trusted-host"));
            assert!(p.required_bytes > p.download_bytes);
            assert_eq!(p.python, PYTHON);
        }
        assert!(profile("exllama").unwrap().lock.contains("torch==2.9.0"));
        assert!(profile("transformers-cuda")
            .unwrap()
            .lock
            .contains("torch==2.14.1"));
        assert!(!profile("video-export").unwrap().lock.contains("torch=="));
    }
    #[test]
    fn damaged_receipts_are_never_ready() {
        let tmp = tempfile::tempdir().unwrap();
        let p = profile("onnx-cpu").unwrap();
        assert!(receipt(tmp.path(), &p).is_err());
        std::fs::write(tmp.path().join("onnx-cpu.json"), b"{}").unwrap();
        assert!(receipt(tmp.path(), &p).is_err());
    }
    #[tokio::test]
    async fn active_workers_block_maintenance() {
        let active = lease().await.unwrap();
        assert!(USE.try_write().is_err());
        drop(active);
        assert!(USE.try_write().is_ok());
    }
    #[test]
    fn defaults_never_fall_back_to_system_python() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(resolve_at(tmp.path(), "python", "onnx").is_err());
        assert!(resolve_at(tmp.path(), "", "media").is_err());
        assert!(resolve_at(tmp.path(), "managed:onnx-cpu", "transformers").is_err());
        assert_eq!(
            resolve_at(tmp.path(), "C:/external Python/python.exe", "media").unwrap(),
            "C:/external Python/python.exe"
        );
    }
    #[tokio::test]
    async fn disk_lock_and_space_fail_before_network() {
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path().canonicalize().unwrap();
        let mut p = profile("video-export").unwrap();
        let file = std::fs::File::create(root.join("operation.lock")).unwrap();
        file.lock().unwrap();
        let cancel = AtomicBool::new(false);
        assert_eq!(
            perform_at(root.clone(), PathBuf::new(), &p, "install", "test", &cancel)
                .await
                .unwrap_err(),
            "COMPONENT_BUSY"
        );
        drop(file);
        p.required_bytes = u64::MAX;
        assert_eq!(
            perform_at(root.clone(), PathBuf::new(), &p, "install", "test", &cancel)
                .await
                .unwrap_err(),
            "COMPONENT_SPACE"
        );
        assert!(!root.join("video-export").exists());
    }
    #[tokio::test]
    async fn failed_install_does_not_publish_a_receipt() {
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path().canonicalize().unwrap();
        let p = profile("video-export").unwrap();
        let marker = root.join("models");
        std::fs::write(&marker, b"keep").unwrap();
        assert!(perform_at(
            root.clone(),
            root.join("missing-uv.exe"),
            &p,
            "install",
            "test",
            &AtomicBool::new(false)
        )
        .await
        .is_err());
        assert!(receipt(&root, &p).is_err());
        assert_eq!(std::fs::read(marker).unwrap(), b"keep");
        assert_eq!(std::fs::read_dir(root.join(p.id)).unwrap().count(), 0);
    }
    #[tokio::test]
    #[ignore = "Explicit network integration; set NOVERA_COMPONENT_TEST_UV to the bundled uv"]
    async fn real_private_video_lifecycle() {
        let uv =
            PathBuf::from(std::env::var_os("NOVERA_COMPONENT_TEST_UV").expect("bundled uv path"));
        let tmp = tempfile::Builder::new()
            .prefix("Novera composants é ")
            .tempdir()
            .unwrap();
        let root = tmp.path().canonicalize().unwrap();
        let p = profile("video-export").unwrap();
        let cancel = AtomicBool::new(false);
        let marker = root.join("user-model.gguf");
        std::fs::write(&marker, b"preserve user files").unwrap();
        perform_at(root.clone(), uv.clone(), &p, "install", "real", &cancel)
            .await
            .unwrap();
        let first = receipt(&root, &p).unwrap();
        assert!(first.packages.get("imageio-ffmpeg").is_some());
        let resolved = resolve_at(&root, "python", "video").unwrap();
        assert!(Path::new(&resolved).starts_with(&root));
        perform_at(root.clone(), uv.clone(), &p, "verify", "real", &cancel)
            .await
            .unwrap();
        perform_at(root.clone(), uv.clone(), &p, "repair", "real", &cancel)
            .await
            .unwrap();
        assert_ne!(receipt(&root, &p).unwrap().generation, first.generation);
        perform_at(root.clone(), uv.clone(), &p, "rollback", "real", &cancel)
            .await
            .unwrap();
        assert_eq!(receipt(&root, &p).unwrap().generation, first.generation);
        // A failed repair leaves the current working environment selected.
        assert!(perform_at(
            root.clone(),
            root.join("bad-uv.exe"),
            &p,
            "repair",
            "real",
            &cancel
        )
        .await
        .is_err());
        assert_eq!(receipt(&root, &p).unwrap().generation, first.generation);
        cancel.store(true, Ordering::SeqCst);
        assert_eq!(
            perform_at(root.clone(), uv.clone(), &p, "repair", "real", &cancel)
                .await
                .unwrap_err(),
            "COMPONENT_CANCELLED"
        );
        cancel.store(false, Ordering::SeqCst);
        perform_at(root.clone(), uv, &p, "uninstall", "real", &cancel)
            .await
            .unwrap();
        assert!(resolve_at(&root, "python", "video").is_err());
        assert!(!root.join(p.id).exists());
        assert!(marker.exists());
    }
    #[tokio::test]
    #[ignore = "Explicit network integration; bundled uv and private Python only"]
    async fn real_private_onnx_inference() {
        let uv =
            PathBuf::from(std::env::var_os("NOVERA_COMPONENT_TEST_UV").expect("bundled uv path"));
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path().canonicalize().unwrap();
        let p = profile("onnx-cpu").unwrap();
        let cancel = AtomicBool::new(false);
        perform_at(root.clone(), uv.clone(), &p, "install", "onnx", &cancel)
            .await
            .unwrap();
        // Installation's probe actually executes an Identity graph in this interpreter.
        let r = receipt(&root, &p).unwrap();
        assert!(r.packages.get("onnxruntime").is_some());
        perform_at(root.clone(), uv.clone(), &p, "verify", "onnx", &cancel)
            .await
            .unwrap();
        perform_at(root, uv, &p, "uninstall", "onnx", &cancel)
            .await
            .unwrap();
    }
    #[tokio::test]
    #[ignore = "Explicit network integration; creates a tiny untrained model, never downloads weights"]
    async fn real_private_transformers_inference() {
        let uv =
            PathBuf::from(std::env::var_os("NOVERA_COMPONENT_TEST_UV").expect("bundled uv path"));
        let tmp = tempfile::tempdir().unwrap();
        let root = tmp.path().canonicalize().unwrap();
        let p = profile("transformers-cpu").unwrap();
        let cancel = AtomicBool::new(false);
        perform_at(root.clone(), uv.clone(), &p, "install", "text", &cancel)
            .await
            .unwrap();
        let exe = resolve_at(&root, "python", "transformers").unwrap();
        let worker = root.join("worker");
        std::fs::create_dir(&worker).unwrap();
        for (name, source) in [
            (
                "server.py",
                include_str!("../../../transformers-server/server.py"),
            ),
            (
                "float_quant.py",
                include_str!("../../../transformers-server/float_quant.py"),
            ),
            (
                "exllama_backend.py",
                include_str!("../../../transformers-server/exllama_backend.py"),
            ),
        ] {
            std::fs::write(worker.join(name), source).unwrap();
        }
        let script = worker.join("smoke.py");
        std::fs::write(&script,r#"
import sys
from pathlib import Path
sys.path.insert(0,str(Path(__file__).parent))
import torch
from transformers import LlamaConfig,LlamaForCausalLM,PreTrainedTokenizerFast
from tokenizers import Tokenizer
from tokenizers.models import WordLevel
from tokenizers.pre_tokenizers import Whitespace
root=Path(__file__).parent/'fixture'
tok=Tokenizer(WordLevel({'[UNK]':0,'[PAD]':1,'[EOS]':2,'Hello':3,'Novera':4},unk_token='[UNK]'))
tok.pre_tokenizer=Whitespace()
tokenizer=PreTrainedTokenizerFast(tokenizer_object=tok,unk_token='[UNK]',pad_token='[PAD]',eos_token='[EOS]')
tokenizer.chat_template="{% for message in messages %}{{ message['content'] }} {% endfor %}"
tokenizer.save_pretrained(root)
model=LlamaForCausalLM(LlamaConfig(vocab_size=5,hidden_size=32,intermediate_size=64,num_hidden_layers=1,num_attention_heads=2,num_key_value_heads=1,max_position_embeddings=256,pad_token_id=1,eos_token_id=2))
model.save_pretrained(root)
from server import Inference
engine=Inference(root,'managed-fixture',128,'cpu')
inputs,options,count=engine.prepare({'model':'managed-fixture','messages':[{'role':'user','content':'Hello Novera'}],'max_tokens':2,'temperature':0})
with torch.inference_mode(): output=engine.model.generate(**inputs,**options)
assert output.shape[1]>count
"#).unwrap();
        let mut c = command(Path::new(&exe), &root);
        c.args(["-I", "-B"]).arg(script);
        run(c, &cancel, &root).await.unwrap();
        // A failing child has a bounded local log and cannot alter a ready receipt.
        let mut c = command(Path::new(&exe), &root);
        c.args([
            "-I",
            "-c",
            "import sys;sys.stderr.write('x'*100000);sys.exit(1)",
        ]);
        assert!(run(c, &cancel, &root).await.is_err());
        assert_eq!(
            std::fs::metadata(root.join("operation.log")).unwrap().len(),
            65536
        );
        assert!(receipt(&root, &p).is_ok());
        perform_at(root, uv, &p, "uninstall", "text", &cancel)
            .await
            .unwrap();
    }
}
