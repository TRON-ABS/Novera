# fix(workspace): require explicit folder and shell access

Attaching a folder previously made it writable without a separate access choice, while native shell execution did not use the MCP approval dialog. Add New project on a folder with read-only selected initially, approval before changes, or explicit editing/deletion access. Preserve projects without messages and keep project setup in the existing window.

Enforce consent at both native invocation boundaries, including parent/child tool calls and monitors. Shell grants are scoped to a conversation and the current app runtime, independent of MCP trust. Folder access is saved explicitly; legacy sessions default to read-only. Denial, Escape, Stop, folder changes and deletion invalidate pending decisions. The shield control reviews folder access and resets grants. Ask-mode background monitors stay read-only. Revocation affects future calls; stopping an already-running command remains the Stop action.

Keep the existing composer, add collapsible cyan/violet navigation, align the home and conversation canvas, and expose compact frame-count/cadence controls for local video profiles. Folder-project transports remain text-tool workflows. Add four permission texts to every existing locale (80 catalogs, 1,742 keys each), with native review pending. Refresh the reference docs and GitHub showcase without a new binary or enabling Actions.

## Validation

- Before: folder selection alone enabled project writes; native shell execution did not require a first user choice. After: project setup awaits a separate choice and the shell cannot reach native execution before consent. Tests assert the native writable flag stays false for read-only projects even after shell approval.
- node node_modules/vitest/vitest.mjs run src/lib/__tests__/cowork src/lib/__tests__/agentTools src/lib/__tests__/native src/containers/__tests__/Cowork src/containers/__tests__/ChatInput src/containers/__tests__/CreationControls src/containers/dialogs/__tests__/Native src/hooks/__tests__/useCowork src/hooks/__tests__/useThreads src/components/left-sidebar/__tests__ src/locales/__tests__/complete-catalogs --maxWorkers=2: 768 tests pass in 51 files.
- node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false: passes.
- node scripts/check-architecture.mjs: no violations; node --test scripts/__tests__/architecture.test.mjs: seven pass.
- python scripts/check-novera-locales.py: 80 locales × 1,742 keys, no structural errors.

Full visual QA in a newly compiled application is pending: the embedded browser cannot reach the local dev server. No new Novera binary, real shell/platform verification, video render or CI approval is claimed. Existing screenshot assets still show the earlier local build. No external issue is closed; no PR dependency, required merge order or known overlapping contribution is introduced.
