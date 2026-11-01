# fix(ci): build all Novera distribution candidates on GitHub

The maintainer requests all eleven distribution variants on GitHub Actions, explicitly including Linux, Android, iOS and macOS. Add a manual, read-only build workflow with isolated runners, independent failure reporting, checksummed candidate artifacts and the TRON-ABS personal signature. Windows x64 produces desktop/NSIS/MSI/portable from one build; Windows ARM64 uses its own CPU worker. macOS has separate Intel and Apple Silicon builds. Web and CLI are independent; the CLI is built on three hosts.

Existing release templates force legacy identities, signing and publication paths. Use a separate candidate workflow without inherited secrets or public-release writes. Permit a pinned CUDA 13.4.3 override for the existing Windows image toolchain, validating each downloaded CUDA component hash. Fix the AppImage directory lookup to follow the actual product name. Keep user conversations, models and private symbols out of artifacts. Preserve licenses and add the welcome signature to notices.

Android's three review flags remain false. A narrowly scoped CI-only, explicitly requested debug test-build option can tolerate those review flags; all technical guards and normal build behavior remain enforced. iOS targets a simulator; a signed iPhone IPA and store delivery still need genuine Apple credentials. No production signature or device certification is claimed. Record the remote run and its actual results in [CI_DISTRIBUTIONS.md](docs/CI_DISTRIBUTIONS.md).

Validation before dispatch: actionlint 1.7.12 passed; YAML parsed; four new collector/Android-policy tests passed; nine distribution-definition tests passed; 223 portable assertions across twelve scenarios passed. Bash syntax passed for the build, prerequisites and AppImage scripts after the sandbox initially prevented Bash from starting. These local checks do not claim successful native builds on remote platforms. No related open PR was found at the previous repository inspection; this is direct main publication at the maintainer's request. No issue is closed, and no external publication/notification workflow is invoked.

## Earlier completed source and Windows preparation work

# fix(distribution): prepare clean Windows packages and refresh the showcase

## Clean Windows package preparation — 1 November 2026

The maintainer explicitly requests desktop, portable and Windows installer candidates from the tested desktop, excluding personal conversations. Preserve build `1.0.0-2026-11-01_04-10-51-711`; do not rebuild the application or copy user profiles. The desktop contains 94 runtime files and the portable 96 entries. All portable and desktop payload hashes match the tested runtime. Add the clean package directory to Git ignores and record package sizes, checksums, provenance and remaining release checks in [the Windows preparation report](docs/DISTRIBUTION_WINDOWS_2026-11-01.md). Personal data on the maintainer's PC is preserved.

Tauri `bundle --bundles nsis --config <private clean-resource override> --ci` succeeded using the precompiled executable. Installer: 812,961,689 bytes. Independent 7-Zip extraction succeeded: 102 files, all 94 runtime hashes match; eight extra files are NSIS resources, the uninstaller and the verified Microsoft WebView2 bootstrapper. The existing binary lacks Tauri's bundle-type marker, so the bundler reports a warning and leaves its hash unchanged; automatic updates remain disabled. Visual C++ x64 remains a documented prerequisite. The application and installer are unsigned. No installer execution against the maintainer's personal profile was performed.

Publish a warm closing message in both README languages above the existing TRON-ABS signature. The supplied screenshot and runtime sources were already published directly to main in `ac002425` and `56e4b70`; GitHub About was updated, homepage/topics retained, Actions disabled. No open PR or equivalent pending contribution was found before publication.

Full web lint: `node node_modules/eslint/bin/eslint.js . --quiet` passed from `web-app`. The filename sanitizer intentionally strips ASCII controls; document that intent with a scoped lint directive, preserving behavior. `node node_modules/vitest/vitest.mjs run src/modules/conversations/__tests__/export.test.ts`: 28 passed. No CI approval, signed/public binary release, clean-machine installation certification or private symbol upload is claimed. Earlier notes below preserve their historical validation scope.

## Publication update — 1 November 2026

The maintainer reports that the desktop works well and explicitly requests publishing the prepared sources directly to main. Replace the dashboard screenshot in both READMEs with the supplied 1 November Windows capture, preserve the original image bytes, and add the exact footer signature **TRON-ABS — The art of Human with AI**. This is a declared manual desktop result, without a profile-by-profile GPU or clean-machine report. Existing automated validation remains distinguished from manual use and from CI approval. No binary, tag, release, Actions activation or Python/PyTorch-in-EXE bundle is part of this publication.


Python-backed engines previously required a system interpreter or a manually entered path. The updated Windows x64 sources resolve default requests through private per-profile environments and expose confirmed installation, verification, repair, selection, update, same-lock rollback and removal in Configurations. Preserve explicit external interpreters in advanced options, native GGUF/ACE-Step workflows and cloud access. Mobile never installs these desktop Python/PyTorch stacks; embedding them in the EXE was explicitly deferred.

Ten sealed profiles ship complete transitive locks and hashes. Use bundled uv, binary-only installs, private managed Python, staged generations and atomic receipts, process/file locks, bounded local logs and cancellation. Route Transformers/ONNX import/probe/load and media/export/upscale calls through the native resolver without falling back to system Python. Do not replace an active receipt on failure or change another selected profile during repair. Translate the new runtime flow and updated guidance in all 80 catalogs (2,429 keys each).

Reproduction: on a Windows machine without Python, open Configurations, select a required optional profile and confirm installation. After successful verification, the engine uses its private interpreter without a path entry. Before these changes, default requests executed `python` from PATH. The managed integration tests install Python privately and execute a tiny ONNX graph and a generated, untrained Llama model; no pretrained weights are downloaded.

Validation: full Rust suite 1,161 passed / five optional ignored; three explicit private-runtime integration tests passed; 17 targeted Python tests passed; architecture and distribution checks passed. Commands (from `web-app`): `$env:TAURI_ENV_PLATFORM='windows'`; `node ../node_modules/vitest/vitest.mjs run src/services/components.test.ts src/containers/__tests__/ManagedComponents.test.tsx src/services/transformers/engine.test.ts src/services/onnx/engine.test.ts src/containers/__tests__/CreationControls.test.tsx src/containers/__tests__/CreationInstall.test.tsx src/services/creation/stream.test.ts src/services/creation/memory.test.ts src/services/creation/cloud.test.ts src/services/creation/cloud-stream.test.ts src/services/creation/music-cloud-stream.test.ts src/lib/__tests__/noveraErrorTracking.test.ts --silent`. Windows-configured web suite: 174 passed / one non-Windows scenario skipped, 12 files. TypeScript passed; scoped ESLint has zero errors and two existing hook dependency warnings in CreationControls. Ten lockfile SHA-256 values match. The first sandboxed Rust run lacked loopback access and was interrupted; the full suite passed with local HTTP access. A broader media run in the unchanged global Python has three missing optional dependencies and does not certify managed media/GPU profiles. Layout and confirmation were inspected in French/German/Arabic RTL at 360px. No native review of all 80 translations is claimed.

No desktop application build, installed-binary upgrade, portable refresh, push, CI approval or public release. CUDA/ExLlama/GenAI/media generation, a clean Windows novice flow and non-Windows profiles remain unverified by this task. The maintainer compiles and tests desktop before preparing portable from the same runtime. Public GitHub About/homepage/topics were inspected read-only and remain consistent with 80 languages, 42 providers and 49 media presets; no remote metadata was changed. No remote PR, issue closure or merge dependency is introduced; preserve other existing local work below.

## Other existing local work (preserved)

# fix(maintenance): capture consented failures with release diagnostics

Caught text and media failures were missing from error tracking, repeated errors were discarded after the first occurrence, and release builds had no private source-map workflow. A maintainer could see an incomplete incident without identifying the exact local build.

## Result

Account for hardware-reserved RAM in total-capacity tiers. The maintainer's nominal 16 GiB desktop reports 15,789 MiB, so the strict 16,384 MiB music gate rejected it before native execution. Allow 5% on total-RAM tiers only; keep actual free-memory budgets and native checks unchanged. Resource-profile and music-routing regressions use the reported value; 106 tests passed across six files. This does not establish successful real music inference.

Restore visible Image/Music/Video mode buttons before any cloud selection, including on constrained devices. Hardware restrictions previously hid these entry points, forcing users to type a creation request in Auto to reveal controls. Keep local generation guards and busy-state disabling. Direct Music/Video settings access with an empty prompt is covered by regression tests; 103 tests passed across six affected control/stream files, and TypeScript passed. Existing labels are reused in all 80 languages. The maintainer's tested desktop precedes this fix and needs recompilation.

Fix the Explorer-launched engine preflight when Clang is installed outside PATH. Discover existing LLVM, Visual Studio LLVM or MSYS2 compiler directories and append the selected directory without displacing MSVC linker precedence. Keep an existing PATH compiler unchanged; report a clear error when none is installed. No installation or persistent environment change. Validation: 24 PowerShell preparation assertions passed, including spaced paths and linker priority; the real Bash engine-toolchain check passed after MSVC initialization. No application build was started.

The sidebar header also displays the existing build-time `VERSION` next to Novera (currently 1.0.0), automatically following `web-app/package.json` in future builds. Long versions truncate with the full label in a tooltip; the collapse button keeps its space. Existing native titlebar visibility rules remain unchanged. Seven sidebar tests passed across header labels, settings navigation and the Cowork gate.

Instrument model loading, downloads and verification, text/media generation, cloud saving, memory transitions, the React error boundary, native OOM and detected llama.cpp worker exits. Use fixed operation, task, engine and error/reason codes. Include build ID, commit, source state, environment, OS and architecture. Keep a memory-only session ID, count repeated occurrences up to 60/minute, report suppressed/delivery counts, bound requests to ten seconds and abort on withdrawal.

Require renewed, independent v2 consent for the expanded schema. Exclude raw messages, prompts, responses, model names, personal paths and arbitrary error properties. Reuse existing consent labels in all 80 languages.

Prepare private JS/CSS source maps with matching PostHog chunk IDs outside the shipped frontend. Verify file inventory and hashes; upload through pinned official CLI 0.19.0 only with explicit local credentials. Record build metadata in desktop/portable receipts. Enable optional preparation in the maintainer's launcher without starting an application build. Document triage and release checks in docs/MAINTENANCE.md.

## Before / after

1. Trigger a handled generation or model-loading failure with tracking consent enabled.
2. Before: the UI displayed the failure, but the global unhandled-error collector could miss it.
3. After: report a bounded diagnostic with its operation and build identity, without the original error text. Repeated failures remain countable within the rate limit.
4. Withdraw consent: detach collectors and cancel pending requests.

## Local validation

- Scoped Windows-configured Vitest suite: 616 passed, one non-Windows scenario skipped, 32 files. Includes text transport, model services, event handler, consent, collector, creation and resource profiles.
- Final collector rerun: `node node_modules/vitest/vitest.mjs run src/lib/__tests__/noveraErrorTracking.test.ts --root web-app --silent`: 10 passed.
- `node --test scripts/monitoring/__tests__/symbols.test.mjs`: four passed, including a real Vite fixture build, chunk mapping, inventory integrity and JS/CSS map removal.
- `node web-app/node_modules/typescript/bin/tsc -b web-app --pretty false`: passed.
- `node scripts/check-architecture.mjs`: passed. Targeted ESLint: zero errors/warnings for the diagnostics and consent files checked.
- PowerShell telemetry configuration tests: 16 assertions passed; launcher tests: 69 passed without compiling the app.
- `cargo check --offline --locked --manifest-path src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml --no-default-features`: passed; two existing AMD naming warnings.
- Locale checks: 80 catalogs, 2,412 keys each, no structural errors.
- Synthetic event accepted and visibly confirmed in PostHog EU project 319433: https://eu.posthog.com/project/319433/error-tracking/01a19487-c02b-73c1-8566-e158a3a069d6 . This validates ingestion, not the future binary or source-map resolution.

## Remaining release checks

The initial component checklist in docs/REPRISE_COMPOSANTS_GERES_80_LANGUES.md is now implemented for the Windows profiles described above; its remaining hardware and platform validations are recorded separately. The maintainer retains desktop compilation and reports increased CPU parallelism; no running build was modified.

An hourly threshold email alert is enabled for the maintainer's PostHog account (TRON ABS), restricted to Novera production exceptions and excluding synthetic tests. The saved enabled state and initial non-firing evaluation were verified. Test delivery was started for one email recipient; the maintainer confirmed inbox receipt on November 1, 2026. Specialized new/reopened/spiking issue rules are not enabled by this trend alert. Private CLI authentication and upload/resolution of the final release symbols remain pending. The maintainer will compile; no full Novera build, installed-binary validation, CI result, publication, approval or merge is claimed. Abrupt native process crashes and failures not returned to the frontend remain outside this collector's coverage.

The earlier constrained-device configuration changes remain documented in docs/SUIVI_VALIDATION_DISTRIBUTIONS.md and need real-device validation. Preserve unrelated working-tree changes. No new remote PR, issue closure or merge dependency was created by this task.
