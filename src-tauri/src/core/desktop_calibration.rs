use sha2::{Digest, Sha256};
use std::{
    path::{Path, PathBuf},
    sync::Arc,
    time::UNIX_EPOCH,
};
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_llamacpp::{engine::calibration, LlamacppState};

pub fn receipt(
    directory: &Path,
    model: &Path,
    settings: impl serde::Serialize,
    runtime: &Path,
) -> Option<PathBuf> {
    fn list(root: &Path, files: &mut Vec<PathBuf>) -> Option<()> {
        for entry in std::fs::read_dir(root).ok()? {
            let entry = entry.ok()?;
            let ty = entry.file_type().ok()?;
            if ty.is_dir() {
                list(&entry.path(), files)?;
            } else if ty.is_file() || ty.is_symlink() {
                files.push(entry.path());
            }
        }
        Some(())
    }
    let mut files = vec![runtime.to_owned(), std::env::current_exe().ok()?];
    let root = if model.is_dir() {
        model
    } else {
        model.parent()?
    };
    list(root, &mut files)?;
    files.sort();
    let mut hash = Sha256::new();
    hash.update(serde_json::to_vec(&(model, settings)).ok()?);
    for path in files {
        let metadata = std::fs::metadata(&path).ok()?;
        if !metadata.is_file() {
            return None;
        }
        hash.update(serde_json::to_vec(&path).ok()?);
        hash.update(metadata.len().to_le_bytes());
        hash.update(
            metadata
                .modified()
                .ok()?
                .duration_since(UNIX_EPOCH)
                .ok()?
                .as_nanos()
                .to_le_bytes(),
        );
    }
    let key: String = hash
        .finalize()
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect();
    Some(directory.join(format!("{key}.json")))
}

pub fn selected(path: Option<PathBuf>, legacy: u32, choices: &[u32]) -> u32 {
    if !jan_utils::calibration::available() {
        return 0;
    }
    match path
        .and_then(|p| std::fs::read_to_string(p).ok())
        .as_deref()
    {
        Some("true") => legacy,
        Some(value) => value
            .parse::<u32>()
            .ok()
            .filter(|n| choices.contains(n))
            .unwrap_or(0),
        None => 0,
    }
}

pub fn already_compared(path: &Path) -> bool {
    std::fs::read_to_string(path)
        .ok()
        .is_some_and(|value| value.parse::<u32>().is_ok())
}

pub async fn compare_profiles<F, Fut>(
    reference: u32,
    choices: &[u32],
    mut probe: F,
) -> Result<Option<(u32, calibration::ConfirmedGain)>, String>
where
    F: FnMut(bool, usize, u32) -> Fut,
    Fut: std::future::Future<Output = Result<calibration::Sample, String>>,
{
    let mut order = vec![reference];
    order.extend(
        choices
            .iter()
            .copied()
            .filter(|&profile| profile != reference),
    );
    let mut screening = std::collections::HashMap::<u32, Vec<calibration::Sample>>::new();
    for confirming in [false, true] {
        let mut results = std::collections::HashMap::<u32, Vec<calibration::Sample>>::new();
        for round in 0..2 {
            let mut profiles = order.clone();
            if (round != 0) != confirming {
                profiles.reverse();
            }
            for profile in profiles {
                match probe(confirming, round, profile).await {
                    Ok(sample) => results.entry(profile).or_default().push(sample),
                    Err(error) if profile == reference || error.contains("CALIBRATION_BUSY") => {
                        return Err(error)
                    }
                    Err(error) => log::warn!("Calibration profile {profile} skipped: {error}"),
                }
            }
        }
        if confirming {
            return Ok(order[1..]
                .iter()
                .filter_map(|profile| {
                    let first = [
                        screening.get(&reference)?.clone(),
                        screening.get(profile)?.clone(),
                    ];
                    let second = [
                        results.get(&reference)?.clone(),
                        results.get(profile)?.clone(),
                    ];
                    calibration::confirmed_gain(&first, &second).map(|gain| (*profile, gain))
                })
                .max_by(|a, b| a.1.ratio.total_cmp(&b.1.ratio)));
        }
        // Complete the confirmation workload for every configuration. Only
        // confirmed_gain may select a winner, even when screening was slower.
        screening = results;
    }
    Ok(None)
}

pub async fn resources_free<R: Runtime>(app: &AppHandle<R>, client: &reqwest::Client) -> bool {
    if !calibration::enabled() || calibration::foreground_busy() {
        return false;
    }
    match app.try_state::<Arc<LlamacppState>>() {
        Some(state) => calibration::router_is_free(state.inner(), client).await,
        None => true,
    }
}

pub fn save(path: &Path, value: u32) -> Result<(), String> {
    std::fs::create_dir_all(path.parent().ok_or("Calibration directory unavailable")?)
        .map_err(|e| e.to_string())?;
    let pending = path.with_extension(format!("{}.pending", uuid::Uuid::new_v4()));
    std::fs::write(&pending, value.to_string()).map_err(|e| e.to_string())?;
    let result = std::fs::rename(&pending, path).map_err(|e| e.to_string());
    if result.is_err() {
        let _ = std::fs::remove_file(pending);
    }
    result
}

pub(super) fn publish_gain<R: Runtime>(
    app: &AppHandle<R>,
    model: &str,
    confirmed: Option<calibration::ConfirmedGain>,
    profile: serde_json::Value,
) {
    if let (Some(confirmed), Ok(root)) = (confirmed, app.path().app_cache_dir()) {
        calibration::record_gain_with_profile(&root, "text", model, confirmed, Some(profile));
    }
}

#[tauri::command]
pub fn desktop_auto_tune_activity() -> Option<calibration::ModelActivity> {
    if !calibration::enabled() {
        return None;
    }
    calibration::current_activity()
}

#[tauri::command]
pub fn desktop_auto_tune_gains<R: Runtime>(
    app: AppHandle<R>,
    include_history: Option<bool>,
) -> Vec<calibration::GainBadge> {
    if !jan_utils::calibration::available() {
        return Vec::new();
    }
    app.path()
        .app_cache_dir()
        .map(|root| {
            if include_history.unwrap_or(false) {
                calibration::gain_history(&root)
            } else {
                calibration::latest_gains(&root)
            }
        })
        .unwrap_or_default()
}
