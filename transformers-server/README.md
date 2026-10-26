# Safetensors CPU / CUDA engine

Novera's desktop sources now register a `transformers` local engine on Windows and Linux. It imports a complete local Hugging Face causal language model directory, starts a Python worker when selected for chat, streams text through the existing chat transport, and stops the worker on unload or app shutdown. The worker also exits when its parent dies. Rebuild the desktop app to expose this engine; existing executables do not gain it automatically.

## Python 3.15.1

On Windows, run `powershell -File transformers-server/setup.ps1 -Backend cpu` for CPU, or `powershell -File transformers-server/setup.ps1 -Backend cu130` for NVIDIA CUDA 13.0. The script uses the installed Python 3.15.1 and creates an isolated environment, preserving the global installation. PyTorch wheels come from the official CPU/CUDA indexes. Versions: Python **3.15.1**, PyTorch **2.14.1** (CPU or CUDA build), Transformers **5.20.2**, Safetensors **0.8.0**. Version 2.14.1 is the latest stable release verified on 26 October 2026; 2.15 is still a release candidate. See [engine tracking](../docs/SUIVI_MOTEURS.md) for validation results and sources.

On Linux, create a Python 3.15.1 virtual environment, install `torch==2.14.1` from `https://download.pytorch.org/whl/cpu` or `https://download.pytorch.org/whl/cu130`, then install `transformers-server/requirements.txt`. Linux is a source target; runtime validation is performed on Windows only. Optional installer indexes `cu126` and `cu132` require suitable hardware/drivers and are not validated here.

In Novera, open Settings → Model Providers → **Safetensors / Transformers**, activate it, and set **Python** to the environment's `Scripts/python.exe` (Windows) or `bin/python` (Linux). Select **CPU / GPU**: Auto chooses CUDA if available, CPU otherwise; CPU forces CPU; CUDA fails explicitly if unavailable. A CUDA PyTorch build can also run on CPU; a CPU-only build cannot use CUDA. Stop/reload a loaded model after changing these settings. Click **Import** and select the full model folder, then select the model in chat. One model is loaded at a time. Removing an import preserves the original folder.

The folder must contain `config.json`, tokenizer files, and either `model.safetensors` or a complete `model.safetensors.index.json` with its shards. Loading stays offline, uses `use_safetensors=True` and `trust_remote_code=False`, and accepts only architectures built into Transformers for causal text generation. Safetensors is a container, not a guarantee that every architecture or quantization is supported.

The engine runs on CPU or NVIDIA CUDA. GPU loading preserves the declared dtype; CPU uses float32. Models must fit device memory; there is no CPU/GPU layer offload. Tools, images, audio, embeddings, adapters alone, AWQ/GPTQ/MLX quantizations, structured output and custom stop sequences are not supported. AMD ROCm, Intel XPU and Apple MPS are outside this validated integration. Supported controls: temperature, top-p and output-token cap. Context is bounded by the model's limit. Models without a chat template use a role-labelled text prompt.

Python 3.15.1/Windows requires inference on the main thread and sequential weight loading in the tested stack. HTTP and cancellation run on separate threads; torch operations are queued to the main thread. The worker listens only on `127.0.0.1` with a random per-session bearer key. Python and model errors are surfaced through Novera; worker startup has a 120-second deadline and a diagnostic log under the data folder's `transformers/worker.log`.

## Tiny offline test model

```powershell
& '<environment>/Scripts/python.exe' transformers-server/create_tiny_model.py .build/tiny-safetensors
& '<environment>/Scripts/python.exe' transformers-server/test_server.py
```

The fixture is a deterministic, untrained GPT-2 architecture with a 32-token vocabulary, two 16-dimensional layers and a 128-token context. Its weights occupy only tens of KiB. It tests real loading and generation, including a sharded variant, without downloading any model. It is not a useful conversational model. Its random outputs are expected.

The tests cover normal and streaming completion, token usage, authentication, invalid model/input/context, device selection, cancellation, missing/external shards and worker startup. Set `NOVERA_SAFETENSORS_DEVICE=cuda` and run with the CUDA environment to validate GPU generation, parameter placement and memory allocation. PyTorch itself is substantially larger than the fixture. Inference uses eager mode; `torch.compile` is unsupported under Python 3.15 in this release.
