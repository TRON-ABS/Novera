#!/usr/bin/env bash
set -euo pipefail
[[ "${GITHUB_ACTIONS:-}" == true && "${RUNNER_ENVIRONMENT:-}" == github-hosted && "$RUNNER_OS" == macOS ]] || { echo 'Disposable macOS GitHub runner required.' >&2; exit 2; }
[[ "${NOVERA_ENABLE_UPDATER:-}" == true ]] || { echo 'The headless battery requires a signed updater package.' >&2; exit 2; }
# Signing is already complete. No signing or GitHub credential reaches tests.
unset TAURI_SIGNING_PRIVATE_KEY TAURI_SIGNING_PRIVATE_KEY_PASSWORD GITHUB_TOKEN GH_TOKEN
unset APPLE_CERTIFICATE APPLE_CERTIFICATE_PASSWORD APPLE_SIGNING_IDENTITY APPLE_ID APPLE_PASSWORD APPLE_TEAM_ID
export CARGO_BUILD_JOBS=2 CARGO_PROFILE_DEV_DEBUG=0 CARGO_PROFILE_TEST_DEBUG=0 CARGO_INCREMENTAL=0
mkdir -p .build/macos-headless .build/candidates
node node_modules/vitest/vitest.mjs run --project @janhq/web-app \
  web-app/src/providers/__tests__/ThemeProvider.test.tsx \
  web-app/src/hooks/__tests__/useTheme.test.ts \
  web-app/src/lib/__tests__/platform-utils.test.ts \
  web-app/src/hooks/__tests__/useModelProvider.coverage.test.ts \
  web-app/src/services/models/__tests__/default.coverage.test.ts \
  web-app/src/services/creation/memory.test.ts \
  web-app/src/hooks/__tests__/useAppUpdater.test.ts \
  web-app/src/services/updater/__tests__/tauri.test.ts \
  web-app/src/lib/__tests__/noveraErrorTracking.test.ts \
  web-app/src/containers/__tests__/ErrorTrackingConsent.configuration.test.tsx \
  web-app/src/lib/__tests__/clipboard.test.ts \
  web-app/src/lib/__tests__/messageExportText.test.ts \
  web-app/src/lib/__tests__/mobileDuckduckgoSearch.test.ts \
  web-app/src/containers/__tests__/ShareButton.test.tsx \
  web-app/src/containers/__tests__/SettingsMenu.test.tsx \
  --reporter=json --outputFile=.build/macos-headless/frontend.json
python3 scripts/distribution/macos-headless.py fixture
export JAN_TEST_GGUF
JAN_TEST_GGUF=$(cat .build/macos-headless/model-path.txt)
# Existing real-model tests cover generation, streaming, auth, cancellation,
# model eviction, persisted KV and worker supervision. Run serially on small VMs.
cargo test --release --locked --manifest-path src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml \
  --features engine-metal --lib --tests -- --test-threads=1 2>&1 | tee .build/macos-headless/engine-tests.txt
cargo test --release --locked --manifest-path src-tauri/Cargo.toml \
  --no-default-features --features cli-signed-updates --lib core::cli::updater::signed::tests \
  -- --test-threads=1 2>&1 | tee .build/macos-headless/updater-unit-tests.txt
cargo build --locked --manifest-path scripts/distribution/checks/native-update/Cargo.toml --target-dir .build/native-update-probe
python3 scripts/distribution/macos-headless.py package --probe .build/native-update-probe/debug/novera-update-validation
