# fix(android): correct native web origin, text copying and trace sharing

Android 1000008 still received HTTP 403 from web_search at lite.duckduckgo.com while Lite worked in the phone browser. The copy button reported success before a WebView clipboard write completed, and Prepare preview stayed disabled for a selected message containing only a visible reasoning/error trace without a final answer.

Use tauri-plugin-http's documented empty-Origin sentinel in the mobile web helper. The already-enabled unsafe-headers feature removes the WebView's injected https://tauri.localhost origin before the native request. A controlled PC comparison with the same endpoint, neutral query, honest Novera User-Agent and Accept header returns 403/zero results with Origin versus 200/ten results without it. Retain DuckDuckGo, TLS checks, bounded responses and refusal/challenge handling; no provider fallback, impersonation, new HTTP permission or automatic retry is added. APK 1000009 retains the isolated verified HTTP change; 1000010 carries identical search source.

Route Android text copies through sharing_copy_text and ClipboardManager on the UI thread. The command writes only, limits UTF-8 text to 512 KiB and marks clipboard preview content sensitive. Wait for completion before showing Copied and report failure instead of a false success. Apply this to message, code, table and preview text copies. Desktop/browser clipboard behavior and iOS are unchanged.

For a specifically selected message with no answer, allow its visible reasoning/error text to populate the preview instead of leaving Prepare disabled. Prefer normal answers, exclude tool inputs and leave whole-conversation thought filtering unchanged. Preview is still required before the user chooses an OS sharing action. Existing close-control tests now target the visible footer button explicitly because the corner close button has the same accessible name.

Validation:

- Final frontend clipboard/message-export/CopyButton/ShareButton/labels/code-block/MarkdownTable and sharing suites: 111 passed, 12 platform cases skipped. The reasoning-only preview regression failed before the change and passes afterward; copy tests verify delayed acknowledgement and failure propagation. From web-app, the final command was:

  ```text
  node ../node_modules/vitest/vitest.mjs run src/lib/__tests__/clipboard.test.ts src/lib/__tests__/messageExportText.test.ts src/containers/__tests__/CopyButton.test.tsx src/containers/__tests__/ShareButton.test.tsx src/containers/__tests__/MessageActionLabels.test.tsx src/components/ai-elements/__tests__/code-block.test.tsx src/components/__tests__/MarkdownTable.test.tsx src/services/sharing
  ```
- `node --test scripts/android/__tests__/configure-project.test.mjs`: five passed. The earlier HTTP helper/web-tool suites passed 30 tests and their source is unchanged in 1000010.
- Installed Tauri HTTP-adapter probe preserves the empty-Origin removal sentinel for search and fetch. Cargo's actual Android feature graph confirms unsafe-headers was already enabled. The controlled live PC comparison records 403 versus 200/ten results without retaining personal search terms or page bodies.
- `./scripts/android/build-release.ps1` produced signed, independently inspected Android 1000010. SHA-256 32b0396cfb5eadd947117ffe5ecd3a75cb474a442f1a5ebfdeb3f903be35e7b8; same certificate as 1000009 and higher versionCode. TypeScript/Vite, Cargo release and Gradle/Lint pass. Exact clipboard JS is embedded in the native library; native registration and DEX clipboard symbols are present, generated Kotlin matches tracked source and all 217 PNGs are unchanged.
- P20 verification of HTTP search, actual paste and OS sharing remains pending. No Android public release or confirmed device fix is claimed.
- Source contract CI [41564024252](https://github.com/TRON-ABS/Novera/actions/runs/41564024252) passed on application commit 4da956560f74a92e8f2e5db2b9bce7122f075fd0. The final validation record changes documentation only.

Follows merged PR #14; no remaining merge dependency or known overlap. CLI downloads and Pages are unchanged. Personal screenshots, conversations, models, private keys and raw local logs are excluded. Evidence is linked from docs/RELEASE_ANDROID_1.0.0.md. Earlier endpoint/routing changes alone did not resolve the 403; this PR addresses the reproduced transport-header difference and the newly reported copy/preview defects.
