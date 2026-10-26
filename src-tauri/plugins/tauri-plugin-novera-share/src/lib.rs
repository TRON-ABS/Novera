use tauri::Runtime;
#[cfg(any(target_os = "android", target_os = "ios"))]
use tauri::{plugin::PluginHandle, Manager};
#[cfg(any(target_os = "android", target_os = "ios"))]
struct Sharing<R: Runtime>(PluginHandle<R>);
#[cfg(target_os = "ios")]
tauri::ios_plugin_binding!(init_plugin_novera_share);

pub fn init<R: Runtime>() -> tauri::plugin::TauriPlugin<R> {
    tauri::plugin::Builder::new("novera-share")
        .setup(|_app, _api| {
            #[cfg(target_os = "android")]
            _app.manage(Sharing(_api.register_android_plugin(
                "io.github.tronabs.novera.sharing",
                "SharingPlugin",
            )?));
            #[cfg(target_os = "ios")]
            _app.manage(Sharing(_api.register_ios_plugin(init_plugin_novera_share)?));
            Ok(())
        })
        .build()
}
#[cfg(any(target_os = "android", target_os = "ios"))]
pub fn share<R: Runtime>(
    app: &tauri::AppHandle<R>,
    path: &str,
    mime: &str,
    title: &str,
    text: &str,
    copy: bool,
) -> Result<(), String> {
    let root = app
        .path()
        .app_cache_dir()
        .map_err(|e| e.to_string())?
        .join("shares");
    app.state::<Sharing<R>>()
        .0
        .run_mobile_plugin::<serde_json::Value>(
            if copy { "copyFile" } else { "share" },
            serde_json::json!({"path":path,"root":root,"mime":mime,"title":title,"text":text}),
        )
        .map(|_| ())
        .map_err(|e| format!("SHARE_UNSUPPORTED: {e}"))
}
