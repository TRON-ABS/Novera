//! Private probes of the registered image, video and music configurations.
use super::{creation_cancel, creation_status, start_job, Request, JOBS};
use crate::core::desktop_calibration as common;
use jan_utils::calibration::MIN_GAIN;
use serde_json::{json, Value};
use sha2::{Digest, Sha256};
use std::{
    io::Read,
    path::{Path, PathBuf},
    sync::Arc,
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_llamacpp::{
    engine::{calibration, worker},
    LlamacppState,
};

struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
    }
}

fn receipt<R: Runtime>(app: &AppHandle<R>, request: &Request) -> Option<PathBuf> {
    if !matches!(request.task.as_str(), "image" | "video" | "music")
        || request.input_image.is_some()
        || (request.upscale_factor.is_some()
            && request.upscale_model.as_deref().is_none_or(str::is_empty))
    {
        return None;
    }
    let mut config = serde_json::to_value(request).ok()?;
    let fields = config.as_object_mut()?;
    let instrumental = request.music_lyrics.as_deref() == Some("[Instrumental]");
    for key in [
        "prompt",
        "seed",
        "memory_policy",
        "music_lyrics",
        "music_bpm",
        "music_language",
    ] {
        fields.remove(key);
    }
    fields.insert("instrumental".into(), instrumental.into());
    let mut hash = Sha256::new();
    hash.update(b"novera-media-calibration-v3");
    hash.update(serde_json::to_vec(&config).ok()?);
    let executable = std::env::current_exe().ok()?;
    let paths = [
        Some(request.model.as_str()),
        request.cpp_llm.as_deref(),
        request.cpp_vae.as_deref(),
        request.music_lm.as_deref(),
        request.cpp_executable.as_deref(),
        request.upscale_model.as_deref(),
        executable.to_str(),
    ];
    for path in paths
        .into_iter()
        .flatten()
        .filter(|path| !path.trim().is_empty())
    {
        let metadata = std::fs::metadata(path).ok()?;
        hash.update(metadata.len().to_le_bytes());
        hash.update(
            metadata
                .modified()
                .ok()?
                .duration_since(std::time::UNIX_EPOCH)
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
    let name = format!("{name}.json");
    Some(
        app.path()
            .app_cache_dir()
            .ok()?
            .join("media-calibration")
            .join(name),
    )
}

fn profiles(task: &str) -> &'static [u32] {
    if task == "music" {
        &[128, 512, 1024]
    } else {
        &[2, 4, 8]
    }
}

pub(super) fn selected<R: Runtime>(app: &AppHandle<R>, request: &Request) -> u32 {
    common::selected(receipt(app, request), 0, profiles(&request.task))
}

async fn resources_free<R: Runtime>(app: &AppHandle<R>, client: &reqwest::Client) -> bool {
    if !calibration::enabled() || calibration::foreground_busy() {
        return false;
    }
    match app.try_state::<Arc<LlamacppState>>() {
        Some(state) => calibration::router_is_free(state.inner(), client).await,
        None => true,
    }
}

fn fingerprint(path: &Path) -> Result<Vec<u8>, String> {
    let mut file = std::fs::File::open(path).map_err(|e| e.to_string())?;
    if file.metadata().map_err(|e| e.to_string())?.len() < 32 {
        return Err("Calibration output is empty".into());
    }
    let mut hash = Sha256::new();
    let mut buffer = [0u8; 65536];
    loop {
        let count = file.read(&mut buffer).map_err(|e| e.to_string())?;
        if count == 0 {
            break;
        }
        hash.update(&buffer[..count]);
    }
    Ok(hash.finalize().to_vec())
}

fn trial_limit(task: &str, phase: &str) -> u64 {
    match (task, phase) {
        ("video", "confirmation") => 1800,
        ("video", _) => 900,
        _ => 240,
    }
}

async fn sample<R: Runtime>(
    app: &AppHandle<R>,
    client: &reqwest::Client,
    root: &Path,
    request: Request,
    phase: &str,
    report: &mut Value,
    report_path: &Path,
) -> Result<(f64, Vec<u8>), String> {
    if !resources_free(app, client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let limit = trial_limit(&request.task, phase);
    let start = Instant::now();
    let id = start_job(app.clone(), request, Some(root), None).await?;
    let outcome = async {
        loop {
            if !resources_free(app, client).await {
                return Err("CALIBRATION_BUSY".into());
            }
            let status = match creation_status(id.clone()).await {
                Ok(status) => status,
                Err(_) if !JOBS.lock().await.contains_key(&id) => {
                    return Err("CALIBRATION_BUSY".into())
                }
                Err(error) => return Err(error),
            };
            match status["stage"].as_str() {
                Some("done") => {
                    let duration = start.elapsed().as_secs_f64();
                    if JOBS
                        .lock()
                        .await
                        .get(&id)
                        .is_some_and(|job| job.music_retried)
                    {
                        return Err("Media calibration changed the compute backend".into());
                    }
                    let path =
                        PathBuf::from(status["path"].as_str().ok_or("Missing private output")?);
                    if !path.starts_with(root) {
                        return Err("Unexpected calibration output path".into());
                    }
                    let digest = tokio::task::spawn_blocking(move || fingerprint(&path))
                        .await
                        .map_err(|e| e.to_string())??;
                    return Ok((duration, digest));
                }
                Some("cancelled") => return Err("CALIBRATION_BUSY".into()),
                Some("error") => return Err(status["error"].as_str().unwrap_or("Media calibration worker failed").into()),
                _ => {}
            }
            let stage = match status["stage"].as_str() {
                Some("decoding") => "decoding",
                Some("finalizing" | "encoding" | "saving") => "encoding",
                Some("generating" | "upscaling") => "generating",
                _ => "loading",
            };
            let mut work = json!({"stage":stage});
            if let Some(percent) = status["progress"].as_f64().filter(|v| v.is_finite() && (0.0..=100.0).contains(v)) {
                work["completed"] = json!(percent);
                work["total"] = json!(100);
            }
            if let Some(trial) = report["trials"].as_array_mut().and_then(|trials| trials.last_mut()) {
                if trial["work"] != work {
                    trial["work"] = work;
                    save_report(report_path, report);
                }
            }
            if start.elapsed() >= Duration::from_secs(limit) {
                return Err("Media calibration timed out".into());
            }
            tokio::time::sleep(Duration::from_millis(200)).await;
        }
    }
    .await;
    if outcome.is_err() {
        if let Err(error) = creation_cancel(id.clone()).await {
            log::warn!("Could not cancel calibration job: {error}");
        }
    }
    JOBS.lock().await.remove(&id);
    outcome
}

pub(super) async fn run<R: Runtime>(
    app: AppHandle<R>,
    mut request: Request,
    quick: bool,
    preview_upscale_model: Option<String>,
) -> Result<bool, String> {
    if !jan_utils::calibration::available() {
        return Ok(false);
    }
    let Some(receipt_path) = receipt(&app, &request) else {
        return Ok(false);
    };
    if common::already_compared(&receipt_path) {
        return Ok(selected(&app, &request) != 0);
    }
    if let Ok(bytes) = std::fs::read(&receipt_path) {
        if let Ok(result) = serde_json::from_slice::<bool>(&bytes) {
            if result || !quick {
                return Ok(result);
            }
        }
    }
    let category = match request.task.as_str() {
        "music" => calibration::Category::Music,
        "image" => calibration::Category::Image,
        _ => calibration::Category::Video,
    };
    let _gate = calibration::try_background(category).ok_or("CALIBRATION_BUSY")?;
    let client = worker::loopback_client();
    if !resources_free(&app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let provider = if request.task == "music" {
        "novera-music"
    } else {
        "diffusers"
    };
    let _activity = calibration::track_activity(&request.task, &request.model, provider);
    let parent = receipt_path
        .parent()
        .ok_or("Missing calibration cache directory")?;
    std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    let id = uuid::Uuid::new_v4().to_string();
    let private = parent.join(&id);
    std::fs::create_dir(&private).map_err(|e| e.to_string())?;
    let scratch = Scratch(private);
    request.memory_policy = Some("auto".to_string());
    if request.task == "music" && request.music_lyrics.as_deref() != Some("[Instrumental]") {
        request.music_lyrics = Some(
            "[Verse]\nOne more morning, one more light.\nThe sky is blue, the air is bright."
                .into(),
        );
        request.music_language = Some("en".into());
    }
    let reports = parent
        .parent()
        .ok_or("Missing app cache directory")?
        .join("calibration-reports");
    let report_path = reports.join(format!("{}-{id}.json", request.task));
    let mut report = json!({
        "task":request.task, "model":request.model, "status":"running", "minimumGainPct":MIN_GAIN*100.0, "trials":[], "pairs":[],
    });
    save_report(&report_path, &report);
    calibration::track_report(&report_path);
    let outcome = async {
        let mut candidates = profiles(&request.task).to_vec();
        if quick && request.task != "video" {
            let preview = quick_request(&request, preview_upscale_model);
            candidates = compare(
                &app,
                &client,
                &scratch.0,
                preview,
                "quick",
                &candidates,
                &mut report,
                &report_path,
            )
            .await?
            .into_iter()
            .take(2)
            .map(|(profile, _)| profile)
            .collect();
        }
        // Video always screens every setting on the short workload. Only the
        // two fastest identical-output gains proceed to the long workload.
        let screening_request = if request.task == "video" {
            quick_request(&request, None)
        } else {
            request.clone()
        };
        let initial = compare(
            &app,
            &client,
            &scratch.0,
            screening_request,
            "profile",
            &candidates,
            &mut report,
            &report_path,
        )
        .await?;
        if request.task == "video" {
            candidates = initial.iter().take(2).map(|(profile, _)| *profile).collect();
        }
        let confirmed = compare(
            &app,
            &client,
            &scratch.0,
            request.clone(),
            "confirmation",
            &candidates,
            &mut report,
            &report_path,
        )
        .await?
        .into_iter()
        .filter_map(|(profile, repeat)| {
            initial
                .iter()
                .find(|(id, _)| *id == profile)
                .map(|(_, first)| (profile, first.min(repeat)))
        })
        .max_by(|a, b| a.1.total_cmp(&b.1));
        let accepted = confirmed.is_some();
        if !resources_free(&app, &client).await {
            return Err("CALIBRATION_BUSY".into());
        }
        let selected = confirmed.map_or(0, |(profile, _)| profile);
        common::save(&receipt_path, selected)?;
        report["selectedProfile"] = json!(selected);
        if let Some((profile, ratio)) = confirmed {
            let settings = if request.task == "music" {
                json!({"vaeChunk": profile})
            } else {
                json!({"threads": profile})
            };
            calibration::record_gain_with_profile(
                reports.parent().expect("app cache directory"),
                &request.task,
                &request.model,
                calibration::ConfirmedGain {
                    metric: "duration",
                    ratio,
                },
                Some(settings),
            );
        }
        Ok::<bool, String>(accepted)
    }
    .await;
    match &outcome {
        Ok(selected) => {
            report["status"] = json!("completed");
            report["selected"] = json!(selected);
        }
        Err(error) => {
            report["status"] = json!("interrupted");
            report["error"] = json!(error);
        }
    }
    save_report(&report_path, &report);
    outcome
}

fn quick_request(request: &Request, upscale_model: Option<String>) -> Request {
    let mut quick = request.clone();
    match quick.task.as_str() {
        "image" => {
            quick.width = 512;
            quick.height = 512;
            quick.steps = 2;
            quick.upscale_factor = Some(2);
            quick.upscale_model = upscale_model;
        }
        "video" => {
            (quick.width, quick.height) = if quick.width >= quick.height {
                (384, 224)
            } else {
                (224, 384)
            };
            quick.duration_seconds = Some(3);
            quick.frames = 25;
            quick.fps = 8;
            quick.steps = 2;
        }
        "music" => {
            quick.duration_seconds = Some(10);
            quick.steps = 4;
            quick.music_format = Some("wav16".into());
        }
        _ => {}
    }
    quick
}

fn save_report(path: &Path, report: &Value) {
    if let Err(error) = (|| {
        std::fs::create_dir_all(path.parent().expect("report parent"))?;
        std::fs::write(path, serde_json::to_vec_pretty(report)?)
    })() {
        log::warn!("Could not save calibration report: {error}");
    }
}

async fn compare<R: Runtime>(
    app: &AppHandle<R>,
    client: &reqwest::Client,
    root: &Path,
    mut request: Request,
    phase: &str,
    candidates: &[u32],
    report: &mut Value,
    report_path: &Path,
) -> Result<Vec<(u32, f64)>, String> {
    let mut qualified = candidates
        .iter()
        .map(|&profile| (profile, f64::INFINITY))
        .collect::<Vec<_>>();
    for (round, prompt) in [
        "A calm garden at sunrise, a clear and balanced composition",
        "An evening by the sea, gentle rhythm, clear detail",
    ]
    .into_iter()
    .enumerate()
    {
        if candidates.is_empty() {
            break;
        }
        request.prompt = prompt.into();
        request.seed = 42 + round as u32;
        let mut order = std::iter::once(0)
            .chain(candidates.iter().copied())
            .collect::<Vec<_>>();
        if (round != 0) != (phase == "confirmation") {
            order.reverse();
        }
        let mut samples = std::collections::HashMap::new();
        for profile in order {
            request.calibrated = profile;
            let label = if request.task == "music" {
                format!("VAE · {profile}")
            } else {
                format!("CPU · {profile}")
            };
            let started_at = SystemTime::now().duration_since(UNIX_EPOCH).unwrap_or_default().as_millis();
            report["trials"].as_array_mut().expect("report trials").push(json!({
                "phase":phase, "round":round+1, "seed":request.seed, "candidate":profile!=0,
                "label": if profile == 0 { None } else { Some(label) }, "pending":true,
                "startedAt":started_at, "timeoutMs":trial_limit(&request.task, phase)*1000,
                "work":{"stage":"initializing"},
            }));
            save_report(report_path, report);
            let result = sample(app, client, root, request.clone(), phase, report, report_path).await;
            let trial = match &result {
                Ok((seconds, output)) => {
                    let digest = output
                        .iter()
                        .map(|byte| format!("{byte:02x}"))
                        .collect::<String>();
                    samples.insert(profile, (*seconds, output.clone(), digest.clone()));
                    json!({"seconds": seconds, "sha256": digest})
                }
                Err(error) => json!({"error":error}),
            };
            let current = report["trials"].as_array_mut().expect("report trials").last_mut().expect("pending trial");
            current["pending"] = json!(false);
            for key in ["seconds", "sha256", "error"] {
                current[key] = trial[key].clone();
            }
            save_report(report_path, report);
            if let Err(error) = result {
                if profile == 0 || error.contains("CALIBRATION_BUSY") {
                    return Err(error);
                }
            }
        }
        let (reference, original, digest) = &samples[&0];
        qualified.retain_mut(|(profile, minimum)| {
            let Some((duration, output, hash)) = samples.get(profile) else { return false };
            let identical = output == original;
            let ratio = 1.0 - duration / reference;
            let accepted = improves([*reference, *duration], &[original, output]);
            report["pairs"].as_array_mut().expect("report pairs").push(json!({
                "phase":phase,"round":round+1,"profile":profile,"seed":request.seed,"width":request.width,
                "height":request.height,"steps":request.steps,"frames":request.frames,"fps":request.fps,
                "durationSeconds":request.duration_seconds,"upscale":request.upscale_factor,
                "seconds":[reference,duration],"sha256":[digest,hash],"identical":identical,"qualified":accepted,
            }));
            if accepted { *minimum = minimum.min(ratio); }
            accepted
        });
        save_report(report_path, report);
    }
    qualified.sort_by(|a, b| b.1.total_cmp(&a.1));
    Ok(qualified)
}

fn improves(durations: [f64; 2], outputs: &[impl AsRef<[u8]>; 2]) -> bool {
    !outputs[0].as_ref().is_empty()
        && outputs[0].as_ref() == outputs[1].as_ref()
        && durations[0] > 0.0
        && durations[1] > 0.0
        && durations[1] <= durations[0] * (1.0 - MIN_GAIN)
}

#[cfg(test)]
mod tests {
    use super::improves;

    #[test]
    fn media_requires_byte_identity_and_a_measured_gain() {
        assert!(improves([10.0, 9.0], &[vec![1], vec![1]]));
        assert!(improves([10.0, 9.66], &[vec![1], vec![1]]));
        assert!(!improves([10.0, 9.68], &[vec![1], vec![1]]));
        assert!(!improves([10.0, 9.0], &[vec![1], vec![2]]));
        assert!(!improves([10.0, 9.9], &[vec![1], vec![1]]));
        assert!(!improves([10.0, 9.0], &[vec![], vec![]]));
    }
}
