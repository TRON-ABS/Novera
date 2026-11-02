#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
fn main() {
    // Tauri passes its own /UPDATE /ARGS flags first. Our argument is one
    // hex-encoded UTF-8 value so spaces, quotes and Unicode never need shell quoting.
    let result = (|| -> Result<(), Box<dyn std::error::Error>> {
        let executable = std::env::current_exe()?;
        let Some(value) =
            std::env::args().find_map(|s| s.strip_prefix("--novera-root=").map(str::to_owned))
        else {
            novera_portable::start_portable(executable.parent().ok_or("Missing portable folder")?)?;
            return Ok(());
        };
        if value.len() % 2 != 0
            || value.len() > 65536
            || !value.bytes().all(|b| b.is_ascii_hexdigit())
        {
            return Err("Invalid portable root argument".into());
        }
        let bytes: Result<Vec<u8>, _> = (0..value.len())
            .step_by(2)
            .map(|i| u8::from_str_radix(&value[i..i + 2], 16))
            .collect();
        let root = std::path::PathBuf::from(String::from_utf8(bytes?)?);
        novera_portable::install_update(&root, &std::env::current_exe()?)?;
        Ok(())
    })();
    if let Err(error) = result {
        eprintln!("Portable update failed: {error}");
        #[cfg(windows)]
        unsafe {
            #[link(name = "user32")]
            extern "system" {
                fn MessageBoxW(
                    window: *mut std::ffi::c_void,
                    text: *const u16,
                    title: *const u16,
                    flags: u32,
                ) -> i32;
            }
            let message: Vec<u16> = format!(
                "The portable update could not finish. Your Data folder is preserved.\n\n{error}"
            )
            .encode_utf16()
            .chain(Some(0))
            .collect();
            let title: Vec<u16> = "Novera portable".encode_utf16().chain(Some(0)).collect();
            MessageBoxW(std::ptr::null_mut(), message.as_ptr(), title.as_ptr(), 0x10);
        }
        std::process::exit(1);
    }
}
