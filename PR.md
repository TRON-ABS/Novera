# fix(models): support quantized Safetensors and refresh the showcase

Quantized checkpoints were rejected at import, worker loading and Hub selection. The Hub also discarded available GPU memory because physical hardware probes synthesized inactive device flags, showing insufficient memory for a 731 MB model on an RTX 5070 Laptop.

## Resulting behavior

- Accept complete local AWQ 4-bit unfused GEMM, GPTQ 2/3/4/8-bit gptq/gptq_v2, and bitsandbytes 4-bit NF4/FP4 or 8-bit checkpoints. Add constrained optional installation, per-loader runtime readiness and a shared Python/TypeScript/Rust configuration contract.
- Load quantized weights directly onto NVIDIA CUDA, check free VRAM/context before loading and use eager reference PyTorch CUDA kernels for AWQ/GPTQ. Keep CPU/disk offload and silent full-precision fallback disabled. Loader banners cannot corrupt JSON stdout.
- Remove synthetic GPU inactivity and stale usage during hardware migration. Refresh usage at startup, every five seconds while visible and on visibility return, with no overlapping samples. The observed 15,789 MiB RAM / 13,778 MiB used and 8,151 MiB VRAM / 4,769 MiB used now correctly fit the 731 MB model and LFM3.
- Pin official LFM3-1.7B GGUF Q4_K_M/Q6_K/Q8_0 and use catalog recommendation metadata instead of a hard-coded LFM2.5 highlight. Preserve older lightweight choices and the separate first-run model.
- Update both repository showcase READMEs with the supported-method matrix, requirements, limitations and current 2,404-key locale coverage. Publish the explicitly requested voluntary Bitcoin support section and QR. The address `17TXpB1aBj5DxjwEfM3K44zyqhixRzY78i` passes Base58Check and the decoded QR exactly matches both READMEs; no payment/wallet operation was performed.

## Reproduction and evidence

Import a complete supported pre-quantized folder, select a configured CUDA Python environment and load it for chat. Previously import rejected every quantization_config; the new worker dispatches packed weights to CUDA and reports missing optional loaders explicitly. Test a nearly full RAM sample with remaining RTX VRAM: previously the GPU was incorrectly excluded, now the small model fits. Open the Hub: LFM3 is the pinned LiquidAI recommendation. Open the English/French repository README: model-method support and the BTC address/QR are present.

## Validation

- Targeted Vitest run: **273 tests pass across 13 files**, covering quantization policy/readiness, memory regression, cache migration, polling lifecycle, model metadata/conversion, engine transport and all 80 Hub discovery catalogs. Exact selected-file output: local `.build/quantized-safetensors-2026-10-29/web-tests.log`.
- `NOVERA_TEST_QUANTIZED_CUDA=1` and `NOVERA_TEST_GPTQ_CUDA=1` with `python transformers-server/test_quantization.py`: **11 tests pass**, including real AWQ 4-bit, GPTQ 4-bit, bitsandbytes NF4 and INT8 save/reload/generation on tiny untrained offline fixtures. Policy tests also cover dispatch without .to(), missing loaders, insufficient VRAM, external shards and clean JSON stdout. These tests validate execution, not meaningful-model quality or speed.
- `python transformers-server/test_server.py`: **10 tests pass** on Python 3.15.1 / Torch 2.14.1+cu130 / Transformers 5.20.2, including real plain-model generation, HTTP, streaming, cancellation and shards.
- Quantized validation environment: Python 3.15.1 / Torch 2.15.0+cu134 / Transformers 5.21.0 / GPTQModel 7.7.0 / Optimum 2.3.0 / bitsandbytes 0.50.2 / Accelerate 1.15.0, RTX 5070 Laptop. Optional packages are local to the test environment; existing base packages are reused read-only. bitsandbytes selected its CUDA 13.2 library and executed successfully.
- One isolated Rust test compiled the actual native configuration validator against the shared cases; rustfmt checked the full edited source. This is not a whole Tauri build.
- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false` from web-app: passes. Targeted ESLint: zero errors, two existing mixed-export Fast Refresh warnings.
- `node scripts/check-architecture.mjs`, `node scripts/check-ui-localization.mjs`, `python scripts/check-novera-locales.py`, PowerShell setup parser, README/QR checks and `git diff --check`: pass.

## Scope and limits

Direct main publication was explicitly requested; the commit is based on the previous Hub update 51bab0bbd. No overlapping open PR was found. Unrelated local sidebar/composer edits are excluded. The sources require a rebuild to update the embedded worker/native import and displayed interface. No new app build/install, native GUI verification, whole-repository test result, CI approval, broad architecture validation, real GPTQ 2/3/8-bit inference or performance guarantee is claimed. Split-only GGUF downloads and complete Safetensors repository downloads remain separate work; vLLM is not added by this commit.
