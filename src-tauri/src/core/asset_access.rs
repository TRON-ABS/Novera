//! Asset reads are limited to managed media/workspaces and native user picks.
//! This is a read scope, not authority to execute scripts or write files.
use std::path::Path;
use tauri::{AppHandle, Manager, Runtime};
use tauri_plugin_store::StoreExt;

const GRANTS: &str = "asset-access-grants-v1";

pub(crate) fn initialize<R: Runtime>(app: &AppHandle<R>) -> Result<(), String> {
    let data = super::app::commands::get_jan_data_folder_path(app.clone());
    let scope = app.asset_protocol_scope();
    deny_profile_files(app, &data)?;
    scope
        .forbid_file(super::app::commands::get_configuration_file_path(
            app.clone(),
        ))
        .map_err(|e| e.to_string())?;
    for name in ["threads", "attachments", "agent-workspace"] {
        scope
            .allow_directory(data.join(name), true)
            .map_err(|e| e.to_string())?;
    }
    if let Some(home) = tauri_plugin_agent_tools::workspace::jan_home() {
        scope
            .allow_directory(home.join("projects"), true)
            .map_err(|e| e.to_string())?;
    }
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    for task in ["image", "music", "video"] {
        if let Ok(directory) = super::creation::output_directory(task) {
            scope
                .allow_directory(directory, true)
                .map_err(|e| e.to_string())?;
        }
    }
    let store = app
        .store(data.join("store.json"))
        .map_err(|e| e.to_string())?;
    if let Some(grants) = store.get(GRANTS).and_then(|v| v.as_object().cloned()) {
        for (path, directory) in grants {
            let path = Path::new(&path);
            if path.exists() {
                allow(app, path, directory.as_bool().unwrap_or(false))?;
            }
        }
    }
    Ok(())
}

fn deny_profile_files<R: Runtime>(app: &AppHandle<R>, data: &Path) -> Result<(), String> {
    // Only Novera's actual stores are private. A project's settings.json remains
    // a normal previewable document after its owner explicitly selects it.
    for name in ["settings.json", "store.json"] {
        app.asset_protocol_scope()
            .forbid_file(data.join(name))
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn allow<R: Runtime>(app: &AppHandle<R>, path: &Path, directory: bool) -> Result<(), String> {
    let scope = app.asset_protocol_scope();
    if directory {
        scope.allow_directory(path, true)
    } else {
        scope.allow_file(path)
    }
    .map_err(|e| e.to_string())
}

/// Only call after the OS file picker or an OS drop event supplied this path.
pub(crate) fn selected<R: Runtime>(app: &AppHandle<R>, path: &Path) -> Result<(), String> {
    let path = path.canonicalize().map_err(|e| e.to_string())?;
    let directory = path.is_dir();
    allow(app, &path, directory)?;
    let data = super::app::commands::get_jan_data_folder_path(app.clone());
    let store = app
        .store(data.join("store.json"))
        .map_err(|e| e.to_string())?;
    // Store paths, not contents. Rehydrate only those explicit user choices.
    let mut grants = store
        .get(GRANTS)
        .and_then(|v| v.as_object().cloned())
        .unwrap_or_default();
    grants.insert(
        path.to_string_lossy().into_owned(),
        serde_json::Value::Bool(directory),
    );
    store.set(GRANTS, serde_json::Value::Object(grants));
    store.save().map_err(|e| e.to_string())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn app() -> tauri::App<tauri::test::MockRuntime> {
        let mut context = tauri::test::mock_context(tauri::test::noop_assets());
        *context.config_mut() =
            serde_json::from_str(include_str!("../../tauri.conf.json")).unwrap();
        tauri::test::mock_builder().build(context).unwrap()
    }

    #[test]
    fn individual_grant_does_not_expose_sibling_files() {
        let app = app();
        let root = tempfile::tempdir().unwrap();
        let selected = root.path().join("selected.png");
        let sibling = root.path().join("private.txt");
        std::fs::write(&selected, "synthetic").unwrap();
        std::fs::write(&sibling, "synthetic").unwrap();
        let scope = app.asset_protocol_scope();
        assert!(!scope.is_allowed(&selected));
        allow(app.handle(), &selected, false).unwrap();
        assert!(scope.is_allowed(&selected));
        assert!(!scope.is_allowed(&sibling));
    }

    #[test]
    fn secret_denials_override_a_selected_directory() {
        let app = app();
        let root = tempfile::tempdir().unwrap();
        deny_profile_files(app.handle(), root.path()).unwrap();
        allow(app.handle(), root.path(), true).unwrap();
        let scope = app.asset_protocol_scope();
        for name in [
            "provider_secrets.enc",
            "provider-secrets.dpapi-key",
            "settings.json",
            "store.json",
        ] {
            let secret = root.path().join(name);
            std::fs::write(&secret, "synthetic").unwrap();
            assert!(
                !scope.is_allowed(secret),
                "{name} must remain unreadable via asset URLs"
            );
        }
    }

    #[test]
    fn selected_project_settings_remain_previewable() {
        let app = app();
        let project = tempfile::tempdir().unwrap();
        let file = project.path().join("settings.json");
        std::fs::write(&file, "{}").unwrap();
        allow(app.handle(), project.path(), true).unwrap();
        assert!(app.asset_protocol_scope().is_allowed(file));
    }
}
