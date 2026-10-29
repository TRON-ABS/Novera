//! ACE-Step CLI orchestration. Shares creation job ownership and memory policy.
use super::*;
use std::io::{Read, Seek, SeekFrom, Write};

fn filename(value: &str) -> Result<String, String> {
    PathBuf::from(value)
        .file_name()
        .and_then(|v| v.to_str())
        .map(str::to_owned)
        .ok_or("MUSIC_MODEL_NAME".into())
}
fn engine(request: &Request, stage: &str) -> Result<PathBuf, String> {
    let directory = request
        .music_engine
        .as_deref()
        .filter(|v| !v.is_empty())
        .map(PathBuf::from)
        .or_else(|| PathBuf::from(&request.model).parent().map(PathBuf::from))
        .ok_or("MUSIC_ENGINE_MISSING")?;
    let name = if cfg!(windows) {
        format!("ace-{stage}.exe")
    } else {
        format!("ace-{stage}")
    };
    let path = directory
        .join(name)
        .canonicalize()
        .map_err(|_| "MUSIC_ENGINE_MISSING")?;
    if !path.is_file() {
        return Err("MUSIC_ENGINE_MISSING".into());
    }
    Ok(path)
}
pub(super) fn validate(request: &Request) -> Result<(), String> {
    if request.backend.as_deref() != Some("acestep")
        || !super::super::creation_policy::valid_memory_policy(request.memory_policy.as_deref())
        || request.prompt.trim().is_empty()
        || request.prompt.len() > 8000
        || request.input_image.is_some()
        || request.upscale_factor.is_some()
        || !["auto", "cpu", "cuda"].contains(&request.device.as_str())
        || !(1..=50).contains(&request.steps)
        || !request
            .duration_seconds
            .is_some_and(|v| (10..=600).contains(&v))
        || !["mp3", "wav16", "wav24", "wav32"]
            .contains(&request.music_format.as_deref().unwrap_or("wav24"))
        || ![128, 320].contains(&request.music_bitrate.unwrap_or(320))
        || request
            .music_bpm
            .is_some_and(|v| v != 0 && !(30..=300).contains(&v))
        || request
            .music_lyrics
            .as_ref()
            .is_some_and(|v| v.len() > 32000)
        || request.music_language.as_ref().is_some_and(|v| {
            v.len() > 20 || !v.chars().all(|c| c.is_ascii_alphanumeric() || c == '-')
        })
    {
        return Err("MUSIC_PARAMETERS".into());
    }
    let root = PathBuf::from(&request.model)
        .canonicalize()
        .map_err(|_| "MUSIC_MODEL_MISSING")?
        .parent()
        .ok_or("MUSIC_MODEL_MISSING")?
        .to_path_buf();
    for (path, arch) in [
        (request.model.as_str(), "acestep-dit"),
        (
            request.music_lm.as_deref().ok_or("MUSIC_PLANNER_MISSING")?,
            "acestep-lm",
        ),
        (
            request.cpp_llm.as_deref().ok_or("MUSIC_ENCODER_MISSING")?,
            "acestep-text-enc",
        ),
        (
            request.cpp_vae.as_deref().ok_or("MUSIC_VAE_MISSING")?,
            "acestep-vae",
        ),
    ] {
        let file = local_file(path, &["gguf"])?;
        if file.parent() != Some(root.as_path())
            || gguf_architecture(&file).as_deref() != Some(arch)
        {
            return Err("MUSIC_MODEL_ARCHITECTURE".into());
        }
    }
    // The pinned engine selects its first text encoder; never silently ignore a choice.
    let choices = models(root.to_string_lossy().into_owned())?;
    let chosen = filename(request.cpp_llm.as_deref().unwrap())?;
    if choices["encoder"][0].as_str() != Some(chosen.as_str()) {
        return Err("MUSIC_ENCODER_SELECTION".into());
    }
    engine(request, "lm")?;
    engine(request, "synth")?;
    Ok(())
}
pub(super) fn models(directory: String) -> Result<Value, String> {
    let root = PathBuf::from(directory)
        .canonicalize()
        .map_err(|_| "MUSIC_DIRECTORY")?;
    if !root.is_dir() {
        return Err("MUSIC_DIRECTORY".into());
    }
    let mut result = json!({"generator":[],"planner":[],"encoder":[],"vae":[]});
    for entry in std::fs::read_dir(root)
        .map_err(|e| e.to_string())?
        .take(4096)
    {
        let file = entry.map_err(|e| e.to_string())?.path();
        if !file.is_file() || file.extension().and_then(|v| v.to_str()) != Some("gguf") {
            continue;
        }
        let key = match gguf_architecture(&file).as_deref() {
            Some("acestep-dit") => "generator",
            Some("acestep-lm") => "planner",
            Some("acestep-text-enc") => "encoder",
            Some("acestep-vae") => "vae",
            _ => continue,
        };
        if let Some(name) = file.file_name().and_then(|v| v.to_str()) {
            result[key].as_array_mut().unwrap().push(json!(name));
        }
    }
    for key in ["generator", "planner", "encoder", "vae"] {
        result[key]
            .as_array_mut()
            .unwrap()
            .sort_by(|a, b| a.as_str().cmp(&b.as_str()));
    }
    Ok(result)
}
pub(super) fn payload(request: &Request) -> Result<Value, String> {
    Ok(
        json!({"caption":request.prompt,"lyrics":request.music_lyrics.as_deref().unwrap_or("[Instrumental]"),
        "duration":request.duration_seconds.unwrap_or(30),"inference_steps":request.steps,
        "seed":request.seed,"lm_seed":request.seed,"bpm":request.music_bpm.unwrap_or(0),
        "vocal_language":request.music_language.as_deref().unwrap_or(""),
        "output_format":request.music_format.as_deref().unwrap_or("wav24"),"mp3_bitrate":request.music_bitrate.unwrap_or(320),
        "synth_model":filename(&request.model)?,"lm_model":filename(request.music_lm.as_deref().ok_or("MUSIC_PLANNER_MISSING")?)?,
        "vae":filename(request.cpp_vae.as_deref().ok_or("MUSIC_VAE_MISSING")?)?,
        "lm_batch_size":1,"synth_batch_size":1,"task_type":"text2music","lm_mode":"generate"}),
    )
}
pub(super) fn command(
    request: &Request,
    directory: &std::path::Path,
    stage: &str,
) -> Result<Command, String> {
    let executable = engine(request, stage)?;
    let model = PathBuf::from(&request.model)
        .canonicalize()
        .map_err(|e| e.to_string())?;
    let mut command = Command::new(&executable);
    command
        .current_dir(executable.parent().unwrap())
        .arg("--models")
        .arg(model.parent().unwrap())
        .arg("--request")
        .arg(directory.join(if stage == "lm" {
            "music.json"
        } else {
            "music0.json"
        }));
    match request.device.as_str() {
        "cpu" => {
            command.args(["--device", "CPU"]);
        }
        "cuda" => {
            command.args(["--device", "CUDA0"]);
        }
        _ => {}
    }
    if stage == "synth" && request.device != "cpu" {
        command.args(["--vae-chunk", "256", "--vae-overlap", "32"]);
    }
    command.kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    Ok(command)
}
pub(super) fn transition(job: &mut Job) -> Result<Child, String> {
    let request = job.pending_music.take().ok_or("MUSIC_JOB_STATE")?;
    let path = job.directory.join("music0.json");
    if std::fs::metadata(&path)
        .map_err(|_| "MUSIC_PLANNER_OUTPUT")?
        .len()
        > 512 * 1024
    {
        return Err("MUSIC_PLANNER_OUTPUT".into());
    }
    let mut value: Value =
        serde_json::from_slice(&std::fs::read(&path).map_err(|e| e.to_string())?)
            .map_err(|_| "MUSIC_PLANNER_OUTPUT")?;
    let codes = value
        .get("audio_codes")
        .and_then(Value::as_str)
        .ok_or("MUSIC_PLANNER_OUTPUT")?;
    if codes.is_empty()
        || codes.len() > 64_000
        || !codes
            .chars()
            .all(|c| c.is_ascii_digit() || c == ',' || c.is_ascii_whitespace())
    {
        return Err("MUSIC_PLANNER_OUTPUT".into());
    }
    let frozen = payload(&request)?;
    for key in [
        "duration",
        "inference_steps",
        "seed",
        "lm_seed",
        "output_format",
        "mp3_bitrate",
        "synth_model",
        "lm_model",
        "vae",
        "lm_batch_size",
        "synth_batch_size",
        "task_type",
    ] {
        value[key] = frozen[key].clone();
    }
    std::fs::write(
        &path,
        serde_json::to_vec(&value).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    std::fs::OpenOptions::new()
        .append(true)
        .open(job.directory.join("error.log"))
        .map_err(|e| e.to_string())?
        .write_all(b"\n[Novera music] synthesis\n")
        .map_err(|e| e.to_string())?;
    job.music_request = Some(request.clone());
    spawn_synth(job, &request)
}
fn spawn_synth(job: &Job, request: &Request) -> Result<Child, String> {
    let mut command = command(request, &job.directory, "synth")?;
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
        ));
    if let Some(path) = &job.music_runtime_path {
        command.env("PATH", path);
    }
    command.spawn().map_err(|e| e.to_string())
}

pub(super) fn recoverable(job: &Job) -> bool {
    if job.task != "music" || job.cancelled || job.music_retried || job.pending_music.is_some()
        || !job.music_request.as_ref().is_some_and(|r|r.device=="auto") {return false;}
    let log=std::fs::read_to_string(job.directory.join("error.log")).unwrap_or_default();
    cuda_vae_failure(&log)
}
fn cuda_vae_failure(log: &str) -> bool {
    log.contains("[VAE] Tiled decode") && log.contains("CUDA error: device not ready")
}
pub(super) fn recover(job: &mut Job) -> Result<Child,String> {
    job.music_retried=true;
    let mut request=job.music_request.clone().ok_or("MUSIC_JOB_STATE")?;
    request.device="cpu".into();
    std::fs::OpenOptions::new().append(true).open(job.directory.join("error.log")).map_err(|e|e.to_string())?
      .write_all(b"\n[Novera music] recovery CPU\n[Novera music] synthesis\n").map_err(|e|e.to_string())?;
    job.music_request=Some(request.clone());
    spawn_synth(job,&request)
}

pub(super) fn progress(job: &Job) -> Value {
    let log = std::fs::read_to_string(job.directory.join("error.log")).unwrap_or_default();
    if job.pending_music.is_some() {
        let ready = log
            .lines()
            .any(|line| line.starts_with("[LM-Generate]") || line.starts_with("[LM-Phase"));
        let codes = log
            .lines()
            .rev()
            .filter(|line| line.starts_with("[LM-Phase2] Step "))
            .find_map(|line| {
                line.split(" total codes")
                    .next()?
                    .rsplit(',')
                    .next()?
                    .trim()
                    .parse::<u32>()
                    .ok()
            });
        let duration = job
            .pending_music
            .as_ref()
            .and_then(|r| r.duration_seconds)
            .unwrap_or(30);
        let percent = codes
            .map(|codes| ((codes as u64 * 35) / (duration as u64 * 5)).min(34) as i64)
            .unwrap_or(-1);
        return json!({"stage":if ready {"generating"}else{"loading"},"progress":percent});
    }
    let synth = log.rsplit("[Novera music] synthesis").next().unwrap_or("");
    let ready = synth.lines().any(|line| {
        line.starts_with("[DiT] Solver:")
            || line.starts_with("[DiT] Step ")
            || line.starts_with("[DiT-Generate] Total:")
    });
    let percent = synth
        .lines()
        .rev()
        .filter_map(|line| line.strip_prefix("[DiT] Step "))
        .find_map(|line| {
            let token = line.split_whitespace().next()?;
            let (done, total) = token.split_once('/')?;
            let done = done.parse::<u32>().ok()?;
            let total = total.parse::<u32>().ok()?;
            (total > 0 && done <= total)
                .then_some(35 + (done as u64 * 55 / total.max(1) as u64).min(55) as i64)
        })
        .unwrap_or(35);
    json!({"stage":if ready {"generating"} else {"loading"},"progress":percent,"recovery":job.music_retried,"device":if job.music_retried {"cpu"}else{"auto"}})
}
pub(super) fn publish(job: &Job) -> Result<(), String> {
    let ext = job
        .output
        .extension()
        .and_then(|v| v.to_str())
        .ok_or("MUSIC_OUTPUT")?;
    let source = job.directory.join(format!("music00.{ext}"));
    let mut file = std::fs::File::open(&source).map_err(|_| "MUSIC_OUTPUT_MISSING")?;
    let size = file.metadata().map_err(|e| e.to_string())?.len();
    if !(44..=256 * 1024 * 1024).contains(&size) {
        return Err("MUSIC_OUTPUT_SIZE".into());
    }
    let mut header = [0u8; 12];
    file.read_exact(&mut header).map_err(|e| e.to_string())?;
    if (ext == "wav" && (&header[..4] != b"RIFF" || &header[8..] != b"WAVE"))
        || (ext == "mp3"
            && &header[..3] != b"ID3"
            && !(header[0] == 0xff && header[1] & 0xe0 == 0xe0))
    {
        return Err("MUSIC_OUTPUT_FORMAT".into());
    }
    drop(file);
    let mut metadata: Value = serde_json::from_slice(
        &std::fs::read(job.directory.join("request.json")).map_err(|e| e.to_string())?,
    )
    .map_err(|e| e.to_string())?;
    if ext == "wav" {
        validate_wav(
            &source,
            metadata
                .get("duration_seconds")
                .and_then(Value::as_u64)
                .unwrap_or(30) as f64,
        )?;
    }
    let mut input = std::fs::File::open(&source).map_err(|e| e.to_string())?;
    let mut staged = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&job.staged)
        .map_err(|e| e.to_string())?;
    std::io::copy(&mut input, &mut staged).map_err(|e| e.to_string())?;
    staged.sync_all().map_err(|e| e.to_string())?;
    drop(staged);
    metadata["total_seconds"] = json!(job.started.elapsed().as_secs_f64());
    metadata["sample_rate"] = json!(48000);
    metadata["cpu_recovery"] = json!(job.music_retried);
    metadata["channels"] = json!(2);
    let sidecar = job.output.with_extension(format!("{ext}.json"));
    let mut meta = std::fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&sidecar)
        .map_err(|e| e.to_string())?;
    if let Err(error) =
        meta.write_all(&serde_json::to_vec_pretty(&metadata).map_err(|e| e.to_string())?)
    {
        drop(meta);
        let _ = std::fs::remove_file(&sidecar);
        return Err(error.to_string());
    }
    drop(meta);
    if let Err(error) = super::super::creation_cloud::publish_stage(&job.staged, &job.output) {
        let _ = std::fs::remove_file(sidecar);
        return Err(error);
    }
    let _ = std::fs::remove_file(source);
    Ok(())
}

fn validate_wav(path: &std::path::Path, duration: f64) -> Result<(), String> {
    let mut file = std::fs::File::open(path).map_err(|e| e.to_string())?;
    let size = file.metadata().map_err(|e| e.to_string())?.len();
    let mut head = [0u8; 12];
    file.read_exact(&mut head)
        .map_err(|_| "MUSIC_OUTPUT_FORMAT")?;
    if &head[..4] != b"RIFF"
        || &head[8..] != b"WAVE"
        || u32::from_le_bytes(head[4..8].try_into().unwrap()) as u64 + 8 != size
    {
        return Err("MUSIC_OUTPUT_FORMAT".into());
    }
    let mut align = None;
    let mut data = None;
    while file.stream_position().map_err(|e| e.to_string())? + 8 <= size {
        let mut chunk = [0u8; 8];
        file.read_exact(&mut chunk)
            .map_err(|_| "MUSIC_OUTPUT_FORMAT")?;
        let length = u32::from_le_bytes(chunk[4..].try_into().unwrap()) as u64;
        let start = file.stream_position().map_err(|e| e.to_string())?;
        let end = start
            .checked_add(length + (length % 2))
            .filter(|end| *end <= size)
            .ok_or("MUSIC_OUTPUT_FORMAT")?;
        if &chunk[..4] == b"fmt " {
            if length < 16 {
                return Err("MUSIC_OUTPUT_FORMAT".into());
            }
            let mut fmt = [0u8; 16];
            file.read_exact(&mut fmt)
                .map_err(|_| "MUSIC_OUTPUT_FORMAT")?;
            let kind = u16::from_le_bytes(fmt[..2].try_into().unwrap());
            let channels = u16::from_le_bytes(fmt[2..4].try_into().unwrap());
            let rate = u32::from_le_bytes(fmt[4..8].try_into().unwrap());
            let bytes = u16::from_le_bytes(fmt[12..14].try_into().unwrap());
            let bits = u16::from_le_bytes(fmt[14..].try_into().unwrap());
            if ![1, 3, 0xfffe].contains(&kind)
                || channels != 2
                || rate != 48000
                || ![16, 24, 32].contains(&bits)
                || bytes != 2 * (bits / 8)
            {
                return Err("MUSIC_OUTPUT_FORMAT".into());
            }
            align = Some(bytes);
        } else if &chunk[..4] == b"data" {
            data = Some(length);
        }
        file.seek(SeekFrom::Start(end)).map_err(|e| e.to_string())?;
    }
    let bytes = data.ok_or("MUSIC_OUTPUT_FORMAT")?;
    let align = align.ok_or("MUSIC_OUTPUT_FORMAT")? as u64;
    if bytes == 0
        || bytes % align != 0
        || (bytes as f64 / (48000 * align) as f64 - duration).abs() > 1.0
    {
        return Err("MUSIC_OUTPUT_DURATION".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    fn gguf(path: &std::path::Path, arch: &str) {
        let mut bytes = b"GGUF".to_vec();
        bytes.extend(3u32.to_le_bytes());
        bytes.extend(0u64.to_le_bytes());
        bytes.extend(1u64.to_le_bytes());
        let key = "general.architecture";
        bytes.extend((key.len() as u64).to_le_bytes());
        bytes.extend(key.as_bytes());
        bytes.extend(8u32.to_le_bytes());
        bytes.extend((arch.len() as u64).to_le_bytes());
        bytes.extend(arch.as_bytes());
        std::fs::write(path, bytes).unwrap();
    }
    #[test]
    fn music_payload_and_command_bind_the_four_roles_and_both_seeds() {
        let root = std::env::temp_dir().join(format!("novera-music-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        for (name, arch) in [
            ("dit.gguf", "acestep-dit"),
            ("lm.gguf", "acestep-lm"),
            ("enc.gguf", "acestep-text-enc"),
            ("vae.gguf", "acestep-vae"),
        ] {
            gguf(&root.join(name), arch);
        }
        for stage in ["lm", "synth"] {
            std::fs::write(
                root.join(if cfg!(windows) {
                    format!("ace-{stage}.exe")
                } else {
                    format!("ace-{stage}")
                }),
                b"fixture",
            )
            .unwrap();
        }
        let mut request: Request=serde_json::from_value(json!({"task":"music","prompt":"ambient piano; keep this as data","backend":"acestep","model":root.join("dit.gguf"),"music_lm":root.join("lm.gguf"),"cpp_llm":root.join("enc.gguf"),"cpp_vae":root.join("vae.gguf"),"music_engine":root,"music_format":"wav24","music_bitrate":320,"music_lyrics":"[Instrumental]","music_bpm":0,"duration_seconds":30,"steps":8,"seed":123,"device":"auto","python":"unused","width":1024,"height":432,"frames":81,"fps":16})).unwrap();
        validate(&request).unwrap();
        let value = payload(&request).unwrap();
        assert_eq!(value["seed"], 123);
        assert_eq!(value["lm_seed"], 123);
        assert_eq!(value["synth_model"], "dit.gguf");
        assert_eq!(value["lm_model"], "lm.gguf");
        assert_eq!(value["output_format"], "wav24");
        let lm_command = command(&request, &root, "lm").unwrap();
        let args: Vec<_> = lm_command
            .as_std()
            .get_args()
            .map(|v| v.to_string_lossy().into_owned())
            .collect();
        assert_eq!(args.len(), 4);
        assert_eq!(args[0], "--models");
        assert_eq!(args[2], "--request");
        assert!(!args.iter().any(|v| v.contains("ambient piano")));
        let synth=command(&request,&root,"synth").unwrap();
        let synth_args:Vec<_>=synth.as_std().get_args().map(|v|v.to_string_lossy().into_owned()).collect();
        assert!(synth_args.windows(2).any(|args|args==["--vae-chunk","256"]));
        request.device="cpu".into();
        let cpu=command(&request,&root,"synth").unwrap();
        let cpu_args:Vec<_>=cpu.as_std().get_args().map(|v|v.to_string_lossy().into_owned()).collect();
        assert!(cpu_args.windows(2).any(|args|args==["--device","CPU"]));
        request.device="auto".into();
        for duration in [0, 9, 601] {
            request.duration_seconds = Some(duration);
            assert!(validate(&request).is_err());
        }
        for duration in [10, 30, 240, 360, 600] {
            request.duration_seconds = Some(duration);
            validate(&request).unwrap();
            assert_eq!(payload(&request).unwrap()["duration"], duration);
        }
        gguf(&root.join("dit.gguf"), "qwen3");
        assert!(validate(&request).is_err());
        for file in std::fs::read_dir(&root).unwrap() {
            std::fs::remove_file(file.unwrap().path()).unwrap();
        }
        std::fs::remove_dir(root).unwrap();
    }
    #[test]
    fn audio_publication_requires_complete_stereo_48khz_wav() {
        let root = std::env::temp_dir().join(format!("novera-music-wav-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir(&root).unwrap();
        let path = root.join("test.wav");
        let data = vec![0u8; 48000 * 6];
        let mut bytes = b"RIFF".to_vec();
        bytes.extend((36u32 + data.len() as u32).to_le_bytes());
        bytes.extend(b"WAVEfmt ");
        bytes.extend(16u32.to_le_bytes());
        bytes.extend(1u16.to_le_bytes());
        bytes.extend(2u16.to_le_bytes());
        bytes.extend(48000u32.to_le_bytes());
        bytes.extend(288000u32.to_le_bytes());
        bytes.extend(6u16.to_le_bytes());
        bytes.extend(24u16.to_le_bytes());
        bytes.extend(b"data");
        bytes.extend((data.len() as u32).to_le_bytes());
        bytes.extend(data);
        std::fs::write(&path, &bytes).unwrap();
        validate_wav(&path, 1.0).unwrap();
        assert!(validate_wav(&path, 30.0).is_err());
        bytes.pop();
        std::fs::write(&path, &bytes).unwrap();
        assert!(validate_wav(&path, 1.0).is_err());
        std::fs::remove_file(path).unwrap();
        std::fs::remove_dir(root).unwrap();
    }
}
    #[test]
    fn detects_only_the_reported_cuda_vae_failure() {
        assert!(cuda_vae_failure("[VAE] Tiled decode: 6 tiles\nCUDA error: device not ready"));
        assert!(!cuda_vae_failure("[DiT] CUDA error: device not ready"));
        assert!(!cuda_vae_failure("[VAE] Tiled decode\nout of memory"));
    }
