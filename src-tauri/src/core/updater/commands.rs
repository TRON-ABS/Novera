//! Legacy version-comparison command. Desktop checks use Tauri's signed updater.
use super::custom_updater::CustomUpdater;
use tauri::command;

/// Check if update is available by comparing versions
#[command]
pub fn is_update_available(current_version: String, latest_version: String) -> bool {
    let updater = match CustomUpdater::new() {
        Ok(u) => u,
        Err(_) => return false,
    };
    updater.is_update_available(&current_version, &latest_version)
}
