use super::{spawn_worker, Model};
use crate::core::desktop_calibration as common;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::{Duration, Instant, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_llamacpp::{
    engine::{calibration, worker},
    LlamacppState,
};

const CONTEXT: u32 = 2048;
const THREADS: &[u32] = &[0, 2, 4, 8];

struct Scratch(PathBuf);

impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn receipt(
    directory: &Path,
    model: &Model,
    python: &str,
    device: &str,
    context: u32,
) -> Option<PathBuf> {
    let mut hash = Sha256::new();
    hash.update(
        serde_json::to_vec(&(
            "transformers-calibration-v1",
            &model.id,
            &model.path,
            &model.adapter_path,
            python,
            device,
            context,
        ))
        .ok()?,
    );
    let mut files = Vec::new();
    for root in std::iter::once(&model.path).chain(model.adapter_path.as_ref()) {
        for entry in std::fs::read_dir(root).ok()? {
            let entry = entry.ok()?;
            if entry.path().is_file() {
                files.push(entry.path());
            }
        }
    }
    if Path::new(python).is_file() {
        files.push(PathBuf::from(python));
    }
    files.push(std::env::current_exe().ok()?);
    files.sort();
    for file in files {
        let metadata = std::fs::metadata(&file).ok()?;
        hash.update(file.to_string_lossy().as_bytes());
        hash.update(metadata.len().to_le_bytes());
        hash.update(
            metadata
                .modified()
                .ok()?
                .duration_since(UNIX_EPOCH)
                .ok()?
                .as_nanos()
                .to_le_bytes(),
        );
    }
    let name: String = hash
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    Some(directory.join("calibration").join(format!("{name}.json")))
}

pub(super) fn selected(
    directory: &Path,
    model: &Model,
    python: &str,
    device: &str,
    context: u32,
) -> u32 {
    common::selected(
        receipt(directory, model, python, device, context),
        2,
        THREADS,
    )
}

async fn free<R: Runtime>(app: &AppHandle<R>, client: &reqwest::Client) -> bool {
    if !calibration::enabled() || calibration::foreground_busy() {
        return false;
    }
    match app.try_state::<Arc<LlamacppState>>() {
        Some(state) => calibration::router_is_free(state.inner(), client).await,
        None => true,
    }
}

pub(super) async fn run<R: Runtime>(
    app: &AppHandle<R>,
    directory: &Path,
    model: &Model,
    python: &str,
    device: &str,
) -> Result<(), String> {
    let Some(path) = receipt(directory, model, python, device, CONTEXT) else {
        return Ok(());
    };
    if common::already_compared(&path) {
        return Ok(());
    }
    let _guard =
        calibration::try_background(calibration::Category::Text).ok_or("CALIBRATION_BUSY")?;
    let client = worker::loopback_client();
    if !free(app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let _activity = calibration::track_activity("text", &model.id, "transformers");
    let private = directory.join(format!("calibration-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir(&private).map_err(|e| e.to_string())?;
    let scratch = Scratch(private);
    let reference = common::selected(Some(path.clone()), 2, THREADS);
    let confirmed = common::compare_profiles(reference, THREADS, |confirming, round, threads| {
        let client = &client;
        let scratch = &scratch.0;
        async move {
            let prompt = if confirming {
                [
                    "Explain two methods of conserving water at home.",
                    "Décris le cycle des saisons en détail.",
                ]
            } else {
                [
                    "Describe how to organise a small library.",
                    "Décris un jardin au printemps.",
                ]
            }[round];
            let foreground = async {
                while free(app, client).await {
                    tokio::time::sleep(Duration::from_millis(500)).await;
                }
            };
            tokio::select! {
                biased;
                _ = foreground => Err("CALIBRATION_BUSY".into()),
                value = sample(client, scratch, model, python, device, threads, prompt) => value,
            }
        }
    })
    .await?;
    if !free(app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let selected = confirmed.map_or(reference, |(threads, _)| threads);
    common::save(&path, selected)?;
    common::publish_gain(
        app,
        &model.id,
        confirmed.map(|(_, gain)| gain),
        json!({"threads": selected}),
    );
    Ok(())
}

async fn sample(
    client: &reqwest::Client,
    scratch: &Path,
    model: &Model,
    python: &str,
    device: &str,
    threads: u32,
    prompt: &str,
) -> Result<calibration::Sample, String> {
    let start = Instant::now();
    let mut worker = spawn_worker(scratch, model, python, device, CONTEXT, threads).await?;
    let load = start.elapsed().as_secs_f64();
    let start = Instant::now();
    let response = client.post(format!("http://127.0.0.1:{}/v1/chat/completions", worker.session.port))
        .bearer_auth(&worker.session.api_key).timeout(Duration::from_secs(120))
        .json(&json!({"model": model.id, "messages": [{"role":"user", "content":prompt}], "temperature":0, "max_tokens":96}))
        .send().await;
    let response = async { response?.error_for_status()?.json::<Value>().await }.await;
    let duration = start.elapsed().as_secs_f64();
    let _ = worker.child.kill().await;
    let response = response.map_err(|e| e.to_string())?;
    let tokens = response["usage"]["completion_tokens"]
        .as_u64()
        .filter(|v| *v > 0)
        .ok_or("Missing completion tokens")?;
    let choice = &response["choices"][0];
    if choice["message"]["content"]
        .as_str()
        .is_none_or(str::is_empty)
        || choice["finish_reason"].as_str().is_none()
    {
        return Err("Incomplete Transformers calibration response".into());
    }
    Ok(calibration::Sample {
        load,
        rate: tokens as f64 / duration,
        output: json!([worker.session.device, choice, response["usage"]]),
    })
}
