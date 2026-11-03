# fix(android): stack log actions and route DuckDuckGo query URLs

On a narrow settings card, the log buttons stayed side by side and the second button extended outside the visible panel. Stack Open logs below Open containing folder below 480 px, allow labels to wrap and preserve the wide-card layout.

The maintainer also reports HTTP 403 from duckduckgo.com on Android 1000007. A model can send a DuckDuckGo search URL to web_fetch, which previously requested the JavaScript site directly. Route known DuckDuckGo search URLs with q to the existing official mobile Lite search before any HTTP request. Reject an empty search homepage locally while preserving ordinary help-page fetching. Keep HTTPS validation, size/time limits, provider selection and refusal/challenge handling. Do not retry a 403 through another endpoint.

Prefix HTTP errors with web_search or web_fetch and identify the original host when a redirect ends at another host, without including query terms. This covers a reproduced routing defect; it does not establish the cause of the phone's refusal. The maintainer subsequently confirms that the Lite URL works in the phone browser. Novera search success is not established and no general network block is asserted.

Validation:

- From web-app: `node ../node_modules/vitest/vitest.mjs run src/lib/__tests__/mobileDuckduckgoSearch.test.ts src/lib/__tests__/webSearchTool.test.ts src/routes/settings/__tests__/general.test.tsx`: 45 passed. Tests cover query URL normalization, no-query refusal, help-page preservation and separate redirected-search/source-fetch HTTP 403 diagnostics.
- `node --test scripts/android/__tests__/configure-project.test.mjs`: five passed. A probe through the actual Tauri HTTP adapter confirms direct Lite GET routing, honest Novera identity and disabled automatic redirects; it performs no network request.
- Android release 1000008: TypeScript/Vite, Cargo release, Gradle/Lint, signing and independent APK inspection passed. SHA-256 dc93772a04b64fa33192d4056a88ba4cf9f6c6b4dd02d80c3ee8ed20f66b2db7. Same certificate and higher versionCode than 1000007; compiled library contains the changes and all 217 compiled PNGs are unchanged.
- Manual P20 verification of button layout, update retention and search remains pending. HTTP 403 resolution is not claimed. No public Android release was made.
- Source contract CI [41556129149](https://github.com/TRON-ABS/Novera/actions/runs/41556129149) passed on application commit 1a006339cdcaba4a08bf4ea52f3ea7b163c93a5d. This final documentation update changes no application source.

Follows merged PR #12 and documentation PR #13; no remaining merge dependency or known overlap. Desktop DuckDuckGo, CLI downloads and the Pages presentation are unchanged. Personal screenshots, model/conversation data and private signing material are excluded. Evidence is linked from docs/RELEASE_ANDROID_1.0.0.md.
