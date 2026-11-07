# fix(android): reapply task bindings after Tauri regenerates Gradle sources

Fresh Android run 42344464455 fails at RustPlugin.kt:73: Tauri 2.12.4 assigns `projectDir = project.projectDir.path`, but our adapted BuildTask obtains that path from Gradle directly and exposes no String property. Gradle therefore resolves the inherited read-only File property and rejects the assignment.

Remove only that generated assignment and keep the task's existing `File(project.projectDir, root)` working directory. Reapply both task adaptations from the settings hook as well as full configuration, because Tauri can regenerate the task files after the initial configuration step. Preserve target/release assignments and other generated settings.

Validation: nine Android configuration tests pass, including a fresh modern template, regeneration after initial configuration, plugin-only refresh, and repeated idempotent configuration. A new Android CI candidate is dispatched for the actual Gradle compilation; no successful remote package is claimed yet.

Depends on merged #28/#32 and follows #37. The signed production APK already built locally is retained; this change repairs clean-runner reproducibility without rotating Android signing identity or changing Desktop packages. Add the confirmed lesson to the release memo.
