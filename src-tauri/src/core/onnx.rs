//! Managed local ONNX Runtime worker (tensor graphs and GenAI exports).
//! The Python worker is embedded in the binary; Python dependencies are explicit.
use serde::{Deserialize, Serialize};
use std::{
    path::{Path, PathBuf},
    process::Stdio,
    sync::LazyLock,
};
use tauri::{AppHandle, Runtime};
use tokio::{
    process::{Child, Command},
    sync::Mutex,
};

const TRANSPORT: &str = include_str!("../../../onnx-server/transport.py");
const SCRIPT: &str = include_str!("../../../onnx-server/server.py");
static WORKER: LazyLock<Mutex<Option<Worker>>> = LazyLock::new(|| Mutex::new(None));
static REGISTRY: LazyLock<Mutex<()>> = LazyLock::new(|| Mutex::new(()));

struct Worker {
    child: Child,
    session: Session,
}

#[derive(Clone, Serialize)]
pub struct Session {
    pid: u32,
    port: u16,
    model_id: String,
    is_embedding: bool,
    api_key: String,
    device: String,
    runtime_version: String,
    context_size: u32,
    memory: Option<serde_json::Value>,
}

#[derive(Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Model {
    id: String,
    name: String,
    path: PathBuf,
    size_bytes: u64,
    provider_id: String,
    port: u16,
    imported: bool,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    memory: Option<serde_json::Value>,
}

async fn directory<R: Runtime>(app: AppHandle<R>) -> Result<PathBuf, String> {
    let data = super::app::commands::get_jan_data_folder_path(app);
    let directory = PathBuf::from(data).join("onnx");
    std::fs::create_dir_all(&directory).map_err(|e| e.to_string())?;
    Ok(directory)
}

fn read_models(directory: &Path) -> Result<Vec<Model>, String> {
    let file = directory.join("models.json");
    if !file.exists() {
        return Ok(vec![]);
    }
    serde_json::from_slice(&std::fs::read(file).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}

fn write_models(directory: &Path, models: &[Model]) -> Result<(), String> {
    // Keep the previous registry if serialisation fails.
    let data = serde_json::to_vec_pretty(models).map_err(|e| e.to_string())?;
    std::fs::write(directory.join("models.json"), data).map_err(|e| e.to_string())
}

fn inspect(path: &Path) -> Result<u64, String> {
    if !path.is_dir() {
        return Err("Select a complete ONNX export directory".into());
    }
    fn visit(root: &Path, path: &Path, size: &mut u64, graphs: &mut usize) -> Result<(), String> {
        for entry in std::fs::read_dir(path).map_err(|e| e.to_string())? {
            let entry = entry.map_err(|e| e.to_string())?;
            let target = entry.path().canonicalize().map_err(|e| e.to_string())?;
            if !target.starts_with(root)
                || entry.file_type().map_err(|e| e.to_string())?.is_symlink()
            {
                return Err("ONNX exports must not contain symlinks or external paths".into());
            }
            if target.is_dir() {
                visit(root, &target, size, graphs)?;
            } else {
                *size = size
                    .checked_add(target.metadata().map_err(|e| e.to_string())?.len())
                    .ok_or("Model size overflow")?;
                if target.extension().is_some_and(|ext| ext == "onnx") {
                    *graphs += 1;
                }
            }
        }
        Ok(())
    }
    let mut size = 0;
    let mut graphs = 0;
    visit(path, path, &mut size, &mut graphs)?;
    if graphs == 0 {
        return Err("No ONNX graph found in export directory".into());
    }
    Ok(size)
}

#[tauri::command]
pub async fn onnx_list<R: Runtime>(app: AppHandle<R>) -> Result<Vec<Model>, String> {
    let _guard = REGISTRY.lock().await;
    read_models(&directory(app).await?)
}

#[tauri::command]
pub async fn onnx_import<R: Runtime>(
    app: AppHandle<R>,
    model_id: String,
    model_path: String,
    python_path: String,
) -> Result<(), String> {
    if model_id.trim().is_empty() || model_id.len() > 200 {
        return Err("Invalid model name".into());
    }
    let path = PathBuf::from(model_path)
        .canonicalize()
        .map_err(|e| e.to_string())?;
    let size_bytes = inspect(&path)?;
    let inspection_directory = directory(app.clone()).await?;
    let script = inspection_directory.join("export-check.py");
    std::fs::write(&script, SCRIPT).map_err(|e| e.to_string())?;
    std::fs::write(inspection_directory.join("transport.py"), TRANSPORT)
        .map_err(|e| e.to_string())?;
    let mut command = Command::new(python_path);
    command
        .arg("-u")
        .arg(script)
        .arg("--inspect")
        .arg("--model")
        .arg(&path)
        .kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let output = tokio::time::timeout(std::time::Duration::from_secs(60), command.output())
        .await
        .map_err(|_| "ONNX export inspection timed out")?
        .map_err(|e| e.to_string())?;
    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).into_owned());
    }
    let _guard = REGISTRY.lock().await;
    let directory = directory(app).await?;
    let mut models = read_models(&directory)?;
    if models.iter().any(|m| m.id == model_id) {
        return Err("A model with this name already exists".into());
    }
    models.push(Model {
        name: model_id.clone(),
        id: model_id,
        path,
        size_bytes,
        provider_id: "onnx".into(),
        port: 0,
        imported: true,
        memory: None,
    });
    write_models(&directory, &models)
}

async fn stop_worker(worker: &mut Option<Worker>) -> Result<(), String> {
    if let Some(mut running) = worker.take() {
        running.child.kill().await.map_err(|e| e.to_string())?;
    }
    Ok(())
}

pub async fn cleanup() {
    let _ = stop_worker(&mut *WORKER.lock().await).await;
}

#[tauri::command]
pub async fn onnx_unload(model_id: String) -> Result<(), String> {
    let mut worker = WORKER.lock().await;
    if worker
        .as_ref()
        .is_some_and(|w| w.session.model_id == model_id)
    {
        stop_worker(&mut worker).await?;
    }
    Ok(())
}

#[tauri::command]
pub async fn onnx_session(model_id: String) -> Result<Option<Session>, String> {
    let mut worker = WORKER.lock().await;
    if let Some(w) = worker.as_mut() {
        if w.child.try_wait().map_err(|e| e.to_string())?.is_some() {
            *worker = None;
        }
    }
    Ok(worker
        .as_ref()
        .filter(|w| w.session.model_id == model_id || model_id.is_empty())
        .map(|w| w.session.clone()))
}

#[tauri::command]
pub async fn onnx_delete<R: Runtime>(app: AppHandle<R>, model_id: String) -> Result<(), String> {
    onnx_unload(model_id.clone()).await?;
    let _guard = REGISTRY.lock().await;
    let directory = directory(app).await?;
    let mut models = read_models(&directory)?;
    models.retain(|m| m.id != model_id);
    // Imported folders belong to the user. Remove only the registry entry.
    write_models(&directory, &models)
}

#[tauri::command]
pub async fn onnx_load<R: Runtime>(
    app: AppHandle<R>,
    model_id: String,
    python_path: String,
    ctx_size: Option<u32>,
    device: Option<String>,
) -> Result<Session, String> {
    let device = device.unwrap_or_else(|| "auto".into());
    if !matches!(device.as_str(), "auto" | "cpu" | "cuda") {
        return Err("Device must be auto, cpu or cuda".into());
    }
    let directory = directory(app).await?;
    let model = {
        let _guard = REGISTRY.lock().await;
        read_models(&directory)?
            .into_iter()
            .find(|m| m.id == model_id)
            .ok_or("Import the model folder first")?
    };
    inspect(&model.path)?;
    let mut worker = WORKER.lock().await;
    if let Some(w) = worker.as_mut() {
        if w.child.try_wait().map_err(|e| e.to_string())?.is_none()
            && w.session.model_id == model_id
        {
            return Ok(w.session.clone());
        }
    }
    stop_worker(&mut worker).await?;
    let script = directory.join("server.py");
    std::fs::write(&script, SCRIPT).map_err(|e| e.to_string())?;
    std::fs::write(directory.join("transport.py"), TRANSPORT).map_err(|e| e.to_string())?;
    let listener = std::net::TcpListener::bind("127.0.0.1:0").map_err(|e| e.to_string())?;
    let port = listener.local_addr().map_err(|e| e.to_string())?.port();
    drop(listener);
    let api_key = uuid::Uuid::new_v4().to_string();
    let log_path = directory.join("worker.log");
    let log = std::fs::File::create(&log_path).map_err(|e| e.to_string())?;
    let mut command = Command::new(if python_path.trim().is_empty() {
        "python"
    } else {
        python_path.trim()
    });
    command
        .arg("-u")
        .arg(script)
        .arg("--model")
        .arg(&model.path)
        .arg("--model-id")
        .arg(&model_id)
        .arg("--port")
        .arg(port.to_string())
        .arg("--ctx-size")
        .arg(ctx_size.unwrap_or(2048).clamp(16, 131072).to_string())
        .arg("--device")
        .arg(&device)
        .arg("--parent-pid")
        .arg(std::process::id().to_string())
        .env("NOVERA_ONNX_KEY", &api_key)
        .env("HF_HUB_OFFLINE", "1")
        .stdout(Stdio::null())
        .stderr(log)
        .kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let mut child = command.spawn().map_err(|e| format!("Cannot start Python: {e}. Configure the Python executable with onnxruntime, onnx and numpy installed."))?;
    let client = reqwest::Client::builder()
        .no_proxy()
        .timeout(std::time::Duration::from_secs(1))
        .build()
        .map_err(|e| e.to_string())?;
    let deadline = tokio::time::Instant::now() + std::time::Duration::from_secs(300);
    let runtime = loop {
        if child.try_wait().map_err(|e| e.to_string())?.is_some() {
            let log = std::fs::read_to_string(&log_path).unwrap_or_default();
            let tail = log
                .lines()
                .rev()
                .take(12)
                .collect::<Vec<_>>()
                .into_iter()
                .rev()
                .collect::<Vec<_>>()
                .join("\n");
            return Err(format!("ONNX engine failed: {tail}"));
        }
        if let Ok(response) = client
            .get(format!("http://127.0.0.1:{port}/health"))
            .bearer_auth(&api_key)
            .send()
            .await
        {
            if response.status().is_success() {
                if let Ok(body) = response.json::<serde_json::Value>().await {
                    if body.get("model_id").and_then(|v| v.as_str()) == Some(model_id.as_str()) {
                        break body;
                    }
                }
            }
        }
        if tokio::time::Instant::now() >= deadline {
            let _ = child.kill().await;
            return Err(format!(
                "ONNX engine did not become ready in 300 seconds. See {}",
                log_path.display()
            ));
        }
        tokio::time::sleep(std::time::Duration::from_millis(250)).await;
    };
    let session = Session {
        pid: child.id().unwrap_or(0),
        port,
        model_id,
        is_embedding: false,
        api_key,
        device: runtime["device"].as_str().unwrap_or("unknown").into(),
        runtime_version: runtime["onnxruntime"].as_str().unwrap_or("unknown").into(),
        context_size: runtime["context_size"].as_u64().unwrap_or(2048) as u32,
        memory: runtime.get("memory").cloned(),
    };
    *worker = Some(Worker {
        child,
        session: session.clone(),
    });
    Ok(session)
}

/// Inspect the selected environment without downloading or loading model weights.
#[tauri::command]
pub async fn onnx_probe<R: Runtime>(
    app: AppHandle<R>,
    python_path: String,
) -> Result<serde_json::Value, String> {
    let directory = directory(app).await?;
    let script = directory.join("probe.py");
    std::fs::write(&script, SCRIPT).map_err(|e| e.to_string())?;
    std::fs::write(directory.join("transport.py"), TRANSPORT).map_err(|e| e.to_string())?;
    let mut command = Command::new(if python_path.trim().is_empty() {
        "python"
    } else {
        python_path.trim()
    });
    command
        .arg("-u")
        .arg(script)
        .arg("--probe")
        .env("HF_HUB_OFFLINE", "1")
        .kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000);
    let result = tokio::time::timeout(std::time::Duration::from_secs(30), command.output())
        .await
        .map_err(|_| "Python runtime check timed out")?
        .map_err(|e| e.to_string())?;
    if !result.status.success() {
        return Err(String::from_utf8_lossy(&result.stderr)
            .lines()
            .rev()
            .take(4)
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect::<Vec<_>>()
            .join("\n"));
    }
    serde_json::from_slice(&result.stdout).map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn requires_graphs_and_counts_external_data() {
        let root = tempfile::tempdir().unwrap();
        let root = root.path().canonicalize().unwrap();
        assert!(inspect(&root).is_err());
        std::fs::create_dir(root.join("onnx")).unwrap();
        std::fs::write(root.join("onnx/model.onnx"), [0u8; 8]).unwrap();
        std::fs::write(root.join("onnx/weights.data"), [0u8; 32]).unwrap();
        assert_eq!(inspect(&root).unwrap(), 40);
    }

    #[tokio::test]
    #[ignore = "Requires NOVERA_ONNX_TEST_PYTHON and NOVERA_ONNX_TEST_MODEL"]
    async fn imports_runs_and_unregisters_without_deleting_export() {
        let python = std::env::var("NOVERA_ONNX_TEST_PYTHON").unwrap();
        let model = std::env::var("NOVERA_ONNX_TEST_MODEL").unwrap();
        let app = tauri::test::mock_app();
        let handle = app.handle().clone();
        let id = "onnx-native-test".to_string();
        let runtime = onnx_probe(handle.clone(), python.clone()).await.unwrap();
        assert_eq!(runtime["ready"], true);
        onnx_import(handle.clone(), id.clone(), model.clone(), python.clone())
            .await
            .unwrap();
        assert_eq!(onnx_list(handle.clone()).await.unwrap().len(), 1);
        let session = onnx_load(
            handle.clone(),
            id.clone(),
            python,
            Some(128),
            Some("cpu".into()),
        )
        .await
        .unwrap();
        assert_eq!(session.device, "CPUExecutionProvider");
        assert_eq!(
            onnx_session(id.clone()).await.unwrap().unwrap().pid,
            session.pid
        );
        let client = reqwest::Client::builder().no_proxy().build().unwrap();
        let response = client
            .post(format!("http://127.0.0.1:{}/v1/onnx/run", session.port))
            .bearer_auth(&session.api_key)
            .json(
                &serde_json::json!({"inputs":{"x":{"dtype":"float32","shape":[1,2],"data":[3,4]}}}),
            )
            .send()
            .await
            .unwrap()
            .error_for_status()
            .unwrap()
            .json::<serde_json::Value>()
            .await
            .unwrap();
        assert_eq!(
            response["outputs"]["y"]["data"],
            serde_json::json!([4.0, 6.0])
        );
        onnx_delete(handle.clone(), id.clone()).await.unwrap();
        assert!(onnx_list(handle).await.unwrap().is_empty());
        assert!(onnx_session(id).await.unwrap().is_none());
        assert!(Path::new(&model).join("model.onnx").is_file());
    }
}
