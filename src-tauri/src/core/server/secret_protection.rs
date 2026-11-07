//! OS-protected random encryption keys and private, atomic file replacement.
use rand::TryRng;
use std::{fs, io::Write, path::Path};

pub(super) fn write_private_atomic(path: &Path, bytes: &[u8]) -> Result<(), String> {
    let parent = path.parent().ok_or("Missing secret directory")?;
    fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    if fs::symlink_metadata(path).is_ok_and(|m| m.file_type().is_symlink()) {
        return Err("Secret files cannot be symbolic links".into());
    }
    let temporary = parent.join(format!(
        ".novera-secret-{:032x}.tmp",
        rand::random::<u128>()
    ));
    let result = (|| {
        let mut options = fs::OpenOptions::new();
        options.write(true).create_new(true);
        #[cfg(unix)]
        {
            use std::os::unix::fs::OpenOptionsExt;
            options.mode(0o600);
        }
        let mut file = options.open(&temporary).map_err(|e| e.to_string())?;
        file.write_all(bytes)
            .and_then(|_| file.sync_all())
            .map_err(|e| e.to_string())?;
        drop(file);
        fs::rename(&temporary, path).map_err(|e| e.to_string())
    })();
    if result.is_err() {
        let _ = fs::remove_file(&temporary);
    }
    result
}

#[cfg(windows)]
pub(super) fn load_or_create_key(root: &Path) -> Result<Vec<u8>, String> {
    let _lock = key_lock(root)?;
    let path = root.join("provider-secrets.dpapi-key");
    if fs::symlink_metadata(&path).is_ok_and(|m| m.file_type().is_symlink()) {
        return Err("Protected key cannot be a symbolic link".into());
    }
    match fs::read(&path) {
        Ok(bytes) => validate_key(dpapi(&bytes, false)?),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            fs::create_dir_all(root).map_err(|e| e.to_string())?;
            let mut key = vec![0u8; 32];
            rand::rngs::SysRng.try_fill_bytes(&mut key)
                .map_err(|_| "Operating-system entropy unavailable".to_string())?;
            let wrapped = dpapi(&key, true)?;
            // create_new prevents concurrent processes from replacing a key.
            let mut options = fs::OpenOptions::new();
            options.write(true).create_new(true);
            use std::os::windows::fs::OpenOptionsExt;
            options.share_mode(0);
            match options.open(&path) {
                Ok(mut file) => {
                    file.write_all(&wrapped)
                        .and_then(|_| file.sync_all())
                        .map_err(|e| e.to_string())?;
                    validate_key(key)
                }
                Err(error) if error.kind() == std::io::ErrorKind::AlreadyExists => {
                    validate_key(dpapi(&fs::read(path).map_err(|e| e.to_string())?, false)?)
                }
                Err(error) => Err(error.to_string()),
            }
        }
        Err(error) => Err(error.to_string()),
    }
}

#[cfg(not(any(windows, target_os = "android", target_os = "ios")))]
pub(super) fn load_or_create_key(root: &Path) -> Result<Vec<u8>, String> {
    use sha2::{Digest, Sha256};
    let _lock = key_lock(root)?;
    // A separate root gets a separate vault entry. If the vault is unavailable,
    // fail closed instead of storing a recoverable key next to the ciphertext.
    let account = hex::encode(Sha256::digest(root.as_os_str().as_encoded_bytes()));
    let entry = keyring::Entry::new("novera-provider-file-keys-v2", &account)
        .map_err(|_| "Secure key storage unavailable".to_string())?;
    match entry.get_password() {
        Ok(key) => validate_key(hex::decode(key).map_err(|_| "Invalid protected provider key")?),
        Err(keyring::Error::NoEntry) => {
            let mut key = vec![0u8; 32];
            rand::rngs::SysRng.try_fill_bytes(&mut key)
                .map_err(|_| "Operating-system entropy unavailable".to_string())?;
            entry
                .set_password(&hex::encode(&key))
                .map_err(|_| "Secure key storage unavailable")?;
            // Use what the vault actually retained, also on concurrent creation.
            let stored = entry
                .get_password()
                .map_err(|_| "Secure key storage unavailable")?;
            validate_key(hex::decode(stored).map_err(|_| "Invalid protected provider key")?)
        }
        Err(_) => Err("Secure key storage unavailable; keys cannot be persisted".into()),
    }
}

/// Serialize first-key creation across application/CLI processes, including
/// toolchains at the application's declared minimum Rust version.
#[cfg(not(any(target_os = "android", target_os = "ios")))]
fn key_lock(root: &Path) -> Result<fs::File, String> {
    fs::create_dir_all(root).map_err(|e| e.to_string())?;
    let path = root.join("provider-secrets.key-lock");
    if fs::symlink_metadata(&path).is_ok_and(|m| m.file_type().is_symlink()) {
        return Err("Protected key lock cannot be a symbolic link".into());
    }
    let mut options = fs::OpenOptions::new();
    options.read(true).write(true).create(true).truncate(false);
    #[cfg(unix)]
    {
        use std::os::unix::fs::OpenOptionsExt;
        options.mode(0o600);
    }
    let file = options.open(path).map_err(|e| e.to_string())?;
    fs2::FileExt::lock_exclusive(&file).map_err(|e| e.to_string())?;
    Ok(file)
}

fn validate_key(key: Vec<u8>) -> Result<Vec<u8>, String> {
    if key.len() != 32 {
        return Err("Invalid protected provider key".into());
    }
    Ok(key)
}

#[cfg(windows)]
fn dpapi(input: &[u8], protect: bool) -> Result<Vec<u8>, String> {
    use windows_sys::Win32::{
        Foundation::LocalFree,
        Security::Cryptography::{
            CryptProtectData, CryptUnprotectData, CRYPTPROTECT_UI_FORBIDDEN, CRYPT_INTEGER_BLOB,
        },
    };
    let input = CRYPT_INTEGER_BLOB {
        cbData: u32::try_from(input.len()).map_err(|_| "Secret too large")?,
        pbData: input.as_ptr() as *mut u8,
    };
    let mut output = CRYPT_INTEGER_BLOB {
        cbData: 0,
        pbData: std::ptr::null_mut(),
    };
    // DPAPI binds the random key to the current Windows account, not machine ID.
    let success = unsafe {
        if protect {
            CryptProtectData(
                &input,
                std::ptr::null(),
                std::ptr::null(),
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        } else {
            CryptUnprotectData(
                &input,
                std::ptr::null_mut(),
                std::ptr::null(),
                std::ptr::null(),
                std::ptr::null(),
                CRYPTPROTECT_UI_FORBIDDEN,
                &mut output,
            )
        }
    };
    if success == 0 {
        return Err("Windows protected storage unavailable".into());
    }
    let bytes = if output.cbData == 0 {
        Vec::new()
    } else {
        unsafe { std::slice::from_raw_parts(output.pbData, output.cbData as usize).to_vec() }
    };
    unsafe {
        LocalFree(output.pbData.cast());
    }
    Ok(bytes)
}
