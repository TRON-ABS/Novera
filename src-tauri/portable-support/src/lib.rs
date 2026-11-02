//! Portable profile initialization and transactional Program-only replacement.
//! Shared by the shipping desktop and the signed, self-contained updater.
use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::{
    collections::HashSet,
    fs::{self, File, OpenOptions},
    io::{self, BufRead, BufReader, BufWriter, Read, Seek, SeekFrom, Write},
    path::{Path, PathBuf},
    time::{Duration, Instant, SystemTime, UNIX_EPOCH},
};

pub const MARKER: &str = "novera-portable.json";
pub const FORMAT: &str = "novera-windows-portable";
pub const FOOTER: &[u8; 16] = b"NOVERA-PORT-ZIP1";
pub const ENDPOINT: &str =
    "https://github.com/TRON-ABS/Novera/releases/latest/download/latest-portable.json";

/// Windows account-protected bytes, stored only in the portable Data folder.
/// No Credential Manager entry or plaintext export is created.
#[cfg(windows)]
fn crypt_secret(input: &[u8], protect: bool) -> io::Result<Vec<u8>> {
    #[repr(C)]
    struct Blob {
        length: u32,
        data: *mut u8,
    }
    #[link(name = "crypt32")]
    extern "system" {
        fn CryptProtectData(
            input: *const Blob,
            description: *const u16,
            entropy: *const Blob,
            reserved: *mut std::ffi::c_void,
            prompt: *mut std::ffi::c_void,
            flags: u32,
            output: *mut Blob,
        ) -> i32;
        fn CryptUnprotectData(
            input: *const Blob,
            description: *mut *mut u16,
            entropy: *const Blob,
            reserved: *mut std::ffi::c_void,
            prompt: *mut std::ffi::c_void,
            flags: u32,
            output: *mut Blob,
        ) -> i32;
    }
    #[link(name = "kernel32")]
    extern "system" {
        fn LocalFree(memory: *mut std::ffi::c_void) -> *mut std::ffi::c_void;
    }
    let length = u32::try_from(input.len()).map_err(|_| invalid("Secret store too large"))?;
    let input = Blob {
        length,
        data: input.as_ptr() as *mut u8,
    };
    let mut output = Blob {
        length: 0,
        data: std::ptr::null_mut(),
    };
    let success = unsafe {
        if protect {
            CryptProtectData(
                &input,
                std::ptr::null(),
                std::ptr::null(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                1,
                &mut output,
            )
        } else {
            CryptUnprotectData(
                &input,
                std::ptr::null_mut(),
                std::ptr::null(),
                std::ptr::null_mut(),
                std::ptr::null_mut(),
                1,
                &mut output,
            )
        }
    };
    if success == 0 {
        return Err(io::Error::last_os_error());
    }
    let bytes = unsafe { std::slice::from_raw_parts(output.data, output.length as usize).to_vec() };
    unsafe {
        LocalFree(output.data.cast());
    }
    Ok(bytes)
}

#[cfg(windows)]
pub fn protect_secret(input: &[u8]) -> io::Result<Vec<u8>> {
    crypt_secret(input, true)
}
#[cfg(windows)]
pub fn unprotect_secret(input: &[u8]) -> io::Result<Vec<u8>> {
    crypt_secret(input, false)
}

fn invalid(message: impl Into<String>) -> io::Error {
    io::Error::other(message.into())
}

/// Reject reparse points as well as symlinks, including in existing ancestors.
pub fn plain(path: &Path) -> io::Result<()> {
    let meta = fs::symlink_metadata(path)?;
    #[cfg(windows)]
    {
        use std::os::windows::fs::MetadataExt;
        if meta.file_attributes() & 0x400 != 0 {
            return Err(invalid(
                "Portable paths cannot use junctions or reparse points",
            ));
        }
    }
    if meta.file_type().is_symlink() {
        return Err(invalid("Portable paths cannot use symlinks"));
    }
    Ok(())
}

pub fn validate_root(root: &Path) -> io::Result<PathBuf> {
    if !root.is_absolute() || root.parent().is_none() {
        return Err(invalid("Expected a dedicated absolute portable folder"));
    }
    for ancestor in root.ancestors() {
        plain(ancestor)?;
    }
    let root = fs::canonicalize(root)?;
    #[cfg(windows)]
    let root = {
        let text = root.to_string_lossy();
        if let Some(unc) = text.strip_prefix(r"\\?\UNC\") {
            PathBuf::from(format!(r"\\{unc}"))
        } else if let Some(path) = text.strip_prefix(r"\\?\") {
            PathBuf::from(path)
        } else {
            root
        }
    };
    plain(&root.join(MARKER))?;
    let marker: serde_json::Value = serde_json::from_slice(&fs::read(root.join(MARKER))?)?;
    if marker["format"] != FORMAT || marker["schema"] != 1 {
        return Err(invalid("Unrecognized portable marker"));
    }
    plain(&root.join("Program"))?;
    Ok(root)
}

pub fn root_for_executable(exe: &Path) -> io::Result<PathBuf> {
    let program = exe
        .parent()
        .ok_or_else(|| invalid("Missing Program folder"))?;
    if program.file_name().and_then(|v| v.to_str()) != Some("Program") {
        return Err(invalid(
            "Extract the entire portable archive; keep the executable in Program",
        ));
    }
    validate_root(
        program
            .parent()
            .ok_or_else(|| invalid("Missing portable root"))?,
    )
}

pub fn ensure_directory(path: &Path) -> io::Result<()> {
    // Check existing ancestors before create_dir_all can traverse a junction.
    for ancestor in path.ancestors() {
        if ancestor.exists() {
            plain(ancestor)?;
        }
    }
    fs::create_dir_all(path)?;
    plain(path)
}

/// The file remains in Data; the OS releases the exclusive handle on exit.
pub fn profile_lock(root: &Path) -> io::Result<File> {
    ensure_directory(&root.join("Data"))?;
    let path = root.join("Data/.portable.lock");
    if path.exists() {
        plain(&path)?;
    }
    let mut options = OpenOptions::new();
    options.read(true).write(true).create(true);
    #[cfg(windows)]
    {
        use std::os::windows::fs::OpenOptionsExt;
        options.share_mode(0);
    }
    options.open(path)
}

fn atomic_write(path: &Path, bytes: &[u8]) -> io::Result<()> {
    let temp = path.with_file_name(format!(
        ".novera-write-{}-{}",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos()
    ));
    let mut file = OpenOptions::new()
        .write(true)
        .create_new(true)
        .open(&temp)?;
    file.write_all(bytes)?;
    file.sync_all()?;
    drop(file);
    // rename replaces a regular file atomically on Windows and Unix.
    fs::rename(&temp, path)
}

fn relocate_string(value: &str, previous: &Path, current: &Path, depth: usize) -> Option<String> {
    if depth > 32 {
        return None;
    }
    // Path::strip_prefix enforces component boundaries; unrelated external paths stay external.
    if let Ok(relative) = Path::new(value).strip_prefix(previous) {
        return Some(current.join(relative).to_string_lossy().into_owned());
    }
    // The settings store also contains serialized JSON inside JSON string values.
    if value.starts_with('{') || value.starts_with('[') {
        if let Ok(mut nested) = serde_json::from_str::<serde_json::Value>(value) {
            if relocate_json(&mut nested, previous, current, depth + 1) {
                return serde_json::to_string(&nested).ok();
            }
        }
    }
    None
}

fn relocate_json(
    value: &mut serde_json::Value,
    previous: &Path,
    current: &Path,
    depth: usize,
) -> bool {
    if depth > 32 {
        return false;
    }
    match value {
        serde_json::Value::String(s) => {
            if let Some(next) = relocate_string(s, previous, current, depth) {
                *s = next;
                true
            } else {
                false
            }
        }
        serde_json::Value::Array(a) => a.iter_mut().fold(false, |changed, v| {
            relocate_json(v, previous, current, depth + 1) | changed
        }),
        serde_json::Value::Object(o) => o.values_mut().fold(false, |changed, v| {
            relocate_json(v, previous, current, depth + 1) | changed
        }),
        _ => false,
    }
}

fn relocate_yaml(value: &mut serde_yaml::Value, previous: &Path, current: &Path) -> bool {
    match value {
        serde_yaml::Value::String(s) => {
            if let Some(next) = relocate_string(s, previous, current, 0) {
                *s = next;
                true
            } else {
                false
            }
        }
        serde_yaml::Value::Sequence(a) => a.iter_mut().fold(false, |changed, v| {
            relocate_yaml(v, previous, current) | changed
        }),
        serde_yaml::Value::Mapping(o) => o.values_mut().fold(false, |changed, v| {
            relocate_yaml(v, previous, current) | changed
        }),
        serde_yaml::Value::Tagged(t) => relocate_yaml(&mut t.value, previous, current),
        _ => false,
    }
}

fn relocate_lines(path: &Path, previous: &Path, current: &Path) -> io::Result<()> {
    let temp = path.with_file_name(format!(
        ".novera-relocate-{}-{}",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos()
    ));
    let mut output = BufWriter::new(
        OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&temp)?,
    );
    let mut input = BufReader::new(File::open(path)?);
    let mut changed = false;
    let mut line = String::new();
    while input.read_line(&mut line)? != 0 {
        if let Ok(mut value) = serde_json::from_str::<serde_json::Value>(&line) {
            if relocate_json(&mut value, previous, current, 0) {
                serde_json::to_writer(&mut output, &value)?;
                output.write_all(b"\n")?;
                changed = true;
            } else {
                output.write_all(line.as_bytes())?;
            }
        } else {
            output.write_all(line.as_bytes())?;
        }
        line.clear();
    }
    output.flush()?;
    output.get_ref().sync_all()?;
    drop(output);
    drop(input);
    if changed {
        fs::rename(temp, path)?;
    } else {
        fs::remove_file(temp)?;
    }
    Ok(())
}

fn relocate_tree(folder: &Path, previous: &Path, current: &Path) -> io::Result<()> {
    if !folder.exists() {
        return Ok(());
    }
    plain(folder)?;
    for item in fs::read_dir(folder)? {
        let path = item?.path();
        plain(&path)?;
        if path.is_dir() {
            relocate_tree(&path, previous, current)?;
            continue;
        }
        let extension = path.extension().and_then(|v| v.to_str()).unwrap_or("");
        if !["json", "jsonl", "yml", "yaml"].contains(&extension) {
            continue;
        }
        if extension == "jsonl" {
            relocate_lines(&path, previous, current)?;
            continue;
        }
        if path.metadata()?.len() > 64 * 1024 * 1024 {
            return Err(invalid(format!(
                "Metadata too large to relocate safely: {}",
                path.display()
            )));
        }
        let bytes = fs::read(&path)?;
        let output = if extension == "yml" || extension == "yaml" {
            let Ok(mut value) = serde_yaml::from_slice::<serde_yaml::Value>(&bytes) else {
                continue;
            };
            if !relocate_yaml(&mut value, previous, current) {
                continue;
            }
            serde_yaml::to_string(&value)
                .map_err(|e| invalid(e.to_string()))?
                .into_bytes()
        } else {
            let Ok(mut value) = serde_json::from_slice::<serde_json::Value>(&bytes) else {
                continue;
            };
            if !relocate_json(&mut value, previous, current, 0) {
                continue;
            }
            serde_json::to_vec_pretty(&value)?
        };
        atomic_write(&path, &output)?;
    }
    Ok(())
}

/// Call while holding profile_lock and before any Tauri/plugin/profile reader starts.
pub fn initialize_profile(root: &Path) -> io::Result<()> {
    initialize_profile_with(root, |_, _| Ok(()))
}

pub fn initialize_profile_with(root: &Path, on_move: impl FnOnce(&Path, &Path) -> io::Result<()>) -> io::Result<()> {
    for directory in [
        "Data/Novera/data",
        "Data/Models",
        "Data/WebView",
        "Data/Cache",
        "Data/Temp",
    ] {
        ensure_directory(&root.join(directory))?;
    }
    let location = root.join("Data/portable-location.json");
    if location.exists() {
        plain(&location)?;
        let value: serde_json::Value = serde_json::from_slice(&fs::read(&location)?)?;
        let previous = PathBuf::from(
            value["root"]
                .as_str()
                .ok_or_else(|| invalid("Invalid portable relocation record"))?,
        );
        if !previous.is_absolute() {
            return Err(invalid("Invalid former portable root"));
        }
        if previous != root {
            for folder in ["Data/Novera", "Data/Models", "Data/Application"] {
                relocate_tree(&root.join(folder), &previous, root)?;
            }
            on_move(&previous, root)?;
        }
    }
    atomic_write(
        &location,
        &serde_json::to_vec(&serde_json::json!({"schema":1,"root":root}))?,
    )
}

#[derive(Serialize, Deserialize)]
pub struct PayloadFile {
    pub path: String,
    pub bytes: u64,
    pub sha256: String,
}
#[derive(Serialize, Deserialize)]
pub struct PayloadManifest {
    pub format: String,
    pub schema: u32,
    pub version: String,
    pub files: Vec<PayloadFile>,
}

pub fn safe_program_path(name: &str) -> bool {
    let parts: Vec<_> = name.split('/').collect();
    parts.len() > 1
        && parts[0] == "Program"
        && parts[1..].iter().all(|part| {
            !part.is_empty()
                && ![".", ".."].contains(part)
                && !part.ends_with(['.', ' '])
                && !part
                    .chars()
                    .any(|c| c.is_control() || "\\:<>\"|?*".contains(c))
                && ![
                    "CON", "PRN", "AUX", "NUL", "COM1", "COM2", "COM3", "COM4", "COM5", "COM6",
                    "COM7", "COM8", "COM9", "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7",
                    "LPT8", "LPT9",
                ]
                .contains(
                    &part
                        .split('.')
                        .next()
                        .unwrap_or("")
                        .to_ascii_uppercase()
                        .as_str(),
                )
        })
}

pub fn digest(path: &Path) -> io::Result<String> {
    let mut reader = File::open(path)?;
    let mut hash = Sha256::new();
    let mut buffer = [0u8; 65536];
    loop {
        let n = reader.read(&mut buffer)?;
        if n == 0 {
            break;
        }
        hash.update(&buffer[..n]);
    }
    Ok(format!("{:x}", hash.finalize()))
}

/// Bounded view of the appended ZIP; offsets are relative to the ZIP, not the PE.
pub struct PayloadReader {
    file: File,
    start: u64,
    length: u64,
    position: u64,
}
impl PayloadReader {
    pub fn open(path: &Path) -> io::Result<Self> {
        let mut file = File::open(path)?;
        let size = file.metadata()?.len();
        if size < 24 {
            return Err(invalid("Missing portable update payload"));
        }
        file.seek(SeekFrom::End(-24))?;
        let mut footer = [0u8; 24];
        file.read_exact(&mut footer)?;
        if &footer[8..] != FOOTER {
            return Err(invalid("Invalid portable update footer"));
        }
        let length = u64::from_le_bytes(footer[..8].try_into().unwrap());
        if length == 0 || length > size - 24 {
            return Err(invalid("Invalid portable payload size"));
        }
        let start = size - 24 - length;
        file.seek(SeekFrom::Start(start))?;
        Ok(Self {
            file,
            start,
            length,
            position: 0,
        })
    }
}
impl Read for PayloadReader {
    fn read(&mut self, buffer: &mut [u8]) -> io::Result<usize> {
        let size = buffer.len().min((self.length - self.position) as usize);
        let n = self.file.read(&mut buffer[..size])?;
        self.position += n as u64;
        Ok(n)
    }
}
impl Seek for PayloadReader {
    fn seek(&mut self, from: SeekFrom) -> io::Result<u64> {
        let next = match from {
            SeekFrom::Start(v) => v as i128,
            SeekFrom::Current(v) => self.position as i128 + v as i128,
            SeekFrom::End(v) => self.length as i128 + v as i128,
        };
        if next < 0 || next > self.length as i128 {
            return Err(invalid("Portable payload seek outside bounds"));
        }
        self.file.seek(SeekFrom::Start(self.start + next as u64))?;
        self.position = next as u64;
        Ok(self.position)
    }
}

fn verify_plain_tree(path: &Path) -> io::Result<()> {
    plain(path)?;
    if path.is_dir() {
        for item in fs::read_dir(path)? {
            verify_plain_tree(&item?.path())?;
        }
    }
    Ok(())
}

pub fn extract_payload(reader: impl Read + Seek, stage: &Path) -> io::Result<PayloadManifest> {
    let mut zip = zip::ZipArchive::new(reader)?;
    let manifest: PayloadManifest = {
        let mut entry = zip.by_name("portable-update.json")?;
        if entry.size() > 1024 * 1024 {
            return Err(invalid("Oversized update manifest"));
        }
        let mut json = Vec::new();
        entry.read_to_end(&mut json)?;
        serde_json::from_slice(&json)?
    };
    if manifest.format != FORMAT
        || manifest.schema != 1
        || manifest.files.is_empty()
        || manifest.files.len() > 10000
        || zip.len() != manifest.files.len() + 1
    {
        return Err(invalid("Invalid portable update manifest"));
    }
    let mut seen = HashSet::new();
    let mut total = 0u64;
    for item in &manifest.files {
        if !safe_program_path(&item.path)
            || !seen.insert(item.path.to_ascii_lowercase())
            || item.bytes == 0
            || item.sha256.len() != 64
        {
            return Err(invalid("Invalid or duplicate portable update path"));
        }
        total = total
            .checked_add(item.bytes)
            .ok_or_else(|| invalid("Oversized update"))?;
        if total > 16 * 1024 * 1024 * 1024 {
            return Err(invalid("Oversized update"));
        }
        let mut entry = zip.by_name(&item.path)?;
        if entry.is_dir()
            || entry.size() != item.bytes
            || entry.unix_mode().is_some_and(|v| v & 0o170000 == 0o120000)
        {
            return Err(invalid("Linked or invalid payload file"));
        }
        let destination = stage.join(&item.path);
        ensure_directory(destination.parent().unwrap())?;
        let mut file = OpenOptions::new()
            .write(true)
            .create_new(true)
            .open(&destination)?;
        let copied = io::copy(&mut entry, &mut file)?;
        file.sync_all()?;
        drop(file);
        if copied != item.bytes || digest(&destination)? != item.sha256 {
            return Err(invalid("Portable payload hash mismatch"));
        }
    }
    if !seen.contains("program/novera-desktop.exe") {
        return Err(invalid("Missing portable application"));
    }
    Ok(manifest)
}

/// Only Program is renamed. Data and root launcher/marker are never replaced.
pub fn replace_program(root: &Path, stage: &Path) -> io::Result<()> {
    if stage.parent() != Some(root)
        || !stage
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .starts_with(".novera-update-")
    {
        return Err(invalid("Invalid owned staging folder"));
    }
    verify_plain_tree(&root.join("Program"))?;
    verify_plain_tree(&stage.join("Program"))?;
    let previous = stage.join("previous");
    atomic_write(
        &root.join("Data/pending-portable-update.json"),
        &serde_json::to_vec(&serde_json::json!({"stage":stage.file_name()}))?,
    )?;
    let deadline = Instant::now() + Duration::from_secs(90);
    loop {
        match fs::rename(root.join("Program"), &previous) {
            Ok(()) => break,
            Err(_) if Instant::now() < deadline => std::thread::sleep(Duration::from_millis(500)),
            Err(error) => return Err(error),
        }
    }
    if let Err(error) = fs::rename(stage.join("Program"), root.join("Program")) {
        fs::rename(&previous, root.join("Program")).map_err(|rollback| invalid(format!("Replacement failed: {error}; rollback failed: {rollback}; previous program is at {}", previous.display())))?;
        return Err(error);
    }
    // Failure to remove an old locked runtime must not undo a successful update.
    let _ = fs::remove_dir_all(&previous);
    fs::remove_file(root.join("Data/pending-portable-update.json"))?;
    Ok(())
}

/// Recover the old Program if power was lost between the two directory renames.
/// The root launcher calls this with the same exclusive profile lock as the app.
pub fn recover_program(root: &Path) -> io::Result<()> {
    let pending = root.join("Data/pending-portable-update.json");
    if !pending.exists() {
        return Ok(());
    }
    plain(&pending)?;
    let value: serde_json::Value = serde_json::from_slice(&fs::read(&pending)?)?;
    let name = value["stage"]
        .as_str()
        .ok_or_else(|| invalid("Invalid pending update"))?;
    if !name.starts_with(".novera-update-")
        || !name
            .bytes()
            .all(|c| c.is_ascii_digit() || b".novera-updt".contains(&c))
    {
        return Err(invalid("Invalid recovery stage"));
    }
    let previous = root.join(name).join("previous");
    if !root.join("Program").exists() {
        verify_plain_tree(&previous)?;
        fs::rename(previous, root.join("Program"))?;
    }
    fs::remove_file(pending)
}

pub fn start_portable(root: &Path) -> io::Result<()> {
    // Recovery can run when Program is temporarily absent, but the marker and
    // ancestors still have to be ordinary paths in the selected portable root.
    for ancestor in root.ancestors() {
        plain(ancestor)?;
    }
    plain(&root.join(MARKER))?;
    let marker: serde_json::Value = serde_json::from_slice(&fs::read(root.join(MARKER))?)?;
    if marker["format"] != FORMAT || marker["schema"] != 1 {
        return Err(invalid("Unrecognized portable marker"));
    }
    let guard = profile_lock(root)?;
    recover_program(root)?;
    validate_root(root)?;
    let exe = root.join("Program/Novera-Desktop.exe");
    plain(&exe)?;
    drop(guard);
    std::process::Command::new(exe).current_dir(root).spawn()?;
    Ok(())
}

pub fn install_update(root: &Path, payload: &Path) -> io::Result<()> {
    let root = validate_root(root)?;
    let deadline = Instant::now() + Duration::from_secs(90);
    let guard = loop {
        match profile_lock(&root) {
            Ok(file) => break file,
            Err(_) if Instant::now() < deadline => std::thread::sleep(Duration::from_millis(500)),
            Err(error) => return Err(error),
        }
    };
    recover_program(&root)?;
    let stage = root.join(format!(
        ".novera-update-{}-{}",
        std::process::id(),
        SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos()
    ));
    fs::create_dir(&stage)?;
    let manifest = extract_payload(PayloadReader::open(payload)?, &stage)?;
    replace_program(&root, &stage)?;
    atomic_write(
        &root.join("Data/last-portable-update.json"),
        &serde_json::to_vec(
            &serde_json::json!({"version":manifest.version,"programReplaced":true,"dataPreserved":true}),
        )?,
    )?;
    // This owned stage now contains no user data and no links.
    let _ = fs::remove_dir(&stage);
    drop(guard);
    std::process::Command::new(root.join("Program/Novera-Desktop.exe"))
        .current_dir(&root)
        .spawn()?;
    Ok(())
}
