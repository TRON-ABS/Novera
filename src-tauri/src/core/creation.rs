//! Offline diffusion jobs, isolated cancellation, and OS-known media folders.
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{collections::HashMap, path::PathBuf, process::Stdio, sync::LazyLock};
use tauri::{AppHandle, Manager, Runtime};
use tokio::{
    process::{Child, Command},
    sync::Mutex,
};

static JOBS: LazyLock<Mutex<HashMap<String, Job>>> = LazyLock::new(|| Mutex::new(HashMap::new()));
const NVFP4: &str = include_str!("../../../media-server/nvfp4_compat.py");
const WORKER: &str = include_str!("../../../media-server/worker.py");
const NATIVE_FP4: &str = include_str!("../../../media-server/nvfp4_cuda.py");
struct Job {
    child: Child,
    directory: PathBuf,
    output: PathBuf,
    staged: PathBuf,
    task: String,
    cancelled: bool,
    delivered: bool,
    cpp: bool,
    pending_cpp: Option<Request>,
    started: std::time::Instant,
}

#[derive(Deserialize, Serialize, Clone)]
pub struct Request {
    task: String,
    prompt: String,
    model: String,
    python: String,
    device: String,
    encoder_device: Option<String>,
    width: u32,
    height: u32,
    steps: u32,
    frames: u32,
    fps: u32,
    seed: u32,
    input_image: Option<String>,
    backend: Option<String>,
    cpp_executable: Option<String>,
    cpp_llm: Option<String>,
    cpp_vae: Option<String>,
    cpp_cfg: Option<f32>,
    #[serde(skip)]
    compat_quantize: bool,
}

fn local_file(value: &str, extensions: &[&str]) -> Result<PathBuf, String> {
    let path = PathBuf::from(value)
        .canonicalize()
        .map_err(|_| "Required local model or engine file is unavailable")?;
    if !path.is_file()
        || !path
            .extension()
            .and_then(|v| v.to_str())
            .is_some_and(|v| extensions.contains(&v.to_ascii_lowercase().as_str()))
    {
        return Err("Unsupported local file format".into());
    }
    if path
        .extension()
        .and_then(|v| v.to_str())
        .is_some_and(|v| v.eq_ignore_ascii_case("gguf"))
    {
        use std::io::Read;
        let mut header = [0u8; 24];
        std::fs::File::open(&path)
            .map_err(|e| e.to_string())?
            .read_exact(&mut header)
            .map_err(|_| "Invalid GGUF header")?;
        if &header[..4] != b"GGUF"
            || ![2, 3].contains(&u32::from_le_bytes(header[4..8].try_into().unwrap()))
        {
            return Err("Invalid GGUF header".into());
        }
    }
    Ok(path)
}

// Inspect bounded GGUF metadata, not its filename; never load model weights to identify its role.
fn gguf_architecture(path: &std::path::Path) -> Option<String> {
    use std::io::Read;
    fn bytes<'a>(data: &'a [u8], pos: &mut usize, size: usize) -> Option<&'a [u8]> {
        let end = pos.checked_add(size)?;
        let value = data.get(*pos..end)?;
        *pos = end;
        Some(value)
    }
    fn u32_at(data: &[u8], pos: &mut usize) -> Option<u32> {
        Some(u32::from_le_bytes(bytes(data, pos, 4)?.try_into().ok()?))
    }
    fn u64_at(data: &[u8], pos: &mut usize) -> Option<u64> {
        Some(u64::from_le_bytes(bytes(data, pos, 8)?.try_into().ok()?))
    }
    fn string(data: &[u8], pos: &mut usize) -> Option<String> {
        let len = usize::try_from(u64_at(data, pos)?).ok()?;
        String::from_utf8(bytes(data, pos, len)?.to_vec()).ok()
    }
    fn skip(data: &[u8], pos: &mut usize, kind: u32, depth: usize) -> Option<()> {
        if depth > 4 {
            return None;
        }
        match kind {
            0 | 1 | 7 => {
                bytes(data, pos, 1)?;
            }
            2 | 3 => {
                bytes(data, pos, 2)?;
            }
            4 | 5 | 6 => {
                bytes(data, pos, 4)?;
            }
            10 | 11 | 12 => {
                bytes(data, pos, 8)?;
            }
            8 => {
                let len = usize::try_from(u64_at(data, pos)?).ok()?;
                bytes(data, pos, len)?;
            }
            9 => {
                let element = u32_at(data, pos)?;
                let length = u64_at(data, pos)?;
                if length > 2_000_000 {
                    return None;
                }
                for _ in 0..length {
                    skip(data, pos, element, depth + 1)?;
                }
            }
            _ => return None,
        };
        Some(())
    }
    let mut data = Vec::new();
    std::fs::File::open(path)
        .ok()?
        .take(16 * 1024 * 1024)
        .read_to_end(&mut data)
        .ok()?;
    if data.get(..4)? != b"GGUF" {
        return None;
    }
    let mut pos = 16;
    let count = u64_at(&data, &mut pos)?;
    if count > 8192 {
        return None;
    }
    for _ in 0..count {
        let key = string(&data, &mut pos)?;
        let kind = u32_at(&data, &mut pos)?;
        if key == "general.architecture" && kind == 8 {
            return string(&data, &mut pos);
        }
        skip(&data, &mut pos, kind, 0)?;
    }
    None
}

pub(super) fn output_directory(task: &str) -> Result<PathBuf, String> {
    let root = match task {
        "image" => dirs::picture_dir(),
        "video" => dirs::video_dir(),
        _ => return Err("Unsupported creation type".into()),
    }
    .ok_or("The operating system media folder is unavailable")?;
    Ok(root.join(if task == "image" {
        "Novera image"
    } else {
        "Novera vidéo"
    }))
}

fn requires_nvfp4(path: &str) -> Result<bool, String> {
    use std::io::Read;
    if !path.to_ascii_lowercase().ends_with(".safetensors") {
        return Ok(false);
    }
    let mut file = std::fs::File::open(path).map_err(|e| e.to_string())?;
    let mut raw = [0u8; 8];
    file.read_exact(&mut raw).map_err(|e| e.to_string())?;
    let size = u64::from_le_bytes(raw);
    if !(2..=64 * 1024 * 1024).contains(&size) {
        return Err("Invalid Safetensors header".into());
    }
    let mut bytes = vec![0; size as usize];
    file.read_exact(&mut bytes).map_err(|e| e.to_string())?;
    let header: Value =
        serde_json::from_slice(&bytes).map_err(|_| "Invalid Safetensors metadata")?;
    let metadata = header
        .get("__metadata__")
        .and_then(|v| v.get("_quantization_metadata"))
        .and_then(Value::as_str);
    let Some(metadata) = metadata else {
        return Ok(false);
    };
    let quant: Value =
        serde_json::from_str(metadata).map_err(|_| "Invalid quantization metadata")?;
    Ok(quant
        .get("layers")
        .and_then(Value::as_object)
        .is_some_and(|layers| {
            layers
                .values()
                .any(|v| v.get("format").and_then(Value::as_str) == Some("nvfp4"))
        }))
}
fn cpp_command(
    request: &Request,
    staged: &std::path::Path,
    config: &Value,
) -> Result<Command, String> {
    let executable = PathBuf::from(request.cpp_executable.as_deref().unwrap())
        .canonicalize()
        .map_err(|e| e.to_string())?;
    let mut cli = Command::new(&executable);
    // Explicit argv, never shell interpolation. Run next to DLLs shipped with the chosen binary.
    cli.current_dir(executable.parent().ok_or("Missing engine directory")?);
    cli.args(["--mode", "img_gen", "--diffusion-model"])
        .arg(
            PathBuf::from(&request.model)
                .canonicalize()
                .map_err(|e| e.to_string())?,
        )
        .arg("--llm")
        .arg(
            PathBuf::from(request.cpp_llm.as_deref().unwrap())
                .canonicalize()
                .map_err(|e| e.to_string())?,
        )
        .arg("--vae")
        .arg(
            PathBuf::from(request.cpp_vae.as_deref().unwrap())
                .canonicalize()
                .map_err(|e| e.to_string())?,
        )
        .arg("--prompt")
        .arg(&request.prompt)
        .arg("--output")
        .arg(&staged)
        .arg("--width")
        .arg(request.width.to_string())
        .arg("--height")
        .arg(request.height.to_string())
        .arg("--steps")
        .arg(request.steps.to_string())
        .arg("--seed")
        .arg(request.seed.to_string())
        .arg("--cfg-scale")
        .arg(request.cpp_cfg.unwrap_or(1.0).to_string())
        .args([
            "--sampling-method",
            "euler",
            "--offload-to-cpu",
            "--vae-tiling",
        ]);
    let mut backends = Vec::new();
    match request.device.as_str() {
        "cpu" => backends.extend(["diffusion=cpu", "vae=cpu"]),
        "cuda" => backends.extend(["diffusion=cuda0", "vae=cuda0"]),
        _ => {}
    }
    match request.encoder_device.as_deref() {
        Some("cpu") => backends.push("te=cpu"),
        Some("cuda") => backends.push("te=cuda0"),
        _ => {}
    }
    if !backends.is_empty() {
        cli.args(["--backend", &backends.join(",")]);
    }
    if let Some(path) = config.get("input_image").and_then(Value::as_str) {
        cli.arg("--ref-image").arg(path);
    }
    if request.compat_quantize {
        // Restrict the compatibility runtime representation to diffusion weights.
        // Preserve the caller's GGUF encoder quantization and the VAE representation.
        cli.args(["--tensor-type-rules", "^model\\.=q8_0"]);
    }
    Ok(cli)
}

fn validate(request: &Request) -> Result<(), String> {
    if !["image", "video"].contains(&request.task.as_str())
        || request.prompt.trim().is_empty()
        || request.prompt.len() > 32_000
        || !["auto", "cpu", "cuda"].contains(&request.device.as_str())
        || !["auto", "cpu", "cuda"].contains(&request.encoder_device.as_deref().unwrap_or("auto"))
        || !(64..=2048).contains(&request.width)
        || !(64..=2048).contains(&request.height)
        || request.width % 16 != 0
        || request.height % 16 != 0
        || !(1..=100).contains(&request.steps)
        || !(1..=257).contains(&request.frames)
        || !(1..=60).contains(&request.fps)
    {
        return Err("Invalid creation parameters".into());
    }
    if request.backend.as_deref() == Some("nvfp4-cuda") {
        if request.task != "image" || request.device == "cpu" || request.input_image.is_some() {
            return Err("NVFP4_NATIVE_UNAVAILABLE".into());
        }
        local_file(&request.model, &["safetensors"])?;
        if !requires_nvfp4(&request.model)? {
            return Err("NVFP4_NATIVE_UNAVAILABLE".into());
        }
        let encoder = local_file(
            request.cpp_llm.as_deref().ok_or("Select Qwen encoder")?,
            &["gguf"],
        )?;
        if gguf_architecture(&encoder).as_deref() != Some("qwen3") {
            return Err("NVFP4_NATIVE_UNAVAILABLE".into());
        }
        local_file(
            request.cpp_vae.as_deref().ok_or("Select FLUX.2 VAE")?,
            &["safetensors"],
        )?;
    } else if request.backend.as_deref() == Some("sdcpp") {
        if request.task != "image"
            || request.prompt.len() > 8000
            || !request.cpp_cfg.unwrap_or(1.0).is_finite()
            || !(0.0..=30.0).contains(&request.cpp_cfg.unwrap_or(1.0))
        {
            return Err("Invalid GGUF image parameters".into());
        }
        let executable = request
            .cpp_executable
            .as_deref()
            .ok_or("Select sd-cli executable")?;
        #[cfg(windows)]
        local_file(executable, &["exe"])?;
        #[cfg(not(windows))]
        if !PathBuf::from(executable).is_file() {
            return Err("Select sd-cli executable".into());
        }
        let image = local_file(&request.model, &["gguf", "safetensors"])?;
        if gguf_architecture(&image).is_some_and(|name| {
            [
                "qwen3", "qwen2", "qwen2moe", "qwen3moe", "llama", "mistral", "gemma", "gemma2",
                "gemma3", "phi2", "phi3", "bert", "gpt2",
            ]
            .contains(&name.as_str())
        }) {
            return Err("CREATION_TEXT_ENCODER_AS_DIFFUSION".into());
        }
        local_file(
            request
                .cpp_llm
                .as_deref()
                .ok_or("Select Qwen text encoder GGUF")?,
            &["gguf", "safetensors"],
        )?;
        local_file(
            request.cpp_vae.as_deref().ok_or("Select FLUX.2 VAE")?,
            &["safetensors", "gguf"],
        )?;
    } else if request
        .backend
        .as_deref()
        .is_some_and(|backend| backend != "diffusers")
    {
        return Err("Unsupported creation backend".into());
    } else if !PathBuf::from(&request.model)
        .join("model_index.json")
        .is_file()
    {
        return Err("Select a complete local Diffusers model folder".into());
    }
    Ok(())
}

/// Validate an imported media configuration without starting any engine or generation.
#[tauri::command]
pub fn creation_check_files(mut request: Request) -> Result<(), String> {
    request.cpp_executable = Some(std::env::current_exe().map_err(|e|e.to_string())?.to_string_lossy().into_owned());
    validate(&request)
}

#[tauri::command]
pub async fn creation_start<R: Runtime>(
    app: AppHandle<R>,
    mut request: Request,
) -> Result<String, String> {
    if request.backend.as_deref() == Some("sdcpp") && request.cpp_executable.as_deref().is_none_or(|s| s.trim().is_empty()) {
        let root = app.path().resource_dir().map_err(|e| e.to_string())?;
        let executable = root.join("resources/image-engine/novera-image-engine.exe");
        if !executable.is_file() { return Err("CREATION_BUNDLED_ENGINE_MISSING".into()); }
        request.cpp_executable = Some(executable.to_string_lossy().into_owned());
    }
    let started = std::time::Instant::now();
    validate(&request)?;
    let mut jobs = JOBS.lock().await;
    // Release old completed process handles; only one GPU creation at a time.
    jobs.retain(|_, job| !job.delivered || !matches!(job.child.try_wait(), Ok(Some(_))));
    for job in jobs.values_mut() {
        if job.child.try_wait().map_err(|e| e.to_string())?.is_none() {
            return Err("CREATION_BUSY".into());
        }
    }
    let id = uuid::Uuid::new_v4().to_string();
    let directory = PathBuf::from(super::app::commands::get_jan_data_folder_path(app))
        .join("creations")
        .join(&id);
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let destination = output_directory(&request.task)?;
    std::fs::create_dir_all(&destination).map_err(|e| e.to_string())?;
    let extension = if request.task == "image" {
        "png"
    } else {
        "mp4"
    };
    let output = destination.join(format!("Novera-{id}.{extension}"));
    let staged = destination.join(format!(".Novera-{id}.partial.{extension}"));
    let mut config = serde_json::to_value(&request).map_err(|e| e.to_string())?;
    config["output"] = json!(output);
    config["staged_output"] = json!(staged);
    config["parent_pid"] = json!(std::process::id());
    if let Some(input) = &request.input_image {
        use base64::Engine;
        let (_, payload) = input
            .split_once(",")
            .filter(|(head, _)| head.starts_with("data:image/") && head.ends_with(";base64"))
            .ok_or("Only image data attachments are supported for editing")?;
        if payload.len() > 32 * 1024 * 1024 {
            return Err("Input image is too large".into());
        }
        let bytes = base64::engine::general_purpose::STANDARD
            .decode(payload)
            .map_err(|e| e.to_string())?;
        let input_path = directory.join("input-image");
        std::fs::write(&input_path, bytes).map_err(|e| e.to_string())?;
        config["input_image"] = json!(input_path);
    }
    let cpp = request.backend.as_deref() == Some("sdcpp");
    let mut compat_models = Vec::new();
    if cpp {
        if requires_nvfp4(&request.model)? {
            compat_models.push(json!({"role":"image","path":request.model}));
        }
        if let Some(path) = request.cpp_llm.as_deref() {
            if requires_nvfp4(path)? {
                compat_models.push(json!({"role":"encoder","path":path}));
            }
        }
    }
    let preparing = !compat_models.is_empty();
    if preparing {
        config["compat_models"] = json!(compat_models);
        config["compat_staging"] = json!(directory.join("compat.partial.safetensors"));
        config["compat_cache"] = json!(directory
            .parent()
            .ok_or("Missing cache parent")?
            .join("compat-cache"));
    }
    let script = directory.join("worker.py");
    if request.backend.as_deref() == Some("nvfp4-cuda") {
        std::fs::write(directory.join("nvfp4_cuda.py"), NATIVE_FP4).map_err(|e| e.to_string())?;
        std::fs::write(directory.join("nvfp4_compat.py"), NVFP4).map_err(|e| e.to_string())?;
        for (component, source) in [
            (
                "transformer/config.json",
                include_str!("../../../media-server/native-flux2-klein-4b/transformer/config.json"),
            ),
            (
                "vae/config.json",
                include_str!("../../../media-server/native-flux2-klein-4b/vae/config.json"),
            ),
            (
                "text_encoder/config.json",
                include_str!(
                    "../../../media-server/native-flux2-klein-4b/text_encoder/config.json"
                ),
            ),
            (
                "scheduler/scheduler_config.json",
                include_str!(
                    "../../../media-server/native-flux2-klein-4b/scheduler/scheduler_config.json"
                ),
            ),
        ] {
            let target = directory.join("native-flux2-klein-4b").join(component);
            std::fs::create_dir_all(target.parent().unwrap()).map_err(|e| e.to_string())?;
            std::fs::write(target, source).map_err(|e| e.to_string())?;
        }
        config["torch_cache"] = json!(directory.join("torch-cache"));
    }
    let config_path = directory.join("request.json");
    std::fs::write(&script, WORKER).map_err(|e| e.to_string())?;
    std::fs::write(
        &config_path,
        serde_json::to_vec(&config).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    let stdout =
        std::fs::File::create(directory.join("progress.jsonl")).map_err(|e| e.to_string())?;
    let stderr = std::fs::File::create(directory.join("error.log")).map_err(|e| e.to_string())?;
    let mut command = if preparing {
        let converter = directory.join("nvfp4_compat.py");
        std::fs::write(&converter, NVFP4).map_err(|e| e.to_string())?;
        let mut python = Command::new(if request.python.trim().is_empty() {
            "python"
        } else {
            &request.python
        });
        python.arg("-u").arg(converter).arg(&config_path);
        python
    } else if cpp {
        cpp_command(&request, &staged, &config)?
    } else {
        let mut python = Command::new(if request.python.trim().is_empty() {
            "python"
        } else {
            &request.python
        });
        python.arg("-u").arg(script).arg(config_path);
        python
    };
    command
        .stdout(Stdio::from(stdout))
        .stderr(Stdio::from(stderr))
        .kill_on_drop(true)
        .env("HF_HUB_OFFLINE", "1")
        .env("TRANSFORMERS_OFFLINE", "1")
        .env("HF_DEACTIVATE_ASYNC_LOAD", "1");
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let child = command.spawn().map_err(|e| {
        format!(
            "{}: {e}",
            if cpp {
                "stable-diffusion.cpp"
            } else {
                "Python / Diffusers"
            }
        )
    })?;
    jobs.insert(
        id.clone(),
        Job {
            child,
            directory,
            output,
            staged,
            task: request.task.clone(),
            cancelled: false,
            delivered: false,
            pending_cpp: if preparing {
                Some(request.clone())
            } else {
                None
            },
            cpp,
            started,
        },
    );
    Ok(id)
}

#[tauri::command]
pub async fn creation_status(id: String) -> Result<Value, String> {
    let mut jobs = JOBS.lock().await;
    let job = jobs.get_mut(&id).ok_or("Unknown generation")?;
    if job.cancelled {
        return Ok(json!({"stage":"cancelled"}));
    }
    let log = std::fs::read_to_string(job.directory.join("progress.jsonl")).unwrap_or_default();
    let progress = if job.cpp && job.pending_cpp.is_none() {
        None
    } else {
        log.lines()
            .rev()
            .find_map(|line| serde_json::from_str::<Value>(line).ok())
    };
    let status = job.child.try_wait().map_err(|e| e.to_string())?;
    if matches!(status, Some(status) if status.success()) && job.pending_cpp.is_some() {
        let transition = (|| -> Result<Child, String> {
            let mut request = job.pending_cpp.take().ok_or("Missing prepared job")?;
            let mut config: Value = serde_json::from_str(
                &std::fs::read_to_string(job.directory.join("request.json"))
                    .map_err(|e| e.to_string())?,
            )
            .map_err(|e| e.to_string())?;
            let root = job
                .directory
                .parent()
                .ok_or("Missing cache directory")?
                .join("compat-cache")
                .canonicalize()
                .map_err(|e| e.to_string())?;
            let paths = progress
                .as_ref()
                .and_then(|v| v.get("paths"))
                .and_then(Value::as_object)
                .ok_or("Preparation did not return model paths")?;
            if requires_nvfp4(&request.model)? && !paths.contains_key("image") {
                return Err("Missing prepared diffusion model".into());
            }
            if request
                .cpp_llm
                .as_deref()
                .is_some_and(|path| requires_nvfp4(path).unwrap_or(true))
                && !paths.contains_key("encoder")
            {
                return Err("Missing prepared text encoder".into());
            }
            for (role, path) in paths {
                let value = path.as_str().ok_or("Invalid prepared model")?;
                let prepared = local_file(value, &["safetensors"])?;
                if !prepared.starts_with(&root)
                    || !prepared
                        .file_name()
                        .and_then(|v| v.to_str())
                        .is_some_and(|v| v.starts_with("nvfp4-v1-"))
                {
                    return Err("Prepared model outside owned cache".into());
                }
                if role == "image" {
                    request.model = prepared.to_string_lossy().to_string();
                } else if role == "encoder" {
                    request.cpp_llm = Some(prepared.to_string_lossy().to_string());
                } else {
                    return Err("Invalid prepared model role".into());
                }
            }
            config["prepared_models"] = json!(paths);
            config["compat_runtime_type"] = json!("diffusion:q8_0; encoder and VAE unchanged");
            request.compat_quantize = true;
            std::fs::write(
                job.directory.join("request.json"),
                serde_json::to_vec(&config).map_err(|e| e.to_string())?,
            )
            .map_err(|e| e.to_string())?;
            let mut command = cpp_command(&request, &job.staged, &config)?;
            command
                .stdout(Stdio::from(
                    std::fs::OpenOptions::new()
                        .append(true)
                        .open(job.directory.join("progress.jsonl"))
                        .map_err(|e| e.to_string())?,
                ))
                .stderr(Stdio::from(
                    std::fs::OpenOptions::new()
                        .append(true)
                        .open(job.directory.join("error.log"))
                        .map_err(|e| e.to_string())?,
                ))
                .kill_on_drop(true);
            #[cfg(windows)]
            command.creation_flags(0x08000000);
            command.spawn().map_err(|e| e.to_string())
        })();
        return match transition {
            Ok(child) => {
                job.child = child;
                Ok(json!({"stage":"generating","progress":-1}))
            }
            Err(error) => {
                job.delivered = true;
                Ok(json!({"stage":"error","error":error}))
            }
        };
    }
    if matches!(status, Some(status) if status.success()) && job.cpp && !job.output.exists() {
        use std::io::{Read, Write};
        let publish = (|| -> Result<(), String> {
            let mut head = [0u8; 8];
            std::fs::File::open(&job.staged)
                .map_err(|_| "GGUF engine did not produce an image")?
                .read_exact(&mut head)
                .map_err(|e| e.to_string())?;
            if &head != b"\x89PNG\r\n\x1a\n" {
                return Err("GGUF engine returned an invalid PNG".into());
            }
            let sidecar = job.output.with_extension("png.json");
            let mut metadata: Value = serde_json::from_str(
                &std::fs::read_to_string(job.directory.join("request.json"))
                    .map_err(|e| e.to_string())?,
            )
            .map_err(|e| e.to_string())?;
            if let Some(object) = metadata.as_object_mut() {
                object.remove("input_image");
                object.remove("staged_output");
                object.remove("parent_pid");
                object.insert(
                    "total_seconds".into(),
                    json!(job.started.elapsed().as_secs_f64()),
                );
            }
            let mut file = std::fs::OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&sidecar)
                .map_err(|e| e.to_string())?;
            let write = file.write_all(
                serde_json::to_string_pretty(&metadata)
                    .map_err(|e| e.to_string())?
                    .as_bytes(),
            );
            drop(file);
            if let Err(error) = write {
                let _ = std::fs::remove_file(&sidecar);
                return Err(error.to_string());
            }
            if let Err(error) = super::creation_cloud::publish_stage(&job.staged, &job.output) {
                let _ = std::fs::remove_file(sidecar);
                return Err(error);
            }
            Ok(())
        })();
        if let Err(error) = publish {
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
            return Ok(json!({"stage":"error","error":error}));
        }
    }
    match status {
        None => Ok(progress
            .unwrap_or(json!({"stage":if job.cpp {"generating"} else {"loading"},"progress":if job.cpp {-1} else {0}}))),
        Some(status) if status.success() && job.output.is_file() => {
            job.delivered = true;
            Ok(
                json!({"stage":"done","progress":100,"task":job.task,"name":job.output.file_name().and_then(|s| s.to_str()),"path":job.output,"generation_seconds":progress.as_ref().and_then(|p| p.get("generation_seconds")).cloned()}),
            )
        }
        Some(_) => {
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
            Ok(
                json!({"stage":"error","error":progress.and_then(|p| p.get("error").cloned()).unwrap_or(json!("Python / Diffusers generation failed; check the configured environment and model"))}),
            )
        }
    }
}

#[tauri::command]
pub async fn creation_cancel(id: String) -> Result<(), String> {
    super::creation_cloud::cancel(&id).await;
    let mut jobs = JOBS.lock().await;
    if let Some(job) = jobs.get_mut(&id) {
        if !job.delivered {
            if job.child.try_wait().map_err(|e| e.to_string())?.is_none() {
                job.child.kill().await.map_err(|e| e.to_string())?;
            }
            job.cancelled = true;
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
        }
    }
    Ok(())
}

fn resolve(task: &str, name: &str) -> Result<PathBuf, String> {
    let extension = name
        .rsplit('.')
        .next()
        .ok_or("Invalid creation extension")?;
    if !(task == "image" && ["png", "jpg", "jpeg", "webp"].contains(&extension)
        || task == "video" && extension == "mp4")
    {
        return Err("Invalid creation type".into());
    }
    let suffix = format!(".{extension}");
    let id = name
        .strip_prefix("Novera-")
        .and_then(|name| name.strip_suffix(suffix.as_str()))
        .ok_or("Invalid creation name")?;
    uuid::Uuid::parse_str(id).map_err(|_| "Invalid creation id")?;
    let root = output_directory(task)?
        .canonicalize()
        .map_err(|e| e.to_string())?;
    let file = root.join(name).canonicalize().map_err(|e| e.to_string())?;
    if !file.starts_with(&root) || !file.is_file() {
        return Err("Creation unavailable".into());
    }
    Ok(file)
}

#[tauri::command]
pub fn creation_resolve(task: String, name: String) -> Result<String, String> {
    Ok(resolve(&task, &name)?.to_string_lossy().to_string())
}

#[tauri::command]
pub fn creation_image_input(name: String) -> Result<String, String> {
    use base64::Engine;
    let file = resolve("image", &name)?;
    if std::fs::metadata(&file).map_err(|e| e.to_string())?.len() > 24 * 1024 * 1024 {
        return Err("Input image is too large".into());
    }
    let bytes = std::fs::read(file).map_err(|e| e.to_string())?;
    let mime = if name.ends_with(".webp") {
        "image/webp"
    } else if name.ends_with(".jpg") || name.ends_with(".jpeg") {
        "image/jpeg"
    } else {
        "image/png"
    };
    Ok(format!(
        "data:{mime};base64,{}",
        base64::engine::general_purpose::STANDARD.encode(bytes)
    ))
}

pub async fn cleanup() {
    let mut jobs = JOBS.lock().await;
    for (_, mut job) in jobs.drain() {
        let _ = job.child.kill().await;
        let _ = std::fs::remove_file(job.staged);
        let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
    }
}
