//! Runs production Rust modules without Tauri or native inference builds.
#[path = "../../../src-tauri/plugins/tauri-plugin-rag/src/error.rs"]
mod error;
pub use error::RagError;
#[path = "../../../src-tauri/plugins/tauri-plugin-rag/src/constants.rs"]
mod constants;
pub use constants::*;
#[path = "../../../src-tauri/plugins/tauri-plugin-rag/src/parser.rs"]
mod parser;
#[path = "../../../src-tauri/src/core/server/api_security.rs"]
mod api_security;

#[cfg(windows)]
#[test]
fn keyring_upgrade_reads_existing_windows_credentials() {
    let account = format!("migration-{:032x}", rand::random::<u128>());
    struct Cleanup(keyring_v3::Entry);
    impl Drop for Cleanup {
        fn drop(&mut self) { let _ = self.0.delete_credential(); }
    }
    let old = Cleanup(keyring_v3::Entry::new("novera-compatibility-tests", &account).unwrap());
    old.0.set_password("synthetic-compatibility-fixture").unwrap();
    let updated = keyring::Entry::new("novera-compatibility-tests", &account).unwrap();
    assert_eq!(updated.get_password().unwrap(), "synthetic-compatibility-fixture");
}
pub mod core {
    pub mod app {
        pub mod commands {
            pub fn resolve_jan_data_folder() -> std::path::PathBuf {
                // Test adapter: never fall back to a developer's actual profile.
                std::env::var_os("JAN_DATA_FOLDER").expect("isolated test directory required").into()
            }
        }
    }
}
#[path = "../../../src-tauri/src/core/server/provider_secrets.rs"]
mod provider_secrets;
