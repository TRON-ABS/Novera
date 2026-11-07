# fix(android): align generated Rust task calls with the adapted Gradle task

The inspected signed local APK builds, but fresh Android CI fails in buildSrc because Tauri's generated RustPlugin assigns `rootDir = config.rootDirRel`. Our adapted BuildTask exposes `rootDirRel`; Gradle already owns a read-only File property named rootDir. Update the generated plugin's exact task assignments alongside the task template, preserving idempotent configuration and the Cargo registry.

Reproduction: Android job 128312108465, run 42342175253, fails at RustPlugin.kt:73 with “val cannot be reassigned” and String/File mismatch. The existing local project already used rootDirRel, explaining the successful local package without certifying fresh generation.

Validation: the generated-project regression covers both task assignments and repeated configuration. Targeted Android/source tests pass; the clean Android CI candidate is rerun. The separately signed local 1.0.1 APK passes package inspection, retains production certificate ccea6bf0… and versionCode 1000013; device installation remains unvalidated. No new private key is generated or committed.

Depends on merged #28 and #31; independent of installed desktop builds. Update the release lessons with the fresh-project discrepancy and safe cache cleanup. The publication README helpers remain local work and are excluded from this change.
