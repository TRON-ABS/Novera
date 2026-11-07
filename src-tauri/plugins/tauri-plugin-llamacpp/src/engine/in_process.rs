//! Local authenticated server shared by iOS and the GUI-free CLI.
//! Native aborts terminate the host process here; there is no sidecar boundary.
use super::{
    assert_pinned_version, http::EngineServer, preset, registry::Registry, slots::StateStore,
};
use std::{path::Path, sync::Arc, time::Duration};
use tokio::sync::{oneshot, Mutex};

pub struct LocalServer {
    pub port: u16,
    pub models: Vec<String>,
    shutdown: Option<oneshot::Sender<()>>,
    task: Option<tokio::task::JoinHandle<()>>,
}

impl LocalServer {
    pub async fn start(
        path: &Path,
        port: u16,
        key: String,
        models_max: usize,
        slot_cache_mib: u64,
    ) -> Result<Self, String> {
        if key.trim().is_empty() {
            return Err("a non-empty local engine API key is required".into());
        }
        if models_max == 0 {
            return Err("models_max must be at least 1".into());
        }
        assert_pinned_version().map_err(|e| e.to_string())?;
        let ini = std::fs::read_to_string(path)
            .map_err(|e| format!("could not read engine preset: {e}"))?;
        let mut registry = Registry::new(models_max);
        let mut models = Vec::new();
        for (name, spec) in preset::specs(&path.to_string_lossy(), &ini) {
            registry.register(name.clone(), spec);
            models.push(name);
        }
        models.sort();
        if models.is_empty() {
            return Err("the engine preset contains no models".into());
        }
        let registry = Arc::new(Mutex::new(registry));
        let (mut server, listener) = EngineServer::bind(Arc::clone(&registry), port, key)
            .await
            .map_err(|e| e.to_string())?;
        if let Some(dir) = preset::shared_value(&ini, "slot-save-path") {
            let store = StateStore::new(&dir, slot_cache_mib);
            store.ensure_dir().map_err(|e| e.to_string())?;
            store.prune();
            server = server.with_slot_state(store);
        }
        let port = server.port;
        let server = Arc::new(server);
        let (shutdown, signal) = oneshot::channel();
        let task = tokio::spawn(async move {
            Arc::clone(&server)
                .serve_until(
                    listener,
                    async {
                        let _ = signal.await;
                    },
                    Duration::from_secs(10),
                )
                .await;
            server.save_resident_slots().await;
            registry.lock().await.shutdown();
        });
        Ok(Self {
            port,
            models,
            shutdown: Some(shutdown),
            task: Some(task),
        })
    }

    pub fn finished(&self) -> bool {
        match &self.task {
            Some(task) => task.is_finished(),
            None => true,
        }
    }

    pub async fn stop(mut self) {
        if let Some(signal) = self.shutdown.take() {
            let _ = signal.send(());
        }
        if let Some(task) = self.task.take() {
            let _ = task.await;
        }
    }
}

impl Drop for LocalServer {
    fn drop(&mut self) {
        // A dropped JoinHandle detaches; let the server drain and release models.
        if let Some(signal) = self.shutdown.take() {
            let _ = signal.send(());
        }
    }
}

#[cfg(all(test, feature = "engine"))]
mod tests {
    use super::*;
    use tokio::io::{AsyncReadExt, AsyncWriteExt};

    async fn models(port: u16, key: Option<&str>) -> String {
        let mut stream = tokio::net::TcpStream::connect(("127.0.0.1", port))
            .await
            .unwrap();
        let authorization = key
            .map(|key| format!("Authorization: Bearer {key}\r\n"))
            .unwrap_or_default();
        stream.write_all(format!("GET /v1/models HTTP/1.1\r\nHost: localhost\r\n{authorization}Connection: close\r\n\r\n").as_bytes()).await.unwrap();
        let mut response = Vec::new();
        tokio::time::timeout(Duration::from_secs(3), stream.read_to_end(&mut response))
            .await
            .unwrap()
            .unwrap();
        String::from_utf8(response).unwrap()
    }

    #[tokio::test]
    async fn local_server_requires_auth_lists_models_and_releases_port() {
        let dir = tempfile::tempdir().unwrap();
        let preset = dir.path().join("local.ini");
        // Listing registered models must not try to load the missing GGUF.
        std::fs::write(&preset, "[test-model]\nmodel = missing.gguf\n").unwrap();
        let server = LocalServer::start(&preset, 0, "test-secret".into(), 1, 0)
            .await
            .unwrap();
        let port = server.port;
        assert_eq!(server.models, ["test-model"]);
        assert!(models(port, None).await.starts_with("HTTP/1.1 401"));
        assert!(models(port, Some("wrong"))
            .await
            .starts_with("HTTP/1.1 401"));
        let response = models(port, Some("test-secret")).await;
        assert!(response.starts_with("HTTP/1.1 200"));
        assert!(response.contains("test-model"));
        server.stop().await;
        let _listener = tokio::net::TcpListener::bind(("127.0.0.1", port))
            .await
            .unwrap();
    }
}
