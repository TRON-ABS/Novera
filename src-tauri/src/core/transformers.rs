//! Desktop CPU/CUDA inference for complete Hugging Face Safetensors directories.
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

const EXLLAMA_SCRIPT: &str = include_str!("../../../transformers-server/exllama_backend.py");
const SCRIPT: &str = include_str!("../../../transformers-server/server.py");
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
    torch_version: String,
    context_size: u32,
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
}

async fn directory<R: Runtime>(app: AppHandle<R>) -> Result<PathBuf, String> {
    let data = super::app::commands::get_jan_data_folder_path(app);
    let directory = PathBuf::from(data).join("transformers");
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

fn inspect_quantization(config: &serde_json::Value) -> Result<(), String> {
    let Some(quant) = config.get("quantization_config").filter(|v| !v.is_null()) else {
        return Ok(());
    };
    let quant = quant
        .as_object()
        .ok_or("quantization_config must be an object")?;
    let valid = match quant.get("quant_method").and_then(|v| v.as_str()) {
        Some("exl3" | "exl2") => quant
            .get("bits")
            .and_then(|v| v.as_f64())
            .is_some_and(|bits| bits.is_finite() && (1.0..=8.0).contains(&bits)),
        Some("awq") => {
            quant.get("bits").and_then(|v| v.as_u64()) == Some(4)
                && quant.get("version").map_or(true, |v| {
                    v.as_str().is_some_and(|s| s.eq_ignore_ascii_case("gemm"))
                })
                && quant
                    .get("do_fuse")
                    .map_or(true, |v| v.as_bool() == Some(false))
        }
        Some("gptq") => {
            quant
                .get("bits")
                .and_then(|v| v.as_u64())
                .is_some_and(|v| [2, 3, 4, 8].contains(&v))
                && quant
                    .get("checkpoint_format")
                    .map_or(true, |v| matches!(v.as_str(), Some("gptq" | "gptq_v2")))
        }
        Some("bitsandbytes") => {
            let flag = |bits| -> Option<bool> {
                let plain = quant.get(&format!("load_in_{bits}bit"));
                let private = quant.get(&format!("_load_in_{bits}bit"));
                let value = plain.or(private).map_or(Some(false), |v| v.as_bool());
                if private.is_some_and(|v| v.as_bool() != value) {
                    None
                } else {
                    value
                }
            };
            matches!(
                (flag(4), flag(8)),
                (Some(true), Some(false)) | (Some(false), Some(true))
            ) && quant
                .get("llm_int8_enable_fp32_cpu_offload")
                .map_or(true, |v| v.as_bool() == Some(false))
                && (flag(4) != Some(true)
                    || quant
                        .get("bnb_4bit_quant_type")
                        .map_or(true, |v| matches!(v.as_str(), Some("fp4" | "nf4"))))
        }
        _ => false,
    };
    if valid {
        Ok(())
    } else {
        Err("Unsupported or invalid quantization configuration. Supported: EXL3, EXL2, AWQ GEMM 4-bit, GPTQ 2/3/4/8-bit, bitsandbytes 4/8-bit; CUDA and optional loaders required.".into())
    }
}

fn inspect(path: &Path) -> Result<u64, String> {
    let read_json = |name: &str| -> Result<serde_json::Value, String> {
        serde_json::from_slice(&std::fs::read(path.join(name)).map_err(|e| format!("{name}: {e}"))?)
            .map_err(|e| e.to_string())
    };
    let config = read_json("config.json")?;
    inspect_quantization(&config)?;
    if ![
        "tokenizer.json",
        "tokenizer.model",
        "vocab.json",
        "vocab.txt",
    ]
    .iter()
    .any(|n| path.join(n).is_file())
    {
        return Err("Select the complete model folder including tokenizer files".into());
    }
    let names: std::collections::HashSet<String> =
        if path.join("model.safetensors.index.json").is_file() {
            read_json("model.safetensors.index.json")?
                .get("weight_map")
                .and_then(|v| v.as_object())
                .ok_or("Invalid Safetensors index")?
                .values()
                .map(|v| v.as_str().map(str::to_owned).ok_or("Invalid shard name"))
                .collect::<Result<_, _>>()?
        } else if matches!(
            config["quantization_config"]["quant_method"].as_str(),
            Some("exl3" | "exl2")
        ) {
            std::fs::read_dir(path)
                .map_err(|e| e.to_string())?
                .map(|entry| {
                    entry
                        .map(|entry| entry.file_name().to_string_lossy().into_owned())
                        .map_err(|e| e.to_string())
                })
                .collect::<Result<Vec<_>, _>>()?
                .into_iter()
                .filter(|name| name.ends_with(".safetensors"))
                .collect()
        } else {
            ["model.safetensors".to_owned()].into_iter().collect()
        };
    if names.is_empty() {
        return Err("Empty Safetensors index".into());
    }
    let mut size = 0;
    for name in names {
        let file = path
            .join(&name)
            .canonicalize()
            .map_err(|e| format!("Missing shard {name}: {e}"))?;
        if !file.starts_with(path)
            || file.extension().and_then(|e| e.to_str()) != Some("safetensors")
            || !file.is_file()
        {
            return Err(format!("Invalid Safetensors shard: {name}"));
        }
        size += file.metadata().map_err(|e| e.to_string())?.len();
    }
    Ok(size)
}

#[tauri::command]
pub async fn transformers_list<R: Runtime>(app: AppHandle<R>) -> Result<Vec<Model>, String> {
    let _guard = REGISTRY.lock().await;
    read_models(&directory(app).await?)
}

#[tauri::command]
pub async fn transformers_import<R: Runtime>(
    app: AppHandle<R>,
    model_id: String,
    model_path: String,
) -> Result<(), String> {
    if model_id.trim().is_empty() || model_id.len() > 200 {
        return Err("Invalid model name".into());
    }
    let path = PathBuf::from(model_path)
        .canonicalize()
        .map_err(|e| e.to_string())?;
    let size_bytes = inspect(&path)?;
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
        provider_id: "transformers".into(),
        port: 0,
        imported: true,
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
pub async fn transformers_unload(model_id: String) -> Result<(), String> {
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
pub async fn transformers_session(model_id: String) -> Result<Option<Session>, String> {
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
pub async fn transformers_delete<R: Runtime>(
    app: AppHandle<R>,
    model_id: String,
) -> Result<(), String> {
    transformers_unload(model_id.clone()).await?;
    let _guard = REGISTRY.lock().await;
    let directory = directory(app).await?;
    let mut models = read_models(&directory)?;
    models.retain(|m| m.id != model_id);
    // Imported folders belong to the user. Remove only the registry entry.
    write_models(&directory, &models)
}

#[tauri::command]
pub async fn transformers_load<R: Runtime>(
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
    std::fs::write(directory.join("exllama_backend.py"), EXLLAMA_SCRIPT)
        .map_err(|e| e.to_string())?;
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
        .env("NOVERA_TRANSFORMERS_KEY", &api_key)
        .env("TORCHINDUCTOR_CACHE_DIR", directory.join("torch-cache"))
        .env("TRITON_CACHE_DIR", directory.join("triton-cache"))
        .env("TORCH_EXTENSIONS_DIR", directory.join("torch-extensions"))
        .env("HF_HUB_OFFLINE", "1")
        .env("TRANSFORMERS_OFFLINE", "1")
        .env("TORCHDYNAMO_DISABLE", "1")
        .stdout(Stdio::null())
        .stderr(log)
        .kill_on_drop(true);
    #[cfg(windows)]
    command.creation_flags(0x08000000); // CREATE_NO_WINDOW
    let mut child = command.spawn().map_err(|e| format!("Cannot start Python: {e}. Configure the Python executable with torch, transformers and safetensors installed."))?;
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
            return Err(format!("Safetensors engine failed: {tail}"));
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
                "Safetensors engine did not become ready in 300 seconds. See {}",
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
        torch_version: runtime["torch"].as_str().unwrap_or("unknown").into(),
        context_size: runtime["context_size"].as_u64().unwrap_or(2048) as u32,
    };
    *worker = Some(Worker {
        child,
        session: session.clone(),
    });
    Ok(session)
}

/// Inspect the selected environment without downloading or loading model weights.
#[tauri::command]
pub async fn transformers_probe<R: Runtime>(
    app: AppHandle<R>,
    python_path: String,
) -> Result<serde_json::Value, String> {
    let directory = directory(app).await?;
    let script = directory.join("probe.py");
    std::fs::write(&script, SCRIPT).map_err(|e| e.to_string())?;
    std::fs::write(directory.join("exllama_backend.py"), EXLLAMA_SCRIPT)
        .map_err(|e| e.to_string())?;
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
        .env("TRANSFORMERS_OFFLINE", "1")
        .env("TORCHDYNAMO_DISABLE", "1")
        .env("TORCHINDUCTOR_CACHE_DIR", directory.join("torch-cache"))
        .env("TRITON_CACHE_DIR", directory.join("triton-cache"))
        .env("TORCH_EXTENSIONS_DIR", directory.join("torch-extensions"))
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
    fn shares_quantization_policy_with_python_and_hub() {
        let cases: Vec<serde_json::Value> = serde_json::from_str(include_str!(
            "../../../transformers-server/quantization-cases.json"
        ))
        .unwrap();
        for case in cases {
            assert_eq!(
                inspect_quantization(&case["config"]).is_err(),
                case["expected"] == "unsupported",
                "{}",
                case["name"]
            );
        }
    }
    #[tokio::test]
    #[ignore = "Requires NOVERA_SAFETENSORS_TEST_PYTHON and NOVERA_SAFETENSORS_TEST_MODEL"]
    async fn imports_loads_generates_and_unregisters_without_deleting_weights() {
        let python = std::env::var("NOVERA_SAFETENSORS_TEST_PYTHON").unwrap();
        let model = std::env::var("NOVERA_SAFETENSORS_TEST_MODEL").unwrap();
        let app = tauri::test::mock_app();
        let handle = app.handle().clone();
        let runtime = transformers_probe(handle.clone(), python.clone())
            .await
            .unwrap();
        assert_eq!(runtime["ready"], true);
        assert_eq!(runtime["python"], "3.15.1");
        let id = "tiny-safetensors-test".to_string();
        transformers_import(handle.clone(), id.clone(), model.clone())
            .await
            .unwrap();
        assert_eq!(transformers_list(handle.clone()).await.unwrap().len(), 1);
        let device =
            std::env::var("NOVERA_SAFETENSORS_TEST_DEVICE").unwrap_or_else(|_| "cpu".into());
        let session = transformers_load(
            handle.clone(),
            id.clone(),
            python,
            Some(128),
            Some(device.clone()),
        )
        .await
        .unwrap();
        assert_eq!(session.device, device);
        if device == "cuda" {
            assert_eq!(runtime["cudaAvailable"], true);
        }
        assert!(session.port > 0);
        assert_eq!(
            transformers_session(id.clone()).await.unwrap().unwrap().pid,
            session.pid
        );
        let response = reqwest::Client::builder().no_proxy().build().unwrap()
            .post(format!("http://127.0.0.1:{}/v1/chat/completions", session.port))
            .bearer_auth(&session.api_key)
            .json(&serde_json::json!({"model": id, "messages": [{"role":"user", "content":"Bonjour Novera"}], "max_tokens":8, "temperature":0}))
            .send().await.unwrap().error_for_status().unwrap().json::<serde_json::Value>().await.unwrap();
        assert!(response["usage"]["completion_tokens"].as_u64().unwrap() > 0);
        transformers_delete(handle.clone(), id.clone())
            .await
            .unwrap();
        assert!(transformers_session(id).await.unwrap().is_none());
        assert!(transformers_list(handle).await.unwrap().is_empty());
        assert!(Path::new(&model).join("model.safetensors").is_file());
    }

    #[test]
    fn validates_shards_and_never_accepts_external_weights() {
        let root =
            std::env::temp_dir().join(format!("novera-safetensors-{}", uuid::Uuid::new_v4()));
        std::fs::create_dir_all(&root).unwrap();
        let root = root.canonicalize().unwrap();
        std::fs::write(root.join("config.json"), "{}").unwrap();
        std::fs::write(root.join("tokenizer.json"), "{}").unwrap();
        assert!(inspect(&root).is_err());
        std::fs::write(root.join("model.safetensors"), [0u8; 8]).unwrap();
        assert_eq!(inspect(&root).unwrap(), 8);
        std::fs::write(
            root.join("model.safetensors.index.json"),
            r#"{"weight_map":{"weight":"../outside.safetensors"}}"#,
        )
        .unwrap();
        assert!(inspect(&root).is_err());
        std::fs::remove_dir_all(root).unwrap();
    }
}
