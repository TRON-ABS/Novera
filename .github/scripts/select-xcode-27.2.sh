#!/usr/bin/env bash
set -euo pipefail

export DEVELOPER_DIR=/Applications/Xcode_27.2.app/Contents/Developer
version=$(xcodebuild -version)
printf '%s\n' "$version"
grep -Fxq 'Xcode 27.2' <<< "$version"
grep -Fxq 'Build version 27B52' <<< "$version"
test "$(xcrun --sdk macosx --show-sdk-version)" = '27.2'
printf 'DEVELOPER_DIR=%s\n' "$DEVELOPER_DIR" >> "$GITHUB_ENV"
