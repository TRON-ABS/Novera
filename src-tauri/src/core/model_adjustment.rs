use serde::{Deserialize, Serialize};
use std::{
    fs::{self, File, OpenOptions},
    io::{self, Read},
    path::{Path, PathBuf},
    process::Stdio,
    sync::Mutex,
};
use tauri::{AppHandle, Manager};
use tokio::{process::Command, sync::watch};

const CANDIDATE: &str = "LFM3-Q4_K_M-recalibrated-v1.gguf";
const REFERENCE: &str = "LFM3-Omni-2B-Q8_0.gguf";
const BASELINE: &str = "LFM3-Omni-2B-Q4_K_M.gguf";
const CORPORA: [(&str, usize); 5] = [
    (
        include_str!("../../../scripts/validation/q4-quantization/validation.txt"),
        6,
    ),
    (
        include_str!("../../../scripts/validation/q4-quantization/validation-independent.txt"),
        6,
    ),
    (
        include_str!("../../../scripts/validation/q4-quantization/transfer.txt"),
        4,
    ),
    (
        include_str!("../../../scripts/validation/q4-quantization/holdout-4.txt"),
        4,
    ),
    (
        include_str!("../../../scripts/validation/q4-quantization/holdout-5.txt"),
        4,
    ),
];

#[derive(Clone, Default, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct Report {
    stage: String,
    recalibrating: bool,
    recalibration_failed: bool,
    can_stop: bool,
    stopping: bool,
    run_id: String,
    reference_bytes: u64,
    reference_name: &'static str,
    runs: Vec<Measurement>,
}

#[derive(Clone, Serialize)]
struct Measurement {
    label: &'static str,
    bytes: u64,
    file: &'static str,
    mean_kl: f64,
    max_kl: f64,
    corpus_max_kl: Vec<f64>,
}

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Inputs {
    reference: Option<PathBuf>,
    baseline: Option<PathBuf>,
}

#[derive(Serialize)]
pub struct SavedModel {
    name: String,
    folder: PathBuf,
    projector: Option<String>,
}

struct Run {
    report: Report,
    stop: watch::Sender<bool>,
    directory: PathBuf,
    parent: PathBuf,
    saving: bool,
}

static CURRENT: Mutex<Option<Run>> = Mutex::new(None);

fn model(app: &AppHandle, selected: Option<PathBuf>, expected: &str) -> Result<PathBuf, String> {
    let root =
        super::downloads::storage::default_models_root().and_then(|path| path.canonicalize().ok());
    let path = match selected {
        Some(path) => {
            let path = path.canonicalize().map_err(|e| e.to_string())?;
            if !app.asset_protocol_scope().is_allowed(&path) {
                return Err("Select the GGUF with the native file picker".into());
            }
            path
        }
        None => {
            let root = root.as_ref().ok_or_else(|| format!("Select {expected}"))?;
            let mut files = vec![root.join(expected)];
            for entry in fs::read_dir(root).map_err(|e| e.to_string())?.flatten() {
                files.push(entry.path().join(expected));
            }
            files
                .into_iter()
                .filter_map(|p| p.canonicalize().ok())
                .find(|p| p.starts_with(root) && p.is_file())
                .ok_or_else(|| format!("Select {expected}"))?
        }
    };
    if cfg!(feature = "portable") && !root.as_ref().is_some_and(|root| path.starts_with(root)) {
        return Err("Select a model inside the portable models folder".into());
    }
    if path.file_name().and_then(|name| name.to_str()) != Some(expected) {
        return Err(format!("Select {expected}"));
    }
    let mut header = [0; 4];
    File::open(&path)
        .and_then(|mut file| file.read_exact(&mut header))
        .map_err(|e| e.to_string())?;
    if &header != b"GGUF" {
        return Err("Invalid GGUF".into());
    }
    Ok(path)
}

fn tool_path(directory: &Path, tool: &str) -> PathBuf {
    directory.join(format!("llama-{tool}{}", std::env::consts::EXE_SUFFIX))
}

fn tools(app: &AppHandle) -> Result<PathBuf, String> {
    let bundled = app
        .path()
        .resource_dir()
        .map_err(|e| e.to_string())?
        .join("resources/bin");
    let mut locations = vec![bundled];
    if let Ok(exe) = std::env::current_exe() {
        if let Some(parent) = exe.parent() {
            locations.push(parent.join("resources/bin"));
        }
    }
    #[cfg(debug_assertions)]
    locations.push(Path::new(env!("CARGO_MANIFEST_DIR")).join("resources/bin"));
    locations
        .into_iter()
        .find(|dir| {
            ["quantize", "imatrix", "perplexity"]
                .iter()
                .all(|tool| tool_path(dir, tool).is_file())
        })
        .ok_or_else(|| "The bundled llama.cpp recalibration tools are missing".into())
}

#[tauri::command]
pub fn model_adjustment_start(app: AppHandle, inputs: Inputs) -> Result<(), String> {
    let mut current = CURRENT.lock().unwrap();
    if current
        .as_ref()
        .is_some_and(|run| run.report.recalibrating || run.saving)
    {
        return Err("Busy".into());
    }
    let reference = model(&app, inputs.reference, REFERENCE)?;
    let baseline = model(&app, inputs.baseline, BASELINE)?;
    let tools = tools(&app)?;
    let reference_bytes = fs::metadata(&reference).map_err(|e| e.to_string())?.len();
    let run_id = uuid::Uuid::new_v4().to_string();
    #[cfg(feature = "portable")]
    let cache = super::app::portable::data_root().join("Cache");
    #[cfg(not(feature = "portable"))]
    let cache = app.path().app_cache_dir().map_err(|e| e.to_string())?;
    let directory = cache.join("model-adjustment").join(&run_id);
    fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    let (stop, receiver) = watch::channel(false);
    let previous = current.replace(Run {
        report: Report {
            stage: "Démarrage du recalibrage".into(),
            recalibrating: true,
            can_stop: true,
            run_id,
            reference_bytes,
            reference_name: "Q8",
            ..Report::default()
        },
        stop,
        directory: directory.clone(),
        parent: reference.parent().ok_or("Missing model parent")?.to_owned(),
        saving: false,
    });
    tauri::async_runtime::spawn(async move {
        if let Some(previous) = previous {
            let _ = tokio::fs::remove_dir_all(previous.directory).await;
        }
        let result = benchmark(&tools, &directory, &reference, &baseline, receiver.clone()).await;
        if let Err(error) = &result {
            if !*receiver.borrow() {
                log::error!("Model adjustment: {error}");
            }
        }
        // Logit caches can occupy over a gigabyte and are never needed for saving.
        for index in 0..CORPORA.len() {
            let _ = tokio::fs::remove_file(directory.join(format!("{index}.logits"))).await;
        }
        let _ = tokio::fs::remove_file(directory.join("importance.gguf")).await;
        let mut current = CURRENT.lock().unwrap();
        let report = &mut current.as_mut().unwrap().report;
        let stopped = *receiver.borrow();
        report.recalibrating = false;
        report.can_stop = false;
        report.stopping = false;
        report.recalibration_failed = result.is_err() && !stopped;
        report.stage = if stopped {
            "Comparaison arrêtée"
        } else if result.is_ok() {
            "Comparaison terminée"
        } else {
            "Comparaison interrompue"
        }
        .into();
    });
    Ok(())
}

#[tauri::command]
pub fn model_adjustment_report() -> Report {
    CURRENT
        .lock()
        .unwrap()
        .as_ref()
        .map(|run| run.report.clone())
        .unwrap_or_default()
}

#[tauri::command]
pub fn model_adjustment_stop() -> Result<(), String> {
    if let Some(run) = CURRENT
        .lock()
        .unwrap()
        .as_mut()
        .filter(|run| run.report.recalibrating)
    {
        run.stop.send_replace(true);
        run.report.stopping = true;
        run.report.can_stop = false;
    }
    Ok(())
}

async fn execute(
    tools: &Path,
    directory: &Path,
    tool: &str,
    args: &[&std::ffi::OsStr],
    stop: &mut watch::Receiver<bool>,
) -> Result<String, String> {
    if *stop.borrow() {
        return Err("Stopped".into());
    }
    let log_path = directory.join(format!("{tool}.log"));
    let log_file = File::create(&log_path).map_err(|e| e.to_string())?;
    let stderr = log_file.try_clone().map_err(|e| e.to_string())?;
    let mut command = Command::new(tool_path(tools, tool));
    command
        .args(args)
        .current_dir(directory)
        .kill_on_drop(true)
        .env_remove("GGML_BACKEND_PATH")
        .stdin(Stdio::null())
        .stdout(Stdio::from(log_file))
        .stderr(Stdio::from(stderr));
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let mut child = command.spawn().map_err(|e| format!("llama-{tool}: {e}"))?;
    let status = tokio::select! {
        result = child.wait() => result.map_err(|e| e.to_string())?,
        _ = stop.changed() => {
            let _ = child.kill().await;
            return Err("Stopped".into());
        }
    };
    let output = tokio::fs::read(log_path).await.map_err(|e| e.to_string())?;
    let output_text = String::from_utf8_lossy(&output);
    if !status.success() {
        let tail = output_text.lines().rev().take(12).collect::<Vec<_>>();
        return Err(format!(
            "llama-{tool} exited with {}: {}",
            status,
            tail.into_iter().rev().collect::<Vec<_>>().join("\n")
        ));
    }
    Ok(output_text.into_owned())
}

fn stage(text: String) {
    CURRENT.lock().unwrap().as_mut().unwrap().report.stage = text;
}

fn metric(output: &str, label: &str) -> Result<f64, String> {
    output
        .lines()
        .find_map(|line| {
            let (name, rest) = line.split_once([':', '='])?;
            if !name.split_whitespace().eq(label.split_whitespace()) {
                return None;
            }
            rest.split_whitespace().next()?.parse::<f64>().ok()
        })
        .filter(|value| value.is_finite())
        .ok_or_else(|| format!("Missing {label}"))
}

async fn benchmark(
    tools: &Path,
    directory: &Path,
    reference: &Path,
    baseline: &Path,
    mut stop: watch::Receiver<bool>,
) -> Result<(), String> {
    use std::ffi::OsStr;
    let matrix = directory.join("importance.gguf");
    let calibration = directory.join("calibration.txt");
    tokio::fs::write(
        &calibration,
        include_str!("../../../scripts/validation/q4-quantization/calibration.txt"),
    )
    .await
    .map_err(|e| e.to_string())?;
    let flags = |chunks: usize| {
        [
            "-c".into(),
            "512".into(),
            "-ngl".into(),
            "99".into(),
            "--chunks".into(),
            chunks.to_string(),
        ]
    };
    stage("Matrice d’importance sur corpus varié".into());
    let common = flags(6);
    let mut args = vec![
        OsStr::new("-m"),
        reference.as_os_str(),
        OsStr::new("-f"),
        calibration.as_os_str(),
        OsStr::new("-o"),
        matrix.as_os_str(),
    ];
    args.extend(common.iter().map(OsStr::new));
    execute(tools, directory, "imatrix", &args, &mut stop).await?;

    stage("Quantification Q4 recalibré v1".into());
    let candidate = directory.join(CANDIDATE);
    let mut args: Vec<&OsStr> = ["--allow-requantize", "--imatrix"]
        .into_iter()
        .map(OsStr::new)
        .collect();
    args.push(matrix.as_os_str());
    args.extend(
        ["--token-embedding-type", "q6_K"]
            .into_iter()
            .map(OsStr::new),
    );
    for rule in [
        "attn_q=q6_K",
        "attn_k=q6_K",
        "attn_output=q6_K",
        r"blk\.[0-5]\.ffn_gate=q8_0",
        r"blk\.[0-5]\.ffn_up=q6_K",
        r"blk\.([0-9]|1[01])\.shortconv\.(in_proj|out_proj)=q6_K",
    ] {
        args.extend([OsStr::new("--tensor-type"), OsStr::new(rule)]);
    }
    args.extend([
        reference.as_os_str(),
        candidate.as_os_str(),
        OsStr::new("Q4_K_M"),
    ]);
    execute(tools, directory, "quantize", &args, &mut stop).await?;

    let models = [
        ("Q4 original", BASELINE, baseline),
        ("Q4 recalibré v1", CANDIDATE, candidate.as_path()),
    ];
    let mut totals = [0.0; 2];
    let mut rows = Vec::new();
    for (label, file, model) in models {
        rows.push(Measurement {
            label,
            file,
            bytes: fs::metadata(model).map_err(|e| e.to_string())?.len(),
            mean_kl: 0.0,
            max_kl: 0.0,
            corpus_max_kl: Vec::new(),
        });
    }
    for (index, (content, chunks)) in CORPORA.iter().enumerate() {
        let corpus = directory.join(format!("{index}.txt"));
        let logits = directory.join(format!("{index}.logits"));
        tokio::fs::write(&corpus, content)
            .await
            .map_err(|e| e.to_string())?;
        let common = flags(*chunks);
        let evaluate = |model: &Path, reference_pass: bool| {
            let mut args = vec![
                OsStr::new("-m").to_owned(),
                model.as_os_str().to_owned(),
                "-f".into(),
                corpus.clone().into_os_string(),
            ];
            args.extend(common.iter().map(|flag| OsStr::new(flag).to_owned()));
            if reference_pass {
                args.push("--save-all-logits".into());
            } else {
                args.extend(["--kl-divergence".into(), "--kl-divergence-base".into()]);
            }
            args.push(logits.clone().into_os_string());
            args
        };
        stage(format!(
            "Calcul de la référence Q8 · corpus {}/5",
            index + 1
        ));
        let args = evaluate(reference, true);
        execute(
            tools,
            directory,
            "perplexity",
            &args.iter().map(|s| s.as_os_str()).collect::<Vec<_>>(),
            &mut stop,
        )
        .await?;
        for (row, (_, _, model)) in models.iter().enumerate() {
            stage(format!(
                "Mesure · {} · corpus {}/5",
                rows[row].label,
                index + 1
            ));
            let args = evaluate(model, false);
            let output = execute(
                tools,
                directory,
                "perplexity",
                &args.iter().map(|s| s.as_os_str()).collect::<Vec<_>>(),
                &mut stop,
            )
            .await?;
            totals[row] += metric(&output, "Mean KLD")?;
            rows[row]
                .corpus_max_kl
                .push(metric(&output, "Maximum KLD").or_else(|_| metric(&output, "Max KLD"))?);
            rows[row].mean_kl = totals[row] / (index + 1) as f64;
            rows[row].max_kl = rows[row]
                .corpus_max_kl
                .iter()
                .copied()
                .fold(f64::NEG_INFINITY, f64::max);
            CURRENT.lock().unwrap().as_mut().unwrap().report.runs = rows
                .iter()
                .filter(|entry| !entry.corpus_max_kl.is_empty())
                .cloned()
                .collect();
        }
        let _ = tokio::fs::remove_file(logits).await;
    }
    Ok(())
}

#[tauri::command]
pub async fn model_adjustment_save(run: String, file: String) -> Result<SavedModel, String> {
    let (source, folder) = {
        let mut current = CURRENT.lock().unwrap();
        let entry = current
            .as_mut()
            .filter(|entry| {
                entry.report.run_id == run
                    && !entry.saving
                    && entry.report.stage == "Comparaison terminée"
                    && file == CANDIDATE
            })
            .ok_or("No completed model")?;
        entry.saving = true;
        (entry.directory.join(CANDIDATE), entry.parent.clone())
    };
    let result = tauri::async_runtime::spawn_blocking(move || -> Result<SavedModel, String> {
        let name = format!("Novera-LFM3-Q4_K_M-recalibrated-v1-{run}.gguf");
        let destination = folder.join(&name);
        if fs::hard_link(&source, &destination).is_err() {
            let mut input = File::open(source).map_err(|e| e.to_string())?;
            let mut target = OpenOptions::new()
                .write(true)
                .create_new(true)
                .open(&destination)
                .map_err(|e| e.to_string())?;
            if let Err(error) = io::copy(&mut input, &mut target).and_then(|_| target.sync_all()) {
                drop(target);
                let _ = fs::remove_file(destination);
                return Err(error.to_string());
            }
        }
        let projector = "mmproj-LFM3-Omni-2B-Q8_0.gguf";
        let projector = folder
            .join(projector)
            .is_file()
            .then(|| projector.to_owned());
        Ok(SavedModel {
            name,
            folder,
            projector,
        })
    })
    .await;
    CURRENT.lock().unwrap().as_mut().unwrap().saving = false;
    result.map_err(|e| e.to_string())?
}
