#!/usr/bin/env bash
# Ephemeral GitHub runners only; never invoked by the desktop application.
set -euo pipefail
kind="${1:?candidate kind required}"
[[ "${GITHUB_ACTIONS:-}" == true ]] || { echo 'This entry point requires GitHub Actions.' >&2; exit 2; }
corepack enable
corepack prepare yarn@4.5.3 --activate
if [[ "$kind" != web ]]; then
  version=$(sed -n 's/^channel *= *"\([^"]*\)"/\1/p' rust-toolchain.toml)
  [[ "$version" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || exit 2
  rustup toolchain install "$version" --profile minimal
fi
case "$RUNNER_OS" in
  Linux)
    if [[ "$kind" != web ]]; then
      sudo apt-get update
      sudo apt-get install -y build-essential cmake ninja-build clang pkg-config libssl-dev
    fi
    if [[ "$kind" == desktop ]]; then
      sudo apt-get install -y libglib2.0-dev libatk1.0-dev libpango1.0-dev libgtk-3-dev libsoup-3.0-dev libwebkit2gtk-4.1-dev librsvg2-dev libfuse2 libappindicator3-dev xdg-utils file desktop-file-utils xvfb
    fi
    ;;
  Windows)
    if [[ "$kind" == desktop ]]; then
      if ! command -v make >/dev/null; then choco install make -y --no-progress; fi
      echo 'C:\ProgramData\chocolatey\bin' >> "$GITHUB_PATH"
    fi
    ;;
  macOS)
    if [[ "$kind" == desktop ]]; then
      # Match the established MLX build requirement, without changing xcode-select.
      if [[ "$RUNNER_ARCH" == ARM64 ]]; then
        export DEVELOPER_DIR=/Applications/Xcode_26.2.app/Contents/Developer
        [[ -d "$DEVELOPER_DIR" ]] || { echo 'MLX requires the pinned Xcode 26.2 installation.' >&2; exit 2; }
        echo "DEVELOPER_DIR=$DEVELOPER_DIR" >> "$GITHUB_ENV"
        xcodebuild -version
      fi
      command -v cmake >/dev/null || brew install cmake
      command -v ninja >/dev/null || brew install ninja
    fi
    if [[ "$kind" == ios ]]; then
      brew install xcodegen
      rustup target add aarch64-apple-ios-sim
    fi
    ;;
esac
