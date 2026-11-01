//! CI-only probe of the real Tauri updater against signed, already-built packages.
//! It never changes the production endpoint or ships in a Novera distribution.
use serde::Deserialize;
use serde_json::json;
use std::{
    error::Error,
    fs,
    path::{Path, PathBuf},
    time::Duration,
};
use tauri_plugin_updater::UpdaterExt;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct Request {
    endpoint: String,
    executable: PathBuf,
    mode: String,
    current_version: String,
}

fn inside(root: &Path, path: &Path) -> Result<PathBuf, Box<dyn Error>> {
    let path = path.canonicalize()?;
    if path == root || !path.starts_with(root) {
        return Err("Validation path must stay inside its dedicated runner directory".into());
    }
    Ok(path)
}

fn main() -> Result<(), Box<dyn Error>> {
    if std::env::var("GITHUB_ACTIONS").as_deref() != Ok("true")
        || std::env::var("RUNNER_ENVIRONMENT").as_deref() != Ok("github-hosted")
    {
        return Err(
            "Installation/update validation is restricted to ephemeral GitHub runners".into(),
        );
    }
    let temp = PathBuf::from(std::env::var("RUNNER_TEMP")?).canonicalize()?;
    let root = inside(&temp, Path::new(&std::env::var("NOVERA_VALIDATION_ROOT")?))?;
    // Keep probe-control paths out of argv: Windows forwards current argv when
    // restarting the installed application after an update.
    let request_path =
        PathBuf::from(std::env::var_os("NOVERA_UPDATE_REQUEST").ok_or("Missing request path")?);
    let request: Request = serde_json::from_slice(&fs::read(inside(&root, &request_path)?)?)?;
    let receipt =
        PathBuf::from(std::env::var_os("NOVERA_UPDATE_RECEIPT").ok_or("Missing receipt path")?);
    inside(&root, receipt.parent().ok_or("Receipt needs a parent")?)?;
    if receipt.exists() {
        return Err("Receipt must not already exist".into());
    }
    let executable = inside(&root, &request.executable)?;
    let endpoint: url::Url = request.endpoint.parse()?;
    if endpoint.scheme() != "http"
        || endpoint.host_str() != Some("127.0.0.1")
        || endpoint.port().is_none()
    {
        return Err("The CI fixture endpoint must be a loopback HTTP server".into());
    }
    if !matches!(
        request.mode.as_str(),
        "check-current" | "download" | "reject-tampered" | "install"
    ) {
        return Err("Unsupported validation mode".into());
    }
    let trust: serde_json::Value = serde_json::from_str(include_str!(concat!(
        env!("CARGO_MANIFEST_DIR"),
        "/../../../../src-tauri/tauri.updater.conf.json"
    )))?;
    let key = trust["plugins"]["updater"]["pubkey"]
        .as_str()
        .ok_or("Missing pinned key")?;
    let mut context = tauri::test::mock_context(tauri::test::noop_assets());
    context.config_mut().identifier = "io.github.tronabs.novera.validation".into();
    context.config_mut().plugins.0.insert(
        "updater".into(),
        json!({
            "pubkey":key, "endpoints":[endpoint.as_str()],
            "dangerousInsecureTransportProtocol":true,
            "windows":{"installMode":"quiet"}
        }),
    );
    context.package_info_mut().name = "Novera validation probe".into();
    context.package_info_mut().version = request.current_version.parse()?;
    let app = tauri::test::mock_builder()
        .plugin(tauri_plugin_updater::Builder::new().build())
        .build(context)?;
    let mut builder = app
        .updater_builder()
        .executable_path(&executable)
        .timeout(Duration::from_secs(180))
        .no_proxy();
    #[cfg(windows)]
    {
        builder = builder.installer_arg("/CURRENTUSER").installer_arg(format!(
            "/D={}",
            executable
                .parent()
                .ok_or("No installation directory")?
                .display()
        ));
    }
    let updater = builder.build()?;
    tauri::async_runtime::block_on(async {
        let update = updater.check().await?;
        if request.mode == "check-current" {
            if update.is_some() {
                return Err::<(), Box<dyn Error>>(
                    "Same-version feed unexpectedly offers an update".into(),
                );
            }
            fs::write(
                &receipt,
                serde_json::to_vec_pretty(
                    &json!({"sameVersionNotOffered":true,"probeVersion":request.current_version}),
                )?,
            )?;
            return Ok(());
        }
        let update = update.ok_or("Fixture did not offer an update")?;
        let downloaded = update.download(|_, _| {}, || {}).await;
        if request.mode == "reject-tampered" {
            if !matches!(downloaded, Err(tauri_plugin_updater::Error::Minisign(_))) {
                return Err(
                    "Tampered payload was not rejected specifically by signature verification"
                        .into(),
                );
            }
            fs::write(
                &receipt,
                serde_json::to_vec_pretty(
                    &json!({"tamperedPayloadRejectedByNativeVerifier":true}),
                )?,
            )?;
            return Ok(());
        }
        let bytes = downloaded?;
        fs::write(
            &receipt,
            serde_json::to_vec_pretty(&json!({
                "nativeSignatureVerified":true,"downloadedBytes":bytes.len(),
                "probeVersion":request.current_version,"candidateVersion":update.version,
                "installerRequested":request.mode=="install",
                "productionUiEndToEndValidated":false
            }))?,
        )?;
        if request.mode == "install" {
            update.install(bytes)?;
        }
        Ok(())
    })
}
