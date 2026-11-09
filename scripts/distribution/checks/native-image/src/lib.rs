#[path = "../../../../../src-tauri/src/core/creation_native.rs"]
pub mod native;

#[cfg(test)]
mod tests {
    use super::native;
    use serde_json::json;
    use sha2::{Digest, Sha256};
    use std::path::PathBuf;
    struct Fixture(PathBuf);
    impl Fixture {
        fn new() -> Self {
            static NEXT: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
            let root = std::env::temp_dir().join(format!(
                "novera-native-image-check-{}-{}",
                std::process::id(),
                NEXT.fetch_add(1, std::sync::atomic::Ordering::Relaxed)
            ));
            std::fs::create_dir(&root).unwrap();
            let artifacts: Vec<_> = ["sd-cli.exe", "stable-diffusion.dll"].iter().map(|name| {
                let bytes = format!("fixture only, never executed: {name}").into_bytes();
                std::fs::write(root.join(name), &bytes).unwrap();
                json!({"name":name,"bytes":bytes.len(),"sha256":Sha256::digest(&bytes).iter().map(|byte|format!("{byte:02x}")).collect::<String>()})
            }).collect();
            std::fs::write(root.join("BUILD-VERIFICATION.json"), json!({"compiled":true,"esrganSha256":"3acf673f80617b6e4af130662dd30ddadd6361f993c43216a4fb646a945c0cbc","artifacts":artifacts}).to_string()).unwrap();
            Self(root)
        }
    }
    impl Drop for Fixture {
        fn drop(&mut self) {
            assert!(self
                .0
                .canonicalize()
                .unwrap()
                .starts_with(std::env::temp_dir().canonicalize().unwrap()));
            assert!(self
                .0
                .file_name()
                .unwrap()
                .to_string_lossy()
                .starts_with("novera-native-image-check-"));
            std::fs::remove_dir_all(&self.0).unwrap();
        }
    }
    #[test]
    fn requires_the_reviewed_library_and_both_exact_artifacts() {
        let f = Fixture::new();
        let exe = f.0.join("sd-cli.exe");
        assert!(native::verified(&exe));
        std::fs::write(f.0.join("stable-diffusion.dll"), b"changed").unwrap();
        assert!(!native::verified(&exe));
        assert!(native::upscale_command(
            &exe,
            None,
            &f.0.join("model.pth"),
            &f.0.join("input.png"),
            &f.0.join("output.png")
        )
        .is_err());
    }
    #[test]
    fn unknown_or_incomplete_receipts_keep_the_existing_fallback() {
        let f = Fixture::new();
        let receipt = f.0.join("BUILD-VERIFICATION.json");
        let mut value: serde_json::Value =
            serde_json::from_slice(&std::fs::read(&receipt).unwrap()).unwrap();
        value["esrganSha256"] = json!("unknown");
        std::fs::write(&receipt, value.to_string()).unwrap();
        assert!(!native::verified(&f.0.join("sd-cli.exe")));
        std::fs::remove_file(receipt).unwrap();
        assert!(!native::verified(&f.0.join("sd-cli.exe")));
        assert!(native::image_flags(false).contains(&"--vae-tiling"));
        assert!(!native::image_flags(true).contains(&"--offload-to-cpu"));
    }
    #[test]
    fn upscale_uses_only_the_selected_backend_and_fixed_learned_tiles() {
        let f = Fixture::new();
        let command = native::upscale_command(
            &f.0.join("sd-cli.exe"),
            Some("cpu"),
            &f.0.join("model.pth"),
            &f.0.join("input.png"),
            &f.0.join("output.png"),
        )
        .unwrap();
        let args: Vec<_> = command
            .as_std()
            .get_args()
            .map(|a| a.to_string_lossy().into_owned())
            .collect();
        assert!(args.windows(2).any(|a| a == ["--backend", "cpu"]));
        assert!(args.windows(2).any(|a| a == ["--mode", "upscale"]));
        assert!(args.windows(2).any(|a| a == ["--upscale-tile-size", "128"]));
        assert!(!args.contains(&"--steps".to_string()));
    }
}
