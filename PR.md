# fix(updater): report unavailable feeds during manual checks

Settings claimed that Novera was up to date when its production feed could not be fetched. With the official endpoint returning HTTP 404, Configurations > General > Check for Updates on the previous Windows candidate displays “Vous utilisez la dernière version”, while the native updater logs a failed release fetch.

Propagate the original Tauri service error, clear and synchronize stale offers, and rethrow for manual checks so Settings shows its existing translated error and permits retry. Automatic checks remain quiet. The endpoint, pinned key and signature verification are unchanged.

## Before and after

- Before: the existing Windows candidate shows the latest-version message on a failed feed.
- After, the verified Windows x64 CI candidate signed for the updater: “Échec de la vérification des mises à jour” appears in Configurations > General, the button re-enables, and retry repeats the explicit error.
- After, native Windows local debug build with the production frontend: “Échec de la vérification des mises à jour” appears and retry remains available in the same isolated profile.
- After, real signed Linux AppImage: the Settings button shows “Failed to check for updates” on the actual HTTP 404 feed, without the false latest-version message. The screenshot and receipt are independently inspected.

## Validation

[Run 41358869680](https://github.com/TRON-ABS/Novera/actions/runs/41358869680), application code commit 428299c34d66170f543722ea98a11de6e3e50979, completed successfully, including source, Linux, Windows ARM64 and Windows x64 jobs. The macOS matrix entries only select/skip this windows-linux target; they do not compile macOS.

- Local Windows: 42 updater service/hook/Settings Vitest tests, all 57 distribution Node contracts and ten Python package/guard tests pass. The HTTP fixture requires loopback access outside the sandbox. Python syntax, actionlint, TypeScript, the production frontend build and diff checks pass.
- Ubuntu source CI: 55 Node tests pass, two Windows-only tests are skipped, and ten Python tests pass.
- Linux candidate artifact 13105425728: its GitHub digest and all 15 file hashes match; the final AppImage signature is independently verified with the pinned key. Reports confirm 42 frontend tests and nine migrations, with none failed or ignored.
- Windows ARM64 artifact 13105967267: its GitHub digest and all 24 file hashes match; the final updater signature and embedded trust key are independently checked. All seven native PE files are ARM64, and all nine runtime files exactly match the extracted signed NSIS payload. Reports confirm 42 frontend tests and nine migrations. The package is not installed or executed locally; visual ARM64 behavior is not certified.
- Windows x64 artifact 13109843363: its GitHub digest and all 125 file hashes match; the updater signature and embedded trust key pass. All 83 native PE files are x64, and all 106 runtime files match the extracted signed NSIS. Reports confirm 42 frontend tests and nine migrations. The actual CI runtime passes the manual Settings error and retry route in the authorized isolated profile; it is separate from the local debug proof.
- Native Linux UI: the external Tauri/WebKit driver runs the actual AppImage under Xvfb with isolated data and no updater IPC mocks. Its error route passes, with a screenshot, visible-text receipt and diagnostic log.
- Native Windows local UI: an independently rebuilt debug executable embeds the production frontend and uses the prepared runtime dependencies. The live check and retry show the translated error; this local build is not a signed distribution candidate.

CI runs updater contracts before signed desktop engine builds and retains their JSON report. The manual windows-linux target selects Windows x64, Windows ARM64 and Linux x64. Linux UI isolation guards refuse local and self-hosted execution. Diagnostic output is retained on failure.

Commands:

    node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/hooks/__tests__/useAppUpdater.test.ts web-app/src/services/updater/__tests__/tauri.test.ts web-app/src/routes/settings/__tests__/general.test.tsx
    node --test scripts/distribution/__tests__/check-release-readiness.test.mjs scripts/distribution/__tests__/prepare-version.test.mjs scripts/distribution/__tests__/ci-candidates.test.mjs scripts/distribution/__tests__/ci-check-macos.test.mjs scripts/distribution/__tests__/ci-check-updater.test.mjs scripts/distribution/__tests__/prepare-pages-site.test.mjs scripts/distribution/__tests__/prepare-cli-feed.test.mjs scripts/distribution/__tests__/web-delivery.test.mjs scripts/distribution/__tests__/cuda-redist-plan.test.mjs scripts/distribution/__tests__/record-upgrade-check.test.mjs scripts/__tests__/novera-update.test.mjs scripts/android/__tests__/configure-project.test.mjs
    python -m unittest discover -s scripts/distribution/checks -p 'test_*.py'
    python -m py_compile scripts/distribution/validate-linux-update-ui.py
    git diff --check

## Remaining gates

Both production feeds still return HTTP 404 at 02:35 UTC on November 2 (03:35 Paris); the release remains a private draft with 15 existing assets. All available Windows/Linux candidate checks are complete. ARM64 visual validation requires an appropriate host. The recurring follow-up has been deleted.

These UI tests cover an unavailable feed, not an offered update, installation or a transition between published versions. The Linux harness opens Settings directly in a fresh profile and does not certify onboarding or model setup. The Windows profile uses a checksum-verified real local model. Previous installation/replacement proofs remain separate.

No production feed or release is published and nothing is merged. Apple signing/notarization and iOS device distribution still require real Apple access. No related issue or equivalent open PR was found before this PR. See docs/UPDATE_CHANNEL_CHECK_2026-11-01.md for provenance, package hashes and evidence.
