# fix(models): support split GGUF and ExLlama CUDA

Split-only GGUF repositories were excluded from discovery, and individual shards were renamed to `model.gguf`, preventing llama.cpp from finding their companions. EXL3 and EXL2 were rejected as unsupported Safetensors quantization. Both repository showcases now describe the implemented paths and their measured limitations.

## Resulting behavior

- Group each complete numbered GGUF series into one variant, display its summed size/file count, resolve every file at one repository revision, and require each size/SHA-256. Validate every GGUF split index/count before registering the first path and total weight. Explicit weight removal deletes the numbered series while preserving other variants.
- Route EXL3 to ExLlamaV3 and EXL2 to ExLlamaV2 through the managed local Safetensors lifecycle. Require CUDA, matching dependencies, complete local checkpoints and free VRAM; never convert or silently fall back to CPU. Reuse authenticated streaming, targeted cancellation, busy rejection, recovery and unload. Supervise the Windows venv launcher as well as the application parent.
- Provide a separately pinned Python 3.12 CUDA environment, EXL3/EXL2 Hub filters and loader diagnostics. Keep the existing Python 3.15 stack available. Add an opt-in editable TabbyAPI catalog/chat connection; independent servers retain their own lifecycle.
- Refresh the English/French README showcase and engine tracker with implementation status, reproducible evidence and the distinction between sources, runtime tests and an installed binary.

## Reproduction and evidence

1. Discover a repository containing `model-00001-of-00002.gguf` and `model-00002-of-00002.gguf`. It now appears once with two files and their total size. Missing/duplicate indices, missing hashes, failed verification or a corrupt later shard prevent registration. Two 250 GB shards report 500 GB without promising hardware compatibility.
2. Import a complete EXL3/EXL2 directory with `config.json`, tokenizer and `output.safetensors`, then select the isolated interpreter. The matching loader generates on CUDA. Authentication, streaming, occupied-model rejection, per-request cancellation, recovery and full process-tree shutdown passed real GPU tests for both layouts.
3. Connect the optional TabbyAPI provider to an authenticated loopback server. Real EXL3 model listing and SSE generation passed separately; provider catalog behavior is also covered by web tests.

Actual RTX 5070 Laptop result: Qwen2.5-0.5B-Instruct, context 2048, prompt 272 tokens, completion 128, five warmed serial runs. Median decode: GGUF Q4_K_M **402.7 tokens/s**, EXL3 4 bpw **312.5**, EXL2 4 bpw **146.9**. No speed improvement over GGUF is claimed. Publishers/head precision/calibration differ; EXL3 answered one arithmetic smoke prompt incorrectly. EXL2 uses explicit eager CUDA attention because the pinned SDPA path failed the same weight/token reproduction.

## Validation

Publication regression checks pass: **217 web tests in 10 files** and **97 llama.cpp extension tests**. Native isolated import/removal tests, Python regressions and real GPU/TabbyAPI checks are detailed in the reports below. Web TypeScript, architecture and static localization checks pass. Targeted ExLlama ESLint has no errors and two existing React refresh warnings. The llama.cpp extension's standalone TypeScript check retains its pre-existing `ModelConfig.n_gpu_layers` errors; no unrelated repair is included.

- [GGUF split validation and commands](deliverables/gguf-split-2026-10-30/validation.md)
- [ExLlama validation and commands](deliverables/exllama-2026-10-30/validation.md)
- [Raw benchmark](deliverables/exllama-2026-10-30/benchmark.json), [checkpoint hashes](deliverables/exllama-2026-10-30/model-manifest.json), [GPU HTTP lifecycle](deliverables/exllama-2026-10-30/live-contract.json), [TabbyAPI evidence](deliverables/exllama-2026-10-30/tabby-smoke.json)

## Publication and limits

Main and open pull requests were checked before publication; no equivalent pending PR was found. The maintainer requested direct publication to `main` and the repository showcase. No issue is closed. This builds on the already published quantized Safetensors/Hub work (`108e9281b`, `51bab0bbd`) and preserves the newer dashboard/media commits.

No full desktop rebuild, compiled UI review, CI approval or binary release is claimed. Complete Safetensors repository downloading, broad architecture/large-model validation and equal-quality benchmarking remain outside this change. Existing unrelated work is excluded from the publication commit.
