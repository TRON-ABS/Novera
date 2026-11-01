# fix(updater): report unavailable feeds during manual checks

Settings previously claimed that Novera was up to date when its production feed could not be fetched. The existing Windows candidate reproduces this: Configurations > General > Check for Updates shows “Vous utilisez la dernière version”, while the native updater logs a failed release fetch and the official endpoint returns HTTP 404.

Propagate the original Tauri service error, clear and synchronize stale offers, and rethrow for manual checks so Settings shows its existing translated error and permits retry. Automatic checks remain quiet. The endpoint, pinned key and signature verification are unchanged.

## Validation

- Local Windows: 42 Vitest tests pass across the updater service, hook and Settings. Regressions cover unavailable feeds, stale offers, automatic versus manual checks, error display and retry.
- Local Windows: all 57 distribution Node contracts and ten Python package/guard tests pass. The HTTP fixture test requires loopback access outside the sandbox. Python syntax validation, workflow actionlint and git diff --check pass.
- CI now runs the updater UI contracts before signed desktop engine builds and retains their JSON report. The manual windows-linux target selects Windows x64, Windows ARM64 and Linux x64 without starting Apple builds.
- Linux candidate builds additionally attempt the real AppImage Settings error route through Tauri's external WebKit WebDriver under Xvfb. The harness uses an isolated profile, opens Settings directly, and retains a screenshot, receipt and diagnostic log. It does not mock updater IPC or install an update. Execution is pending; local syntax validation is not a native Linux pass.

Commands:

    node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/hooks/__tests__/useAppUpdater.test.ts web-app/src/services/updater/__tests__/tauri.test.ts web-app/src/routes/settings/__tests__/general.test.tsx
    node --test scripts/distribution/__tests__/ci-candidates.test.mjs scripts/distribution/__tests__/ci-check-updater.test.mjs scripts/distribution/__tests__/record-upgrade-check.test.mjs scripts/__tests__/novera-update.test.mjs
    python -m py_compile scripts/distribution/validate-linux-update-ui.py
    git diff --check

## Remaining gates

Both production feeds still return HTTP 404, and the release remains a private draft. A new signed build and native UI verification of the fix are pending. The Linux harness requires the deliberately unavailable feed and only checks its error route; it cannot certify an offered update, installation, version transition, onboarding or model setup. The previous Windows reproduction used a checksum-verified copy of a real local model in the isolated profile. Native installation/replacement proofs from earlier runs remain separate.

No production feed or release is published, no CI success or approval is claimed, and nothing is merged. Apple signing/notarization and iOS device distribution still require real Apple access. No related issue or existing open PR was found during the repository check. See docs/UPDATE_CHANNEL_CHECK_2026-11-01.md for the original reproduction and evidence.

The corrected signed rebuild is [run 41358869680](https://github.com/TRON-ABS/Novera/actions/runs/41358869680), code commit 428299c34d66170f543722ea98a11de6e3e50979. Its source job passes; native candidate builds and the Linux WebDriver result remain pending. The first run 41358745246 was superseded during preparation. Linux isolation guards now have three additional passing tests.
