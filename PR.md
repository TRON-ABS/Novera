# fix(android): use a 512-token batch for the 1.0.0 release

Android inherited the desktop batch size of 2048. Use 512 by default on Android, migrate saved legacy 2048 defaults, and supply 512 when a model has no saved batch setting. Preserve custom values and desktop behavior. Keep application version 1.0.0 and increase Android versionCode to 1000011 using the existing signing identity.

The maintainer confirms the previous signed APK 1000010 works well and authorizes publication. Recommend a modern phone for local models or an API provider on less powerful devices. Recommend at least 16K tokens of context for web search, consistently with the other versions; the recommendation does not automatically increase mobile context memory use.

Validation:

- From web-app: `node ../node_modules/vitest/vitest.mjs run src/hooks/__tests__/useModelProvider.coverage.test.ts src/services/models/__tests__/default.coverage.test.ts`: 85 passed. Migration covers missing, numeric/string legacy defaults, custom batches and remote/desktop preservation; loading verifies fallback and custom values.
- `node --test scripts/android/__tests__/configure-project.test.mjs`: 5 passed.
- Signed build and final APK inspection are in progress; device validation of the rebuilt 1000011 is distinct from the maintainer report on 1000010.

Follows merged PR #15. No open PR overlaps were found on 3 November 2026. Android direct APK only; desktop/CLI update feeds and existing public assets remain unchanged. Old local Android APKs will be removed as requested after the final package passes inspection; receipts are retained.
