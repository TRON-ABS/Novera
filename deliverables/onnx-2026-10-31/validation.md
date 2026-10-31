# ONNX and adapted Hub ranking — local validation

Date: 31 October 2026. Scope: source changes in the existing dirty checkout; no publication or installed application upgrade.

## Implemented

- Desktop ONNX engine registration, selected Python/device settings, validated folder import, registry, load/session/unload and application cleanup.
- General numeric/bool tensor graph inference through authenticated HTTP or JSON user messages in the local chat transport. Prepared single-decoder text GenAI exports use their tokenizer and chat template. Generic task preprocessing/postprocessing remains explicit.
- Graph/external-data validation, explicit graph selection for multi-graph exports, tensor dtype/rank/shape/range checks, int64 JSON precision, finite output checks, bounded request/serialized output size, busy rejection and cancellation.
- Hub ONNX engine and format discovery, explicit ONNX metadata queries, local-import navigation and conservative unknown runtime memory. No automatic arbitrary-bundle download.
- Default adapted ranking: hardware fit first, then release date descending before publisher, curation and model size. Recent edits of old repositories retain their original creation date; no installed-model replacement.

## Results

- **155 web tests passed in 8 files.** ONNX engine, import UI, authenticated model factory, Hub taxonomy, discovery/ranking, Hugging Face/category feeds and memory orchestration.
- **9 Python tests passed.** Real CPU Add graph; external-data loading and truncated/path failures; int64 identity; typed inputs; authenticated HTTP, SSE, busy/recovery; real GenAI API on a synthetic zero-layer decoder, template, context and cancellation. No model weights downloaded.
- **2 isolated Rust tests passed.** Supervisor source, import/probe/load/session/authenticated inference/unregister/unload; original model retained. Tauri app handle and registry directory are replaced in the harness; process/HTTP behavior is unchanged. This does not test Tauri IPC.
- Web TypeScript build check passed. Architecture check: 28 files, 6 areas, no violations.
- Targeted ESLint: no errors, two React refresh export warnings in the existing diagnostic component structure.
- Native `cargo check --locked --lib` passed. The full Tauri unit-test binary compiled, then failed before test execution with Windows `STATUS_ENTRYPOINT_NOT_FOUND (0xc0000139)`, including when using the repository's Tauri test environment setting. This was the initial outcome; the subsequent manifest fix, passing actual Tauri ONNX tests and complete suite (1,153 passed, 0 failed, 2 ignored) are documented in the [Windows test report](../tauri-windows-tests-2026-10-31/validation.md).

Commands from the repository root:

```powershell
node web-app/node_modules/typescript/bin/tsc -b web-app --pretty false
node scripts/check-architecture.mjs
node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/services/onnx/engine.test.ts web-app/src/modules/engines/hub-catalog.test.ts web-app/src/lib/__tests__/hubDiscovery.test.ts web-app/src/lib/__tests__/model-factory.test.ts web-app/src/services/models/__tests__/hubCategories.test.ts web-app/src/services/models/__tests__/huggingfaceCatalog.test.ts web-app/src/containers/dialogs/__tests__/ImportSafetensorsModelDialog.test.tsx web-app/src/services/creation/memory.test.ts
.build/onnx/runtime/Scripts/python.exe -m unittest discover -s onnx-server -v
python scripts/tests/check-onnx-native.py
cargo check --manifest-path src-tauri/Cargo.toml --locked --lib
```

The HTTP tests require localhost access, which this sandbox blocks by default. They passed outside that restriction. CPU runtime versions: Python 3.12.15, ONNX Runtime 1.31.1, ONNX 1.23.2, NumPy 2.5.4, ONNX Runtime GenAI 0.18.0. Dependencies are isolated under `.build/onnx/runtime` and pinned under `onnx-server`.

## Limits

No trained-model quality/performance benchmark, GPU inference, realistic KV-cache test, macOS/Linux runtime test, installed binary or interactive UI validation. GenAI remains subject to the compatibility of its export/runtime version. Specialized graphs require the caller's task-specific processing. Raw tensor chat has zero token usage. All downloaded dependencies and generated fixtures/build artifacts remain under ignored build directories.

## TokenEconomizer observation

The official local status command reports 1 folded session, 873.1k effective tokens, 0 plugin overhead (0.0%), 0 injected facts, 0 redirects and 0 still-stuck notices. These are consolidated plugin totals, not an isolated measurement of this task or proof of token savings. Configuration: `microskills=envfacts toolprune=off loopguard=nudge repomap=off mode=auto shadow=False`.
