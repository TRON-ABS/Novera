# fix(linux): adapt portal proxy builders to zbus 6

After enabling the proxy feature in #31, Linux compilation reaches the two XDG theme proxy builders and rejects their `?` operators. zbus 6 setters return the builder directly and retain validation errors for `build()`. Remove `?` from destination, path and interface while preserving `build().await?` in both paths.

Reproduction: Linux run 42343670821 / job 128316700112 fails with E0277 at setup.rs:502 and :698. The pinned 6.2.1 builder source confirms the deferred error behavior; the existing sharing proxy calls already type-check.

Validation: Rust 2021 syntax parsing and 16 source/version contracts pass. Whole-file formatting still reports preexisting differences outside the changed builder chains. The signed Linux candidate is relaunched for full compilation, migration and native UI checks. No successful Linux package is claimed before that run completes. Windows/Mac builds use their existing conditional code and continue independently.

Depends on merged #31 and the other 1.0.1 preparation fixes. Update the release lessons to inspect the entire changed API chain and preserve final error handling.
