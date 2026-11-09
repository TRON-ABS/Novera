//! Verified native image runtimes shared by Desktop platforms.
use serde_json::Value;
use sha2::{Digest, Sha256};
use std::path::{Path, PathBuf};
use tokio::process::Command;

pub struct NativeRuntime {
    pub executable: PathBuf,
    pub backend: Option<String>,
    pub combined: bool,
}

pub fn image_flags(optimized: bool) -> &'static [&'static str] {
    if optimized {
        &["--flash-attn", "on"]
    } else {
        &["--offload-to-cpu", "--vae-tiling"]
    }
}

pub fn verified(executable: &Path) -> bool {
    (|| -> Option<()> {
        let directory = executable.parent()?;
        let receipt: Value =
            serde_json::from_slice(&std::fs::read(directory.join("BUILD-VERIFICATION.json")).ok()?)
                .ok()?;
        if receipt.get("compiled")?.as_bool()? != true
            || receipt.get("esrganSha256")?.as_str()?
                != "3acf673f80617b6e4af130662dd30ddadd6361f993c43216a4fb646a945c0cbc"
        {
            return None;
        }
        let artifacts = receipt.get("artifacts")?.as_array()?;
        let mut found_executable = false;
        let mut found_library = false;
        for artifact in artifacts {
            let name = artifact.get("name")?.as_str()?;
            let library = matches!(
                name,
                "stable-diffusion.dll" | "libstable-diffusion.so" | "libstable-diffusion.dylib"
            );
            if !library && !matches!(name, "sd-cli.exe" | "sd-cli") {
                return None;
            }
            let path = directory.join(name);
            if std::fs::metadata(&path).ok()?.len() != artifact.get("bytes")?.as_u64()? {
                return None;
            }
            use std::io::Read;
            let mut file = std::fs::File::open(&path).ok()?;
            let mut hash = Sha256::new();
            let mut buffer = [0u8; 65536];
            loop {
                let count = file.read(&mut buffer).ok()?;
                if count == 0 {
                    break;
                }
                hash.update(&buffer[..count]);
            }
            if hash
                .finalize()
                .iter()
                .map(|byte| format!("{byte:02x}"))
                .collect::<String>()
                != artifact.get("sha256")?.as_str()?
            {
                return None;
            }
            found_library |= library;
            found_executable |= path.canonicalize().ok()? == executable.canonicalize().ok()?;
        }
        (found_library && found_executable).then_some(())
    })()
    .is_some()
}

pub async fn discover(
    executable: &Path,
    device: &str,
    encoder: Option<&str>,
) -> Option<NativeRuntime> {
    let mut combined = true;
    let mut backend = match device {
        "cpu" => Some("cpu".to_string()),
        "cuda" => Some("cuda0".to_string()),
        _ => None,
    };
    let runtime = if executable.file_name()?.to_str()? == "novera-image-engine.exe" {
        let directory = executable.parent()?;
        if !["cuda", "vulkan", "cpu"].iter().any(|family| {
            directory
                .join(family)
                .join("BUILD-VERIFICATION.json")
                .is_file()
        }) {
            return None;
        }
        let mut probe = Command::new(executable);
        probe.arg("--novera-probe").kill_on_drop(true);
        let mut assignments = Vec::new();
        if device == "cpu" {
            assignments.extend(["diffusion=cpu", "vae=cpu"]);
        }
        if device == "cuda" {
            assignments.extend(["diffusion=cuda0", "vae=cuda0"]);
        }
        if encoder == Some("cpu") {
            assignments.push("te=cpu");
        }
        if encoder == Some("cuda") {
            assignments.push("te=cuda0");
        }
        if !assignments.is_empty() {
            probe.args(["--backend", &assignments.join(",")]);
        }
        #[cfg(windows)]
        probe.creation_flags(0x08000000);
        let output = tokio::time::timeout(std::time::Duration::from_secs(30), probe.output())
            .await
            .ok()?
            .ok()?;
        if !output.status.success() {
            return None;
        }
        let report: Value = serde_json::from_slice(&output.stdout).ok()?;
        combined = report.get("upscaler_backend").and_then(Value::as_bool) == Some(true);
        let family = report.get("family")?.as_str()?;
        if !matches!(family, "cuda" | "vulkan" | "cpu") {
            return None;
        }
        if device != "cpu" {
            backend = Some(report.get("device")?.as_str()?.to_string());
        }
        directory.join(family).join("sd-cli.exe")
    } else {
        executable.to_path_buf()
    };
    verified(&runtime).then_some(NativeRuntime {
        executable: runtime,
        backend,
        combined,
    })
}

pub fn upscale_command(
    runtime: &Path,
    backend: Option<&str>,
    model: &Path,
    input: &Path,
    output: &Path,
) -> Result<Command, String> {
    if !verified(runtime) {
        return Err("CREATION_NATIVE_RUNTIME_CHANGED".into());
    }
    let mut command = Command::new(runtime);
    command
        .current_dir(runtime.parent().ok_or("Missing native engine directory")?)
        .args(["--mode", "upscale", "--init-img"])
        .arg(input)
        .arg("--upscale-model")
        .arg(model)
        .args([
            "--upscale-repeats",
            "1",
            "--upscale-tile-size",
            "128",
            "--output",
        ])
        .arg(output);
    if let Some(backend) = backend {
        command.args(["--backend", backend]);
    }
    Ok(command)
}
