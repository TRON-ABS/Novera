//! Explicitly approved, resumable downloads of the pinned image starter configuration.
//! Destinations live in a user-selected directory, never in the application's source tree.
use futures_util::StreamExt;
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    path::{Path, PathBuf},
    sync::LazyLock,
    time::Duration,
};
use tauri::{AppHandle, Manager, Runtime};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    sync::Mutex,
};
use tokio_util::sync::CancellationToken;

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct FileSpec {
    role: String,
    name: String,
    url: String,
    size: u64,
    sha256: String,
}
fn manifest() -> Vec<FileSpec> {
    [
        ("ggufImageModel", "flux-2-klein-4b-Q4_K_M.gguf", "unsloth/FLUX.2-klein-4B-GGUF/resolve/0084d1df98e2e2137fe776d55170bc4792ec1d66/flux-2-klein-4b-Q4_K_M.gguf", 2604311104, "0b25d143c8469b342bc5af3bce92b783bf6b0636d285f7b2f75e38af63af9a15"),
        ("ggufTextEncoder", "Qwen3-4B-Q4_K_M.gguf", "Qwen/Qwen3-4B-GGUF/resolve/bc640142c66e1fdd12af0bd68f40445458f3869b/Qwen3-4B-Q4_K_M.gguf", 2497280256, "7485fe6f11af29433bc51cab58009521f205840f5b4ae3a32fa7f92e8534fdf5"),
        ("ggufVae", "diffusion_pytorch_model.safetensors", "black-forest-labs/FLUX.2-klein-4B/resolve/e7b7dc27f91deacad38e78976d1f2b499d76a294/vae/diffusion_pytorch_model.safetensors", 168120878, "ca70d2202afe6415bdbcb8793ba8cd99fd159cfe6192381504d6c4d3036e0f04"),
    ].into_iter().map(|(role,name,url,size,sha256)| FileSpec { role: role.into(), name: name.into(), url: format!("https://huggingface.co/{url}"), size, sha256: sha256.into() }).collect()
}
fn nvfp4_manifest() -> Vec<FileSpec> {
    let mut files = manifest();
    files[0] = FileSpec { role: "ggufImageModel".into(), name: "flux-2-klein-4b-nvfp4.safetensors".into(), url: "https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-nvfp4/resolve/1db2b2f776c24b76f1122e5f69ab1949fc620068/flux-2-klein-4b-nvfp4.safetensors".into(), size: 2460413488, sha256: "d8c5007b6a3bbbdfd38538bbcef5101a55dfde81894f58d2e3c8701cdef3542b".into() };
    files
}
fn files_for(variant: &str) -> Vec<FileSpec> {
    if variant == "upscale" {
        [
            ("upscale2", "RealESRGAN_x2plus.pth", "v0.2.1", 67061725, "49fafd45f8fd7aa8d31ab2a22d14d91b536c34494a5cfe31eb5d89c2fa266abb"),
            ("upscale4", "RealESRGAN_x4plus.pth", "v0.1.0", 67040989, "4fa0d38905f75ac06eb49a7951b426670021be3018265fd191d2125df9d682f1"),
        ].into_iter().map(|(role,name,tag,size,sha256)| FileSpec {
            role: role.into(), name: name.into(), size, sha256: sha256.into(),
            url: format!("https://github.com/xinntao/Real-ESRGAN/releases/download/{tag}/{name}"),
        }).collect()
    } else if variant == "nvfp4" {
        nvfp4_manifest()
    } else {
        manifest()
    }
}
async fn probe_nvfp4<R: Runtime>(
    app: &AppHandle<R>,
    python: &str,
) -> Result<serde_json::Value, String> {
    let directory = app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("creation-probe");
    tokio::fs::create_dir_all(&directory)
        .await
        .map_err(|_| "runtime")?;
    let script = directory.join("probe_nvfp4.py");
    tokio::fs::write(
        &script,
        include_str!("../../../media-server/probe_nvfp4.py"),
    )
    .await
    .map_err(|_| "runtime")?;
    tokio::fs::write(
        directory.join("nvfp4_cuda.py"),
        include_str!("../../../media-server/nvfp4_cuda.py"),
    )
    .await
    .map_err(|_| "runtime")?;
    let mut command = tokio::process::Command::new(if python.trim().is_empty() {
        "python"
    } else {
        python
    });
    command
        .arg("-u")
        .arg(script)
        .env("HF_HUB_OFFLINE", "1")
        .env("TRANSFORMERS_OFFLINE", "1")
        .env("TORCHINDUCTOR_CACHE_DIR", directory.join("torch-cache"))
        .kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let output = tokio::time::timeout(Duration::from_secs(45), command.output())
        .await
        .map_err(|_| "runtime")?
        .map_err(|_| "runtime")?;
    if !output.status.success() {
        return Err("runtime".into());
    }
    serde_json::from_slice(&output.stdout).map_err(|_| "runtime".into())
}
#[tauri::command]
pub async fn creation_bundle_nvfp4_probe<R: Runtime>(
    app: AppHandle<R>,
    python: String,
) -> Result<serde_json::Value, String> {
    probe_nvfp4(&app, &python).await
}
const SUBFOLDER: &str = "FLUX.2 Klein 4B";
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Plan {
    #[serde(default)]
    variant: String,
    #[serde(default)]
    python: String,
    token: String,
    directory: PathBuf,
    files: Vec<FileSpec>,
    total: u64,
    available: u64,
}
#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Snapshot {
    plan: Plan,
    phase: String,
    bytes: Vec<u64>,
    verified: Vec<bool>,
    acknowledged: bool,
    error: Option<String>,
    running: bool,
}
#[derive(Default)]
struct ManagerState {
    pending: Option<Plan>,
    job: Option<Snapshot>,
    cancel: CancellationToken,
    loaded: bool,
}
static STATE: LazyLock<Mutex<ManagerState>> = LazyLock::new(|| Mutex::new(ManagerState::default()));
fn state_file<R: Runtime>(app: &AppHandle<R>) -> Result<PathBuf, String> {
    Ok(app
        .path()
        .app_data_dir()
        .map_err(|e| e.to_string())?
        .join("creation-install.json"))
}
async fn load<R: Runtime>(app: &AppHandle<R>, state: &mut ManagerState) -> Result<(), String> {
    if !state.loaded {
        state.loaded = true;
        if let Ok(data) = tokio::fs::read(state_file(app)?).await {
            if let Ok(mut job) = serde_json::from_slice::<Snapshot>(&data) {
                // Trust only our pinned manifest; never execute URLs from a journal.
                if job
                    .plan
                    .files
                    .iter()
                    .map(|f| (&f.name, &f.sha256, f.size))
                    .eq(files_for(&job.plan.variant)
                        .iter()
                        .map(|f| (&f.name, &f.sha256, f.size)))
                    && job.bytes.len() == job.plan.files.len()
                    && job.verified.len() == job.plan.files.len()
                {
                    job.plan.files = files_for(&job.plan.variant);
                    if job.running {
                        job.phase = "paused".into();
                    }
                    job.running = false;
                    state.job = Some(job);
                }
            }
        }
    }
    Ok(())
}
async fn save<R: Runtime>(app: &AppHandle<R>, job: &Snapshot) -> Result<(), String> {
    let path = state_file(app)?;
    tokio::fs::create_dir_all(path.parent().unwrap())
        .await
        .map_err(|e| e.to_string())?;
    let tmp = path.with_extension("partial.json");
    tokio::fs::write(&tmp, serde_json::to_vec(job).map_err(|e| e.to_string())?)
        .await
        .map_err(|e| e.to_string())?;
    tokio::fs::rename(tmp, path)
        .await
        .map_err(|e| e.to_string())
}
fn free_space(path: &Path) -> u64 {
    let disks = sysinfo::Disks::new_with_refreshed_list();
    disks
        .list()
        .iter()
        .filter(|d| {
            path.starts_with(
                d.mount_point()
                    .canonicalize()
                    .unwrap_or_else(|_| d.mount_point().to_path_buf()),
            )
        })
        .max_by_key(|d| d.mount_point().as_os_str().len())
        .map(|d| d.available_space())
        .unwrap_or(0)
}
fn plain(path: &Path) -> Result<(), String> {
    if let Ok(meta) = std::fs::symlink_metadata(path) {
        #[cfg(windows)]
        {
            use std::os::windows::fs::MetadataExt;
            if meta.file_attributes() & 0x400 != 0 {
                return Err("destination".into());
            }
        }
        if meta.file_type().is_symlink() {
            return Err("destination".into());
        }
    }
    Ok(())
}
fn check_destination(plan: &Plan) -> Result<(), String> {
    let parent = plan
        .directory
        .parent()
        .and_then(Path::parent)
        .ok_or("destination")?;
    if !parent.is_dir() || parent.canonicalize().map_err(|_| "destination")? != parent {
        return Err("destination".into());
    }
    plain(plan.directory.parent().unwrap())?;
    plain(&plan.directory)?;
    for file in &plan.files {
        plain(&plan.directory.join(&file.name))?;
        plain(&plan.directory.join(format!("{}.novera-part", file.name)))?;
    }
    Ok(())
}
#[tauri::command]
pub async fn creation_bundle_plan<R: Runtime>(
    app: AppHandle<R>,
    parent: Option<String>,
    variant: Option<String>,
    python: Option<String>,
) -> Result<Plan, String> {
    let variant = variant.unwrap_or_else(|| "gguf".into());
    if !["gguf", "nvfp4", "upscale"].contains(&variant.as_str()) {
        return Err("variant".into());
    }
    let python = python.unwrap_or_else(|| "python".into());
    if variant.starts_with("nvfp4")
        && probe_nvfp4(&app, &python)
            .await?
            .get("eligible")
            .and_then(serde_json::Value::as_bool)
            != Some(true)
    {
        return Err("runtime".into());
    }
    let parent = match parent.filter(|s| !s.is_empty()) {
        Some(p) => PathBuf::from(p),
        None => app
            .path()
            .document_dir()
            .or_else(|_| app.path().download_dir())
            .map_err(|_| "destination")?,
    };
    let parent = parent.canonicalize().map_err(|_| "destination")?;
    let files = files_for(&variant);
    let total = files.iter().map(|f| f.size).sum();
    let plan = Plan {
        variant: variant.clone(),
        python,
        token: uuid::Uuid::new_v4().to_string(),
        directory: parent.join("Novera models").join(if variant == "upscale" {
            "upscale_models"
        } else if variant == "nvfp4" {
            "FLUX.2 Klein 4B NVFP4"
        } else {
            SUBFOLDER
        }),
        files,
        total,
        available: free_space(&parent),
    };
    check_destination(&plan)?;
    STATE.lock().await.pending = Some(plan.clone());
    Ok(plan)
}
#[tauri::command]
pub async fn creation_bundle_status<R: Runtime>(
    app: AppHandle<R>,
) -> Result<Option<Snapshot>, String> {
    let mut state = STATE.lock().await;
    load(&app, &mut state).await?;
    Ok(state.job.clone())
}
async fn hash_matches(
    path: &Path,
    spec: &FileSpec,
    cancel: &CancellationToken,
) -> Result<bool, String> {
    if tokio::fs::metadata(path)
        .await
        .map(|m| m.len())
        .unwrap_or(0)
        != spec.size
    {
        return Ok(false);
    }
    let mut file = tokio::fs::File::open(path)
        .await
        .map_err(|_| "destination")?;
    let mut hash = Sha256::new();
    let mut buffer = vec![0; 1024 * 1024];
    loop {
        if cancel.is_cancelled() {
            return Err("stopped".into());
        }
        let n = file.read(&mut buffer).await.map_err(|_| "verification")?;
        if n == 0 {
            break;
        }
        hash.update(&buffer[..n]);
    }
    Ok(format!("{:x}", hash.finalize()) == spec.sha256)
}
async fn publish(partial: &Path, path: &Path) -> Result<(), String> {
    #[cfg(windows)]
    {
        // MoveFileW refuses to overwrite and also works on exFAT removable drives.
        use std::os::windows::ffi::OsStrExt;
        #[link(name = "kernel32")]
        extern "system" {
            fn MoveFileW(from: *const u16, to: *const u16) -> i32;
        }
        let from: Vec<u16> = partial.as_os_str().encode_wide().chain(Some(0)).collect();
        let to: Vec<u16> = path.as_os_str().encode_wide().chain(Some(0)).collect();
        if unsafe { MoveFileW(from.as_ptr(), to.as_ptr()) } == 0 {
            return Err("destination".into());
        }
    }
    #[cfg(not(windows))]
    {
        tokio::fs::hard_link(partial, path)
            .await
            .map_err(|_| "destination")?;
        tokio::fs::remove_file(partial)
            .await
            .map_err(|_| "destination")?;
    }
    Ok(())
}
fn valid_range(header: &str, offset: u64, total: u64) -> bool {
    header
        .strip_prefix("bytes ")
        .and_then(|s| s.split_once('/'))
        .is_some_and(|(range, size)| {
            size.parse::<u64>().ok() == Some(total)
                && range.split_once('-').is_some_and(|(start, end)| {
                    start.parse::<u64>().ok() == Some(offset)
                        && end.parse::<u64>().ok() == Some(total - 1)
                })
        })
}
async fn progress(index: usize, bytes: u64, phase: &str) {
    let mut state = STATE.lock().await;
    if let Some(job) = &mut state.job {
        if job.running {
            job.bytes[index] = bytes;
            job.phase = phase.into();
        }
    }
}
async fn download(plan: &Plan, cancel: &CancellationToken) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .connect_timeout(Duration::from_secs(30))
        .read_timeout(Duration::from_secs(60))
        .build()
        .map_err(|_| "network")?;
    for (index, spec) in plan.files.iter().enumerate() {
        check_destination(plan)?;
        let path = plan.directory.join(&spec.name);
        let partial = plan.directory.join(format!("{}.novera-part", spec.name));
        progress(index, 0, "verifying").await;
        if !hash_matches(&path, spec, cancel).await? {
            // Never replace a pre-existing user file with different contents.
            if path.exists() {
                return Err("conflict".into());
            }
            let mut offset = tokio::fs::metadata(&partial)
                .await
                .map(|m| m.len())
                .unwrap_or(0);
            if offset > spec.size {
                return Err("verification".into());
            }
            if offset < spec.size {
                let mut request = client.get(&spec.url);
                if offset > 0 {
                    request = request.header(reqwest::header::RANGE, format!("bytes={offset}-"));
                }
                let response = tokio::select! { _=cancel.cancelled()=>return Err("stopped".into()), r=request.send()=>r.map_err(|_|"network")? };
                if response.status() == reqwest::StatusCode::UNAUTHORIZED
                    || response.status() == reqwest::StatusCode::FORBIDDEN
                {
                    return Err("access".into());
                }
                if !response.status().is_success() {
                    return Err("network".into());
                }
                if response.status() == reqwest::StatusCode::PARTIAL_CONTENT {
                    if !response
                        .headers()
                        .get(reqwest::header::CONTENT_RANGE)
                        .and_then(|h| h.to_str().ok())
                        .is_some_and(|s| valid_range(s, offset, spec.size))
                    {
                        return Err("verification".into());
                    }
                } else {
                    offset = 0;
                }
                let mut file = tokio::fs::OpenOptions::new()
                    .create(true)
                    .write(true)
                    .truncate(offset == 0)
                    .append(offset > 0)
                    .open(&partial)
                    .await
                    .map_err(|_| "destination")?;
                let mut stream = response.bytes_stream();
                let mut last = std::time::Instant::now();
                progress(index, offset, "downloading").await;
                loop {
                    let next = tokio::select! {_=cancel.cancelled()=>{file.flush().await.map_err(|_|"space")?; return Err("stopped".into());},chunk=stream.next()=>chunk};
                    let Some(chunk) = next else {
                        break;
                    };
                    let chunk = chunk.map_err(|_| "network")?;
                    if offset + chunk.len() as u64 > spec.size {
                        return Err("verification".into());
                    }
                    file.write_all(&chunk).await.map_err(|_| "space")?;
                    offset += chunk.len() as u64;
                    if last.elapsed() > Duration::from_millis(200) {
                        progress(index, offset, "downloading").await;
                        last = std::time::Instant::now();
                    }
                }
                file.sync_all().await.map_err(|_| "space")?;
            }
            progress(index, spec.size, "verifying").await;
            if !hash_matches(&partial, spec, cancel).await? {
                let _ = tokio::fs::remove_file(&partial).await;
                return Err("verification".into());
            }
            check_destination(plan)?;
            // Atomic no-clobber publication on the same volume.
            publish(&partial, &path).await?;
        }
        let mut state = STATE.lock().await;
        if let Some(job) = &mut state.job {
            job.bytes[index] = spec.size;
            job.verified[index] = true;
        }
    }
    Ok(())
}
#[tauri::command]
pub async fn creation_bundle_action<R: Runtime>(
    app: AppHandle<R>,
    action: String,
    token: Option<String>,
) -> Result<Option<Snapshot>, String> {
    let mut state = STATE.lock().await;
    load(&app, &mut state).await?;
    if action == "acknowledge" {
        if let Some(job) = &mut state.job {
            if job.phase == "ready" {
                job.acknowledged = true;
                save(&app, job).await?;
            }
        }
        return Ok(state.job.clone());
    }
    if action == "pause" || action == "cancel" {
        state.cancel.cancel();
        if let Some(job) = &mut state.job {
            job.phase = if action == "pause" {
                "paused"
            } else {
                "cancelled"
            }
            .into();
            if action == "cancel" && !job.running {
                check_destination(&job.plan)?;
                for spec in &job.plan.files {
                    let _ = tokio::fs::remove_file(
                        job.plan
                            .directory
                            .join(format!("{}.novera-part", spec.name)),
                    )
                    .await;
                }
            }
            save(&app, job).await?;
        }
        return Ok(state.job.clone());
    }
    if state.job.as_ref().is_some_and(|j| j.running) {
        return Err("busy".into());
    }
    let plan = if action == "start" {
        if state
            .job
            .as_ref()
            .is_some_and(|j| !matches!(j.phase.as_str(), "ready" | "cancelled"))
        {
            return Err("busy".into());
        }
        let plan = state
            .pending
            .as_ref()
            .filter(|p| Some(&p.token) == token.as_ref())
            .ok_or("approval")?
            .clone();
        check_destination(&plan)?;
        if free_space(plan.directory.parent().unwrap().parent().unwrap())
            < plan.total + 256 * 1024 * 1024
        {
            return Err("space".into());
        }
        tokio::fs::create_dir_all(&plan.directory)
            .await
            .map_err(|_| "destination")?;
        state.job = Some(Snapshot {
            plan: plan.clone(),
            phase: "downloading".into(),
            bytes: vec![0; plan.files.len()],
            verified: vec![false; plan.files.len()],
            acknowledged: false,
            error: None,
            running: true,
        });
        plan
    } else if action == "resume" {
        let job = state.job.as_mut().ok_or("missing")?;
        if job.phase == "ready" {
            return Ok(Some(job.clone()));
        }
        check_destination(&job.plan)?;
        job.running = true;
        job.error = None;
        job.phase = "downloading".into();
        job.plan.clone()
    } else {
        return Err("action".into());
    };
    state.cancel = CancellationToken::new();
    let cancel = state.cancel.clone();
    save(&app, state.job.as_ref().unwrap()).await?;
    let snapshot = state.job.clone();
    drop(state);
    tauri::async_runtime::spawn(async move {
        let result = download(&plan, &cancel).await;
        let mut state = STATE.lock().await;
        if let Some(job) = &mut state.job {
            job.running = false;
            if cancel.is_cancelled() {
                if job.phase == "cancelled" {
                    for spec in &plan.files {
                        let path = plan.directory.join(format!("{}.novera-part", spec.name));
                        if plain(&path).is_ok() {
                            let _ = tokio::fs::remove_file(path).await;
                        }
                    }
                }
            } else {
                match result {
                    Ok(()) => job.phase = "ready".into(),
                    Err(e) => {
                        job.phase = "error".into();
                        job.error = Some(e);
                    }
                }
            }
            if let Err(e) = save(&app, job).await {
                log::warn!("Unable to persist creation install: {e}");
            }
        }
    });
    Ok(snapshot)
}

#[cfg(test)]
mod tests {
    use super::*;
    #[test]
    fn pinned_files_and_ranges() {
        let files = manifest();
        assert_eq!(files.len(), 3);
        assert_eq!(files.iter().map(|f| f.size).sum::<u64>(), 5269712238);
        assert!(files.iter().all(|f| f.sha256.len() == 64
            && f.url.starts_with("https://huggingface.co/")
            && !f.name.contains('/')));
        assert!(valid_range("bytes 12-99/100", 12, 100));
        assert!(!valid_range("bytes 0-99/100", 12, 100));
        assert!(!valid_range("bytes 12-99/*", 12, 100));
    }
    #[test]
    fn nvfp4_keeps_the_supported_cpu_encoder() {
        let files = files_for("nvfp4");
        let gguf = manifest();
        assert_eq!(files.len(), 3);
        assert_eq!(files[0].size, 2460413488);
        assert!(files[0]
            .url
            .contains("black-forest-labs/FLUX.2-klein-4b-nvfp4"));
        assert_eq!(files[1].sha256, gguf[1].sha256);
        assert_eq!(files[2].sha256, gguf[2].sha256);
    }
    #[test]
    fn official_upscalers_are_pinned_and_separate_from_diffusion() {
        let files = files_for("upscale");
        assert_eq!(files.len(), 2);
        assert_eq!(files.iter().map(|f| f.size).sum::<u64>(), 134102714);
        assert_eq!(files[0].name, "RealESRGAN_x2plus.pth");
        assert_eq!(files[1].name, "RealESRGAN_x4plus.pth");
        assert!(files.iter().all(|f| f.sha256.len() == 64 && f.url.starts_with("https://github.com/xinntao/Real-ESRGAN/releases/download/")));
    }
    async fn fixture(partial: bool, honors_range: bool) {
        use std::io::{Read, Write};
        let root =
            std::env::temp_dir().join(format!("novera-bundle-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        let root = root.canonicalize().unwrap();
        let directory = root.join("Novera models").join(SUBFOLDER);
        std::fs::create_dir_all(&directory).unwrap();
        let content = b"a tiny verified diffusion fixture";
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let addr = listener.local_addr().unwrap();
        let thread = std::thread::spawn(move || {
            let (mut socket, _) = listener.accept().unwrap();
            socket
                .set_read_timeout(Some(Duration::from_secs(5)))
                .unwrap();
            let mut request = [0u8; 4096];
            let n = socket.read(&mut request).unwrap();
            let text = String::from_utf8_lossy(&request[..n]).to_lowercase();
            assert_eq!(text.contains("range: bytes=7-"), partial);
            let (status, extra, body) = if partial && honors_range {
                (
                    "206 Partial Content",
                    format!(
                        "Content-Range: bytes 7-{}/{}\r\n",
                        content.len() - 1,
                        content.len()
                    ),
                    &content[7..],
                )
            } else {
                ("200 OK", String::new(), &content[..])
            };
            write!(
                socket,
                "HTTP/1.1 {status}\r\n{extra}Content-Length: {}\r\nConnection: close\r\n\r\n",
                body.len()
            )
            .unwrap();
            socket.write_all(body).unwrap();
        });
        let spec = FileSpec {
            role: "ggufImageModel".into(),
            name: "tiny.gguf".into(),
            url: format!("http://{addr}/tiny"),
            size: content.len() as u64,
            sha256: format!("{:x}", Sha256::digest(content)),
        };
        if partial {
            std::fs::write(directory.join("tiny.gguf.novera-part"), &content[..7]).unwrap();
        }
        let plan = Plan {
            variant: "gguf".into(),
            python: "python".into(),
            token: "test".into(),
            directory: directory.clone(),
            files: vec![spec.clone()],
            total: spec.size,
            available: 1024,
        };
        download(&plan, &CancellationToken::new()).await.unwrap();
        thread.join().unwrap();
        assert_eq!(std::fs::read(directory.join("tiny.gguf")).unwrap(), content);
        assert!(!directory.join("tiny.gguf.novera-part").exists());
        // Existing files are verified and reused, with no second network request.
        download(&plan, &CancellationToken::new()).await.unwrap();
        let mut tampered = content.to_vec();
        tampered[0] ^= 1;
        std::fs::write(directory.join("tiny.gguf"), &tampered).unwrap();
        assert_eq!(
            download(&plan, &CancellationToken::new())
                .await
                .unwrap_err(),
            "conflict"
        );
        assert_eq!(
            std::fs::read(directory.join("tiny.gguf")).unwrap(),
            tampered
        );
        std::fs::remove_dir_all(root).unwrap();
    }
    #[tokio::test]
    async fn verifies_and_reuses_files() {
        fixture(false, false).await;
    }
    #[tokio::test]
    async fn resumes_partial_files() {
        fixture(true, true).await;
    }
    #[tokio::test]
    async fn safely_restarts_when_server_ignores_range() {
        fixture(true, false).await;
    }
    #[tokio::test]
    async fn pause_keeps_partial_and_never_publishes() {
        use std::io::{Read, Write};
        let root = std::env::temp_dir().join(format!("novera-pause-test-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        let root = root.canonicalize().unwrap();
        let directory = root.join("Novera models").join(SUBFOLDER);
        std::fs::create_dir_all(&directory).unwrap();
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let address = listener.local_addr().unwrap();
        let server = std::thread::spawn(move || {
            let (mut socket, _) = listener.accept().unwrap();
            let mut request = [0u8; 4096];
            socket.read(&mut request).unwrap();
            write!(socket,"HTTP/1.1 200 OK\r\nContent-Length: 4096\r\nConnection: close\r\n\r\nshort first chunk").unwrap();
            std::thread::sleep(Duration::from_millis(300));
        });
        let plan = Plan {
            variant: "gguf".into(),
            python: "python".into(),
            token: "test".into(),
            directory: directory.clone(),
            files: vec![FileSpec {
                role: "ggufImageModel".into(),
                name: "tiny.gguf".into(),
                url: format!("http://{address}/tiny"),
                size: 4096,
                sha256: "0".repeat(64),
            }],
            total: 4096,
            available: 10000,
        };
        let token = CancellationToken::new();
        let stop = token.clone();
        let part = directory.join("tiny.gguf.novera-part");
        let observe = part.clone();
        let cancel = tokio::spawn(async move {
            for _ in 0..200 {
                if tokio::fs::metadata(&observe)
                    .await
                    .map(|m| m.len() > 0)
                    .unwrap_or(false)
                {
                    stop.cancel();
                    return;
                }
                tokio::time::sleep(Duration::from_millis(1)).await;
            }
            panic!("No partial download observed");
        });
        assert_eq!(download(&plan, &token).await.unwrap_err(), "stopped");
        cancel.await.unwrap();
        server.join().unwrap();
        assert!(part.is_file());
        assert!(!directory.join("tiny.gguf").exists());
        std::fs::remove_dir_all(root).unwrap();
    }
}
