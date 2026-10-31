# fix(engines): add ONNX and native FP8/NVFP4 LLM support

ONNX exports lacked a managed runtime, while native NVFP4 support covered images rather than LLMs. This publication adds compatible local ONNX inference and dedicated ModelOpt FP8/NVFP4 causal-language-model execution, with matching Hub filters and diagnostics.

## Behavior

- Import complete ONNX folders, execute numeric/bool JSON tensors or prepared text GenAI exports, and reuse authenticated streaming, cancellation and lifecycle supervision. Arbitrary ONNX bundle downloads and task-specific preprocessing are not automated.
- Validate dense Llama/Qwen2/Qwen3 ModelOpt per-tensor FP8 or block-16 NVFP4 configuration, architecture, tensor inventory and scale layout. Require supported CUDA hardware, numerical prefill/decode kernel probes and actual model warmup. Keep projections packed; reject unsupported layouts and CPU fallback.
- Associate a separate local LoRA/PEFT adapter with a complete unquantized causal Transformers base, validate identity/tensors and estimate cumulative memory. Adapter-only checkpoints are not runnable models.
- Rank newer releases first within the same hardware-fit tier. Preserve installed selections.
- Link the existing Windows Common-Controls v6 resources into Tauri library tests, fixing the DLL startup failure; update two stale test fixtures.
- Update English/French repository showcases, engine tracking and TokenEconomizer observations. Complete the eight new PEFT strings in all 80 locales and refresh coverage to 2,412 keys per locale.

## Validation

Local results: **1,154 Tauri tests passed, 0 failed, 2 optional ignored**; actual ONNX, FP8 and sharded NVFP4 native lifecycles passed separately. **220 web tests**, TypeScript, architecture checks and targeted lint passed. FP8/NVFP4 Python suites: **33 passed, 9 optional skipped**. ONNX: **9 Python tests passed**. Six synthetic family/format combinations plus tied Qwen3 generated on RTX 5070 Laptop / SM120. These fixtures do not establish trained-model quality or speed improvements.

Localization structure check: 80 locales, 2,412 English keys, no errors. New translations use machine-assisted drafts plus targeted corrections; native editorial review is not claimed.

Commands, environments and measured limitations:

- [ONNX validation](deliverables/onnx-2026-10-31/validation.md), [runtime setup](onnx-server/README.md).
- [FP8/NVFP4 validation](deliverables/llm-float-2026-10-31/validation.md), [CUDA evidence](deliverables/llm-float-2026-10-31/cuda-report.json), [kernel probe](deliverables/llm-float-2026-10-31/kernel-probe.json).
- [LoRA/PEFT validation](deliverables/lora-peft-2026-10-31/validation.md).
- [Windows test manifest validation](deliverables/tauri-windows-tests-2026-10-31/validation.md).
- [TokenEconomizer observations](docs/TOKENECONOMIZER.md).

## Publication and dependencies

The maintainer explicitly requested direct publication to `main`, the GitHub showcase and Markdown on 31 October 2026. Main and open PRs were checked; no equivalent pending PR was found. This coherent source publication builds on the published GGUF/ExLlama work and includes the overlapping ONNX, LoRA and Transformers contracts together. No issue is closed. Other local UI work remains outside this commit.

Validation is local, not CI approval or a public binary release. No Actions activation, model downloads or installed application update is included. FP8/NVFP4 currently excludes block FP8, compressed-tensors, mixed formats, MoE, multimodal models, quantized KV caches and packed-base adapters. Other GPUs/OSes, trained-checkpoint quality, large-context peak memory and packaging remain unvalidated.
