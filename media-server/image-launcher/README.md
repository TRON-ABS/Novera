# Local Windows CUDA 13.4.3 / Vulkan image launcher

This optional launcher runs two separately packaged stable-diffusion.cpp backends plus a CPU fallback. It is not a new Novera application build. It preserves model files, independent CPU encoder placement and the ordinary sd-cli argument interface.

## Preparation

Run from PowerShell 7 with MSVC 2022 x64 Build Tools, Git and NVIDIA CUDA Toolkit **13.4.3** (NVCC **13.4.92**) installed:

```powershell
./media-server/image-launcher/prepare.ps1
```

The script pins upstream stable-diffusion.cpp and GGML, compiles the CUDA engine for the architecture list in `toolchain.json`, verifies the official Vulkan/CPU release archive SHA-256 values, and copies the required local CUDA runtime/cuBLAS libraries and licenses. It creates an ignored local runtime folder under `.build/`; no model weights, global Python packages, system drivers or Windows settings are changed. No application build, upload or release is triggered. A fresh build across multiple GPU architectures can be lengthy. `-Jobs` bounds compiler concurrency; the default is four for machines with limited RAM.

Windows application builds stage this runtime under `resources/image-engine/` automatically. Novera always resolves the bundled launcher internally on Windows; no executable field is displayed, and old absolute executable paths saved in profiles are ignored. Keep diffusion, Qwen encoder and VAE fields separate. Choose **Auto** for GPU routing and **CPU** for Qwen when that is desired. The ordinary raw `sd-cli.exe` executables remain inside `cuda/`, `vulkan/` and `cpu/` for direct command-line testing.

## Device policy

- CUDA is selected only when the packaged CUDA 13.4 runtime can query a device with **SM 7.5 or newer**, the driver meets the runtime/PTX requirement, and the CUDA engine reports an available CUDA backend.
- Maxwell, Pascal and Volta cannot pass that CUDA gate. They use Vulkan when the installed driver exposes a Vulkan device; CPU remains available if no supported GPU backend is reported. This does not certify every older card or guarantee that a model fits its memory.
- Explicit CPU component assignments are retained. Other GPU components use the selected engine family; this launcher does not split one generation between CUDA and Vulkan runtimes. A forced Vulkan backend selects Vulkan; Auto favors an eligible CUDA device.
- The parent owns the renderer through a Windows Job Object. Killing the launcher closes the job and stops its child. A parent-process watcher also ends the launcher if its invoking application exits.
- Unicode paths/prompts and quoting are passed to `CreateProcessW` without a shell. Device probes have a timeout/output limit and do not load model weights.

```powershell
./.build/novera-image-cuda134/runtime/novera-image-engine.exe --novera-probe
```

The probe reports the selected family, GPU token and detected CUDA compute capabilities. A compatible NVIDIA GPU alone does not prove that arbitrary model operators/layouts are supported.

## Shared native image improvements (1.0.1)

The reviewed RealESRGAN_x2plus correction and guarded build provenance are shared with the Web native bridge. Start Desktop with `NOVERA_NATIVE_IMAGE_FAST=1` to opt in to the experimental image path. With a verified runtime, it can generate and enlarge in one process using flash attention without forced CPU offload or VAE tiling. The launcher reports `upscaler_backend: true` when it supports explicit upscaler placement. Explicit CPU assignments remain respected. Final dimensions are checked before publishing the output.

`prepare.ps1` now builds the corrected CUDA and portable CPU cores and writes a `BUILD-VERIFICATION.json` beside each runtime. `-SkipEngineBuild` requires a matching existing receipt. The portable core is also packaged with Vulkan, without requiring a CUDA driver. `build-launcher.ps1` builds the launcher and runs its policy checks using MSVC; its dynamic CUDA query ABI does not require the full CUDA compiler SDK.

Linux/macOS builders can use `python media-server/image-launcher/build-core.py --source <pinned-source> --build <separate-build-directory> --backend metal` (or `cpu`, `cuda`, `vulkan`) with their normal compiler and SDK. Package the resulting CLI, libraries and receipt together. Regenerate the receipt after stripping or signing nested binaries, before signing the outer application bundle. These platform procedures are prepared, but were not executed on Linux/macOS in the Windows validation session.

The local Rust benchmark measured 36.023 s for the previous pipeline and 31.572 s for combined native generation plus x2 (2048 × 880 to 4096 × 1760, four steps, seed 42, RTX 5070 Laptop). The comparison used the pipeline outside the Desktop GUI. The final PNGs differed by a mean of 7.35 RGB levels per channel on a 0–255 scale. Python was faster for the isolated x2 stage in that comparison.

## CUDA formats and scope

| Path | CUDA execution | Constraints |
| --- | --- | --- |
| Compatible diffusion GGUF and mixed GGUF/Safetensors components | Newly built stable-diffusion.cpp CUDA 13.4.3 | Model family/operators, driver and memory still matter. |
| Ordinary supported Safetensors diffusion components | C++ CUDA 13.4.3, or existing complete-folder Diffusers/PyTorch CUDA path | A container alone does not make an arbitrary checkpoint runnable. |
| Recognized Comfy FLUX.2 Klein 4B NVFP4 | Existing strict native PyTorch FP4 path on Blackwell | PyTorch currently uses its own pinned CUDA 13.0 runtime; it is not replaced with Toolkit 13.4 DLLs. The C++ compatibility bridge remains a separate BF16-cache/Q8_0 path. |
| Supported local video folders | Existing Diffusers/PyTorch CUDA path | GGUF video is not added by this image launcher. |

The launcher does not make FP4 arithmetic native on older GPUs. Its architecture policy and lifecycle tests can be checked with the supplied pure C++ policy test; real hardware evidence belongs in `docs/SUIVI_MOTEURS.md`. Compiled files, manifests, raw logs and model outputs remain local. The SDK's EULA and upstream MIT notices accompany the runtime; a future public binary distribution requires its own packaging/license validation.
