# Safetensors CPU / CUDA engine

Novera's desktop sources now register a `transformers` local engine on Windows and Linux. It imports a complete local Hugging Face causal language model directory, starts a Python worker when selected for chat, streams text through the existing chat transport, and stops the worker on unload or app shutdown. The worker also exits when its parent dies. Rebuild the desktop app to expose this engine; existing executables do not gain it automatically.

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

Python 3.15.1/Windows requires inference on the main thread and sequential weight loading in the tested stack. HTTP and cancellation run on separate threads; torch operations are queued to the main thread. The worker listens only on `127.0.0.1` with a random per-session bearer key. Python and model errors are surfaced through Novera; worker startup has a 120-second deadline and a diagnostic log under the data folder's `transformers/worker.log`.

## Tiny offline test model

```powershell
& '<environment>/Scripts/python.exe' transformers-server/create_tiny_model.py .build/tiny-safetensors
& '<environment>/Scripts/python.exe' transformers-server/test_server.py
```

The fixture is a deterministic, untrained GPT-2 architecture with a 32-token vocabulary, two 16-dimensional layers and a 128-token context. Its weights occupy only tens of KiB. It tests real loading and generation, including a sharded variant, without downloading any model. It is not a useful conversational model. Its random outputs are expected.

The tests cover normal and streaming completion, token usage, authentication, invalid model/input/context, device selection, cancellation, missing/external shards and worker startup. Set `NOVERA_SAFETENSORS_DEVICE=cuda` and run with the CUDA environment to validate GPU generation, parameter placement and memory allocation. PyTorch itself is substantially larger than the fixture. Inference uses eager mode; `torch.compile` is unsupported under Python 3.15 in this release.
