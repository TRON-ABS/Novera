use clap::Subcommand;
use novera_inference::engine::{self, in_process::LocalServer};
use std::path::PathBuf;

#[derive(Subcommand)]
pub enum EngineCommands {
    /// Print the linked llama.cpp release identity as JSON
    Version,
    /// Serve local models using an existing Novera/llama.cpp INI preset
    Serve {
        #[arg(long)]
        preset: PathBuf,
        /// Loopback-only port; 0 asks the OS to choose
        #[arg(long, default_value_t = 8080)]
        port: u16,
        #[arg(long, default_value_t = 1)]
        models_max: usize,
        #[arg(long, default_value_t = 0)]
        slot_cache_mib: u64,
    },
}

pub async fn run(command: EngineCommands) -> Result<(), String> {
    engine::assert_pinned_version().map_err(|e| e.to_string())?;
    match command {
        EngineCommands::Version => {
            println!(
                "{}",
                serde_json::json!({
                    "version": engine::PINNED_VERSION, "tag": engine::PINNED_TAG,
                    "build_number": engine::PINNED_BUILD_NUMBER, "commit": engine::PINNED_COMMIT,
                })
            );
        }
        EngineCommands::Serve {
            preset,
            port,
            models_max,
            slot_cache_mib,
        } => {
            let key = std::env::var("NOVERA_ENGINE_API_KEY").map_err(|_| {
                "Set NOVERA_ENGINE_API_KEY before starting the local server".to_string()
            })?;
            let server = LocalServer::start(&preset, port, key, models_max, slot_cache_mib).await?;
            println!(
                "{}",
                serde_json::json!({ "base_url": format!("http://127.0.0.1:{}/v1", server.port),
                "models": &server.models, "llama_version": engine::PINNED_VERSION })
            );
            let signal = tokio::signal::ctrl_c().await.map_err(|e| e.to_string());
            server.stop().await;
            signal?;
        }
    }
    Ok(())
}
