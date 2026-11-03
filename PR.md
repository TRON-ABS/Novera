# fix(android): configure the error-reporting consent destination

The public Android 1000011 APK always disables Allow for error tracking: both Android environment setup and build-apk.ps1 clear the analytics host/project token, so analyticsAvailable is false. This is a build configuration defect; changing button disabled state alone would grant a permission with no recipient.

Add an explicit -WithTelemetry option to the signed release and APK entry points. After Android environment setup, read only the existing validated public Novera settings from web-app/.env.local using the same reader as Desktop. Keep unconfigured builds off, reject invalid/missing destinations, retain separate runtime opt-in for errors and statistics, and never embed a private API token. Application version remains 1.0.0; versionCode increases to 1000012 with the same signing certificate.

Validation:

- From web-app, consent, privacy, error-reporting and statistics suites: 33 passed. New integration tests use the real destination validator and stores: two passed, showing Allow enabled only for configured builds, tracking initially off and statistics unchanged after error consent.
- `./scripts/android/__tests__/telemetry.Tests.ps1`: seven passed; inherited settings cleared, explicit validated settings retained, invalid destinations/tokens refused. No network requests.
- `node --test scripts/android/__tests__/configure-project.test.mjs`: five passed.
- `./scripts/android/build-release.ps1 -WithTelemetry -OutputDirectory deliverables/Novera-Android-error-consent-fix-2026-11-03`: TypeScript/Vite, Cargo release, Gradle/Lint, signature and final package inspection pass. Signed 1000012 is 42256746 bytes; SHA-256 `ac828c2d87db6d4db6f1e9253ef7ca98df6779be2e424b1b47f836cf6e1eed6f`; same signing certificate as 1000011. Exact frontend containing the validated public destination/project token is embedded in the native library; batch 512 and all 217 PNGs retained. No conversations, models, private keys or source maps packaged.
- Source-contract CI [41581269979](https://github.com/TRON-ABS/Novera/actions/runs/41581269979) passed on application commit da9d0ff52. Main was subsequently integrated to remove the already-merged #17 squash overlap; application code is unchanged. Embedded build metadata honestly records the pre-commit dirty checkout; equivalent committed application files are hashed in provenance.
- Phone verification and publication of rebuilt 1000012 remain pending. Private source maps stay local; no real reports were sent. The maintainer requests removal of old APK 1000011 after replacement is ready; its verification history stays available.

Follows merged #16 and #17. No mobile UI or runtime consent policy is relaxed. Existing published assets stay immutable. The new signed candidate contains no conversations, downloaded models, API keys or user profile; the public PostHog project token is build configuration, not a private account API key.
