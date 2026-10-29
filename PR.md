# fix(chat): keep navigation and model selection in the dashboard

Published for review as [draft PR #4](https://github.com/TRON-ABS/Novera/pull/4), from `codex/dashboard-navigation-and-model-selector` into `main`. Not merged; validation below is local.

## Problem and resulting behavior

Opening Models or Settings replaced the conversation, model selection appeared in two places, and several state/duration labels were ambiguous. Keep navigation and model controls in the dashboard while preserving the draft, existing settings and explicit folder-access approval.

- Add Search / New project to the left of the prompt and Models / Settings to the right; remove their sidebar duplicates. One global owner preserves keyboard shortcuts and project dialogs.
- Open navigation and per-model settings in non-modal Novera windows above the composer. Keep the draft and buttons usable; replace the current panel when another is selected. Reuse full settings/model pages and their validated routes in a private memory history. The native Windows folder picker retains its system appearance and read-only access remains the default.
- Keep one compact model selector in the dashboard and remove its header duplicates on Home, threads and projects. Open the list upward, preserve the original hardware-fit indicator, and order local models first, then cloud Text, Image, Music and Video. Local model and media settings retain their appropriate controls. Music choices do not overwrite the text model; missing cloud credentials open provider settings above the dashboard.
- Show green/green button rings while idle, including an empty draft; use yellow/red from submission through the end of streaming/tools. Preserve send/stop and new-discussion actions.
- Give model replies their own rounded cyan frame and slate-blue background, distinct from user messages, both while streaming and after completion.
- Add short Send and Model settings tooltips in all 80 languages. Repair missing or mistranslated duration units; French now displays `21 s`, `1 min 30 s` or `1 h 20 min`. Update catalog coverage to 2,402 keys.
- Increase the local compilation launcher's Cargo parallelism from four jobs to eight. This does not change CPU affinity or inference threads and does not start a build.

## Reproduction and before/after evidence

1. Open Models or Settings from the dashboard: previously the conversation page disappeared; now a panel opens above the mounted composer. Tests type into the draft beneath the panel, switch panels, resize and dismiss with Escape without losing the draft.
2. Open a new conversation with an empty prompt: previously the rings were yellow/red; now both are green until a turn starts, and return to green when it ends.
3. Inspect the model controls: previously a header selector and a separate media shortcut disagreed; now one compact selector displays the active choice and orders local/cloud groups as requested.
4. Inspect a completed French trace lasting 21 seconds: previously the header showed a bare `21`; now its translated duration includes `s`. Regression checks read all 80 actual catalogs.

## Local validation

- Targeted Vitest suite: **449 tests pass in 15 files**. Covers changed sidebar/project workflows, composer actions, model selection/settings, message rendering, durations, catalog completeness, private routing and window positioning. Existing ChatInput mocks emit `act(...)`, unavailable-sandbox and fake-upload warnings; they do not fail the suite.
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false` from `web-app`: passes.
- Targeted ESLint on the changed production components and hooks: no errors or warnings in the final checks.
- `node scripts/check-architecture.mjs`: no violations.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 tests pass.
- `node scripts/check-ui-localization.mjs`: no missing static keys or unreviewed literals.
- `python scripts/check-novera-locales.py`: 80 complete catalogs, 2,402 keys, no structural errors.
- Existing Tailwind tooling processes the actual CSS imports without an application bundle; `git diff --check` passes.
- PowerShell syntax validation and `Compiler-Novera.bat /plan` pass without compiling.

To reproduce the targeted test selection in PowerShell after checkout:

```powershell
$tests = @(git diff --name-only origin/main...HEAD -- '*.test.ts' '*.test.tsx')
node node_modules/vitest/vitest.mjs run --project @janhq/web-app @tests
```

## Dependencies, publication and limits

Based on `main` after merged PR #3 (`3f8f6b0ad3501bbbc41cfa2046dbcb65dc148a9e`). No open overlapping PR was found before publication, and no unmerged prerequisite or external issue closure is introduced.

Local tests and source checks do not establish CI approval or compiled visual validation. The maintainer performs application compilation and checks the final Windows rendering, small-screen behavior and real model/provider execution. No application/native build, binary publication, paid generation, code signing, Actions activation or branch-protection change is included. The prior bypass authorization for PR #3 does not extend to this PR.

## Hub discovery and memory-capacity improvements (2026-10-29)

The Hub collapsed all models above 4 GB into one band, placed official publishers ahead of the selected sort criterion, and appended newly discovered models after existing rows regardless of rank. Add eleven exclusive size bands from under 1 GB through 500 GB and above. Keep the selected numeric/download/release ordering as pages and search matches arrive; send release/download sorting to category discovery, resetting pagination on changes.

Fetch missing public file metadata with at most three detail workers. Preserve exact byte sizes instead of labeling rounded binary units as decimal units. Reuse detected RAM, enabled GPUs and engine/platform diagnostics for hardware ordering. New range labels preserve all 80 locales and update documented catalog coverage to 2,404 keys.

Local validation: 189 tests pass across 10 files (discovery, real conversion service, categories, hardware diagnosis/review, model facts, pagination sentinel, search ranking and all locale discovery keys). TypeScript no-emit check passes. Targeted production ESLint has no errors; the existing mixed component/hook exports in HubHardwareDiagnostic produce two Fast Refresh warnings. No application build, installation, inference benchmark or CI approval was performed for these Hub changes. The maintainer requested direct publication to main; publication is validated separately against the remote branch. Direct live Hugging Face verification was attempted but failed because DNS resolution is unavailable in this environment.

Limits: sorting and size filtering apply to fetched models and their default download variant; the catalog is paginated, not an exhaustive snapshot. Newest uses repository creation time, falling back to update time when unavailable. Hardware fit remains an estimate at 8,192 tokens, not a measured inference guarantee. Very large safetensors models are discoverable without implying that their architecture is runnable; split-only GGUF downloads remain outside existing support.


### Memory-capacity follow-up

Use one live hardware snapshot and one companion-file calculation for Hub ranking, variant hover cards, model facts and download review. Compare against remaining RAM/VRAM with reserves; exclude disabled GPUs, avoid summing unrelated GPUs and never add integrated/unified GPU memory to RAM. Include projector/draft weights and a minimum 256 MiB runtime allowance. Calculate conventional attention KV-cache bytes from layers, KV heads, head dimensions and context when metadata is available (FP16 GGUF, explicit FP32 Safetensors); retain the conservative heuristic for incomplete/recurrent/compressed-attention configurations. CPU Safetensors expansion includes both weights and cache. These are estimates, not measured allocations or guarantees for every architecture.
