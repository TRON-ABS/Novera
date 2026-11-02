//! Portable builds require the reviewed root marker and never use installed profiles.
use sha2::{Digest, Sha256};
use std::{
    fs::File,
    path::{Path, PathBuf},
    sync::OnceLock,
};

static ROOT: OnceLock<PathBuf> = OnceLock::new();
static LOCK: OnceLock<File> = OnceLock::new();

pub fn root() -> &'static Path {
    ROOT.get().expect("portable initialized before plugins")
}
pub fn data_root() -> PathBuf {
    root().join("Data")
}
pub fn data_folder() -> PathBuf {
    root().join("Data/Novera/data")
}
pub fn models_root() -> PathBuf {
    root().join("Data/Models")
}
pub fn webview_root() -> PathBuf {
    root().join("Data/WebView")
}

pub fn initialize() -> Result<(), Box<dyn std::error::Error>> {
    #[cfg(not(windows))]
    compile_error!("The portable distribution currently supports Windows only");
    let portable_root = novera_portable::root_for_executable(&std::env::current_exe()?)?;
    let guard = novera_portable::profile_lock(&portable_root).map_err(|e| {
        format!(
            "Close the other Novera portable instance or update before opening this folder: {e}"
        )
    })?;
    novera_portable::initialize_profile_with(&portable_root, |previous, current| {
        tauri_plugin_vector_db::db::relocate_collection_paths(
            &current.join("Data/Novera/data/db"), previous, current,
        ).map_err(|error| std::io::Error::other(error.to_string()))
    })?;
    ROOT.set(portable_root)
        .map_err(|_| "Portable profile already initialized")?;
    LOCK.set(guard)
        .map_err(|_| "Portable lock already initialized")?;
    // All WebView windows, including windows opened later by JS, share this
    // private Chromium profile. Sidecar caches/temp also travel with the folder.
    for (key, path) in [
        ("WEBVIEW2_USER_DATA_FOLDER", webview_root()),
        ("UV_CACHE_DIR", root().join("Data/Cache/uv")),
        ("BUN_INSTALL_CACHE_DIR", root().join("Data/Cache/bun")),
        ("TEMP", root().join("Data/Temp")),
        ("TMP", root().join("Data/Temp")),
    ] {
        std::env::set_var(key, path);
    }
    Ok(())
}

pub fn configure(context: &mut tauri::Context<tauri::Wry>) {
    let suffix = format!("{:x}", Sha256::digest(root().to_string_lossy().as_bytes()));
    context.config_mut().identifier =
        format!("io.github.tronabs.novera.portable.{}", &suffix[..16]);
    for window in &mut context.config_mut().app.windows {
        window.data_directory = Some(webview_root());
    }
}

pub fn updater_arg() -> String {
    // tauri-plugin-updater joins installer arguments without Windows quoting.
    format!(
        "--novera-root={}",
        hex::encode(root().to_string_lossy().as_bytes())
    )
}
