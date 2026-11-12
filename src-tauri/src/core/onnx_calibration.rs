use super::{Model, SCRIPT, TRANSPORT};
use crate::core::{components, desktop_calibration as common};
use std::{
    path::{Path, PathBuf},
    time::Duration,
};
use tauri::{AppHandle, Runtime};
use tauri_plugin_llamacpp::engine::{calibration, worker};
use tokio::process::Command;

const CONTEXT: u32 = 2048;
const THREADS: &[u32] = &[0, 2, 4, 8];

fn receipt(
    directory: &Path,
    model: &Model,
    python: &str,
    device: &str,
    context: u32,
) -> Option<PathBuf> {
    common::receipt(
        &directory.join("calibration"),
        &model.path,
        ("onnx-threads-v1", &model.id, device == "cuda", context),
        Path::new(python),
    )
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

struct Scratch(PathBuf);
impl Drop for Scratch {
    fn drop(&mut self) {
        let _ = std::fs::remove_dir_all(&self.0);
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
    let _active =
        calibration::try_background(calibration::Category::Text).ok_or("CALIBRATION_BUSY")?;
    let client = worker::loopback_client();
    if !common::resources_free(app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let _activity = calibration::track_activity("text", &model.id, "onnx");
    let _lease = components::lease().await?;
    let root = directory.join(format!("calibration-{}", uuid::Uuid::new_v4()));
    std::fs::create_dir(&root).map_err(|e| e.to_string())?;
    let scratch = Scratch(root);
    let script = scratch.0.join("server.py");
    std::fs::write(&script, SCRIPT).map_err(|e| e.to_string())?;
    std::fs::write(scratch.0.join("transport.py"), TRANSPORT).map_err(|e| e.to_string())?;
    let reference = common::selected(Some(path.clone()), 2, THREADS);
    let confirmed = common::compare_profiles(reference, THREADS, |_, round, threads| {
        let script = &script;
        let client = &client;
        async move {
                let mut command = Command::new(python);
                components::configure_python(&mut command, python);
                command
                    .arg("-u")
                    .arg(&script)
                    .arg("--model")
                    .arg(&model.path)
                    .args([
                        "--model-id",
                        &model.id,
                        "--device",
                        device,
                        "--calibration-probe",
                        &round.to_string(),
                    ])
                    .args([
                        "--ctx-size",
                        &CONTEXT.to_string(),
                        "--parent-pid",
                        &std::process::id().to_string(),
                    ])
                    .env("HF_HUB_OFFLINE", "1")
                    .kill_on_drop(true);
                if threads > 0 {
                    command.arg("--cpu-threads").arg(threads.to_string());
                }
                #[cfg(windows)]
                command.creation_flags(0x08000000);
                let foreground = async {
                    while common::resources_free(app, &client).await {
                        tokio::time::sleep(Duration::from_millis(500)).await;
                    }
                };
                tokio::select! {
                    biased;
                    _ = foreground => return Err("CALIBRATION_BUSY".into()),
                    value = tokio::time::timeout(Duration::from_secs(120), command.output()) => value
                        .map_err(|e| e.to_string()).and_then(|value| value.map_err(|e| e.to_string()))
                        .and_then(|output| if output.status.success() {
                            serde_json::from_slice::<calibration::Sample>(&output.stdout).map_err(|e| e.to_string())
                        } else {
                            Err(String::from_utf8_lossy(&output.stderr).lines().last().unwrap_or("ONNX probe failed").to_owned())
                        }),
                }
        }
    }).await?;
    if !jan_utils::calibration::enabled() {
        return Err("CALIBRATION_BUSY".into());
    }
    let selected = confirmed.map_or(reference, |(threads, _)| threads);
    common::save(&path, selected)?;
    common::publish_gain(
        app,
        &model.id,
        confirmed.map(|(_, gain)| gain),
        serde_json::json!({"threads": selected}),
    );
    Ok(())
}
