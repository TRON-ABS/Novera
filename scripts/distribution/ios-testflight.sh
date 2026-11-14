#!/usr/bin/env bash
set -euo pipefail

: "${APPLE_DEVELOPMENT_TEAM:?Missing Apple team ID}"
: "${APPLE_API_KEY:?Missing App Store Connect key ID}"
: "${APPLE_API_ISSUER:?Missing App Store Connect issuer ID}"
: "${ASC_PRIVATE_KEY:?Missing App Store Connect private key}"

umask 077
scratch=$(mktemp -d "${RUNNER_TEMP:?}/novera-testflight.XXXXXX")
keychain="$scratch/signing.keychain-db"
trap 'security delete-keychain "$keychain" 2>/dev/null || true; rm -rf -- "$scratch"' EXIT
keychain_password=$(openssl rand -hex 24)
security create-keychain -p "$keychain_password" "$keychain"
security unlock-keychain -p "$keychain_password" "$keychain"
security set-keychain-settings -lut 7200 "$keychain"
security list-keychains -d user -s "$keychain"
printf '%s' "${IOS_CERTIFICATE_BASE64:?Missing distribution certificate}" | base64 -D > "$scratch/distribution.p12"
security import "$scratch/distribution.p12" -k "$keychain" -P "${IOS_CERTIFICATE_PASSWORD:?Missing certificate password}" -T /usr/bin/codesign
security set-key-partition-list -S apple-tool:,apple:,codesign: -s -k "$keychain_password" "$keychain"
rm -f "$scratch/distribution.p12"
unset IOS_CERTIFICATE_BASE64 IOS_CERTIFICATE_PASSWORD
export APPLE_API_KEY_PATH="$scratch/AuthKey_${APPLE_API_KEY}.p8"
printf '%s\n' "$ASC_PRIVATE_KEY" > "$APPLE_API_KEY_PATH"
unset ASC_PRIVATE_KEY

bash scripts/distribution/ci-build.sh ios-testflight

shopt -s nullglob
ipas=(src-tauri/gen/apple/build/arm64/*.ipa)
[[ ${#ipas[@]} -eq 1 ]] || { echo 'Expected exactly one exported iPhone IPA.' >&2; exit 1; }
ditto -x -k "${ipas[0]}" "$scratch/ipa"
apps=("$scratch"/ipa/Payload/*.app)
[[ ${#apps[@]} -eq 1 ]] || { echo 'Expected exactly one app in the IPA.' >&2; exit 1; }
codesign --verify --deep --strict "${apps[0]}"
codesign -d --entitlements - "${apps[0]}" > "$scratch/entitlements.plist"
python3 - "${apps[0]}" "$scratch/entitlements.plist" <<'PYTHON'
import json
import os
import plistlib
import sys
from pathlib import Path

app, entitlements = map(Path, sys.argv[1:])
info = plistlib.loads((app / 'Info.plist').read_bytes())
rights = plistlib.loads(entitlements.read_bytes())
config = json.loads(Path('src-tauri/tauri.ios.conf.json').read_text())
app_id = config['identifier']
team_id = os.environ['APPLE_DEVELOPMENT_TEAM']
expected = {
    'CFBundleIdentifier': app_id,
    'CFBundleShortVersionString': config['version'],
    'CFBundleVersion': config['bundle']['iOS']['bundleVersion'],
    'CFBundleSupportedPlatforms': ['iPhoneOS'],
}
for key, value in expected.items():
    if info.get(key) != value:
        raise SystemExit(f'Unexpected IPA metadata: {key}')
if rights.get('com.apple.developer.team-identifier') != team_id or rights.get('application-identifier') != f'{team_id}.{app_id}' or rights.get('get-task-allow'):
    raise SystemExit('Expected distribution entitlements for the configured app and team.')
print(f"Verified signed {app_id} {expected['CFBundleShortVersionString']} ({expected['CFBundleVersion']})")
PYTHON

if [[ "${UPLOAD_TO_TESTFLIGHT:-false}" == true ]]; then
  API_PRIVATE_KEYS_DIR="$scratch" xcrun altool --upload-app --type ios --file "${ipas[0]}" \
    --apiKey "$APPLE_API_KEY" --apiIssuer "$APPLE_API_ISSUER"
fi
