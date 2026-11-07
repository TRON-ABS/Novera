//! Opt-in Novera CLI channel. Every archive is authenticated before extraction.
use super::{AvailableUpdate, UpdateOutcome};
use base64::Engine;
use serde::Deserialize;
use sha2::{Digest, Sha256};
use std::{
    collections::BTreeMap,
    fs,
    io::{Cursor, Read, Write},
    path::{Path, PathBuf},
    time::Duration,
};

const ENDPOINT: &str =
    "https://github.com/TRON-ABS/Novera/releases/latest/download/latest-novera-cli.json";
const MAX_ARCHIVE_BYTES: usize = 128 * 1024 * 1024;
const MAX_BINARY_BYTES: u64 = 256 * 1024 * 1024;

#[derive(Debug, Deserialize)]
struct Manifest {
    version: String,
    platforms: BTreeMap<String, Asset>,
}
#[derive(Debug, Clone, Deserialize)]
struct Asset {
    url: String,
    sha256: String,
    signature: String,
}
#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct ArchiveIdentity {
    format_version: u32,
    product: String,
    version: String,
    platform: String,
    binary: String,
    binary_sha256: String,
    commit: String,
}

fn platform() -> Result<&'static str, String> {
    match (std::env::consts::OS, std::env::consts::ARCH) {
        ("windows", "x86_64") => Ok("windows-x86_64"),
        ("linux", "x86_64") => Ok("linux-x86_64"),
        ("macos", "aarch64") => Ok("darwin-aarch64"),
        _ => Err("No signed Novera CLI channel for this platform".into()),
    }
}
fn public_key() -> Result<minisign_verify::PublicKey, String> {
    let config: serde_json::Value =
        serde_json::from_str(include_str!("../../../tauri.updater.conf.json"))
            .map_err(|e| e.to_string())?;
    let encoded = config["plugins"]["updater"]["pubkey"]
        .as_str()
        .ok_or("Missing Novera public key")?;
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(encoded)
        .map_err(|e| e.to_string())?;
    minisign_verify::PublicKey::decode(std::str::from_utf8(&decoded).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
fn signature(encoded: &str) -> Result<minisign_verify::Signature, String> {
    let decoded = base64::engine::general_purpose::STANDARD
        .decode(encoded.trim())
        .map_err(|e| e.to_string())?;
    minisign_verify::Signature::decode(std::str::from_utf8(&decoded).map_err(|e| e.to_string())?)
        .map_err(|e| e.to_string())
}
fn authenticate(bytes: &[u8], sig: &str, expected: &str) -> Result<(), String> {
    if hex::encode(Sha256::digest(bytes)) != expected {
        return Err("CLI archive SHA-256 mismatch".into());
    }
    public_key()?
        .verify(bytes, &signature(sig)?, false)
        .map_err(|e| format!("CLI archive signature rejected: {e}"))
}
fn reviewed_asset(manifest: &Manifest, current: &str, target: &str) -> Result<Asset, String> {
    let version = semver::Version::parse(&manifest.version).map_err(|e| e.to_string())?;
    let current = semver::Version::parse(current).map_err(|e| e.to_string())?;
    if !version.pre.is_empty()
        || !version.build.is_empty()
        || version.to_string() != manifest.version
    {
        return Err("Stable CLI manifests require a canonical stable version".into());
    }
    if version < current {
        return Err("Refusing a CLI update downgrade, including forced updates".into());
    }
    let asset = manifest
        .platforms
        .get(target)
        .ok_or("No CLI asset for this platform")?;
    let expected=format!("https://github.com/TRON-ABS/Novera/releases/download/v{version}-cli-novera/Novera_CLI_{version}_{target}.zip");
    if asset.url != expected {
        return Err("CLI asset must use the version-matched official Novera release URL".into());
    }
    if asset.sha256.len() != 64
        || !asset
            .sha256
            .bytes()
            .all(|b| b.is_ascii_digit() || (b'a'..=b'f').contains(&b))
    {
        return Err("CLI asset requires an exact SHA-256 digest".into());
    }
    signature(&asset.signature)?;
    Ok(asset.clone())
}
async fn fetch(timeout: Duration) -> Result<(AvailableUpdate, Asset), String> {
    let client = reqwest::Client::builder()
        .timeout(timeout)
        .user_agent(format!("Novera-CLI/{}", super::build_version()))
        .build()
        .map_err(|e| e.to_string())?;
    let mut response = client
        .get(ENDPOINT)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        if bytes.len() + chunk.len() > 1024 * 1024 {
            return Err("CLI manifest exceeds size limit".into());
        }
        bytes.extend_from_slice(&chunk);
    }
    let manifest: Manifest = serde_json::from_slice(&bytes).map_err(|e| e.to_string())?;
    let asset = reviewed_asset(&manifest, super::build_version(), platform()?)?;
    Ok((
        AvailableUpdate {
            channel: "stable",
            current: super::build_version().into(),
            latest: manifest.version,
            url: Some(asset.url.clone()),
            sha256: Some(asset.sha256.clone()),
        },
        asset,
    ))
}
pub(super) async fn check(timeout: Duration) -> Result<AvailableUpdate, String> {
    tokio::time::timeout(timeout, fetch(timeout))
        .await
        .map_err(|_| "CLI update check timed out".to_string())?
        .map(|(info, _)| info)
}
fn verify_native(bytes: &[u8], target: &str) -> Result<(), String> {
    let valid = match target {
        "linux-x86_64" => {
            bytes.get(..6) == Some(b"\x7fELF\x02\x01") && bytes.get(18..20) == Some(&[62, 0])
        }
        "darwin-aarch64" => bytes.get(..8) == Some(&[0xcf, 0xfa, 0xed, 0xfe, 0x0c, 0, 0, 1]),
        "windows-x86_64" => {
            if bytes.get(..2) != Some(b"MZ") {
                false
            } else {
                bytes.get(60..64).is_some_and(|v| {
                    let offset = u32::from_le_bytes(v.try_into().unwrap()) as usize;
                    bytes.get(offset..offset + 6) == Some(&[b'P', b'E', 0, 0, 0x64, 0x86])
                        && bytes.get(offset + 24..offset + 26) == Some(&[0x0b, 0x02])
                })
            }
        }
        _ => false,
    };
    if valid {
        Ok(())
    } else {
        Err("Signed CLI binary has the wrong native architecture or format".into())
    }
}
fn extract_binary(bytes: &[u8], version: &str, target: &str) -> Result<Vec<u8>, String> {
    let mut archive = zip::ZipArchive::new(Cursor::new(bytes)).map_err(|e| e.to_string())?;
    let binary = if cfg!(windows) { "novera.exe" } else { "novera" };
    let mut found = None;
    let mut identity = None;
    for index in 0..archive.len() {
        let mut entry = archive.by_index(index).map_err(|e| e.to_string())?;
        let name = entry.name().map_err(|e| e.to_string())?.into_owned();
        if name == "CLI-UPDATE.json" {
            if identity.is_some() || entry.size() > 16384 {
                return Err("Ambiguous CLI archive identity".into());
            }
            let mut data = Vec::new();
            entry
                .by_ref()
                .take(16385)
                .read_to_end(&mut data)
                .map_err(|e| e.to_string())?;
            if data.len() > 16384 {
                return Err("Oversized CLI archive identity".into());
            }
            identity =
                Some(serde_json::from_slice::<ArchiveIdentity>(&data).map_err(|e| e.to_string())?);
            continue;
        }
        if name != binary {
            continue;
        }
        if found.is_some()
            || entry.is_dir()
            || entry
                .unix_mode()
                .is_some_and(|mode| mode & 0o170000 == 0o120000)
            || entry.size() > MAX_BINARY_BYTES
        {
            return Err("CLI archive contains an ambiguous or invalid executable".into());
        }
        let mut data = Vec::new();
        entry
            .by_ref()
            .take(MAX_BINARY_BYTES + 1)
            .read_to_end(&mut data)
            .map_err(|e| e.to_string())?;
        if data.len() as u64 > MAX_BINARY_BYTES {
            return Err("CLI executable exceeds size limit".into());
        }
        found = Some(data);
    }
    let data = found.ok_or("Signed CLI archive has no root executable")?;
    let identity = identity.ok_or("Signed CLI archive has no authenticated version identity")?;
    if identity.format_version != 2
        || identity.product != "Novera CLI"
        || identity.version != version
        || identity.platform != target
        || identity.binary != binary
        || identity.binary_sha256 != hex::encode(Sha256::digest(&data))
        || identity.commit.len() != 40
        || !identity.commit.bytes().all(|b| b.is_ascii_hexdigit())
    {
        return Err("Signed CLI archive identity differs from the requested version, platform or executable".into());
    }
    verify_native(&data, target)?;
    Ok(data)
}
struct Staging(PathBuf);
impl Drop for Staging {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.0);
    }
}
fn install_verified(
    bytes: &[u8],
    asset: &Asset,
    exe: &Path,
    version: &str,
    target: &str,
) -> Result<(), String> {
    authenticate(bytes, &asset.signature, &asset.sha256)?;
    let binary = extract_binary(bytes, version, target)?;
    let dir = exe
        .parent()
        .ok_or("CLI executable has no installation directory")?;
    let staged = Staging(dir.join(format!(".novera-update-{}.bin", uuid::Uuid::new_v4())));
    let mut file = fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&staged.0)
        .map_err(|e| e.to_string())?;
    file.write_all(&binary)
        .and_then(|_| file.sync_all())
        .map_err(|e| e.to_string())?;
    drop(file);
    super::verify_executable(&staged.0)?;
    super::make_executable(&staged.0)?;
    #[cfg(windows)]
    {
        // Preserve the old image rather than deleting an unrelated `.old` file.
        let backup = dir.join(format!(".novera-cli-backup-{}.exe", uuid::Uuid::new_v4()));
        fs::rename(exe, &backup).map_err(|e| e.to_string())?;
        if let Err(error) = fs::rename(&staged.0, exe) {
            fs::rename(&backup,exe).map_err(|rollback|format!("CLI replacement failed ({error}); rollback failed ({rollback}); original preserved at {}",backup.display()))?;
            return Err(error.to_string());
        }
    }
    #[cfg(not(windows))]
    fs::rename(&staged.0, exe).map_err(|e| e.to_string())?;
    Ok(())
}
pub(super) async fn self_update(force: bool) -> Result<UpdateOutcome, String> {
    let (info, asset) = fetch(Duration::from_secs(10)).await?;
    if !info.is_newer() && !force {
        return Ok(UpdateOutcome::UpToDate {
            version: info.current,
        });
    }
    let exe = super::target_binary_path()?;
    let parent = exe
        .parent()
        .ok_or("CLI executable has no parent directory")?;
    let writable_probe =
        Staging(parent.join(format!(".novera-update-probe-{}", uuid::Uuid::new_v4())));
    fs::OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&writable_probe.0)
        .map_err(|e| format!("CLI executable directory is not writable: {e}"))?;
    drop(writable_probe);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(300))
        .build()
        .map_err(|e| e.to_string())?;
    let mut response = client
        .get(&asset.url)
        .send()
        .await
        .map_err(|e| e.to_string())?
        .error_for_status()
        .map_err(|e| e.to_string())?;
    let mut bytes = Vec::new();
    while let Some(chunk) = response.chunk().await.map_err(|e| e.to_string())? {
        if bytes.len() + chunk.len() > MAX_ARCHIVE_BYTES {
            return Err("CLI archive exceeds size limit".into());
        }
        bytes.extend_from_slice(&chunk);
    }
    install_verified(&bytes, &asset, &exe, &info.latest, platform()?)?;
    Ok(UpdateOutcome::Installed {
        from: info.current,
        to: info.latest,
        path: exe,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    const PROBE: &[u8] = include_bytes!("signed-update-fixtures/probe.bin");
    const SIG: &str = include_str!("signed-update-fixtures/probe.txt.sig");
    fn fixture() -> Manifest {
        Manifest{version:"1.0.1".into(),platforms:BTreeMap::from([("linux-x86_64".into(),Asset{url:"https://github.com/TRON-ABS/Novera/releases/download/v1.0.1-cli-novera/Novera_CLI_1.0.1_linux-x86_64.zip".into(),sha256:hex::encode(Sha256::digest(PROBE)),signature:SIG.trim().into()})])}
    }
    #[test]
    fn real_novera_signature_authenticates_the_committed_public_probe() {
        authenticate(PROBE, SIG, &hex::encode(Sha256::digest(PROBE))).unwrap();
    }
    #[test]
    fn forged_hash_does_not_make_a_modified_payload_authentic() {
        let mut bytes = PROBE.to_vec();
        bytes[0] ^= 1;
        assert!(
            authenticate(&bytes, SIG, &hex::encode(Sha256::digest(&bytes)))
                .unwrap_err()
                .contains("signature rejected")
        );
    }
    #[test]
    fn reject_foreign_and_wrong_version_urls() {
        for url in ["https://delta.jan.ai/manifest.zip","https://github.com/TRON-ABS/Novera/releases/download/v1.0.0/Novera_CLI_1.0.1_linux-x86_64.zip"]{let mut m=fixture();m.platforms.get_mut("linux-x86_64").unwrap().url=url.into();assert!(reviewed_asset(&m,"1.0.0","linux-x86_64").is_err());}
    }
    #[test]
    fn refuse_downgrades_and_nonstable_manifests() {
        let mut m = fixture();
        assert!(reviewed_asset(&m, "2.0.0", "linux-x86_64").is_err());
        m.version = "1.0.1-beta.1".into();
        assert!(reviewed_asset(&m, "1.0.0", "linux-x86_64").is_err());
    }
    #[test]
    fn refuse_missing_platform_digest_and_signature() {
        let mut m = fixture();
        assert!(reviewed_asset(&m, "1.0.0", "darwin-aarch64").is_err());
        m.platforms.get_mut("linux-x86_64").unwrap().sha256.clear();
        assert!(reviewed_asset(&m, "1.0.0", "linux-x86_64").is_err());
        m = fixture();
        m.platforms
            .get_mut("linux-x86_64")
            .unwrap()
            .signature
            .clear();
        assert!(reviewed_asset(&m, "1.0.0", "linux-x86_64").is_err());
    }
    #[test]
    fn reject_signed_binary_for_another_architecture() {
        let mut elf = vec![0; 64];
        elf[..6].copy_from_slice(b"\x7fELF\x02\x01");
        elf[18] = 62;
        verify_native(&elf, "linux-x86_64").unwrap();
        elf[18] = 183;
        assert!(verify_native(&elf, "linux-x86_64").is_err());
        assert!(verify_native(b"MZ-html-error", "windows-x86_64").is_err());
    }

    #[test]
    fn archive_identity_binds_the_version_platform_and_binary() {
        let mut binary = vec![0; 64];
        let (target, name) = if cfg!(windows) {
            binary[..2].copy_from_slice(b"MZ");
            binary[60..64].copy_from_slice(&64u32.to_le_bytes());
            binary.resize(90, 0);
            binary[64..70].copy_from_slice(&[b'P', b'E', 0, 0, 0x64, 0x86]);
            binary[88..90].copy_from_slice(&[0x0b, 0x02]);
            ("windows-x86_64", "novera.exe")
        } else {
            binary[..6].copy_from_slice(b"\x7fELF\x02\x01");
            binary[18] = 62;
            ("linux-x86_64", "novera")
        };
        let identity = serde_json::json!({"formatVersion":2,"product":"Novera CLI",
            "version":"1.0.1","platform":target,"binary":name,
            "binarySha256":hex::encode(Sha256::digest(&binary)),"commit":"a".repeat(40)});
        let mut writer = zip::ZipWriter::new(Cursor::new(Vec::new()));
        writer
            .start_file(name, zip::write::SimpleFileOptions::default())
            .unwrap();
        writer.write_all(&binary).unwrap();
        writer
            .start_file("CLI-UPDATE.json", zip::write::SimpleFileOptions::default())
            .unwrap();
        writer
            .write_all(&serde_json::to_vec(&identity).unwrap())
            .unwrap();
        let archive = writer.finish().unwrap().into_inner();
        assert_eq!(extract_binary(&archive, "1.0.1", target).unwrap(), binary);
        assert!(extract_binary(&archive, "1.0.2", target).is_err());
        assert!(extract_binary(&archive, "1.0.1", "darwin-aarch64").is_err());
    }

    #[test]
    #[ignore = "requires a freshly signed archive on a disposable GitHub runner"]
    fn ci_signed_archive_replaces_and_runs_in_an_isolated_directory() {
        assert_eq!(std::env::var("GITHUB_ACTIONS").as_deref(), Ok("true"));
        assert_eq!(std::env::var("RUNNER_ENVIRONMENT").as_deref(), Ok("github-hosted"));
        let source = PathBuf::from(std::env::var_os("NOVERA_CLI_TEST_ARCHIVE").unwrap()).canonicalize().unwrap();
        let bytes = fs::read(&source).unwrap();
        let sig = fs::read_to_string(format!("{}.sig", source.display())).unwrap();
        let target = platform().unwrap();
        let version = super::super::build_version();
        let asset = Asset { url: String::new(), sha256: hex::encode(Sha256::digest(&bytes)), signature: sig };
        let temp = PathBuf::from(std::env::var_os("RUNNER_TEMP").unwrap()).canonicalize().unwrap();
        let root = temp.join(format!("novera-cli-validation-{}", uuid::Uuid::new_v4()));
        fs::create_dir(&root).unwrap();
        let executable = root.join(if cfg!(windows) {"novera.exe"} else {"novera"});
        fs::write(&executable, b"old isolated executable witness").unwrap();
        let sentinel = root.join("profile-witness.txt");
        fs::write(&sentinel, b"isolated profile must survive").unwrap();
        let mut altered = bytes.clone(); altered[0] ^= 1;
        let forged = Asset { sha256: hex::encode(Sha256::digest(&altered)), ..asset.clone() };
        assert!(install_verified(&altered, &forged, &executable, version, target).unwrap_err().contains("signature rejected"));
        assert_eq!(fs::read(&executable).unwrap(), b"old isolated executable witness");
        install_verified(&bytes, &asset, &executable, version, target).unwrap();
        let mut command = std::process::Command::new(&executable);
        for (key, _) in std::env::vars_os() {
            let label=key.to_string_lossy().to_ascii_uppercase();
            if ["TOKEN", "SECRET", "PASSWORD", "PRIVATE_KEY"].iter().any(|s| label.contains(s)) { command.env_remove(key); }
        }
        for key in ["HOME", "USERPROFILE", "APPDATA", "LOCALAPPDATA", "XDG_CONFIG_HOME", "XDG_DATA_HOME", "XDG_CACHE_HOME"] { command.env(key, &root); }
        let output = command.arg("--version").current_dir(&root).output().unwrap();
        assert!(output.status.success());
        assert!(String::from_utf8_lossy(&output.stdout).contains(version));
        assert_eq!(fs::read(&sentinel).unwrap(), b"isolated profile must survive");
        let receipt = serde_json::json!({"platform":target,"version":version,
            "archiveSha256":asset.sha256,"signatureVerified":true,"tamperedArchiveRejected":true,
            "replacementPerformed":true,"replacedExecutableRuns":true,"profileWitnessPreserved":true,
            "productionEndpointValidated":false,"twoReleasedVersionsUpgradeValidated":false,"publicationAuthorized":false});
        fs::write(source.parent().unwrap().parent().unwrap().join("CLI-INSTALL-VALIDATION.json"), serde_json::to_vec_pretty(&receipt).unwrap()).unwrap();
    }
}
