# Offline FLUX.2 Klein 4B configuration

These small JSON configurations originate from [Black Forest Labs FLUX.2 Klein 4B](https://huggingface.co/black-forest-labs/FLUX.2-klein-4B/tree/main), retrieved 2026-10-26. Black Forest Labs and the original component authors retain their rights; the upstream Apache 2.0 license is preserved in LICENSE. No model weights or tokenizer vocabulary are shipped here. Local path/version bookkeeping fields were removed; architecture values are preserved.

They define the 4B transformer, FLUX.2 VAE and flow-matching scheduler used by the native CUDA worker. The bundled stable-diffusion.cpp core reads the selected Qwen3-4B GGUF directly. Activation quantization uses the standalone Apache-2.0 `comfy-kitchen` package. [NVFP4 weight format](https://github.com/Comfy-Org/comfy-quants/blob/main/docs/formats/nvfp4.md)
