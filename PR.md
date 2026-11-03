# fix(android): use a 512-token batch for the 1.0.0 release

Android inherited the desktop batch size of 2048. Use 512 by default on Android, migrate saved legacy 2048 defaults, and supply 512 when a model has no saved batch setting. Preserve custom values and desktop behavior. Keep application version 1.0.0 and increase Android versionCode to 1000011 using the existing signing identity.

The maintainer confirms the previous signed APK 1000010 works well and authorizes publication. Recommend a modern phone for local models or an API provider on less powerful devices. Recommend at least 16K tokens of context for web search, consistently with the other versions; the recommendation does not automatically increase mobile context memory use.

Validation:

- From web-app: `node ../node_modules/vitest/vitest.mjs run src/hooks/__tests__/useModelProvider.coverage.test.ts src/services/models/__tests__/default.coverage.test.ts`: 85 passed. Migration covers missing, numeric/string legacy defaults, custom batches and remote/desktop preservation; loading verifies fallback and custom values.
- `node --test scripts/android/__tests__/configure-project.test.mjs`: 5 passed.
- `./scripts/android/build-release.ps1 -OutputDirectory deliverables/Novera-Android-public-1.0.0-2026-11-03` under PowerShell 7: TypeScript/Vite, Cargo release, Gradle/Lint and final signed APK inspection pass. VersionCode 1000011, 42211690 bytes, SHA-256 `325d5ef5b6ca558ed150ea590eaf4a01b54ac8bfb1f7ee5b163dffbe85c43ecb`, same certificate as 1000010. Exact batch-512 frontend embedded in the compiled library; 217 PNGs unchanged. The initial Windows PowerShell 5 invocation treated informational stderr as a terminating error; the PowerShell 7 run completed using the existing verified-library copy fallback for unavailable Windows symlinks.
- Source and future-version contracts CI [41578791664](https://github.com/TRON-ABS/Novera/actions/runs/41578791664): success on application commit c171275de. Later changes are documentation/evidence only.
- Device validation of rebuilt 1000011 remains distinct from the maintainer report on 1000010. Direct APK uses the same-certificate, increasing-versionCode manual update path.

Follows merged PR #15. No open PR overlaps were found on 3 November 2026. Android direct APK only; desktop/CLI update feeds and existing public assets remain unchanged. The 12 old local delivery APKs and their detached signing companions were removed as requested after final inspection; receipts are retained. Uploading the final APK and receipts to the prepared GitHub draft was blocked by automatic approval review pending explicit payload/destination approval. No public Android availability is claimed.
