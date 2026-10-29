# fix(composer): show startup context and arrange compact controls

## Current follow-up — 2026-10-29

The local context indicator disappeared on the empty startup screen and until the lazily loaded engine reported its capacity. Keep a pending indicator for a selected local model, then show the actual percentage once available. Do not invent a denominator, display a false zero, or change remote-provider count-only behavior and agent-mode visibility. Reuse labels already translated in all 80 catalogs.

Apply the maintainer's final layout choices: a responsive 1,024 px composer cap; settings immediately after automatic memory; a download shortcut immediately after settings; dark blue send/stop colors with a small 12 px stop square. The scoped settings shortcut opens the existing dialog. The downloads shortcut shares the existing store, retains pause/resume/cancel, and does not register another set of update-completion notifications. It is now the only visible download entry point. The broader futuristic-dashboard redesign is explicitly deferred.

Latest explicit follow-up supersedes conditional download-icon hiding: remove the header/sidebar trigger on every page, including Settings. Move its notification ownership to a root instance that renders no interface; keep the composer as the only visible download trigger. Move New discussion from the sidebar into a dedicated left rail in the prompt, mirroring the right send rail without overlaying the text. Preserve the normal new-chat action and keyboard shortcut. Reuse the existing translated New discussion label.

Subsequently approved appearance change: remove the streaming halo and busy-toolbar dimming. Keep disabled dashboard controls at normal opacity while preserving their locks; only send/stop changes slightly in dark blue. Live progress information still updates. This addresses the requested appearance, without claiming that every possible layout shift has been reproduced or eliminated.

Prepare future distributions without compiling them. Add a declarative inventory of the local launcher's eleven variants, including Windows portable ZIP/checksum, and a read-only Node audit. Verify referenced sources, package scripts, JSON configuration, application identity and desktop/web/native/CLI versions. Report Android review flags and missing Apple provisioning separately from source-reference validity; never certify an unbuilt target. The checker performs no network calls, installs, builds, CI changes or publication. Document prerequisites and the portable package's normal profile storage and separately downloaded model weights.

### Evidence and local validation

- Before: an empty initial local-model input hides the meter; after: tests cover an idle indicator, unavailable capacity and transition to 2.6% from reported data. Existing hook tests retain the engine's actual context as the denominator.
- Layout/control tests verify memory → settings → downloads order, a single settings trigger, scoped dialog access, the stop control inside the prompt and an actual stop callback.
- `node node_modules/vitest/vitest.mjs run --project @janhq/web-app` with the six affected test paths: **148 tests pass**. Paths: TokenCounter, tokenCounterVisibility, ChatInput, useTokensCount, CreationControls and DownloadManegement.
- `node --test scripts/distribution/__tests__/check-release-readiness.test.mjs`: **9 tests pass**, including version drift, missing configurations/scripts, invalid paths and no false build certification.
- `node scripts/distribution/check-release-readiness.mjs`: all eleven source definitions valid; all target build statuses remain `not-verified`, with pending prerequisites listed.
- From `web-app`, `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false`: passes. Targeted ESLint has no errors; two existing CreationControls effect-dependency warnings remain.
- UI localization audit: no missing static keys or unreviewed literals. Architecture: no violations. Actual CSS imports process with existing Tailwind tooling without an application bundle. `git diff --check` passes.
- Duplicate-download-icon follow-up: **73 tests pass** across DownloadManegement and ChatInput; actual CSS processing and `git diff --check` pass. No additional application build or visual runtime validation is claimed.
- Stable-appearance follow-up: **84 tests pass** across ChatInput and CreationControls; actual CSS processing, targeted ChatInput ESLint and `git diff --check` pass. Submission/stop and disabled-control behavior remain covered; the compiled visual result still needs maintainer verification.
- Left new-chat/download-ownership follow-up: **91 tests pass in 7 files** covering the composer, download controls/notifications and sidebar regressions. TypeScript, targeted ESLint, actual CSS processing, architecture, static localization and `git diff --check` pass. No app build or compiled visual confirmation is claimed.

No application/native/extension compilation, GitHub Actions activation, paid cloud generation, installer/archive production, code signing or official release is included. Small-screen and startup behavior still require visual verification in the maintainer's compiled application; browser access to the local preview was unavailable in the preceding layout check. This preparation does not resolve mobile audits or certify target-specific engine compatibility. PR #2 is already merged and provides the base; no unmerged prerequisite or external issue closure is introduced.

The maintainer now requires explicit approval before each future dashboard change, one change at a time. Record that requirement in NOVERA.md and the golden rules. The adjustments above were individually requested before this new workflow rule; keep this follow-up available for review rather than treating it as approval of a broader redesign.

---

## Previous merged change — adaptive composer and generation information (PR #2)

## Current change — 2026-10-29

Long translated controls could crowd the composer, creation durations disappeared when history was reloaded, and unexpected failures were presented as missing configuration. Keep the approved dashboard appearance and its 1,256 px cap, let its rows wrap within the panel, and reserve a separate send/stop rail inside the prompt frame. Mode status text now participates in normal layout instead of overlapping labels.

Persist measured timing and seed information per media file in conversation metadata, including the normal streaming completion path. Restore it after serialized history reloads. Older files may recover recorded numeric information from their existing bounded, path-validated sidecars; missing timings remain absent. Do not expose prompts or model paths through the recovery command.

Preserve the actual unexpected error with configured API keys redacted and an existing translated memory hint when appropriate. Keep preflight setup errors and cancellation handling. Fix a concrete cloud-music invocation mismatch: `creation_cloud_save` expects `request`, whereas its caller supplied `result`. This resolves that contract error; it does not prove the cause of every intermittent GPU or provider failure.

Clarify FLUX.2 Klein 4B's image role in all 80 setup notes. Preserve the current Instrumental recommendation and saved user choices. Reuse existing translated keys. Add official bundled provider icons to all 20 media-provider rows in both README versions. Expand the user guide with startup, model/component roles, local/cloud prerequisites, controls, quantity, measured times and actionable troubleshooting. Add the maintainer's detailed product and user-information golden rules in `docs/REGLES_D_OR.md`, referenced from `NOVERA.md`.

### Reproduction and evidence

- Previously, reload a generated-media conversation: the file survives but its timing metadata is lost. Tests now serialize and reload image/music/video histories repeatedly and preserve each result's measured values, including a multi-result message.
- Previously, cloud music supplies the wrong native argument name. The regression test now checks the argument against the Rust command signature and verifies the saved result.
- Previously, an unknown native allocation or save failure becomes a setup instruction. Regression tests now retain the actual detail, redact secrets and finish the stream once.
- The composer retains one send/stop control and the existing stop/queue behavior; the existing interaction tests pass after moving it into the prompt.

### Local validation

- Targeted Vitest run across diagnostics, streams, composer controls, generated media, conversation persistence and thread completion: **228 tests pass in 9 files**.
- `node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/locales/__tests__/complete-catalogs.test.ts`: **140 tests pass**.
- From `web-app`: `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false`: passes.
- ESLint on the 9 changed production TypeScript files: no errors; two existing dependency warnings in CreationControls remain.
- `node scripts/check-architecture.mjs`: no violations. `node scripts/check-ui-localization.mjs`: no missing static keys or unreviewed literals. `python scripts/check-novera-locales.py`: 80 catalogs, 2,400 keys each, no structural errors.
- `python .build/check-showcase.py`: both README inventories, model/provider references, local assets and original screenshot match. New media rows reuse the official assets already in the provider grid.
- Actual CSS and its imports process through the existing Tailwind tooling without an application bundle. `rustfmt --edition 2021 --emit stdout src-tauri/src/core/creation.rs`: Rust syntax parses; this is not a native compilation or execution of Rust tests.

### Limits and publication

The maintainer will compile the application. No application/extension build, paid generation, new binary, native runtime test, CI approval or cross-device certification is claimed. A standalone layout fixture was prepared, but browser visual verification is unavailable: the in-app browser cannot reach the local server and its URL policy rejects a self-contained data URL. Small-screen, zoom and RTL behavior still require visual confirmation in the compiled app. Structural checks do not certify linguistic quality in every language. Old results recover times only when recorded information still exists.

PR #1 is already merged and is the base; this follow-up is PR #2 and does not depend on another unmerged PR or close an issue. No known overlapping PR is identified. The source branch is published; GitHub blocks merging into the protected main branch. Branch protection remains unchanged; the owner's bypass authorization for PR #1 does not authorize a bypass for this follow-up.

---

## Historical change — explicit folder and shell access

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

## Novera players, editable durations and music history — 2026-10-28

Latest follow-up: Auto recognizes a pasted song sheet with title/lyrics headers or direct Intro/Verse/Chorus sections. Extract the lyrical text separately from the style/accompaniment before native/cloud generation, preserving explicit text requests and saved profiles. Add a generic configuration hint in all 80 locales (1,769 keys) without embedding conversation lyrics.

The user clarified that Windows eventually opens the sheet, then returning from it leaves the app blocked. Close the Radix preparation modal and release its focus/pointer locks before invoking system sharing. Keep it closed on success; restore the prepared selection on native failure. A staged cache file was confirmed present, so no cache purge or application-shutdown change is included. Validation: 379 targeted tests in eight files pass, TypeScript and targeted ESLint pass, architecture has zero violations and seven tests pass, and locale structure passes. An isolated native diagnostic was compiled/launched with a dummy image and returned from its native call, then was closed without sending anything. The product's modal-to-system return still needs verification in a rebuilt Novera application; no product binary or public release was produced.

Windows share freeze: the native adapter synchronously joined StorageFile resolution on the UI thread before showing the system sheet. Resolve on a COM MTA worker, pass an agile storage-item reference to the window thread, and keep only DataTransferManager/UI work there. Bound file preparation to 15 seconds; a failed preparation never schedules the sheet. Preserve verbatim/UNC paths and Unicode filenames. Add real WinRT storage-item tests for TXT/PNG/MP3/MP4 across worker/apartment teardown, missing-file rejection, and frontend recovery after native failure. Validation: the 83 sharing web tests pass; the current `core/sharing.rs` passes seven native isolated tests via `.build/sharing-2026-10-26/test-native.ps1`; architecture has zero violations. Full application UI validation remains pending. No recipient is contacted and no new application binary is included.

Music defaults: disable Instrumental for new configurations and recommended settings so vocal generation is allowed initially. Preserve existing saved choices and keep the instrumental option available.

Sent-message appearance: replace the orange primary fill on colored user bubbles with a Novera navy/indigo gradient and explicit light text, retaining the thin cyan/violet border and the neutral-bubble preference. Text contrast was checked against both gradient endpoints; no application build or visual runtime validation is claimed.

Latest player adjustment: remove adjustable playback speed from both Novera audio and video controls. Request that native share previews hide their playback-rate menu where supported. Existing player tests verify both custom player types have no speed selector and start at normal rate.

Follow-up: sharing a single result now defaults to its original media file or a TXT document for text. The share preview excludes the Novera player decoration; the native payload contains only the attachment, without an extra text message. Include stored MP3/WAV assets and correctly classify newly generated music instead of labeling it as an image. Keep full-conversation/rich exports explicit; HTML music uses audio markup. Configure the desktop main window to start OS-maximized with a 640 × 480 minimum on Windows, Linux and macOS.

Follow-up validation: `TAURI_ENV_PLATFORM=windows node node_modules/vitest/vitest.mjs run src/containers/__tests__/ShareButton.test.tsx src/modules/conversations/__tests__/share.test.ts src/services/sharing --maxWorkers=2` passes 87 tests in seven files, including original-file native payloads for PNG, MP4/WebM and MP3/WAV, and file-only TXT sharing. TypeScript and targeted ESLint pass; architecture has zero violations and seven tests pass. All three desktop configurations parse and contain maximized/resizable startup with the reduced minimum size. Native share-sheet delivery and startup in an application build remain unverified; no recipient was contacted and no new binary was built.

Audio/video exposed the operating system toolbar rather than Novera controls. The duration input rejected empty/intermediate edits, local music was capped at 240 seconds, and restored music references were incorrectly prefixed as base64 data URLs. Add custom Novera audio/video controls and an image viewer across conversations and previews; preserve exclusive playback and pause on viewer teardown. Add standard/Safari fullscreen with an accessible in-app fallback, touch-size controls, translated labels and finite-duration seeking.

Reproduction and corrected behavior:

- Clear 240, then type 360 digit by digit. Before, the field restored the old value or rejected the input. After, the field keeps the draft and switches to manual; the native request receives exactly 360 seconds. Local ACE-Step now accepts its documented 10–600 second range. Invalid manual values are rejected rather than shortened. Cloud limits follow the selected provider's official schema.
- Save a generated MP3/WAV message and reload its serialized history. Before, its durable reference became an invalid base64 URL. After, both save paths preserve the reference across three reload cycles; legacy wrapped references are recovered without deleting media or changing ordinary base64 attachments.
- Start a second audio/video player. The first pauses at its current position, including dialogs and attachment previews. Image viewers add zoom and fitted/fullscreen views.

New/recommended local music remains MP3 320 kb/s; Auto duration is optional and does not change text context settings. Six player labels are translated in all 80 catalogs. Direction, user/development guides, engine tracking, roadmap and language inventory are updated.

Validation:

- `node node_modules/vitest/vitest.mjs run src/components/__tests__/MediaPlayer.test.tsx src/modules/conversations/__tests__/creation-persistence.test.ts src/lib/__tests__/messages.test.ts src/services/app/media-playback.test.ts src/containers/__tests__/MusicControls.test.tsx src/containers/__tests__/GeneratedCreation.test.tsx src/containers/__tests__/CreationControls.test.tsx src/containers/__tests__/CoworkPreviewPanel.test.tsx src/containers/__tests__/ShareButton.test.tsx src/containers/__tests__/ChatInput.test.tsx src/services/creation/music-stream.test.ts src/services/creation/music-cloud-stream.test.ts src/services/creation/music-cloud.test.ts src/services/creation/stream.test.ts src/containers/__tests__/MessageItem.test.tsx src/locales/__tests__/complete-catalogs.test.ts --maxWorkers=2`: 410 tests pass in 16 files.
- Offline Rust harness including the current native creation/music files: 19 tests pass. This builds isolated tests, not the Novera application.
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false`: passes. Targeted ESLint passes.
- `node scripts/check-architecture.mjs`: zero violations. `node --test scripts/__tests__/architecture.test.mjs`: seven pass.
- `python scripts/check-novera-locales.py`: 80 catalogs, 1,768 keys, no structural errors.

Windows/Linux/Android/iOS/macOS runtime and codec validation, native application restart and real 360-second synthesis remain pending. The browser automation window remained minimized and inaccessible, so no visual QA success is claimed. No application build, commit, push, binary release, paid cloud call or issue closure is included. No PR dependency or merge order is introduced. Existing work in this checkout is preserved.

## fix(models): recommend LFM3 Q6_K without a draft — 2026-10-28

Configurations / Text previously offered Qwen3-4B, and desktop onboarding offered LFM2.5 with an optional DSpark companion. Recommend the requested LiquidAI LFM3-1.7B Q6_K URL in both paths and remove the onboarding draft option. The automatic bundle installs LFM3 as a separate verified text file while retaining Qwen3 for FLUX.2 image encoding. Reject old bundles missing the text file before changing media selections.

Update French and English configuration guidance from the official model card: conversation, writing, extraction, tool calls and structured outputs; advertised 256K maximum versus a conservative 32K initial context. Verify the public GGUF size and SHA-256 against the Hugging Face API. Other translated guidance still needs updating.

Validation: frontend recommendation, onboarding, bundle and installation-dialog tests pass; extension import tests pass (79). TypeScript and architecture checks pass; all 80 locale catalogs retain 1,769 keys with no structural errors. Native bundle assertions now cover the independent text role, 21 files and the revised byte total, but were not executed. The subsequent b11940 desktop build and real 32K GPU inference are validated in the engine section below. No CI approval or public release is claimed. No PR was created or issue closed.

## fix(engine): build llama.cpp b11940 for LFM3 — 2026-10-28

Pin llama.cpp b11940 at eb7818c0b85c08ccb39ec2299548b85147c47495, replacing the local b11823 pin which did not recognize LFM3. Build the integrated Windows x64 CPU/CUDA 13.4 worker from those sources. Explicitly target the MSVC ABI and Windows SDK tools when MSYS2 Clang is used; keep Clang's b11940 prefetch-pointer diagnostic as a warning. Older measured batch profiles remain restricted to their calibrated engine tags.

Install the SHA-256-verified LFM3 Q6_K in Novera's actual model data directory with no draft. Real integrated-worker validation loads it on the RTX 5070 at the default 32K context and returns a completed French test answer. Offer the optional NVFP4 source weights only on eligible active NVIDIA GPUs. The card has source/download links and explains the unvalidated GGUF conversion requirement, with no external-server connection instructions or controls. NVFP4 conversion/inference for this checkpoint is not claimed.

Validation: 88 extension preset/profile tests pass; seven NVFP4 recommendation tests pass, including unsupported, disabled and insufficient-memory GPUs and absence of connection controls. TypeScript and targeted ESLint pass. Architecture check has no violations and seven tests pass. The 80 locale catalogs have 1,770 keys and no structural errors (new note translated in French/English, English fallback elsewhere). Full desktop compilation and packaging results are recorded in the engine-b11940 build logs. No CI approval, public release, new PR or issue closure is claimed.

Final b11940 build: Windows x64 desktop compilation completed successfully. Deliverable: `deliverables/Novera-desktop-1.0.0-2026-10-28_02-16-25-120/Novera-Desktop.exe`, SHA-256 `E96E6672DE40C4121EF6D52890D05C29222FE7D53AF12D1AF94EB287F06FB19C`. Packaged worker reports b11940 with the pinned commit; packaged executable and worker hashes match the compiled outputs, and CUDA resources/checksum manifest are present. LFM3 is selected in the saved provider state, preserving other models and an adjacent settings backup. Runtime inference was verified through the integrated worker at 32K; a full graphical application session was not exercised. Audit: `.build/engine-b11940/final-artifact.json` and `validation.json`.

## fix(models): register recommended files and organize future downloads — 2026-10-28

A recommended GGUF downloaded in the browser remained in Downloads and was absent from Models. Discover only checksum-verified text recommendations in Documents/Novera models, managed storage and Downloads, and register them by reference before listing the local engine. Refresh after late engine registration, window focus and entry to the local Models page. Share concurrent discovery and preserve existing settings and explicit deletion tombstones.

Default new GGUF and MLX downloads to Documents/Novera models/<model>, keeping companions together and model.yml registration in app data. Group the combined recommended bundle into the same per-model folders; preserve the flat layout of older saved bundles and use the correct partial-file locations for resume/cancel and disk budgeting. Model IDs cannot escape the chosen root. Transformers manual imports keep their user-selected folders.

Move the maintainer's LFM3 and MiniLM weights into their requested Documents subfolders and update registry paths. Preserve MiniLM's embedding identity. Leave Tron and DSpark in Desktop/T/Convertir GGUF as explicitly requested. Real b11940-worker validation from the new paths: completed LFM3 text response at 32K and 384-dimensional MiniLM embeddings.

Validation: 67 provider/discovery/page tests, six bundle-configuration tests, 79 llama.cpp extension tests and 32 MLX extension tests pass. Three isolated native tests use the production discovery/path functions and cover truncated or incorrect files, nested folders, duplicate detection, traversal and grouped/legacy layout. Web and extension TypeScript, targeted ESLint and architecture checks pass. New embedded extensions are rebuilt. Final desktop build status is recorded in .build/recommended-model-import/final-build.log. No CI approval or public release is claimed.

Final desktop build succeeded: deliverables/Novera-desktop-1.0.0-2026-10-28_03-08-27-045/Novera-Desktop.exe. SHA-256 C23A75AEA1616C0C01D86B1031E727A08E4D206BAAE2FBBD90CB9A8862F3AC7C. Packaged executable matches the compiled output, worker reports b11940, checksum manifest is present. Forty additional provider-service tests pass. Full graphical verification remains pending; model inference/embeddings and automated catalog tests pass. No public binary release or CI approval.

## fix(downloads): allow model-scoped Documents destinations — 2026-10-28

Clicking Download on Qwen3.5-2B Q6_K selected the new Documents/Novera models/<model>/model.gguf path, but the native downloader still restricted writes to app data and rejected it before downloading. Use one shared storage policy for folder generation, batch preflight and cancellation cleanup. Preserve existing app-data downloads; external model downloads require a valid model ID and must stay inside that model's subfolder of the configured Documents storage root. Reject other models, arbitrary user files, traversal and escaping junctions. Validate the complete batch before starting network requests.

Validation: four isolated native tests exercise production scope/path functions, including the exact Qwen layout, companions, partial-file paths, legacy storage and a real Windows junction. Seventeen download-extension tests pass. The native application build and UI verification are recorded under .build/download-model-storage. No CI approval or public release is claimed.

## fix(engine): update llama.cpp to v0.8.0 / b11960 and recommend LFM3 Q8_0 — 2026-10-28

Novera's integrated worker was pinned to b11940 / 0.7.0. Update it to b11960 / 0.8.0 at commit `8642541b255bfb5dc39cd351a178be09013a55d6`, verified directly against both upstream tags (`v0.8.0` is an annotated tag resolving to the same commit). Keep the exact commit pin used by the source-fetch helper and synchronize the private Rust/JavaScript plugin versions, all three affected Cargo lockfiles and the existing pin assertions.

Replace the desktop onboarding recommendation and verified text bundle with the maintainer-selected official `LFM3-1.7B-Q8_0.gguf` (1,846,238,496 bytes, SHA-256 `8f6b24182258205e9e01e21f1f24a1f208c1e8115578825d202ce39976af20b6`). Verify those values against Hugging Face and the existing local file. Keep the initial 32K/no-draft profile, update the download selector and recommendation notes in all 80 chat catalogs, and rebuild the embedded extension. Derive text bundle registration IDs/folders from their saved filename so resumed Q6_K plans still use their original location and identity. Retain the Q6_K import preset for existing models. Android retains its separate LFM2.5 Q4_K_M recommendation.

Validation: all 239 extension tests pass; 91 frontend tests pass, and the seven bundle tests pass after adding a Q6_K resume regression. Architecture checks report no violations; all 80 changed chat catalogs parse. The standard frontend test script cannot find its existing `cross-env` dependency locally, so frontend tests were run directly with `node node_modules/vitest/vitest.mjs run --project @janhq/web-app` and the targeted paths. The integrated Windows x64 CPU/CUDA 13.4 worker compiles successfully. All 187 native tests pass with the staged runtime DLL directory on PATH (the initial test process could not start without it). Real LFM3 Q8_0 inference at 32K returns `4` with finish reason `stop` for `2 + 2`; MiniLM returns 384-dimensional embeddings. Logs and results are under `.build/engine-b11960`. The desktop release build and artifact verification also pass; see the final artifact below. This update does not expose the new upstream realtime/audio endpoints through Novera's existing route table. No PR was created, issue closed, CI approval obtained or public release published.


Final desktop artifact: `deliverables/Novera-desktop-1.0.0-2026-10-28_15-02-56-501/Novera-Desktop.exe`, SHA-256 `dac9649de7a06004664dc3743b7ac4b53b397b2d1e83a5fd1438ce62727dacb3`. The packaged worker reports 0.8.0 / b11960 and the pinned commit. Packaged application/worker/backend hashes match the compiled outputs; the checksum manifest is present and the built frontend contains the Q8_0 checksum. Audit: `.build/engine-b11960/final-artifact.json`. A full graphical application session was not exercised.


## fix(models): detect conditional chat template options — 2026-10-28

Nemotron Bolt declares `conversational_mode` with `{% if conversational_mode | default(false) %}` instead of a self-defaulting `set`. The option was omitted from model settings. Detect `if`/`elif` conditional defaults as well, retain the separate reasoning control and deduplicate options. Bump the metadata detection cache version so existing imports are inspected again. The installed LFM3 Q8_0 template already uses supported self-defaulting sets for preserve_thinking and enable_thinking.

Validation: 240 extension tests pass, including the actual Nemotron conditional pattern. The extension bundle rebuilds successfully. Inspect the installed Nemotron GGUF to confirm the default is false; repair its cached option list for the current application, preserving all other model settings and saving a backup under `.build/engine-b11960`. The current application needs to refresh its model list or restart to load the repaired metadata. A new desktop executable was not built for this fix; the source/cache migration will apply to the next build. No graphical visibility check or public release is claimed.


## fix(models): recommend Nemotron Bolt in default configurations — 2026-10-28

The desktop default configurations and onboarding still offered LFM3-1.7B Q8_0 after local French-language comparisons favored NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M. Replace the recommendation, download selector, verified text manifest and bundle assertions with the official NVIDIA file (6,180,446,208 bytes; SHA-256 `c8af2b8aea10a690a1d9491db744a9446660173cb38fc489612b556615a69612`), checked against the Hugging Face API and the installed local file. All-recommended bundle size becomes 21,059,233,335 bytes. Remove the unrelated LFM3 NVFP4 source-weight card from the default text panel. Retain other downloadable models and the independent Android recommendation.

New official/local Nemotron imports start at the requested 16K context with temperature 1.0, top-p 0.95, top-k/min-p disabled and neutral repetition/presence/frequency penalties. Existing model settings remain authoritative. Retain the explicit LFM3 import preset and saved bundle filename-based registration for legacy plans. Fix Windows drive paths being parsed as URL schemes when applying local import defaults. Update recommendation text in all 80 chat catalogs (French and English wording; English fallback in the remaining catalogs).

Validation: 113 targeted frontend tests and all 243 extension tests pass, including local/official Nemotron defaults, rejected unrelated sources, legacy LFM3 presets and old bundle registration. Architecture checks have no violations; all 80 chat catalogs parse. Rebuild the embedded extension successfully. Desktop build logs: `.build/nemotron-default/build-16k.log` (the initial 4K build was stopped after the user specified 16K). The user's observed 60 tokens/s for Nemotron versus 40 for Ornith is user-reported and was not reproduced as a controlled benchmark. No PR, CI approval or public release is claimed.


Final desktop build succeeds: `deliverables/Novera-desktop-1.0.0-2026-10-28_17-48-03-052/Novera-Desktop.exe`, SHA-256 `0ab2eed46698194a73b39b6313bdb2317af3c82dd19067bbb1cea95c4ea7d586`. Packaged application, worker and backend DLL hashes match the compiled/staged files; b11960 reports the pinned commit. The built frontend contains the verified NVIDIA manifest and the checksum manifest is present. Audit: `.build/nemotron-default/final-artifact.json`. Existing per-model customizations are preserved; 16,384 tokens and the NVIDIA sampling profile apply to newly imported recommendations. A graphical application session was not exercised.

## Current optimization priorities — 2026-10-28

Keep NVIDIA Nemotron-3.5-Bolt-E4B Q4_K_M at 16,384 context tokens as the reference for the current desktop configuration. Prioritize natural French, factual accuracy and faithful source use alongside generation speed, latency and actual VRAM consumption. Higher token throughput alone is not a reason to replace a model that produces better answers. Improve the existing text workflow before adding voice features; voice integration is deferred for now. DFlash remains a possible optimization to evaluate, not an enabled or validated part of this baseline.

### Local compilation ownership

The maintainer explicitly owns compilation from now on. Finish source/configuration changes, documentation and appropriate tests, then let the maintainer compile Novera. Do not start desktop, native or extension builds unless the maintainer explicitly asks. Running tests against existing binaries does not constitute a new build; describe that distinction accurately in validation reports. Previous build records below are historical and do not override this instruction.

The maintainer reports approximately 60 tokens/s for Nemotron, 40 for Ornith-1.5-9B Q4_K_M and 130 for LFM3-1.7B Q8_0. These are user observations, not controlled benchmark results. The supplied Ferrari F50 responses favor Nemotron's French fluency in this sample, but all three models still produced factual or terminology errors. This does not establish a general ranking or prove that a sampling change caused an improvement.

For subsequent comparisons, hold the question, source material, search availability, context, output allowance and reasoning mode constant. Start fresh conversations and repeat each case. Change one setting at a time and record factual errors, completeness, French quality, time to first token, generation throughput and peak VRAM. Include a shared French source-text summary to distinguish source fidelity from retrieval and translation effects. Retain changes only when measurements show a useful gain without sacrificing answer quality. No additional benchmark or optimization is claimed by this documentation update.

## fix(creation): reserve live VRAM and expose dashboard seed controls — 2026-10-28

FLUX.2 Klein 4B Q4_K_M failed at 2048 × 880 before sampling: the native engine reported 1849.57 MiB free while requiring another 2237.31 MiB for its workspace/device margin. The Windows bundled-engine command now requests `--max-vram -0.5`, letting the existing graph-cut planner budget against live free VRAM with 512 MiB reserved for display/driver changes. Preserve the chosen model, seed, resolution, steps, CPU encoder placement and separate Real-ESRGAN stage. External non-Windows CLI versions retain their original arguments. Recognize native workspace capacity/allocation failures as memory errors in the conversation diagnostic.

Add the seed-mode popover immediately after the Real-ESRGAN controls for local images and expose the same control in the local video dashboard. Support random/fixed/increment/decrement modes, a validated uint32 seed and reuse of the last seed. Reuse the existing profile-aware settings and generation seed reservation; image and video settings remain independent. Disable changes while generating and omit these local controls for cloud generation.

Also expose an Instrumental on/off switch directly in the music dashboard, synchronized with the existing settings and selected music profile. Preserve saved lyrics when toggling it. Keep instrumental-only cloud providers fixed on and disable the control during generation.

Validation: reproduce the failed request's prompt, Q4_K_M components, 2048 × 880 dimensions, four steps and seed 1583954823 with the packaged CUDA engine on the RTX 5070 Laptop. It saves an image with the automatic reserve (23.30 s generation), and again with an explicit 4 GiB managed budget (23.02 s); both PNG hashes match. Available physical VRAM differed from the original failure; these runs validate budgeted execution rather than an identical competing-process load. Real-ESRGAN was not rerun in these direct native tests. Logs and outputs remain under `.build/image-memory-fix`. All 84 targeted frontend tests pass, covering dashboard image/video seed independence, seed reuse/bounds, instrumental toggling/profile persistence, generation request mapping and disabled state. Architecture checks report no violations. The initial desktop build was interrupted to include the later Instrumental request; final desktop build validation is pending below. No public release or CI approval is claimed.

Final desktop release build succeeds (5m 20s): `deliverables/Novera-desktop-1.0.0-2026-10-28_19-15-56-298/Novera-Desktop.exe`. Packaged executable and image launcher match their compiled/staged inputs, and SHA256SUMS is present; audit and executable hash are recorded in `.build/image-memory-fix/final-artifact.json`. Frontend production build succeeds. Dashboard behavior was verified through component tests; no graphical application session or real video/music generation was exercised for this change.

## feat(embeddings): replace MiniLM with multilingual Qwen3 Q8_0 — 2026-10-28

The maintainer prioritizes multilingual retrieval and selected the official `Qwen/Qwen3-Embedding-0.6B-GGUF` Q8_0 checkpoint. Replace the automatic fallback/startup download of sentence-transformer-mini with `Qwen3-Embedding-0.6B-Q8_0`. Verify the official Hugging Face metadata and downloaded file: 639,150,592 bytes, SHA-256 `06507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439`. Pass both size and hash to the existing verified download path. Version the bootstrap flag so the previous MiniLM install flag does not suppress the new installation, ignore the legacy model for fallback selection and migrate a legacy default selection. Preserve deliberately selected custom embedders.

Official reference: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF. Use last-token pooling, 8,192-token microbatch/batch defaults, the checkpoint's 32,768-token trained context, full 1,024-dimensional vectors and the GGUF's EOS behavior. Honor pooling metadata when importing decoder embedding models instead of assigning mean pooling unconditionally. Pass the retrieval purpose through the core embedding API: only Qwen retrieval queries receive the official English instruction format; indexed documents remain unprefixed. The embed request budget reads the per-model microbatch rather than imposing the previous 2,048-token fallback on Qwen. Empty project collections default to 1,024 dimensions; actual generated vectors remain authoritative. For Novera's 8 GiB GPU configuration, initially run this small embedder on CPU (`n_gpu_layers: 0`) to preserve GPU memory for text/image models; CPU placement is a Novera resource choice, not an official Qwen requirement.

Download location: `C:/Users/jmsga/Documents/Novera models/Qwen3-Embedding-0.6B-Q8_0/Qwen3-Embedding-0.6B-Q8_0.gguf`. Register the local absolute path with the settings above. After successful native inference, remove only the explicitly requested `all-MiniLM-L6-v2` weight directory and its `sentence-transformer-mini` registry directory; save the former model YAML in `.build/qwen-embedding`. The three existing vector database files were empty (zero bytes), so there were no indexed vectors/documents to rebuild. This is a check of this local profile, not a general automatic reindexing implementation for populated databases.

MiniLM occupied 45,949,216 bytes locally (45.9 MB); Qwen Q8_0 occupies 639.2 MB, approximately 13.9 times as much disk space. Disk size is not runtime RAM/VRAM consumption. Qwen's official model card reports 64.33 on multilingual MTEB and 70.70 on English MTEB v2 for its reference model. These are not measurements of the Q8_0 file, and no directly comparable MiniLM result was established here. Do not infer a quantized benchmark score or a universal accuracy gain from the file size or this smoke test.

Validation: use the existing b11960 worker without rebuilding it, with last pooling, 32K context, 8K microbatch and CPU placement. Four outputs have 1,024 finite components and L2 norms within 0.000001 of one. A French query ranks the English Eiffel Tower passage above the French Ferrari and Spanish Madrid distractors (cosines 0.61234 vs 0.20817 / 0.22109). This checks cross-language retrieval wiring, not a benchmark. Audit, native logs and migration records are in `.build/qwen-embedding`. Source tests and final checks are recorded below. No new application, native engine or extension bundle was compiled: the maintainer will compile. The local launcher now rebuilds core/extensions before the web frontend so that the maintainer's next compile includes these source changes instead of stale extension dist files. No graphical application validation, CI approval or public release is claimed.

Final source validation: all 489 tests pass across 49 files in core, llama.cpp, RAG and vector-db projects, including query-purpose forwarding, unprefixed document vectors, multilingual query formatting, pooling defaults, the verified Qwen bootstrap replacing legacy MiniLM and the new 1,024-dimensional empty-collection default. Run with `node node_modules/vitest/vitest.mjs run --project @janhq/llamacpp-extension --project @janhq/rag-extension --project @janhq/core --project @janhq/vector-db-extension`. The local build launcher passes PowerShell syntax parsing without execution; architecture checks report 25 files checked and no violations. Test logs: `.build/qwen-embedding/final-tests.log`. Ready for the maintainer's compilation and subsequent application restart; no new compiled application is supplied for this change.

### Embedding CPU/GPU selector

Expose a per-model CPU/GPU selector in Settings → llama.cpp → Embedding models. Read the saved placement from model.yml through the models service, persist CPU as `n_gpu_layers: 0` and GPU as `n_gpu_layers: -1` (automatic GPU offload). Use the existing preset refresh/rollback path so the next inference uses the selection. Default unspecified embedding placement to CPU. Make embedding placement independent of the global chat auto-fit option: it previously suppressed the explicit CPU override when enabled. Preserve the saved selection on reopening, disable the selector during loading/saving, retain the previous selection after a persistence failure and allow retry. CPU remains the local Qwen profile default. The maintainer compiles; no compilation or graphical/GPU inference validation was performed for this selector.

Validation: all 266 targeted tests pass across the selector, provider page, models service, extension settings and preset generation. Cover CPU/GPU persistence and restore, retry after failure, unset/zero/automatic/positive GPU layer values, and placement with global auto-fit both enabled and disabled. Architecture checks report no violations. Log: `.build/qwen-embedding/device-tests.log`.

### Embeddings in Novera configurations; instrumental music default

Add a dedicated Embedding models section to the common Novera configurations dialog, immediately after Text. Offer the official Qwen3-Embedding-0.6B Q8_0 file (639 MB), the existing download workflow, a set-default embedding action and the same saved CPU/GPU selector when installed. The embedding action changes only the retrieval default, without selecting Qwen as a conversation model or navigating to a new chat. Give the reusable download button an optional installed-action label so the embedding card does not display a chat action. Reuse existing translated section descriptions and device labels.

Make Instrumental enabled by default in musicDefaults and the music setup reset action. Keep it switchable from the dashboard/settings and preserve existing saved profile choices. Local generation now sends `[Instrumental]` with unknown vocal language for the default settings; vocal-song tests explicitly disable Instrumental before supplying lyrics. No audio model or generation algorithm changes.

Validation: all 75 targeted frontend tests pass across eight files, covering configurations visibility, the official embedding download link, retrieval default selection without changing the chat model, the installed device control, instrumental-by-default native requests, and explicitly enabled vocal workflows locally/cloud. Log: `.build/qwen-embedding/setup-instrumental-tests.log`. No application, native or extension compilation was started; compilation remains the maintainer's responsibility.

### Complete automatic recommended bundle

An audit of “Download and configure everything” found that its runtime manifest omitted the text manifest despite an existing native test expecting it, and that retrieval embeddings and Real-ESRGAN were not part of the global setup. Include the pinned Nemotron text manifest, a shared official Qwen embedding manifest and both verified Real-ESRGAN checkpoints alongside image/music/video weights and music runtime dependencies. The full default bundle now contains 24 files totaling 21,832,486,641 bytes (disk reserve added separately).

Register the verified retrieval GGUF by reference in its own Documents/Novera models/Qwen3-Embedding-0.6B-Q8_0 folder, select it as the embedding default and apply CPU placement for a newly registered embedder. Preserve an existing saved CPU/GPU choice. Register both upscalers from upscale_models so their controls work without browsing for files; retain the upscaling on/off choice. Keep Nemotron as the chat model, the separate FLUX Qwen3-4B encoder, Instrumental on for newly configured music, and the existing video runtime prerequisite check. Reject a bundle missing retrieval/upscaler roles before changing settings. This bundles the recommended variants, not every alternative quantization or user-supplied model.

ACE-Step's encoder has the same filename as the retrieval GGUF but a different size/hash (784,144,960 bytes versus 639,150,592). Store it in the separate ACE-Step folder; do not deduplicate or substitute these files by name. Update the native count/size/destination assertions, frontend setup regressions and all 80 configuration descriptions. The embedding card and global installer read the same embedding manifest.

Validation: 25 targeted frontend tests pass; three pre-existing installation UI cases remain skipped. They cover independent retrieval/text registration, CPU defaults, both upscaler paths, Instrumental and rejection of missing required roles. Static manifest verification confirms 24 files, 21,832,486,641 bytes, distinct music/retrieval hashes and valid locale JSON. Architecture checks report no violations. Logs: `.build/qwen-embedding/all-setup-tests.log` and `bundle-manifest-check.json`. Native regression tests were updated but not compiled or executed, per the maintainer's compilation ownership. No new build, full network bundle download or live video/music installation was performed.


### Localize remaining interface surfaces and add generation quantities

Settings metadata, configuration menus, dependency help, loading progress and
the notification-area menu still exposed hardcoded English despite complete
older catalogs. Route those shipped strings through localization, add the ui
namespace to all 80 catalogs, complete newly missing keys and English prose,
and select plural categories with the locale's Intl rules. The current reference
contains 2,400 keys across 15 namespaces. Keep technical identifiers and user
extension labels intact. Add a source audit with an explicit invariant-text list
and regression coverage for shipped setting metadata in every locale.

Add an independent quantity selector from 1 through 10, defaulting to 1, for
image, music and video generation. Place it after the seed controls locally and
expose it for cloud generation. Snapshot generation settings, run jobs in sequence,
wait for cleanup before the next job, preserve seed policy, collect outputs in
one assistant message and stop the remaining queue on cancellation or failure.
Older settings without a quantity retain single-generation behavior.

Validation: 94 generation/tray tests and 170 affected component tests pass.
TypeScript without emission and architecture checks pass. Catalog and metadata
verification details are recorded in deliverables/interface-audit-2026-10-29/RAPPORT.md.
The final catalog/metadata and screen regression suite passes 945 tests, with
three pre-existing installation cases skipped. All 80 catalogs explicitly cover
2,400 keys without structural errors. The source audit checks 2,117 calls without
missing keys or unreviewed UI literals. Correct two invalid key references and
12 inherited Wolof entries contaminated with temporary translation markers.
New translations are drafts from public translation services, the existing
local model and assistant editorial adaptations; native and regional review remain pending.
No application, native or extension build was run. Rust changes received syntax
parsing only. No live GPU or paid cloud generation, full visual pass across all
languages, CI approval or publication was performed. The maintainer compiles.
### Expand the existing composer dashboard

Let the existing dashboard use the available content width on the home,
conversation, project and Cowork screens. Remove the 72rem composer cap and
the project/Cowork percentage reductions while retaining the existing controls,
layout and outer page padding. Conversation message columns keep their current
reading width. This is a layout-only change; no compilation or graphical
validation was performed. The maintainer compiles.

### Space translated composer tool states

The web, local-tool and reasoning state badges used absolute positioning under
fixed-width circles, so longer translated labels overlapped adjacent controls.
Let each tool size to its label, place the state in normal flow below the icon,
and increase toolbar spacing. Long labels wrap within the button and the toolbar
continues to wrap on narrow windows. Keep the existing actions, state colors and
translations. No application compilation or graphical validation was performed.

Validation: CSS parsing succeeds and all 56 ChatInput tests pass. These checks
cover syntax and existing interaction behavior; translated visual layouts still
need verification in the maintainer's compiled application.

### Match the composer width to the supplied screenshot

The full-width dashboard was too wide on large windows. Cap the shared composer
wrapper at 1,256 CSS pixels and center it, matching the approximately 1,252-pixel
visible frame in the supplied 1,260-pixel-wide reference capture after wrapper
padding. Smaller windows still use the available width. Apply this limit through
the shared ChatInput so home, conversations, projects and Cowork stay consistent.
Keep the existing controls and translated-label spacing. Verified the reference
image dimensions and the shared wrapper change; no compilation or graphical
validation was performed. Screenshot pixels may differ from CSS pixels under
display scaling or application zoom.

### Publish the accumulated Novera source update

Synchronize the current source and documentation with the latest Novera main
branch, including the complete interface catalogs, media generation quantities,
model/embedding configuration updates and the adjusted composer width and tool
spacing. Keep local translation caches, working histories, logs and compiled
packages outside the publication. The original local branch remains available.

Pre-publication checks pass: TypeScript without emission, architecture,
80 catalogs with 2,400 keys each and the static interface-key audit. The prepared
files contain no recognized credential signatures or unexpected binary artifacts.
Previously recorded targeted tests remain documented above; a full application
build, full end-to-end run and native linguistic certification were not performed.

### Refresh the repository showcase and automation story

The English and French repository homepages still displayed the old composer,
41 providers, image/video-only media counts and superseded model defaults.
Replace the composer image with the maintainer's 29 October application capture
and foreground the complete guided workflow from first launch through model
setup, resource management, execution and saved/shareable results.

Document the current local text, retrieval, image, music, video and upscaling
components, including the distinction between retrieval and music encoders.
List all 42 provider profiles and all 49 media presets across 20 generation
providers, including the four music routes and ElevenLabs. Add the source's
text/vision model shortlists, update all 80 catalogs to 2,400 keys each and remove
obsolete model recommendations and historical Hub totals from the showcase.
Keep model entitlement, hardware support and native linguistic review limits clear.

Validation: README links/assets and model names checked against local manifests
and catalogs; the new image is byte-identical to the supplied screenshot. This
is a documentation/assets change with no application build or paid generation.
