# fix(memory): wait for native text requests before switching models

A second image generation could fail with “Memory optimization failed” because llama.cpp still held an in-flight text request when automatic memory management attempted to unload Nemotron. Local application logs confirm the router's explicit HTTP 409 refusal. The coordinator treated this transient state as a permanent error.

## Resulting behavior

Wait 250 ms and retry only the router's explicit in-flight unload refusal, preserving the active native generation. Respect cancellation, release the waiting lease, and allow a subsequent request to recover. If another owner releases the model while waiting, continue without a redundant unload. Other conflicts, transport errors and unsuccessful unloads remain visible failures. Manual policy keeps its existing concurrent behavior.

The same coordinator serves text, image, music and video. Regression checks cover two consecutive requests for each, active text protection, media publication, manual mode, cancellation/recovery and real failures following a busy response. Fix a stale cloud test to distinguish the optional local TabbyAPI profile from the 42 cloud profiles.

## Validation

- `node node_modules/vitest/vitest.mjs run src/services/creation src/modules/engines/memory-gate.test.ts src/lib/__tests__/creation-transport.test.ts src/lib/__tests__/custom-chat-transport-abort-load.test.ts src/lib/__tests__/custom-chat-transport-class.test.ts src/services/models/__tests__/default.coverage.test.ts --root web-app`: **240 tests passed, 16 files**.
- `node web-app/node_modules/typescript/bin/tsc -b web-app --pretty false`: passed.
- `node scripts/check-architecture.mjs`: 28 files / 6 areas, no violations.
- From `web-app`, `node node_modules/eslint/bin/eslint.js src/services/creation/memory.ts`: passed.

The original regression cases reproduced the in-flight rejection before the fix. Tests exercise contracts with mocked native calls; the actual refusal is confirmed separately by application logs. No fresh GPU generation, interactive installed-app validation, desktop rebuild, CI approval or binary release is claimed. Existing installed builds require a rebuild to receive the fix. No UI strings changed; all 80 catalogs retain 2,412 keys each.

## Publication

Follow-up to source commit `4b6a4814121a505fed644c656cb655d82f381f9d`. Publish directly to main under the maintainer's continuing request; preserve unrelated local changes and repository protections. No issue is closed. Update NOVERA.md and engine tracking with the diagnosis, tested scope and remaining installed-build limit. Repository showcase claims remain unchanged and are verified after publication. GitHub Actions stays disabled.
