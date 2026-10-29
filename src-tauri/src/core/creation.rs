//! Offline diffusion jobs, isolated cancellation, and OS-known media folders.
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::{collections::HashMap, path::PathBuf, process::Stdio, sync::LazyLock};
use tauri::{AppHandle, Manager, Runtime};
#[path = "creation_music.rs"]
mod music;
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
    pending_upscale: Option<Request>,
    upscale_source: Option<PathBuf>,
    expected_upscale: Option<(u32, u32)>,
    started: std::time::Instant,
    pending_music: Option<Request>,
    music_request: Option<Request>,
    music_retried: bool,
    music_runtime_path: Option<std::ffi::OsString>,
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
    #[serde(default)]
    duration_seconds: Option<u32>,
    music_lm: Option<String>,
    music_engine: Option<String>,
    music_format: Option<String>,
    music_bitrate: Option<u32>,
    music_lyrics: Option<String>,
    music_bpm: Option<u32>,
    music_language: Option<String>,
    seed: u32,
    input_image: Option<String>,
    backend: Option<String>,
    cpp_executable: Option<String>,
    cpp_llm: Option<String>,
    cpp_vae: Option<String>,
    cpp_cfg: Option<f32>,
    upscale_factor: Option<u32>,
    upscale_model: Option<String>,
    #[serde(skip)]
    compat_quantize: bool,
    #[serde(default)]
    memory_policy: Option<String>,
}

fn local_file(value: &str, extensions: &[&str]) -> Result<PathBuf, String> {
    // Old installer records combined a canonical verbatim prefix with '/'.
    // Windows does not normalize separators after that prefix.
    #[cfg(windows)]
    let normalized = value.replace('/', "\\");
    #[cfg(windows)]
    let value = normalized.as_str();
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

#[cfg(all(test, windows))]
mod installed_path_tests {
    use super::*;
    #[test]
    fn accepts_legacy_verbatim_installer_paths() {
        let root = std::env::temp_dir().join(format!(
            "novera-upscale-path-{}-{}", std::process::id(),
            std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_nanos()
        ));
        std::fs::create_dir(&root).unwrap();
        let file = root.join("RealESRGAN_x2plus.pth");
        std::fs::write(&file, b"fixture").unwrap();
        let root = root.canonicalize().unwrap();
        let mixed = format!("{}/RealESRGAN_x2plus.pth", root.display());
        assert!(PathBuf::from(&mixed).canonicalize().is_err(), "fixture reproduces the original Windows failure");
        assert_eq!(local_file(&mixed, &["pth"]).unwrap(), file.canonicalize().unwrap());
        std::fs::remove_file(file).unwrap();
        std::fs::remove_dir(root).unwrap();
    }
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
        "music" => dirs::audio_dir(),
        _ => return Err("Unsupported creation type".into()),
    }
    .ok_or("The operating system media folder is unavailable")?;
    Ok(root.join(if task == "image" {
        "Novera image"
    } else if task == "music" {
        "Novera musique"
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
    cli.args(["--mode", if request.task == "video" { "vid_gen" } else { "img_gen" }, "--diffusion-model"])
        .arg(
            PathBuf::from(&request.model)
                .canonicalize()
                .map_err(|e| e.to_string())?,
        )
        .arg(if request.task == "video" { "--t5xxl" } else { "--llm" })
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
    // The bundled engine can cut the graph to fit live free VRAM. Reserve space
    // for display/driver allocations instead of planning against all free memory.
    // Keep externally selected engines compatible with their own CLI versions.
    #[cfg(windows)]
    cli.args(["--max-vram", "-0.5"]);
    if request.task == "video" {
        cli.arg("--video-frames").arg(request.frames.to_string())
            .arg("--fps").arg(request.fps.to_string()).args(["--flow-shift", "3.0"]);
    }
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

fn png_dimensions(path: &std::path::Path) -> Result<(u32, u32), String> {
    use std::io::Read;
    let mut header = [0u8; 24];
    std::fs::File::open(path).map_err(|e| e.to_string())?
        .read_exact(&mut header).map_err(|e| e.to_string())?;
    if &header[..8] != b"\x89PNG\r\n\x1a\n" || &header[12..16] != b"IHDR" {
        return Err("CREATION_UPSCALE_INVALID_PNG".into());
    }
    Ok((u32::from_be_bytes(header[16..20].try_into().unwrap()),
        u32::from_be_bytes(header[20..24].try_into().unwrap())))
}

fn validate(request: &Request) -> Result<(), String> {
    if request.task == "music" { return music::validate(request); }
    if let Some(factor) = request.upscale_factor {
        if request.task != "image" || ![2, 4].contains(&factor) {
            return Err("CREATION_UPSCALE_INVALID".into());
        }
        local_file(request.upscale_model.as_deref().ok_or("CREATION_UPSCALE_MISSING")?, &["pth"])
            .map_err(|_| "CREATION_UPSCALE_MISSING")?;
    }
    if !super::creation_policy::valid_memory_policy(request.memory_policy.as_deref())
        || !["image", "video"].contains(&request.task.as_str())
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
        || request.duration_seconds.is_some_and(|seconds| !(1..=3600).contains(&seconds))
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
        if (request.task == "video" && (request.frames < 5 || request.frames % 4 != 1 || request.input_image.is_some()))
            || request.prompt.len() > 8000
            || !request.cpp_cfg.unwrap_or(1.0).is_finite()
            || !(0.0..=30.0).contains(&request.cpp_cfg.unwrap_or(1.0))
        {
            return Err("Invalid GGUF media parameters (Wan T2V requires 4n+1 frames and no input image)".into());
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
        if request.task == "video" && requires_nvfp4(&request.model)? {
            return Err("NVFP4_NATIVE_UNAVAILABLE".into());
        }
        if gguf_architecture(&image).is_some_and(|name| {
            [
                "qwen3", "qwen2", "qwen2moe", "qwen3moe", "llama", "mistral", "gemma", "gemma2",
                "gemma3", "phi2", "phi3", "bert", "gpt2", "t5encoder",
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
pub fn creation_music_models(directory: String) -> Result<Value, String> { music::models(directory) }

#[tauri::command]
pub async fn creation_video_runtime_check(python: String) -> Result<(),String> {
    let mut command=Command::new(if python.trim().is_empty(){"python"}else{&python});
    command.args(["-B","-c","import imageio_ffmpeg; imageio_ffmpeg.get_ffmpeg_version()"])
        .stdout(Stdio::null()).stderr(Stdio::null()).kill_on_drop(true);
    #[cfg(windows)] command.creation_flags(0x08000000);
    let status=tokio::time::timeout(std::time::Duration::from_secs(20),command.status()).await;
    if matches!(status,Ok(Ok(status)) if status.success()) {Ok(())} else {Err("CREATION_VIDEO_RUNTIME_REQUIRED (Python + imageio-ffmpeg)".into())}
}

#[tauri::command]
pub async fn creation_start<R: Runtime>(
    app: AppHandle<R>,
    mut request: Request,
) -> Result<String, String> {
    if let Some(factor) = request.upscale_factor {
        if request.task != "image" || ![2, 4].contains(&factor) {
            return Err("CREATION_UPSCALE_INVALID".into());
        }
        if request.upscale_model.as_deref().is_none_or(|s| s.trim().is_empty()) {
            let name = format!("RealESRGAN_x{factor}plus.pth");
            let model = app.path().document_dir().map_err(|e| e.to_string())?
                .join("Novera models/upscale_models").join(name);
            request.upscale_model = Some(model.to_string_lossy().into_owned());
        }
    }
    // Windows always uses the packaged engine, including for profiles saved with
    // an old absolute development path. Other platforms retain custom runtimes.
    if request.backend.as_deref() == Some("sdcpp")
        && (cfg!(windows)
            || request
                .cpp_executable
                .as_deref()
                .is_none_or(|s| s.trim().is_empty()))
    {
        let root = app.path().resource_dir().map_err(|e| e.to_string())?;
        let executable = root.join("resources/image-engine/novera-image-engine.exe");
        if !executable.is_file() {
            return Err("CREATION_BUNDLED_ENGINE_MISSING".into());
        }
        request.cpp_executable = Some(executable.to_string_lossy().into_owned());
    }
    let started = std::time::Instant::now();
    validate(&request)?;
    if request.upscale_factor.is_some() {
        // Fail before generating an image when the selected Python cannot run
        // the optional upscaler. This process exits before either model loads.
        let mut probe = Command::new(if request.python.trim().is_empty() {
            "python"
        } else {
            &request.python
        });
        probe.args(["-c", "import torch, numpy; from PIL import Image; import sys; assert sys.argv[1] != 'cuda' or torch.cuda.is_available(), 'CUDA unavailable for upscaling'", &request.device]);
        probe.kill_on_drop(true);
        #[cfg(windows)]
        probe.creation_flags(0x08000000);
        let result = tokio::time::timeout(std::time::Duration::from_secs(30), probe.output())
            .await
            .map_err(|_| "CREATION_UPSCALE_RUNTIME: Python/PyTorch check timed out".to_string())?
            .map_err(|e| format!("CREATION_UPSCALE_RUNTIME: Python {}: {e}", request.python))?;
        if !result.status.success() {
            return Err(format!("CREATION_UPSCALE_RUNTIME: Python {}: {}",
                request.python,
                String::from_utf8_lossy(&result.stderr).chars().take(1200).collect::<String>()
            ));
        }
    }
    let mut jobs = JOBS.lock().await;
    // Release completed handles. Automatic requests are exclusive; Manual permits independent workers.
    jobs.retain(|_, job| !job.delivered || !matches!(job.child.try_wait(), Ok(Some(_))));
    for job in jobs.values_mut() {
        if !super::creation_policy::may_start_media(request.memory_policy.as_deref(), job.child.try_wait().map_err(|e| e.to_string())?.is_none()) {
            return Err("CREATION_BUSY".into());
        }
    }
    let id = uuid::Uuid::new_v4().to_string();
    let directory = PathBuf::from(super::app::commands::get_jan_data_folder_path(app.clone()))
        .join("creations")
        .join(&id);
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let destination = output_directory(&request.task)?;
    std::fs::create_dir_all(&destination).map_err(|e| e.to_string())?;
    let extension = if request.task == "image" {
        "png"
    } else if request.task == "music" {
        if request.music_format.as_deref() == Some("mp3") { "mp3" } else { "wav" }
    } else {
        "mp4"
    };
    let output = destination.join(format!("Novera-{id}.{extension}"));
    let staged = destination.join(format!(".Novera-{id}.partial.{extension}"));
    let mut config = serde_json::to_value(&request).map_err(|e| e.to_string())?;
    config["output"] = json!(output);
    config["staged_output"] = json!(staged);
    config["parent_pid"] = json!(std::process::id());
    if request.task == "music" {
        std::fs::write(directory.join("music.json"), serde_json::to_vec(&music::payload(&request)?).map_err(|e|e.to_string())?).map_err(|e|e.to_string())?;
    }
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
    let cpp_video = cpp && request.task == "video";
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
    if request.upscale_factor.is_some() {
        config["upscale_metadata"] = json!(directory.join("generated.json"));
    }
    let config_path = directory.join("request.json");
    std::fs::write(&script, WORKER).map_err(|e| e.to_string())?;
    if request.upscale_factor.is_some() {
        std::fs::write(directory.join("upscale.py"), include_str!("../../../media-server/upscale.py"))
            .map_err(|e| e.to_string())?;
    }
    if cpp_video {
        let command = cpp_command(&request, &directory.join("clip.avi"), &config)?;
        let command = command.as_std();
        let mut argv = vec![command.get_program().to_string_lossy().into_owned()];
        argv.extend(command.get_args().map(|arg| arg.to_string_lossy().into_owned()));
        config["video_command"] = json!(argv);
        config["video_cwd"] = json!(command.get_current_dir());
    }
    if request.task == "video" {
        std::fs::write(directory.join("video_worker.py"), include_str!("../../../media-server/video_worker.py"))
            .map_err(|e| e.to_string())?;
    }
    std::fs::write(
        &config_path,
        serde_json::to_vec(&config).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    let stdout =
        std::fs::File::create(directory.join("progress.jsonl")).map_err(|e| e.to_string())?;
    let stderr = std::fs::File::create(directory.join("error.log")).map_err(|e| e.to_string())?;
    let mut command = if request.task == "music" {
        music::command(&request, &directory, "lm")?
    } else if preparing {
        let converter = directory.join("nvfp4_compat.py");
        std::fs::write(&converter, NVFP4).map_err(|e| e.to_string())?;
        let mut python = Command::new(if request.python.trim().is_empty() {
            "python"
        } else {
            &request.python
        });
        python.arg("-u").arg(converter).arg(&config_path);
        python
    } else if cpp_video {
        let mut python = Command::new(if request.python.trim().is_empty() { "python" } else { &request.python });
        python.arg("-u").arg(directory.join("video_worker.py")).arg(&config_path);
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
    #[cfg(unix)]
    if request.task == "video" { command.process_group(0); }
    let music_runtime_path = if request.task == "music" {
        let mut paths = vec![app.path().resource_dir().map_err(|e|e.to_string())?.join("resources/image-engine/cuda")];
        if let Some(path) = std::env::var_os("PATH") {paths.extend(std::env::split_paths(&path));}
        let path=std::env::join_paths(paths).map_err(|e|e.to_string())?;
        command.env("PATH",&path); Some(path)
    } else {None};
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
            pending_upscale: request.upscale_factor.map(|_| request.clone()),
            upscale_source: None,
            expected_upscale: None,
            cpp: cpp && !cpp_video,
            started,
            pending_music: (request.task == "music").then(|| request.clone()),
            music_request: None,
            music_retried: false,
            music_runtime_path,
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
    let progress = if job.task == "music" || (job.cpp && job.pending_cpp.is_none() && job.expected_upscale.is_none()) {
        None
    } else {
        log.lines()
            .rev()
            .find_map(|line| serde_json::from_str::<Value>(line).ok())
    };
    let status = job.child.try_wait().map_err(|e| e.to_string())?;
    if matches!(status, Some(status) if !status.success()) && music::recoverable(job) {
        match music::recover(job) {
            Ok(child) => {job.child=child;return Ok(json!({"stage":"loading","progress":-1,"device":"cpu","recovery":true}));},
            Err(error) => {job.delivered=true;return Ok(json!({"stage":"error","error":error}));}
        }
    }
    if matches!(status, Some(status) if status.success()) && job.pending_music.is_some() {
        match music::transition(job) {
            Ok(child) => {job.child=child; return Ok(json!({"stage":"loading","progress":35}));},
            Err(error) => {job.delivered=true;return Ok(json!({"stage":"error","error":error}));}
        }
    }
    if matches!(status, Some(status) if status.success()) && job.task == "music" && !job.output.exists() {
        if let Err(error)=music::publish(job) {job.delivered=true;let _=std::fs::remove_file(&job.staged);return Ok(json!({"stage":"error","error":error}));}
    }
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
    if matches!(status, Some(status) if status.success()) && job.pending_upscale.is_some() {
        let transition = (|| -> Result<Child, String> {
            let request = job.pending_upscale.take().ok_or("CREATION_UPSCALE_INVALID")?;
            if png_dimensions(&job.staged)? != (request.width, request.height) {
                return Err("CREATION_UPSCALE_INVALID_PNG".into());
            }
            let factor = request.upscale_factor.ok_or("CREATION_UPSCALE_INVALID")?;
            let output = job.staged.with_file_name(format!(".Novera-{id}.upscaled.partial.png"));
            let mut config = serde_json::to_value(&request).map_err(|e| e.to_string())?;
            config["input_image"] = json!(job.staged);
            config["staged_output"] = json!(output);
            config["parent_pid"] = json!(std::process::id());
            let path = job.directory.join("upscale-request.json");
            std::fs::write(&path, serde_json::to_vec(&config).map_err(|e| e.to_string())?)
                .map_err(|e| e.to_string())?;
            let mut command = Command::new(if request.python.trim().is_empty() { "python" } else { &request.python });
            command.arg("-u").arg(job.directory.join("upscale.py")).arg(path);
            // From this point parse only the owned Python worker's JSON. Never
            // reinterpret raw sd-cli output as trusted progress after transition.
            command.stdout(Stdio::from(std::fs::OpenOptions::new().write(true).truncate(true)
                    .open(job.directory.join("progress.jsonl")).map_err(|e| e.to_string())?))
                .stderr(Stdio::from(std::fs::OpenOptions::new().append(true)
                    .open(job.directory.join("error.log")).map_err(|e| e.to_string())?))
                .kill_on_drop(true);
            #[cfg(windows)]
            command.creation_flags(0x08000000);
            let child = command.spawn().map_err(|e| e.to_string())?;
            job.upscale_source = Some(job.staged.clone());
            job.staged = output;
            job.expected_upscale = Some((request.width * factor, request.height * factor));
            // The native publisher now owns final output for every image backend.
            job.cpp = true;
            Ok(child)
        })();
        return match transition {
            Ok(child) => { job.child = child; Ok(json!({"stage":"upscaling","progress":-1})) },
            Err(error) => {
                job.delivered = true;
                let _ = std::fs::remove_file(&job.staged);
                Ok(json!({"stage":"error","error":format!("CREATION_UPSCALE: {error}")}))
            }
        };
    }
    if matches!(status, Some(status) if status.success()) && job.cpp && !job.output.exists() {
        use std::io::{Read, Write};
        let publish = (|| -> Result<(), String> {
            if let Some(expected) = job.expected_upscale {
                if png_dimensions(&job.staged)? != expected {
                    return Err("CREATION_UPSCALE_FACTOR_MISMATCH".into());
                }
            }
            let mut head = [0u8; 8];
            std::fs::File::open(&job.staged)
                .map_err(|_| "GGUF engine did not produce a media file")?
                .read_exact(&mut head)
                .map_err(|e| e.to_string())?;
            if (job.task == "image" && &head != b"\x89PNG\r\n\x1a\n")
                || (job.task == "video" && head[..4] != [0x1a, 0x45, 0xdf, 0xa3]) {
                return Err("GGUF engine returned an invalid media file".into());
            }
            let sidecar = job.output.with_extension(if job.task == "video" { "webm.json" } else { "png.json" });
            let mut metadata: Value = serde_json::from_str(
                &std::fs::read_to_string(if job.directory.join("generated.json").is_file() {
                    job.directory.join("generated.json")
                } else { job.directory.join("request.json") })
                    .map_err(|e| e.to_string())?,
            )
            .map_err(|e| e.to_string())?;
            if let Some(object) = metadata.as_object_mut() {
                if let Some((width, height)) = job.expected_upscale {
                    object.insert("output_width".into(), json!(width));
                    object.insert("output_height".into(), json!(height));
                }
                object.remove("input_image");
                object.remove("staged_output");
                object.remove("parent_pid");
                object.remove("upscale_metadata");
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
            if let Some(source) = &job.upscale_source { let _ = std::fs::remove_file(source); }
            Ok(())
        })();
        if let Err(error) = publish {
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            if let Some(source) = &job.upscale_source { let _ = std::fs::remove_file(source); }
            let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
            return Ok(json!({"stage":"error","error":error}));
        }
    }
    match status {
        None if job.task == "music" => {
            Ok(music::progress(job))
        },
        None => Ok(progress
            .unwrap_or(json!({"stage":if job.expected_upscale.is_some() {"upscaling"} else if job.cpp {"generating"} else {"loading"},"progress":if job.cpp {-1} else {0}}))),
        Some(status) if status.success() && job.output.is_file() => {
            job.delivered = true;
            let generation_seconds = if job.expected_upscale.is_some() {
                std::fs::read_to_string(job.directory.join("generated.json")).ok()
                    .and_then(|s| serde_json::from_str::<Value>(&s).ok())
                    .and_then(|v| v.get("generation_seconds").cloned())
            } else { progress.as_ref().and_then(|p| p.get("generation_seconds")).cloned() };
            Ok(
                json!({"stage":"done","progress":100,"task":job.task,"name":job.output.file_name().and_then(|s| s.to_str()),"path":job.output,"generation_seconds":generation_seconds}),
            )
        }
        Some(status) => {
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            if let Some(source) = &job.upscale_source { let _ = std::fs::remove_file(source); }
            let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
            Ok(
                json!({"stage":"error","error":progress.and_then(|p| p.get("error").cloned()).unwrap_or_else(|| {
                    let stderr = std::fs::read_to_string(job.directory.join("error.log")).unwrap_or_default();
                    let tail: String = stderr.chars().rev().take(1600).collect::<String>().chars().rev().collect();
                    json!(format!("Media engine exited ({status}): {tail}"))
                })}),
            )
        }
    }
}

/// Drop only completed, delivered processes; never cancel work or remove saved media.
#[tauri::command]
pub async fn creation_release_idle() -> Result<Value, String> {
    let mut jobs=JOBS.lock().await;
    for job in jobs.values_mut() {
        if !job.delivered || job.child.try_wait().map_err(|e|e.to_string())?.is_none() {return Ok(json!({"busy":true}));}
    }
    jobs.clear();
    Ok(json!({"busy":false}))
}

#[tauri::command]
pub async fn creation_cancel(id: String) -> Result<(), String> {
    super::creation_cloud::cancel(&id).await;
    let mut jobs = JOBS.lock().await;
    if let Some(job) = jobs.get_mut(&id) {
        if !job.delivered {
            if job.child.try_wait().map_err(|e| e.to_string())?.is_none() {
                kill_owned_job(job).await?;
            }
            job.cancelled = true;
            job.delivered = true;
            let _ = std::fs::remove_file(&job.staged);
            if let Some(source) = &job.upscale_source { let _ = std::fs::remove_file(source); }
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
        || task == "video" && ["mp4", "webm"].contains(&extension)
        || task == "music" && ["wav", "mp3"].contains(&extension))
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
        let _ = kill_owned_job(&mut job).await;
        let _ = std::fs::remove_file(job.staged);
        let _ = std::fs::remove_file(job.directory.join("compat.partial.safetensors"));
    }
}

async fn kill_owned_job(job: &mut Job) -> Result<(), String> {
    #[cfg(unix)]
    if job.task == "video" {
        if let Some(pid) = job.child.id() {
            // Only video workers are launched as leaders of their own group.
            unsafe { libc::kill(-(pid as i32), libc::SIGKILL); }
        }
    }
    job.child.kill().await.map_err(|e| e.to_string())
}

#[cfg(test)]
mod video_q4_tests {
    use super::*;
    #[test]
    fn video_uses_wan_mode_t5_encoder_frames_and_fps_without_image_flags() {
        let root = std::env::temp_dir().join(format!("novera-video-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        let model = root.join("generator.gguf");
        let encoder = root.join("encoder.gguf");
        let vae = root.join("wan.safetensors");
        let mut header = b"GGUF".to_vec();
        header.extend_from_slice(&3u32.to_le_bytes());
        header.extend_from_slice(&0u64.to_le_bytes());
        header.extend_from_slice(&0u64.to_le_bytes());
        std::fs::write(&model, &header).unwrap();
        std::fs::write(&encoder, &header).unwrap();
        std::fs::write(&vae, b"fixture").unwrap();
        let mut request: Request = serde_json::from_value(json!({
            "task":"video", "prompt":"a landscape", "model":model, "python":"python",
            "device":"auto", "encoder_device":"cpu", "width":832,"height":480,
            "steps":20,"frames":33,"fps":16,"seed":42,"backend":"sdcpp",
            "cpp_executable":std::env::current_exe().unwrap(),"cpp_llm":encoder,"cpp_vae":vae,"cpp_cfg":6.0
        })).unwrap();
        validate(&request).unwrap();
        let command = cpp_command(&request, &root.join("output.webm"), &json!({})).unwrap();
        let args: Vec<_> = command.as_std().get_args().map(|a| a.to_string_lossy().into_owned()).collect();
        for (flag, value) in [("--mode","vid_gen"),("--video-frames","33"),("--fps","16"),("--flow-shift","3.0")] {
            let index = args.iter().position(|arg| arg == flag).unwrap();
            assert_eq!(args[index + 1], value);
        }
        assert!(args.iter().any(|a| a == "--t5xxl"));
        assert!(!args.iter().any(|a| a == "--llm" || a == "--ref-image"));
        request.frames = 32;
        assert!(validate(&request).is_err());
        request.frames = 33;
        request.duration_seconds = Some(3600);
        validate(&request).unwrap();
        request.duration_seconds = Some(3601);
        assert!(validate(&request).is_err());
        request.duration_seconds = Some(0);
        assert!(validate(&request).is_err());
        request.duration_seconds = Some(5);
        request.input_image = Some("image-to-video is not supported by this T2V pack".into());
        assert!(validate(&request).is_err());
        for path in [model, encoder, vae] { std::fs::remove_file(path).unwrap(); }
        std::fs::remove_dir(root).unwrap();
    }
}
