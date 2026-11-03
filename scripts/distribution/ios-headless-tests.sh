#!/usr/bin/env bash
set -euo pipefail
[[ "${GITHUB_ACTIONS:-}" == true && "${RUNNER_ENVIRONMENT:-}" == github-hosted && "$RUNNER_OS" == macOS ]] || exit 2
unset GITHUB_TOKEN GH_TOKEN TAURI_SIGNING_PRIVATE_KEY TAURI_SIGNING_PRIVATE_KEY_PASSWORD
unset APPLE_CERTIFICATE APPLE_CERTIFICATE_PASSWORD APPLE_ID APPLE_PASSWORD APPLE_TEAM_ID
mkdir -p .build/ios-headless
node --test scripts/distribution/__tests__/mobile-interface.test.mjs
node node_modules/vitest/vitest.mjs run --project @janhq/web-app \
  web-app/src/providers/__tests__/ThemeProvider.test.tsx \
  web-app/src/hooks/__tests__/useTheme.test.ts \
  web-app/src/lib/__tests__/platform-utils.test.ts \
  web-app/src/lib/__tests__/clipboard.test.ts \
  web-app/src/lib/__tests__/messageExportText.test.ts \
  web-app/src/lib/__tests__/mobileDuckduckgoSearch.test.ts \
  web-app/src/containers/__tests__/ShareButton.test.tsx \
  web-app/src/containers/__tests__/SettingsMenu.test.tsx \
  web-app/src/routes/settings/__tests__/general.test.tsx \
  web-app/src/containers/__tests__/ErrorTrackingConsent.configuration.test.tsx \
  --reporter=json --outputFile=.build/ios-headless/frontend.json
python3 scripts/distribution/ios-headless.py
