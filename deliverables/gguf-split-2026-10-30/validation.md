# GGUF split downloads — local validation, 30 October 2026

## Result

Complete standard `name-00001-of-000NN.gguf` series are discovered as one variant with a total size and file count. Incomplete or ambiguous series are omitted. Different directories/counts stay separate, and the grouped ID includes the split count to avoid colliding with an unsplit version. A missing size produces an unknown total rather than an underestimate.

Before importing a split download, the service retrieves metadata for the requested revision, pins every URL to the resolved commit and requires every member's measured size and SHA-256. The existing native batch downloader verifies the complete set; the extension then inspects every GGUF header and its zero-based `split.no` and `split.count`. Only after all checks pass does it write `model.yml`, pointing to the first shard and storing the manifest and summed on-disk size. Local split names preserve the stem and use llama.cpp's numbered `.gguf` convention. Explicit deletion derives only the numbered siblings of the registered first shard, validates them before deleting, tolerates missing members and preserves other variants.

The native download manager's existing aggregate progress, pause and resume operate on the batch. The Hub's existing memory diagnostic consumes the summed weight. Two 250 GB shards therefore report 500 GB; downloading them does not establish that a machine has enough RAM/VRAM or that the engine supports their architecture. No merge or second full-size copy is introduced.

## Executed checks

From the repository root:

```powershell
node core/node_modules/typescript/bin/tsc -p core
node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/services/models/__tests__/ggufShards.test.ts web-app/src/services/models/__tests__/default.test.ts web-app/src/services/models/__tests__/default.coverage.test.ts web-app/src/services/models/__tests__/huggingfaceCatalog.test.ts web-app/src/lib/__tests__/hubDiscovery.test.ts web-app/src/containers/__tests__/HubHardwareDiagnostic.test.tsx --reporter=dot
node node_modules/vitest/vitest.mjs run --project @janhq/llamacpp-extension extensions/llamacpp-extension/src/test/index.test.ts --reporter=dot
node scripts/check-architecture.mjs
node scripts/check-ui-localization.mjs
git diff --check
```

- Core declaration compilation passes. Its generated declarations are ignored build output.
- Web: **137 tests pass in six files**. Tests include complete/incomplete series, duplicates, wrong indices/counts, nested paths, independent variants, unknown sizes, exact 500 GB totals, revision pinning, unavailable metadata, missing hashes, and uppercase filenames.
- Extension: **97 tests pass**, including per-shard destinations/hash/size, all GGUF header reads, total registered weight, corrupt second shard, mismatched split metadata, failed native verification and invalid manifests. Existing tests cover unsplit model and projector imports.
- Architecture check: no violations. Static localization check: no missing keys or unreviewed literals.

From `web-app`:

```powershell
node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false
node node_modules/eslint/bin/eslint.js src/services/models/ggufShards.ts src/services/models/default.ts src/services/models/huggingfaceCatalog.ts
```

Both pass.

For the native removal module, a small isolated harness includes the actual production Rust file, avoiding a full desktop build:

```powershell
$env:TMP = Join-Path (Get-Location) 'deliverables/gguf-split-2026-10-30/removal-tests/target/tmp'
$env:TEMP = $env:TMP
New-Item -ItemType Directory -Force -Path $env:TMP | Out-Null
cargo test --offline --manifest-path deliverables/gguf-split-2026-10-30/removal-tests/Cargo.toml
```

**Five Rust tests pass.** These cover whole-series deletion, preserved variants, missing members, rejection of a later directory before any deletion, registered-config confinement and single-file behavior. Cargo reports an unused production function in the standalone library and may fall back to copies when its incremental cache cannot create hard links.

## Known limits

`node extensions/llamacpp-extension/node_modules/typescript/bin/tsc --noEmit -p extensions/llamacpp-extension/tsconfig.json --pretty false` still reports two pre-existing `ModelConfig.n_gpu_layers` errors in the unchanged `checkMmprojExistsAndUpdateOffloadMMprojSetting` code. No unrelated type repair is included.

This is source-level validation with mocked metadata/download/IPC boundaries plus real native filesystem tests. No real split weights, 500 GB download, large-model inference, live desktop visual check, full app build, CI approval, publication or merge is claimed. Split Hub downloads require Hugging Face metadata with complete hashes/sizes. The existing single-file optional verification policy remains in place.

Upstream reference: [llama.cpp GGUF split tool](https://github.com/ggml-org/llama.cpp/blob/master/tools/gguf-split/README.md).
