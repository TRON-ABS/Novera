# fix(portable): prepare versioned packages with the current text engine

The portable 1.0.1 candidate cannot compile with sha2 0.11 because digest arrays no longer implement LowerHex. Its packaging, signing and validation scripts also hardcode 1.0.0 and would reuse that release's old text worker. Encode digest bytes explicitly, verify a standard SHA-256 vector and read the application version consistently across portable artifacts, notices and feeds.

Rebuild the pinned CUDA/Vulkan worker and runtime tools before portable packaging. Verify the fresh worker's reported commit against the current source pin; replace inherited text libraries in the new output tree and record the new worker separately from the immutable image/runtime base. Preserve all published 1.0.0 bytes and the portable Data directory.

Reproduction: portable run 42341135482 fails at `portable-support/src/lib.rs:502`; the old package scripts explicitly require version 1.0.0. The duplicate retry was cancelled once the shared failure was established.

Validation: eight Rust portable tests pass with `cargo test --offline --locked --manifest-path src-tauri/portable-support/Cargo.toml --target-dir .build/release-1.0.1/portable-tests`; tests cover >64 MiB discussions, relocation, Windows-protected secrets, interruption recovery, locks, corruption and a known SHA-256 vector. Eighteen Python distribution tests and 12 targeted Node contracts pass. Python/Node syntax checks and actionlint pass. The new native portable build remains a separate CI check; no public upgrade or UI success is claimed.

Depends on merged #26, #27 and #28; no new native desktop source changes. Update the release lessons and 1.0.1 tracking. The independent iOS PR #22 remains open.
