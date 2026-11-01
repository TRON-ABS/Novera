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
node scripts/distribution/ci-candidates.mjs begin "$kind"
if [[ "$kind" != cli ]]; then
  yarn install --immutable
  yarn build:tauri:plugin:api
  yarn build:core
  yarn build:extensions
  if [[ "$kind" != web ]]; then yarn build:icon; fi
  yarn copy:assets:mobile
fi
case "$kind" in
  web)
    yarn build:web
    node scripts/distribution/ci-candidates.mjs web
    ;;
  cli)
    cargo build --release --manifest-path src-tauri/novera-cli/Cargo.toml --features cli --bin jan
    binary="$CARGO_TARGET_DIR/release/jan"
    [[ "$RUNNER_OS" != Windows ]] || binary="$binary.exe"
    "$binary" --help > .build/candidates/CLI-HELP.txt
    node scripts/distribution/ci-candidates.mjs cli
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
    if [[ "$RUNNER_OS" == Linux ]]; then
      export NO_STRIP=1 APPIMAGE_EXTRACT_AND_RUN=1
      bash src-tauri/build-utils/shim-linuxdeploy.sh yarn tauri build --ci --config .build/candidate-config.json
      bash src-tauri/build-utils/buildAppImage.sh
    else
      yarn tauri build --ci --config .build/candidate-config.json
    fi
    node scripts/distribution/ci-candidates.mjs desktop
    if [[ "$CANDIDATE_VARIANT" == windows ]]; then
      pwsh -NoProfile -File scripts/package-windows-portable.ps1 -RuntimeDir .build/candidates/desktop -OutputDir .build/candidates/portable
    fi
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
  *) echo 'Unknown candidate kind' >&2; exit 2 ;;
esac
node scripts/distribution/ci-candidates.mjs finish "$kind"
