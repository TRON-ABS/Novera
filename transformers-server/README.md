# Safetensors CPU / CUDA engine

Novera's desktop sources now register a `transformers` local engine on Windows and Linux. It imports a complete local Hugging Face causal language model directory, starts a Python worker when selected for chat, streams text through the existing chat transport, and stops the worker on unload or app shutdown. The worker also exits when its parent dies. Rebuild the desktop app to expose this engine; existing executables do not gain it automatically.

## ModelOpt FP8 and NVFP4 LLMs

The 31 October 2026 source integration adds native CUDA matrix multiplication for **dense Llama, Qwen2 and Qwen3 causal text models** with complete local Safetensors exports. This is a dedicated Transformers loader, independent of the image NVFP4 path. The vLLM documentation provides the export-format taxonomy; Novera does not install or wrap vLLM here.

| Export | Accepted representation | Native execution gate |
| --- | --- | --- |
| ModelOpt `FP8` | E4M3FN weights, per-tensor `weight_scale`, optional scalar `input_scale`; otherwise dynamic tensor-wide activation scale | NVIDIA CUDA, compute capability ≥ 8.9 and an actual FP8 GEMM probe |
| ModelOpt `NVFP4` | U8 low-first FP4 weights, row-major E4M3 block-16 `weight_scale`, scalar `weight_scale_2` and `input_scale`; `group_size=16` | NVIDIA CUDA, compute capability ≥ 10.0, `comfy-kitchen` activation quantizer and an actual native FP4 GEMM probe |

Use `quantization_config` with `quant_method: "modelopt"`, or a local `hf_quant_config.json` containing the `quantization` object. Conflicting declarations fail. The architecture must explicitly match `LlamaForCausalLM`, `Qwen2ForCausalLM` or `Qwen3ForCausalLM`; every decoder projection and checkpoint tensor is checked. Only `lm_head` may be excluded. Tied embeddings require the duplicate `lm_head.weight` tensor to be omitted, as in standard Safetensors tied-weight exports.

NVFP4 matrices currently require input/output dimensions divisible by 128; FP8 requires dimensions divisible by 16. Native decode pads the token dimension where required. The loader creates an empty architecture, replaces the packed projections and validates the complete tensor inventory before loading persistent weights. Packed weights remain FP8/U8; the normal embeddings, norms, biases and LM head use BF16. NVFP4 nibble reordering and scale tiling do not create a BF16 weight cache. A loaded-model prefill and cached decode must traverse every packed projection before the worker becomes ready. CUDA dependency/kernel errors, unavailable GPU, insufficient free VRAM or invalid scales fail explicitly; there is no CPU, dequantized-weight or alternate-kernel fallback.

The Hub provides **FP8 · LLM** and **NVFP4 · LLM** format filters. ModelOpt sidecars and complete architecture metadata are read as bounded, public JSON at the repository's exact revision. Failed or inconsistent metadata stays unsupported. A ModelOpt runtime must report a successfully executed numerical kernel probe before the diagnostic can mark it checked. General `fp8` tags, image NVFP4 files or dependency presence alone do not establish LLM support.

Optional setup with the existing pinned base stack:

```powershell
./transformers-server/setup.ps1 -Backend cu130 -Environment .build/safetensors-llm-float -LlmFloat
```

Select that interpreter in the Safetensors provider. For an existing matching CUDA base environment, install `requirements-llm-float.txt` with `requirements.txt` as constraints. The tested Windows environment is Python 3.15.1, PyTorch 2.14.1+cu130, Transformers 5.20.2, Safetensors 0.8.0, Accelerate 1.15.0 and comfy-kitchen 0.2.35, on an RTX 5070 Laptop (SM120). Other GPUs meeting the capability threshold must still pass their own kernel probe.

Explicitly outside this loader: block-scaled/fine-grained FP8, E4M3FNUZ, compressed-tensors formats, mixed precision, MXFP4/MXFP8, W4A16 emulation, quantized KV caches, MoE/hybrid/multimodal architectures, custom repository code and LoRA on these packed bases. Invalid or unsupported exports remain refused. No conversion of ordinary user models or model-weight download is automatic.

Real tests use offline, untrained two-layer fixtures: six family/format combinations, a tied-embedding Qwen3 case, per-layer numeric references, JSON/SSE subprocess requests and native Tauri lifecycle checks. They establish integration and kernel execution, not trained-model quality or a speed advantage. Activation quantization changes logits relative to a decoded-weight-only BF16 baseline; that observation is retained separately from matching-quantization numeric comparisons. [Measured results, commands and remaining limits](../deliverables/llm-float-2026-10-31/validation.md).

References: [vLLM quantization](https://docs.vllm.ai/en/latest/features/quantization/), [ModelOpt checkpoint layouts](https://docs.vllm.ai/en/latest/features/quantization/modelopt/), [NVIDIA NVFP4 packing and scales](https://github.com/NVIDIA/Model-Optimizer/blob/main/modelopt/torch/quantization/qtensor/nvfp4_tensor.py).

## Quantized Safetensors — source integration, 29 October 2026

Complete local pre-quantized checkpoints now have explicit import, worker and Hub paths for:

| Method | Accepted layouts | Execution |
| --- | --- | --- |
| AWQ | 4-bit, unfused GEMM | GPTQModel via Transformers, reference PyTorch CUDA kernel |
| GPTQ | 2/3/4/8-bit configuration; `gptq`/`gptq_v2` checkpoint formats | GPTQModel + Optimum via Transformers, reference PyTorch CUDA kernel |
| bitsandbytes | 4-bit NF4/FP4 or 8-bit; exactly one mode | bitsandbytes via Transformers, CUDA |

The initial integration deliberately requires **NVIDIA CUDA**, with no CPU/disk offload and no silent full-precision fallback. It loads packed weights directly with a fixed CUDA device map, never moves the quantized model using `.to()`, and keeps Torch compilation disabled for the reference kernels on Windows/Python 3.15. It does not quantize ordinary user models automatically. Unknown/malformed quantizations, conflicting bitsandbytes flags, AWQ GEMV/fused layouts and legacy Marlin GPTQ checkpoint formats remain unsupported.

Optional setup in a separate environment:

```powershell
# bitsandbytes 4/8-bit
./transformers-server/setup.ps1 -Backend cu130 -Environment .build/safetensors-quantized -Quantized
# AWQ/GPTQ plus bitsandbytes
./transformers-server/setup.ps1 -Backend cu130 -Environment .build/safetensors-quantized -Gptq
```

The base requirements remain constraints, preventing an implicit replacement of the pinned PyTorch/Transformers stack. With Transformers 5.20.2, AWQ uses **GPTQModel**, not the old AutoAWQ installer that changes Transformers versions. GPTQModel dependencies may need MSVC/CMake/CUDA-compatible build tools or matching wheels. On French Windows, the local Python 3.15 PCRE2 dependency build required disabling Python UTF-8 mode for that build so Visual Studio detection could decode its output. Do not change global Python packages to work around a failed optional installation.

`--probe` reports each loader separately as available/unavailable with a diagnostic reason. Availability proves dependency import and CUDA detection, not every model architecture or kernel. The Hub keeps an unverified loader in runtime-check state. Quantized models cannot pass memory checks by borrowing the full-precision CPU fallback: packed shard bytes, FP16 context cache where known, runtime allowance and a 1 GiB free-VRAM reserve are counted before allocation. Actual peak usage remains model-dependent. Loader banners go to stderr so the probe/worker stdout stays JSON.

The same `quantization-cases.json` contract is tested by Python, the Hub and native Rust import validation. CUDA tests create tiny **untrained** Llama fixtures entirely offline, quantize/save/reload them and generate a few tokens. They validate loading and execution, not conversational quality, speed on useful models or all bit widths.

```powershell
$env:NOVERA_TEST_QUANTIZED_CUDA='1' # bitsandbytes 4/8-bit
$env:NOVERA_TEST_GPTQ_CUDA='1'      # AWQ/GPTQ 4-bit round trips
& '<quantized-environment>/Scripts/python.exe' transformers-server/test_quantization.py
```

Rebuild Novera to include the updated embedded worker and native import checks; existing binaries do not gain these changes automatically.

## Python 3.15.1

On Windows, run `powershell -File transformers-server/setup.ps1 -Backend cpu` for CPU, or `powershell -File transformers-server/setup.ps1 -Backend cu130` for NVIDIA CUDA 13.0. The script uses the installed Python 3.15.1 and creates an isolated environment, preserving the global installation. PyTorch wheels come from the official CPU/CUDA indexes. Versions: Python **3.15.1**, PyTorch **2.14.1** (CPU or CUDA build), Transformers **5.20.2**, Safetensors **0.8.0**. Version 2.14.1 is the latest stable release verified on 26 October 2026; 2.15 is still a release candidate. See [engine tracking](../docs/SUIVI_MOTEURS.md) for validation results and sources.

On Linux, create a Python 3.15.1 virtual environment, install `torch==2.14.1` from `https://download.pytorch.org/whl/cpu` or `https://download.pytorch.org/whl/cu130`, then install `transformers-server/requirements.txt`. Linux is a source target; runtime validation is performed on Windows only. Optional installer indexes `cu126` and `cu132` require suitable hardware/drivers and are not validated here.

In Novera, open Settings → Model Providers → **Safetensors / Transformers**, activate it, and set **Python** to the environment's `Scripts/python.exe` (Windows) or `bin/python` (Linux). Select **CPU / GPU**: Auto chooses CUDA if available, CPU otherwise; CPU forces CPU; CUDA fails explicitly if unavailable. A CUDA PyTorch build can also run on CPU; a CPU-only build cannot use CUDA. Stop/reload a loaded model after changing these settings. Click **Import** and select the full model folder, then select the model in chat. One model is loaded at a time. Removing an import preserves the original folder.

The folder must contain `config.json`, tokenizer files, and either `model.safetensors` or a complete `model.safetensors.index.json` with its shards. Loading stays offline, uses `use_safetensors=True` and `trust_remote_code=False`, and accepts only architectures built into Transformers for causal text generation. Safetensors is a container, not a guarantee that every architecture or quantization is supported.

The unquantized engine runs on CPU or NVIDIA CUDA. GPU loading preserves the declared dtype; CPU uses float32. Models must fit device memory; there is no CPU/GPU layer offload. Tools, images, audio, embeddings, adapters alone, MLX/other unsupported quantizations, structured output and custom stop sequences are not supported. AMD ROCm, Intel XPU and Apple MPS are outside this validated integration. Supported controls: temperature, top-p and output-token cap. Context is bounded by the model's limit. Models without a chat template use a role-labelled text prompt.

Python 3.15.1/Windows requires inference on the main thread and sequential weight loading in the tested stack. HTTP and cancellation run on separate threads; torch operations are queued to the main thread. The worker listens only on `127.0.0.1` with a random per-session bearer key. Python and model errors are surfaced through Novera; worker startup has a 300-second deadline and a diagnostic log under the data folder's `transformers/worker.log`.

## Tiny offline test model

```powershell
& '<environment>/Scripts/python.exe' transformers-server/create_tiny_model.py .build/tiny-safetensors
& '<environment>/Scripts/python.exe' transformers-server/test_server.py
```

The fixture is a deterministic, untrained GPT-2 architecture with a 32-token vocabulary, two 16-dimensional layers and a 128-token context. Its weights occupy only tens of KiB. It tests real loading and generation, including a sharded variant, without downloading any model. It is not a useful conversational model. Its random outputs are expected.

The tests cover normal and streaming completion, token usage, authentication, invalid model/input/context, device selection, cancellation, missing/external shards and worker startup. Set `NOVERA_SAFETENSORS_DEVICE=cuda` and run with the CUDA environment to validate GPU generation, parameter placement and memory allocation. PyTorch itself is substantially larger than the fixture. Inference uses eager mode; `torch.compile` is unsupported under Python 3.15 in this release.


## EXL3 first, EXL2 second — NVIDIA execution

The local Safetensors engine now detects `quantization_config.quant_method` in `config.json` and selects **ExLlamaV3 for EXL3**, **ExLlamaV2 for EXL2**, or Transformers for the previously supported layouts. It never silently changes quantization or falls back to CPU. EXL3 requires NVIDIA compute capability >= 8.0 in this integration; EXL2 >= 7.5. Weights and FP16 KV cache must fit free GPU memory with the existing 1 GiB reserve. Each loader still determines architecture support.

Use a separate **Windows x64 / Python 3.12** environment for the tested wheel stack, leaving the Python 3.15 Transformers environment in place:

```powershell
powershell -NoProfile -File transformers-server/setup-exllama.ps1 -Python '<Python-3.12>/python.exe'
# Add -TabbyAPI to retrieve the separately pinned official API server.
```

The installer pins torch 2.9.0+cu128, ExLlamaV3 1.6.5, ExLlamaV2 0.3.2, Transformers 4.57.1 and triton-windows 3.5.1.post24. Official ExLlama wheels match Python, torch and CUDA. It checks CUDA and both loader imports before reporting success. In Novera, select **Safetensors / Transformers / ExLlama**, set **Python** to the installer output, choose Auto/CUDA and import the complete local checkpoint folder. Change back to the original interpreter for its existing optional loaders.

EXL checkpoints may use arbitrary `*.safetensors` names such as `output.safetensors`. Config, tokenizer and every local shard/index are checked. The Hub has EXL3/EXL2 filters and identifies their loader separately. Complete-repository Safetensors downloading remains separate work; import the full downloaded folder rather than one weights file.

The managed local path reuses authenticated loopback HTTP, streaming, per-request cancellation, busy rejection, unload and process supervision. On Windows the worker also watches the venv launcher so unloading cannot leave its real interpreter holding GPU weights. Removing an import preserves the checkpoint directory. This first integration supports text, temperature, top-p and token limits; it adds no tools, multimodal input, adapters, conversion or speculative decoding to that path.

EXL2 uses explicit eager **CUDA** attention. In the pinned Torch 2.9 / RTX 5070 stack, the SDPA path gave incorrect Qwen2 results while this path gave the correct result with identical weights and token IDs. This is not CPU fallback; another kernel path needs separate validation.

### Optional TabbyAPI

TabbyAPI is installed and managed separately, not bundled. The tested official revision is `b1c225394d0fb45e8d26bddec344318dfd85096e`. It uses ExLlamaV3; EXL2 stays on Novera's dedicated ExLlamaV2 loader. Install with `-TabbyAPI`, configure the upstream server's `config.yml`, and run its `main.py` with the isolated interpreter. Minimal local configuration:

```yaml
network:
  host: 127.0.0.1
  port: 5000
  disable_auth: false
  allowed_origins: []
logging:
  log_auth_keys: false
model:
  model_dir: C:/models
  model_name: my-exl3-folder
  backend: exllamav3
  cache_size: 2048
  max_seq_len: 2048
  cache_mode: FP16
```

Activate Novera's opt-in **TabbyAPI** provider, use `http://127.0.0.1:5000/v1` (editable for an existing server), and enter the ordinary API key from its `api_tokens.yml`. Refresh models to list `/v1/models`. The existing OpenAI-compatible transport handles chat. Novera does not start, stop or change the model of an independently managed TabbyAPI server; automatic unload applies to the directly managed local path above.

### Actual RTX 5070 comparison

Qwen2.5-0.5B-Instruct, context 2,048, 128 generated tokens, greedy, FP16 KV and no draft: five warmed long-input runs gave median decode rates of **GGUF Q4_K_M 402.7 tokens/s**, **EXL3 4 bpw 312.5**, **EXL2 4 bpw 146.9**. No speed benefit over GGUF was demonstrated on this small model and stack. Publishers, head precision and calibration differ, so these are not identical-quality quantizations. One EXL3 arithmetic smoke answer was wrong; two prompts are not a quality benchmark.

[Full validation and commands](../deliverables/exllama-2026-10-30/validation.md), [raw measurements](../deliverables/exllama-2026-10-30/benchmark.json), [checkpoint hashes](../deliverables/exllama-2026-10-30/model-manifest.json). Both loaders passed real GPU streaming, authentication, busy rejection, targeted cancellation, recovery and process-tree shutdown. TabbyAPI listing and authenticated SSE generation passed separately. The desktop binary/UI was not rebuilt or visually validated.

Upstream: [ExLlamaV3](https://github.com/turboderp-org/exllamav3), [ExLlamaV2](https://github.com/turboderp-org/exllamav2), [TabbyAPI](https://github.com/theroyallab/tabbyAPI).


## Local LoRA / PEFT adapters

Install the optional loader in the Python environment selected in Novera:

```powershell
./transformers-server/setup.ps1 -Peft
# Or, for an existing environment:
python -m pip install -r transformers-server/requirements-peft.txt -c transformers-server/requirements.txt
```

In the Safetensors provider import dialog, choose the **complete base model folder**, enable **Attach a LoRA / PEFT adapter**, and select its separate folder containing `adapter_config.json` and `adapter_model.safetensors`. Give the pair its own model name. The registry preserves both local paths; loading the pair loads the base tokenizer/model then attaches the adapter for inference. Removing the registry entry preserves both folders.

Only `LORA` with `CAUSAL_LM` and an **unquantized Transformers base** is supported by this path. GGUF, MLX, ExLlama, AWQ, GPTQ and bitsandbytes adapter combinations are not supported here. The adapter must identify the selected absolute local base path, or its `base_model_name_or_path` must exactly match `_name_or_path` in the base configuration. Missing identity, mismatches, revision-pinned adapters without verifiable provenance, and tokenizer overrides are rejected. Matching metadata is a compatibility check, not cryptographic proof of checkpoint provenance. PEFT checks target modules/shapes at load time; missing or unexpected adapter tensors also fail loading.

The import dialog displays a conservative **CPU estimate at 2,048 tokens**, capped by the base context limit. It counts tensor shapes and dtypes from all base shards and the adapter, with at least FP32 resident floating-point storage, plus cache and runtime overhead. Disk size includes both weights. The worker recalculates memory for the requested context before allocating the base and exposes the breakdown in `/health` and the desktop session `memory` field. It rejects insufficient free RAM (512 MiB reserve) or VRAM (1 GiB reserve). This is an estimate, not a measured peak or a guarantee that every allocation will fit. No adapter is merged into or written over the base.

An adapter alone is rejected as a complete local model and is not advertised as independently runnable in the Hub. No model downloads or repository Python code are permitted during loading. Loader integration follows the [PEFT model API](https://huggingface.co/docs/peft/package_reference/peft_model).

Offline regression checks, including real tiny-model CPU generation and an adapter-on/off output comparison:

```powershell
$env:NOVERA_TEST_PEFT = '1'
python -m unittest discover -s transformers-server -p test_peft.py
```
