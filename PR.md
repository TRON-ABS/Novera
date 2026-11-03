# fix(android): omit the injected WebView origin from native web requests

Android 1000008 still receives HTTP 403 from web_search at lite.duckduckgo.com, while the same Lite page works in the phone browser. The mobile helper did not specify Origin, so tauri-plugin-http 2.5.9 injected the application's https://tauri.localhost WebView origin into native HTTP requests.

Reproduce the difference on one PC using the same endpoint, neutral test query, declared Novera User-Agent and Accept header: the request with the injected origin returns HTTP 403 and zero results; the request without Origin returns HTTP 200 and ten results. Neither response contains a detected challenge. This is evidence for the origin defect, not confirmation of the untested phone build.

Pass the plugin's documented empty-Origin sentinel in the mobile web helper. With the already-enabled unsafe-headers feature, the Rust plugin removes this header before sending the request. Apply it to mobile search and page fetch; retain the honest Novera User-Agent, HTTPS/TLS validation, URL limits, bounded output and refusal/challenge handling. Do not add permissions, alter the provider, spoof a website/browser, or retry refused requests. Desktop web search and provider API clients are unchanged.

Validation:

- From web-app: `node ../node_modules/vitest/vitest.mjs run src/lib/__tests__/mobileDuckduckgoSearch.test.ts src/lib/__tests__/webSearchTool.test.ts`: 30 passed.
- `node --test scripts/android/__tests__/configure-project.test.mjs`: five passed.
- A probe through the installed Tauri JS HTTP adapter verifies that the empty-Origin sentinel survives for both tools, with the existing honest User-Agent and redirect limit. No network request is made by this probe.
- `cargo tree --locked --offline --manifest-path src-tauri/Cargo.toml --no-default-features --features mobile --target aarch64-linux-android -e features -i tauri-plugin-http` confirms unsafe-headers is already enabled for the actual Android target.
- The real two-request Origin comparison records HTTP 403 versus 200/ten results. Sanitized evidence is retained without personal search terms or page bodies.
- Android release 1000009: TypeScript/Vite, Cargo release, Gradle/Lint, signing and independent APK inspection passed. SHA-256 f5e492a8c2ad8868be918fe5c352fec1a8d983e49997e0b725aa6b0677972c9f. Same certificate as 1000008 and higher versionCode. The exact frontend JS asset is embedded in the compiled native library; all 217 compiled PNGs are unchanged.
- P20 confirmation remains pending. No Android public release or verified phone fix is claimed.

Follows merged PR #14 with no remaining merge dependency or known overlap. The existing log-button and settings-layout fixes remain. Private keys, personal screenshots, conversations and model files are excluded. Evidence is linked from docs/RELEASE_ANDROID_1.0.0.md. The previous HTML/Lite/routing changes alone did not resolve the phone refusal; this change addresses the reproduced transport-header difference.
