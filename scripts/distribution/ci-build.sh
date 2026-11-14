#!/usr/bin/env bash
set -euo pipefail
kind="${1:?candidate kind required}"
[[ "${GITHUB_ACTIONS:-}" == true ]] || { echo 'This entry point requires GitHub Actions.' >&2; exit 2; }
export CARGO_TARGET_DIR="${GITHUB_WORKSPACE//\\//}/src-tauri/target"
# Windows SDK resource tools still impose MAX_PATH in nested Vulkan builds.
# Keep the existing per-OUT_DIR isolation supplied by the engine build script.
if [[ "$RUNNER_OS" == Windows ]]; then
  export JAN_ENGINE_BUILD_DIR="${RUNNER_TEMP//\\//}/ne"
fi
mkdir -p .build/candidates
if [[ "$kind" == desktop && "$RUNNER_OS" == macOS && "${NOVERA_MACOS_DISTRIBUTION:-false}" != true ]]; then
  # Tauri treats an exported empty certificate as a request to import one.
  # Direct distribution must omit Apple credentials entirely; updater signing
  # remains enabled separately with the Novera key.
  unset APPLE_CERTIFICATE APPLE_CERTIFICATE_PASSWORD APPLE_SIGNING_IDENTITY
  unset APPLE_ID APPLE_PASSWORD APPLE_TEAM_ID
fi
if [[ "$kind" == desktop && "${NOVERA_MACOS_DISTRIBUTION:-false}" == true ]]; then
  [[ "$RUNNER_OS" == macOS ]] || { echo 'Apple distribution requires macOS.' >&2; exit 2; }
  node scripts/distribution/macos-distribution.mjs preflight
fi
if [[ "$kind" == desktop && "${NOVERA_ENABLE_UPDATER:-false}" == true ]]; then
  [[ -n "${TAURI_SIGNING_PRIVATE_KEY:-}" && -n "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}" ]] || { echo 'Missing required Novera update signing credentials.' >&2; exit 2; }
fi
node scripts/distribution/ci-candidates.mjs begin "$kind"
if [[ "$kind" != cli ]]; then
  yarn install --immutable
  yarn build:tauri:plugin:api
  yarn build:core
  yarn build:extensions
  if [[ "$kind" != web ]]; then yarn build:icon; fi
  yarn copy:assets:mobile
fi
if [[ "$kind" == desktop && "${NOVERA_ENABLE_UPDATER:-false}" == true ]]; then
  # Fail before compiling engines if a manual feed error can masquerade as an
  # up-to-date installation. Keep the machine-readable result with the build.
  yarn vitest run --project @janhq/web-app \
    web-app/src/hooks/__tests__/useAppUpdater.test.ts \
    web-app/src/services/updater/__tests__/tauri.test.ts \
    web-app/src/routes/settings/__tests__/general.test.tsx \
    --reporter=json --outputFile=.build/candidates/UPDATER-UI-CONTRACTS.json
fi
case "$kind" in
  web)
    yarn build:web
    node scripts/distribution/ci-candidates.mjs web
    ;;
  cli)
    # The CLI now embeds the shared inference crate, so clean runners need
    # the same pinned llama.cpp source as the desktop build.
    bash src-tauri/build-utils/fetch-engine-source.sh
    cli_features=cli
    if [[ "${NOVERA_ENABLE_CLI_UPDATER:-false}" == true ]]; then
      [[ -n "${TAURI_SIGNING_PRIVATE_KEY:-}" && -n "${TAURI_SIGNING_PRIVATE_KEY_PASSWORD:-}" ]] || { echo 'Missing CLI update signing credentials.' >&2; exit 2; }
      yarn install --immutable
      cli_features=cli,signed-updates
    fi
    cargo build --release --locked --manifest-path src-tauri/novera-cli/Cargo.toml --features "$cli_features" --bin novera
    cargo test --release --locked --manifest-path src-tauri/novera-cli/Cargo.toml --features "$cli_features" --test novera_update_policy
    binary="$CARGO_TARGET_DIR/release/novera"
    [[ "$RUNNER_OS" != Windows ]] || binary="$binary.exe"
    "$binary" --help > .build/candidates/CLI-HELP.txt
    node scripts/distribution/ci-candidates.mjs cli
    if [[ "${NOVERA_ENABLE_CLI_UPDATER:-false}" == true ]]; then
      node scripts/distribution/ci-check-cli-updater.mjs
      export NOVERA_CLI_TEST_ARCHIVE
      # Cargo runs library tests from the package directory, not the shell cwd.
      # Node returns a native absolute path on Windows as well as Unix runners.
      NOVERA_CLI_TEST_ARCHIVE=$(node --input-type=module -e 'import fs from "node:fs"; import path from "node:path"; const dir=".build/candidates/packages"; const files=fs.readdirSync(dir).filter(n=>/^Novera_CLI_.*\.zip$/.test(n)); if(files.length!==1)throw new Error("Expected one signed CLI archive"); console.log(fs.realpathSync(path.join(dir,files[0])));')
      cargo test --release --locked --manifest-path src-tauri/Cargo.toml --no-default-features --features cli-signed-updates --lib core::cli::updater::signed::tests
      cargo test --release --locked --manifest-path src-tauri/Cargo.toml --no-default-features --features cli-signed-updates --lib ci_signed_archive_replaces_and_runs_in_an_isolated_directory -- --ignored --test-threads=1
      unset NOVERA_CLI_TEST_ARCHIVE
    fi
    ;;
  desktop)
    export IS_TAURI=true
    if [[ "$RUNNER_OS" == Linux ]]; then
      xvfb-run -a cargo test --release --manifest-path scripts/distribution/checks/linux-clipboard/Cargo.toml -- --ignored --test-threads=1
    fi
    yarn download:bin
    if [[ "$RUNNER_OS" == macOS ]]; then
      make build-engine
      if [[ "$RUNNER_ARCH" == ARM64 ]]; then yarn build:mlx-server; fi
    else
      make build-engine
    fi
    worker=src-tauri/resources/bin/novera-llama-worker
    [[ "$RUNNER_OS" != Windows ]] || worker="$worker.exe"
    "$worker" --version-json > .build/worker-version.json
    if [[ "$CANDIDATE_VARIANT" == windows ]]; then
      pwsh -NoProfile -Command '& ./media-server/image-launcher/prepare.ps1 -ToolkitRoot $env:CUDA_PATH; if ($LASTEXITCODE) { exit $LASTEXITCODE }; & ./scripts/distribution/stage-novera-image.ps1'
    fi
    node scripts/distribution/ci-candidates.mjs config
    if [[ "$RUNNER_OS" == Windows ]]; then
      # Tauri uses the static MSVC runtime. Keep that mode for the direct Cargo
      # migration tests too: tauri-build leaves an msvcrt.lib override in OUT_DIR
      # which otherwise shadows Microsoft's import library during the rebuild.
      export STATIC_VCRUNTIME=true
    fi
    if [[ "$RUNNER_OS" == Linux ]]; then
      export NO_STRIP=1 APPIMAGE_EXTRACT_AND_RUN=1
      bash src-tauri/build-utils/shim-linuxdeploy.sh yarn tauri build --ci --config .build/candidate-config.json
      bash src-tauri/build-utils/buildAppImage.sh
    else
      yarn tauri build --ci --config .build/candidate-config.json
    fi
    if [[ "$RUNNER_OS" == macOS ]]; then
      node scripts/distribution/ci-check-macos.mjs "$CARGO_TARGET_DIR/release/bundle/macos/Novera.app"
    fi
    node scripts/distribution/ci-candidates.mjs desktop
    if [[ "${NOVERA_ENABLE_UPDATER:-false}" == true ]]; then
      node scripts/distribution/ci-check-updater.mjs
      if [[ "$RUNNER_OS" == Linux ]]; then
        cargo install tauri-driver --version 2.1.0 --locked
        xvfb-run -a python3 scripts/distribution/validate-linux-update-ui.py
      fi
    fi
    if [[ "$RUNNER_OS" == macOS && "${NOVERA_MACOS_DISTRIBUTION:-false}" == true ]]; then
      node scripts/distribution/macos-distribution.mjs verify "$CARGO_TARGET_DIR/release/bundle/macos/Novera.app" .build/candidates/packages
    fi
    # Freeze the delivered runtime before tests can rebuild Cargo outputs.
    # Tauri has now built the frontend required by the integration test.
    export TAURI_CONFIG
    TAURI_CONFIG=$(cat .build/candidate-config.json)
    if [[ "$RUNNER_OS" == Linux ]]; then
      xvfb-run -a cargo test --release --locked --manifest-path src-tauri/Cargo.toml --test upgrade_compat -- --test-threads=1 | tee .build/upgrade-compatibility.txt
    else
      cargo test --release --locked --manifest-path src-tauri/Cargo.toml --test upgrade_compat -- --test-threads=1 | tee .build/upgrade-compatibility.txt
    fi
    unset TAURI_CONFIG
    node scripts/distribution/record-upgrade-check.mjs .build/upgrade-compatibility.txt
    if [[ "$RUNNER_OS" == macOS && "${NOVERA_MACOS_HEADLESS_TESTS:-false}" == true ]]; then
      bash scripts/distribution/macos-headless-tests.sh
    fi
    # The portable feature and its signed Program-only updater have their own
    # workflow; an installed desktop runtime is never relabelled as portable.
    ;;
  android)
    pwsh -NoProfile -File scripts/distribution/ci-android.ps1
    node scripts/distribution/ci-candidates.mjs android
    ;;
  ios)
    export IS_TAURI=true IS_IOS=true TAURI_ENV_PLATFORM=ios
    node scripts/distribution/ci-candidates.mjs config-ios
    yarn tauri ios init --ci --skip-targets-install --config .build/candidate-config.json
    yarn tauri ios build --ci --debug --target aarch64-sim --features mobile --config .build/candidate-config.json -- --no-default-features
    node scripts/distribution/ci-candidates.mjs ios
    ;;
  ios-device|ios-testflight)
    export IS_TAURI=true IS_IOS=true TAURI_ENV_PLATFORM=ios
    node scripts/distribution/ci-candidates.mjs config-ios
    # Set the identity explicitly so the generated Xcode project matches App Store Connect.
    node --input-type=module -e '
      import fs from "node:fs";
      const path = ".build/candidate-config.json";
      const config = JSON.parse(fs.readFileSync(path));
      config.identifier = JSON.parse(fs.readFileSync("src-tauri/tauri.ios.conf.json")).identifier;
      fs.writeFileSync(path, JSON.stringify(config, null, 2));
    '
    yarn tauri ios init --ci --skip-targets-install --config .build/candidate-config.json
    if [[ "$kind" == ios-testflight ]]; then
      yarn tauri ios build --ci --target aarch64 --features mobile --export-method app-store-connect --config .build/candidate-config.json -- --no-default-features
    else
      yarn tauri ios build --ci --target aarch64 --features mobile --no-sign --archive-only --config .build/candidate-config.json -- --no-default-features
      python3 scripts/distribution/ios-device-evidence.py
    fi
    exit 0
    ;;
  *) echo 'Unknown candidate kind' >&2; exit 2 ;;
esac
node scripts/distribution/ci-candidates.mjs finish "$kind"
