use super::desktop_calibration as common;
use serde_json::{json, Value};
use std::{
    path::{Component, Path, PathBuf},
    process::Stdio,
    time::{Duration, Instant},
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_llamacpp::engine::{calibration, worker};
use tokio::process::Command;

fn imported_path(data: &Path, model_id: &str) -> Result<PathBuf, String> {
    if !model_id.split('/').all(|part| {
        !part.is_empty()
            && part != "."
            && part != ".."
            && part
                .bytes()
                .all(|c| c.is_ascii_alphanumeric() || b"_-.".contains(&c))
    }) {
        return Err("Invalid MLX model ID".into());
    }
    let registration = data.join("mlx/models").join(model_id).join("model.yml");
    let content = std::fs::read(&registration).map_err(|e| {
        format!(
            "Cannot read imported MLX model {}: {e}",
            registration.display()
        )
    })?;
    let model: Value = serde_yaml::from_slice(&content).map_err(|e| e.to_string())?;
    let path = Path::new(
        model["model_path"]
            .as_str()
            .filter(|path| !path.is_empty())
            .ok_or("Missing model_path")?,
    );
    if path.is_absolute() {
        return Ok(path.to_owned());
    }
    if !path
        .components()
        .all(|part| matches!(part, Component::Normal(_)))
    {
        return Err("Invalid relative MLX model path".into());
    }
    Ok(data.join(path))
}

const CACHE_MIB: &[u32] = &[0, 64, 128, 256];

/// CLI entry into the same local-only calibration used by Desktop imports.
pub(crate) fn handle_cli<R: Runtime>(
    app: AppHandle<R>,
    args: impl IntoIterator<Item = String>,
) -> bool {
    let mut args = args.into_iter().skip(1);
    if args.next().as_deref() != Some("--calibrate-mlx") {
        return false;
    }
    let report = |message: &str| {
        eprintln!("MLX calibration: {message}");
        log::info!("MLX calibration: {message}");
    };
    if !cfg!(all(target_os = "macos", target_arch = "aarch64"))
        || !jan_utils::calibration::available()
    {
        report("requires the local Apple Silicon build");
        return true;
    }
    let Some(id) = args.next() else {
        report("usage: --calibrate-mlx MODEL_ID [CONTEXT]");
        return true;
    };
    let context = args
        .next()
        .map_or(Some(4096), |value| value.parse::<i32>().ok());
    let Some(context) =
        context.filter(|value| (16..=131072).contains(value) && args.next().is_none())
    else {
        report("usage: --calibrate-mlx MODEL_ID [CONTEXT]");
        return true;
    };
    tauri::async_runtime::spawn(async move {
        if !calibration::enabled() {
            report("automatic calibration is paused in the Auto Tune dashboard");
            return;
        }
        let data = super::app::commands::get_jan_data_folder_path(app.clone());
        let model = match imported_path(&data, &id) {
            Ok(model) => model,
            Err(error) => {
                report(&error);
                return;
            }
        };
        let Some((_, _, receipt)) = paths(&app, &model.to_string_lossy(), context) else {
            report("could not resolve the imported model or packaged MLX server");
            return;
        };
        let already_tested = common::already_compared(&receipt);
        let deadline = Instant::now() + Duration::from_secs(90);
        loop {
            match mlx_calibrate(app.clone(), model.to_string_lossy().into_owned(), context).await {
                Ok(()) => {
                    let selected = common::selected(Some(receipt), 256, CACHE_MIB);
                    let result = if selected == 0 {
                        "reference profile retained".to_owned()
                    } else if already_tested {
                        format!("previously validated {selected} MiB profile retained")
                    } else {
                        format!("{selected} MiB selected for the next model load")
                    };
                    report(&result);
                    return;
                }
                Err(error)
                    if error == "CALIBRATION_BUSY"
                        && calibration::enabled()
                        && Instant::now() < deadline =>
                {
                    tokio::time::sleep(Duration::from_secs(2)).await
                }
                Err(error) if error == "CALIBRATION_BUSY" => {
                    report("paused or busy; unload active models and try again");
                    return;
                }
                Err(error) => {
                    report(&error);
                    return;
                }
            }
        }
    });
    true
}

fn paths<R: Runtime>(
    app: &AppHandle<R>,
    model: &str,
    context: i32,
) -> Option<(PathBuf, PathBuf, PathBuf)> {
    if !cfg!(all(target_os = "macos", target_arch = "aarch64"))
        || !jan_utils::calibration::available()
    {
        return None;
    }
    let model = Path::new(model).canonicalize().ok()?;
    let root = if model.is_dir() {
        &model
    } else {
        model.parent()?
    };
    if !root.join("config.json").is_file() {
        return None;
    }
    let binary = app
        .path()
        .resource_dir()
        .ok()?
        .join("resources/bin/mlx-server");
    let cache = app.path().app_cache_dir().ok()?.join("mlx-calibration");
    let receipt = common::receipt(&cache, &model, ("mlx-cache-v1", context), &binary)?;
    Some((model, binary, receipt))
}

#[tauri::command]
pub fn mlx_calibration_profile<R: Runtime>(
    app: AppHandle<R>,
    model_path: String,
    context: i32,
) -> u32 {
    common::selected(
        paths(&app, &model_path, context).map(|(_, _, path)| path),
        256,
        CACHE_MIB,
    )
}

#[tauri::command]
pub async fn mlx_calibrate<R: Runtime>(
    app: AppHandle<R>,
    model_path: String,
    context: i32,
) -> Result<(), String> {
    let Some((model, binary, path)) = paths(&app, &model_path, context) else {
        return Ok(());
    };
    if common::already_compared(&path) {
        return Ok(());
    }
    let client = worker::loopback_client();
    if !common::resources_free(&app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let _active =
        calibration::try_background(calibration::Category::Text).ok_or("CALIBRATION_BUSY")?;
    let _activity = calibration::track_activity("text", &model.to_string_lossy(), "mlx");
    let reference = common::selected(Some(path.clone()), 256, CACHE_MIB);
    let confirmed =
        common::compare_profiles(reference, CACHE_MIB, |confirming, round, cache_mib| {
            let app = &app;
            let client = &client;
            let model = &model;
            let binary = &binary;
            async move {
                let prompt = if confirming {
                    [
                        "Explain two methods of conserving water at home.",
                        "Décris le cycle des saisons en détail.",
                    ]
                } else {
                    [
                        "Describe how to organise a library.",
                        "Décris un jardin au printemps.",
                    ]
                }[round];
                let foreground = async {
                    while common::resources_free(app, client).await {
                        tokio::time::sleep(Duration::from_millis(500)).await;
                    }
                };
                tokio::select! {
                    biased;
                    _ = foreground => Err("CALIBRATION_BUSY".into()),
                    value = tokio::time::timeout(Duration::from_secs(180),
                        sample(client, model, binary, context, cache_mib, prompt)) =>
                        value.unwrap_or_else(|_| Err("MLX calibration timed out".into())),
                }
            }
        })
        .await?;
    if !common::resources_free(&app, &client).await {
        return Err("CALIBRATION_BUSY".into());
    }
    let selected = confirmed.map_or(reference, |(cache, _)| cache);
    common::save(&path, selected)?;
    common::publish_gain(
        &app,
        &model.to_string_lossy(),
        confirmed.map(|(_, gain)| gain),
        json!({"cacheMiB": selected}),
    );
    Ok(())
}

async fn sample(
    client: &reqwest::Client,
    model: &Path,
    binary: &Path,
    context: i32,
    cache_mib: u32,
    prompt: &str,
) -> Result<calibration::Sample, String> {
    let listener = std::net::TcpListener::bind(("127.0.0.1", 0)).map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    drop(listener);
    let key = uuid::Uuid::new_v4().to_string();
    let url = format!("http://127.0.0.1:{port}");
    let mut command = Command::new(binary);
    command
        .arg("--model")
        .arg(model)
        .args([
            "--model-id",
            "calibration",
            "--port",
            &port.to_string(),
            "--ctx-size",
            &context.to_string(),
            "--api-key",
            &key,
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .kill_on_drop(true);
    if cache_mib > 0 {
        command
            .arg("--calibration-cache-mib")
            .arg(cache_mib.to_string());
    }
    let started = Instant::now();
    let mut child = command.spawn().map_err(|e| e.to_string())?;
    loop {
        if child.try_wait().map_err(|e| e.to_string())?.is_some() {
            return Err("MLX probe worker exited before readiness".into());
        }
        if client
            .get(format!("{url}/health"))
            .timeout(Duration::from_secs(1))
            .send()
            .await
            .is_ok_and(|response| response.status().is_success())
        {
            break;
        }
        tokio::time::sleep(Duration::from_millis(50)).await;
    }
    let load = started.elapsed().as_secs_f64();
    let started = Instant::now();
    let body = client
        .post(format!("{url}/v1/chat/completions"))
        .bearer_auth(key)
        .json(
            &json!({"model":"calibration", "messages":[{"role":"user","content":prompt}],
            "temperature":0, "max_tokens":128, "stream":false}),
        )
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?
        .json::<Value>()
        .await
        .map_err(|e| e.to_string())?;
    let duration = started.elapsed().as_secs_f64();
    let _ = child.kill().await;
    let tokens = body["usage"]["completion_tokens"]
        .as_u64()
        .filter(|n| *n > 0)
        .ok_or("MLX returned no tokens")?;
    let choice = &body["choices"][0];
    if choice["message"]["content"]
        .as_str()
        .is_none_or(str::is_empty)
        || choice["finish_reason"].as_str().is_none()
    {
        return Err("Incomplete MLX calibration response".into());
    }
    Ok(calibration::Sample {
        load,
        rate: tokens as f64 / duration,
        output: json!([choice, body["usage"]]),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn cli_resolves_existing_registrations_and_rejects_path_traversal() {
        let root = tempfile::tempdir().unwrap();
        let record = root.path().join("mlx/models/org/model");
        std::fs::create_dir_all(&record).unwrap();
        let config = record.join("model.yml");
        std::fs::write(&config, "model_path: weights/Model With Spaces\n").unwrap();
        assert_eq!(
            imported_path(root.path(), "org/model").unwrap(),
            root.path().join("weights/Model With Spaces")
        );
        assert!(imported_path(root.path(), "org/../model").is_err());
        std::fs::write(&config, "model_path: ../another-profile\n").unwrap();
        assert!(imported_path(root.path(), "org/model").is_err());
    }
}
