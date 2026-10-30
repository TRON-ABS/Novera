# EXL3, then EXL2 — real NVIDIA validation, 30 October 2026

## Outcome

The source integration adds dedicated EXL3/ExLlamaV3 and EXL2/ExLlamaV2 execution behind Novera's existing managed Safetensors engine. Explicit `quantization_config.quant_method` selects the loader; the container extension alone does not. Native/Python/Hub policies share the bitrate cases. Folder registration accepts complete indexed checkpoints or all local EXL Safetensors names, including `output.safetensors`; missing/escaping shards fail. There is no conversion or CPU fallback. The Hub has EXL3/EXL2 filters and matching runtime diagnostics.

The separate Python 3.12 environment preserves the existing Python 3.15 Transformers stack. The embedded adapter reuses authenticated loopback HTTP, streaming, targeted cancellation, busy rejection, recovery and process-based unload. Parent supervision now includes the Windows venv launcher as well as Novera; real tests confirm its interpreter tree exits without forced descendant cleanup. Imported checkpoint files are preserved by unregistering.

TabbyAPI is a separate optional server. Its opt-in provider defaults to `http://127.0.0.1:5000/v1`, supports an editable endpoint and authenticated model discovery, and reuses the OpenAI-compatible transport. Its lifecycle remains owned by the independent server operator. The pinned TabbyAPI revision uses EXL3; Novera's dedicated ExLlamaV2 path provides EXL2. No external server is silently started or stopped by the application.

## Actual benchmark

GPU: NVIDIA GeForce RTX 5070 Laptop, 8,151 MiB, driver 617.42. Model family: Qwen2.5-0.5B-Instruct. Complete checkpoint revisions, measured file sizes and SHA-256 values are in [model-manifest.json](model-manifest.json); retrieved publisher metadata is in [model-metadata.json](model-metadata.json).

Context 2,048, one sequence, greedy (`temperature=0`, `top_p=1`), FP16 KV cache, no speculative decoding. Same explicit system/user messages across all engines. Five measured runs after a separate warmup for each input length. Every measured short input is 48 tokens, long input 272 tokens; every measured output is 128 tokens. Engine workers run in serial and are stopped between models. Unique prompt prefixes prevent full-page prefix reuse; GGUF also receives `cache_prompt=false`. The final run had no concurrent TabbyAPI test.

Long-input medians:

| Engine | Decode tokens/s | End-to-end tokens/s | First content ms | Load seconds | Max sampled total GPU MiB | Max process-tree RSS MiB |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| GGUF Q4_K_M | 402.7 | 361.1 | 35.1 | 0.73 | 1305 | 919 |
| EXL3 4 bpw | 312.5 | 291.2 | 33.0 | 4.69 | 1373 | 1939 |
| EXL2 4 bpw | 146.9 | 142.4 | 34.5 | 5.04 | 1512 | 1824 |

Decode throughput excludes the first content token: `(completion_tokens - 1) / (last_content_time - first_content_time)`. End-to-end throughput includes request and prompt processing. RSS includes the Windows venv launcher and its real interpreter. GPU memory is sampled whole-device usage every 250 ms, including the desktop/background allocation; it is neither isolated model allocation nor a guaranteed transient peak. The raw samples, output text, runtimes and process-exit results are preserved in [benchmark.json](benchmark.json). The existing GGUF worker version and successful model load/unload are recorded in the raw JSON.

**No speed benefit over GGUF was demonstrated here.** Long-input decode is 22.4% lower for EXL3 and 63.5% lower for EXL2 than GGUF in this stack. This is a small-model result on one laptop, not a general engine ranking. GPU clocks/power and desktop scheduling were not fixed. ExLlama uses torch 2.9.0/CUDA 12.8; the existing llama.cpp worker is b11960, built for this machine. Engine stacks, calibration and head precision differ (EXL3 head 8 bits; EXL2 head 6 bits; GGUF mixed Q4_K_M). Equal advertised bitrate does not establish equal quality or identical original weight revisions.

Quality smoke: with the explicit benchmark system message, EXL3 answered `32` to `17 + 25`, EXL2 answered `17 + 25 = 42`, GGUF answered `17 + 25 = 42`. All translated “The cat is sleeping” to “Le chat dort.” These two prompts are not a quality evaluation. The separate TabbyAPI test used its tokenizer-default system template and returned `17 + 25 = 42` via SSE. Prompt-sensitive arithmetic on a quantized 0.5B model must not be generalized to all EXL3 models.

## EXL2 attention reproduction

With the same verified EXL2 checkpoint and identical HF/native tokenizer IDs, the pinned stack's SDPA route produced unrelated/repetitive replies. Disabling CUDA graphs alone did not fix it; disabling SDPA did. Explicit eager CUDA attention produced `17 + 25 = 42`. Novera therefore selects `no_flash_attn=True` and `no_sdpa=True` for this ExLlamaV2 path; CUDA graphs stay at the library default. This is a scoped observation on the tested stack, not a claim that all upstream SDPA implementations fail. No corrupted checkpoint result was used for the retained benchmark.

## Dependency/runtime evidence

Tested isolated stack: Python 3.12.15, torch 2.9.0+cu128, ExLlamaV3 1.6.5+cu128.torch2.9.0, ExLlamaV2 0.3.2+cu128.torch2.9.0, Transformers 4.57.1, Safetensors 0.8.0, triton-windows 3.5.1.post24. [Full package snapshot](runtime-packages.txt). Official Windows release wheels are pinned in `requirements-exllama.txt`; the tested installer creates/uses a separate environment and verifies CUDA plus both loader imports.

TabbyAPI official source commit: `b1c225394d0fb45e8d26bddec344318dfd85096e`. Its authenticated model listing and actual EXL3 streaming response are preserved in [tabby-smoke.json](tabby-smoke.json), with no API keys. It was stopped after the test. [GPU HTTP contract evidence](live-contract.json) records both native loaders: CUDA placement, memory allocation, unauthorized 401, busy 409, unrelated cancellation rejected, active cancellation accepted, successful subsequent generation and process-tree shutdown.

## Executed validation

- Web: **83 tests pass in five files**, covering shared quantization policies, matching CUDA loader readiness, memory advice, folder import, settings transport, and TabbyAPI provider/catalog behavior.
- Python regressions: **27 tests run, 23 pass, four existing optional quantization round trips skipped**. This run uses the existing Python 3.15 environment and includes real tiny CPU model generation, sharded reload, HTTP auth/stream/cancel and worker startup, plus the ExLlama unit tests.
- Opt-in ExLlama GPU contract: **one test passes across both EXL3 and EXL2**, using real checkpoint loading, authentication, busy rejection, streaming, targeted cancellation, recovery and process-tree shutdown.
- Native import: **two tests pass**, extracting the actual production import functions into a small offline Rust harness. Covers all shared policy fixtures, arbitrary shard names, aggregate size, missing weights and path escape rejection. This does not compile the entire Tauri application.
- Web TypeScript passes. Targeted ESLint has no errors; the diagnostic component retains two existing React fast-refresh warnings.
- Architecture check passes. Static localization check has no missing keys or unreviewed literals; EXL3/EXL2 are registered technical format identifiers. PowerShell installer syntax and Python module syntax pass. The installer was also executed successfully against the isolated environment, finishing with both CUDA loaders available. `git diff --check` passes.

Commands from repository root:

```powershell
node node_modules/vitest/vitest.mjs run --project @janhq/web-app web-app/src/lib/__tests__/providerEndpoints.test.ts web-app/src/modules/engines/hub-catalog.test.ts web-app/src/services/transformers/engine.test.ts web-app/src/containers/__tests__/HubHardwareDiagnostic.test.tsx web-app/src/containers/dialogs/__tests__/ImportSafetensorsModelDialog.test.tsx --reporter=dot
python scripts/tests/check-exllama-native.py
node scripts/check-architecture.mjs
node scripts/check-ui-localization.mjs
```

Run the Python regressions with the existing Python 3.15 Safetensors environment. Use a writable `TMP`/`TEMP` directory inside the workspace in restricted sessions. For real EXL GPU checks:

```powershell
$env:NOVERA_EXL3_TEST_MODEL = '<complete-EXL3-folder>'
$env:NOVERA_EXL2_TEST_MODEL = '<complete-EXL2-folder>'
& '<ExLlama-environment>/Scripts/python.exe' -m unittest discover -s transformers-server -p test_exllama_live.py
```

Reproduce the benchmark without network/model downloads:

```powershell
& '<ExLlama-environment>/Scripts/python.exe' scripts/benchmark-exllama.py --exl3 '<complete-EXL3-folder>' --exl2 '<complete-EXL2-folder>' --gguf '<Q4_K_M.gguf>' --llama-worker '<Novera-novera-llama-worker.exe>' --output .build/exllama/recheck --runs 5
```

From `web-app`, run `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false` and targeted ESLint on `src/services/transformers/engine.ts`, `src/lib/remoteModelCatalog.ts`, `src/lib/providerEndpoints.ts`, `src/containers/HubHardwareDiagnostic.tsx`.

## Limits

Local ExLlama supports text chat only in this integration. Complete Safetensors repository downloading, adapters, tools, structured output, multimodal input, CPU fallback, conversion and large-model/architecture coverage are not added here. The Windows/Python 3.12 setup is the validated stack; other platforms or versions require independent dependency/kernel validation. The optional TabbyAPI server may expose its own broader features, independently of the managed local adapter.

This report records source and Python runtime validation before source publication. No complete desktop rebuild, compiled UI approval or CI approval is claimed; source publication does not upgrade an installed binary. Existing unrelated work in the checkout is preserved.

Upstream references: [ExLlamaV3](https://github.com/turboderp-org/exllamav3), [ExLlamaV2](https://github.com/turboderp-org/exllamav2), [TabbyAPI](https://github.com/theroyallab/tabbyAPI).
