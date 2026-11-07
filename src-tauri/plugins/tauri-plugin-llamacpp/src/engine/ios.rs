//! iOS hosts llama.cpp in the app: spawning an executable is unavailable.
use super::in_process::LocalServer;
use std::{
    collections::HashMap,
    path::{Path, PathBuf},
    sync::Arc,
};
use tauri_plugin_hardware::vendor::nvidia::CudaVersion;

#[derive(Debug, Clone, Copy)]
pub enum RuntimeFault {
    Oom,
    Backend,
}
impl RuntimeFault {
    pub const fn event_name(self) -> &'static str {
        match self {
            Self::Oom => "llamacpp-router-oom",
            Self::Backend => "llamacpp-router-backend-error",
        }
    }
}
pub type FaultCallback = Arc<dyn Fn(RuntimeFault, String) + Send + Sync + 'static>;

#[derive(Debug)]
pub struct WorkerError(String);
impl std::fmt::Display for WorkerError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}", self.0)
    }
}

pub struct WorkerHandle {
    pub port: u16,
    pub pid: u32,
    pub api_key: String,
    pub models: Vec<String>,
    pub cuda_toolkit: Option<CudaVersion>,
    server: LocalServer,
}

impl WorkerHandle {
    pub async fn stop(self) {
        self.server.stop().await;
    }
    // Never kill the application's own PID. Drain/cancel through the server.
    pub async fn kill(self) {
        self.server.stop().await;
    }
    pub fn exited(&mut self) -> Option<std::process::ExitStatus> {
        use std::os::unix::process::ExitStatusExt;
        self.server
            .finished()
            .then(|| std::process::ExitStatus::from_raw(0))
    }
}

#[allow(clippy::too_many_arguments)]
pub async fn spawn(
    _exe: &Path,
    preset_path: &Path,
    port: u16,
    api_key: &str,
    _models_max: u32,
    _slot_cache_mib: u64,
    envs: HashMap<String, String>,
    _on_fault: Option<FaultCallback>,
) -> Result<WorkerHandle, WorkerError> {
    // Process-global environment mutation would race other app requests.
    if !envs.is_empty() {
        log::debug!("iOS ignores child-process environment overrides");
    }
    let server = LocalServer::start(preset_path, port, api_key.to_string(), 1, 0)
        .await
        .map_err(WorkerError)?;
    Ok(WorkerHandle {
        port: server.port,
        pid: std::process::id(),
        api_key: api_key.into(),
        models: server.models.clone(),
        cuda_toolkit: None,
        server,
    })
}

pub fn loopback_client_builder() -> reqwest::ClientBuilder {
    reqwest::Client::builder().no_proxy()
}
pub fn loopback_client() -> reqwest::Client {
    loopback_client_builder().build().unwrap_or_default()
}
pub fn worker_file_name() -> &'static str {
    "in-process llama.cpp"
}
pub fn sidecar_candidate() -> Option<PathBuf> {
    None
}
pub fn configure_bundled_environment(_command: &mut tokio::process::Command, _exe: &Path) {}
