# Native FP8 / NVFP4 Safetensors LLMs — 31 October 2026

Local source integration in the existing checkout. No commit, push, CI approval, installed-application upgrade or public binary release is implied.

## Scope and design

The existing image NVFP4 route cannot load causal language models. Add a distinct packed linear loader under the managed Safetensors engine for dense `LlamaForCausalLM`, `Qwen2ForCausalLM` and `Qwen3ForCausalLM` exports with ModelOpt per-tensor FP8 or block-16 NVFP4 weights. vLLM's documentation supplies the format taxonomy; the implementation uses native PyTorch CUDA scaled matrix multiplication, not a vLLM server or an image pipeline.

The config policy is shared through **62 cases** exercised by Python, Rust and the Hub. Read inline ModelOpt metadata or `hf_quant_config.json`; reject conflicts, custom/multimodal/MoE layouts, block FP8, mixed precision and quantized KV caches. Accept only the documented packed shapes, scalar/block scales and dense module graph. Headers for all shards are validated before persistent weight loading. Scale values must be finite and positive. A loaded-model prefill and cached decode traverse all packed projections before readiness. Tied embeddings are tested without a duplicate LM-head tensor.

Each runtime probe performs numerical checks on native prefill and single-token decode GEMMs. The Hub requires `kernelValidated=true`, not just dependency presence. ModelOpt metadata discovery uses bounded public JSON from an exact repository revision; failures remain unsupported. FP8/NVFP4 LLM filters are separate from the image NVFP4 recommendation. CUDA availability, hardware capability, configured context, packed weight size and the existing 1 GiB VRAM reserve gate model loading. There is no silent CPU or BF16 weight-cache fallback.

## Real GPU evidence

Hardware: NVIDIA GeForce RTX 5070 Laptop GPU, SM120, 8,518,041,600 bytes total VRAM. Tested software: Python 3.15.1, PyTorch 2.14.1+cu130, Transformers 5.20.2, Safetensors 0.8.0, Accelerate 1.15.0, comfy-kitchen 0.2.35. No pretrained model weights were downloaded.

Independent offline fixture generation uses two-layer random dense decoders, 128 hidden dimensions, 256 intermediate dimensions, four attention/KV heads and 32 vocabulary entries. Each model has 14 packed projections. Their packed projection weights occupy **327,680 bytes in FP8** and **163,840 bytes in NVFP4**, excluding scales, normal BF16 tensors, cache and runtime. NVFP4 fixtures use two Safetensors shards. The generator writes ModelOpt low-first nibbles and row-major block scales independently from the runtime's high-first/tiled GEMM representation.

Standalone kernel relative errors against decoded input/weight products: FP8 **0.001668 / 0.001488**; NVFP4 **0.001649 / 0.001521**, for prefill/decode respectively. [Probe evidence](kernel-probe.json).

Model-level observations, with both weights and activations matched in the kernel reference:

| Family | Method | Generated tokens | Relative logit error vs matching quantization | Difference vs decoded-weight-only BF16 baseline |
| --- | --- | ---: | ---: | ---: |
| llama | modelopt-fp8 | 2 | 0.000000 | 0.041228 |
| llama | modelopt-nvfp4 | 2 | 0.000000 | 0.160694 |
| qwen2 | modelopt-fp8 | 4 | 0.000000 | 0.035815 |
| qwen2 | modelopt-nvfp4 | 4 | 0.000000 | 0.115229 |
| qwen3 | modelopt-fp8 | 4 | 0.007287 | 0.054015 |
| qwen3 | modelopt-nvfp4 | 2 | 0.000000 | 0.193007 |

[Raw model observations](cuda-report.json). The matching-quantization reference decodes the stored weights and quantized activations, then executes ordinary FP32 multiplication and BF16 output rounding. The separate decoded-weight-only baseline omits activation quantization; differences up to approximately 19.3% occur on these random fixtures. These metrics validate implementation parity, not model quality, semantic accuracy or degradation on useful models. No throughput advantage is claimed. Other eligible GPU families still require their own executed probe.

## Validation results

- **220 web tests passed in 8 files**: format/architecture taxonomy, kernel readiness, revision-pinned metadata and blocked failures, model service, Hub feeds/ranking, local engine and chat transport.
- **6 floating-point policy/CUDA tests passed**, including all six family/format generation cases, independent numeric references, tied Qwen3 embeddings, inline/sidecar metadata, wrong shapes/scales, CPU/old GPU rejection, missing-kernel and VRAM failures, and missing parameters.
- **1 real subprocess HTTP test passed for both formats**: authentication, JSON and SSE generation, unsupported request error/recovery, unrelated cancellation IDs and process-tree shutdown. The Windows venv launcher's child is awaited before test cleanup.
- **26 additional Python regressions passed, 9 optional tests skipped**: 10 existing base-server tests, 7 quantization policy tests (4 older CUDA integrations skipped), 6 ExLlama contract tests, 3 LoRA policies (5 optional LoRA runtime tests skipped). Total across the six Python files: **33 passed, 9 skipped**.
- Native ModelOpt import/probe/load/CUDA generation/unregister/weight-retention tests passed with actual Tauri for **both FP8 and sharded NVFP4**. The NVFP4 run also passed four policy/registry tests. Inspection normalizes the Windows root before checking sidecar containment; the retention test validates a complete folder rather than assuming a single `model.safetensors` file.
- **Complete Tauri library suite: 1,154 passed, 0 failed, 2 optional integrations ignored.** The floating-point native integrations were exercised explicitly above.
- Web TypeScript build check passed; architecture check: 28 files, 6 areas, no violations. Targeted ESLint has no errors. The extracted native import/ExLlama regression harness passed its 2 tests.

## Reproduction

Install the optional stack as described in the [engine guide](../../transformers-server/README.md#modelopt-fp8-and-nvfp4-llms). Substitute the Python executable for the environment being tested:

```powershell
$env:NOVERA_FLOAT_CUDA_TEST='1'
$env:NOVERA_FLOAT_TEST_REPORT='.build/llm-float/cuda-report.json'
& '<cuda-python>' -m unittest discover -s transformers-server -p test_float_quant.py -v
& '<cuda-python>' -m unittest discover -s transformers-server -p test_float_live.py -v
& '<cuda-python>' transformers-server/server.py --probe
& '<cuda-python>' transformers-server/create_float_fixture.py .build/llm-float/new-fp8 --method modelopt-fp8
& '<cuda-python>' transformers-server/create_float_fixture.py .build/llm-float/new-nvfp4 --method modelopt-nvfp4 --sharded
$env:NOVERA_SAFETENSORS_TEST_PYTHON='<absolute-cuda-python>'
$env:NOVERA_SAFETENSORS_TEST_DEVICE='cuda'
$env:NOVERA_SAFETENSORS_TEST_MODEL='<absolute-fixture-packed-directory>'
cargo test --manifest-path src-tauri/Cargo.toml --locked --lib core::transformers::tests -- --include-ignored --test-threads=1
cargo test --manifest-path src-tauri/Cargo.toml --locked --lib -- --test-threads=1
node web-app/node_modules/typescript/bin/tsc -b web-app --pretty false
node scripts/check-architecture.mjs
```

Local logs and generated model/environment data remain under ignored `.build/llm-float/`. No user model is converted or overwritten. Native tests and HTTP tests require local socket access outside this sandbox's default networking restriction.

## Remaining limits

Only Windows/SM120 was executed. No trained checkpoint evaluation, quality/throughput benchmark, realistic large-context peak measurement, Linux/macOS execution, FP8 block formats, compressed-tensors, MoE, hybrid/VLM, quantized KV cache, packed LoRA, CPU emulation or automatic user-model quantization is validated. Full native BF16 application packaging/interactive UI was not rebuilt or exercised for this source change. The CUDA dependency requirements and native probes are independent of the existing image NVFP4 route.

References: [vLLM quantization matrix](https://docs.vllm.ai/en/latest/features/quantization/), [vLLM ModelOpt formats](https://docs.vllm.ai/en/latest/features/quantization/modelopt/), [NVIDIA ModelOpt NVFP4 specification/implementation](https://github.com/NVIDIA/Model-Optimizer/blob/main/modelopt/torch/quantization/qtensor/nvfp4_tensor.py).
