# Experimental port for Novera's local media models

This target investigates the **same model bundles used by Desktop**: FLUX.2 Klein 4B with Qwen3 and FLUX.2 VAE, and Wan2.1 T2V 1.3B with UMT5 and Wan VAE. It does not substitute SD1.5, a hosted API, or a converted music package. ACE-Step's existing GGUF runtime needs its own port; this target does not implement music.

Image dimensions and steps are now passed through from the Web composer (64–2048 pixels, multiples of 16), with a bounded explicit GPU budget. The pinned WebGPU device memory query returns the single-buffer limit rather than physical VRAM; the guarded capacity patch treats physical memory as unknown while retaining the requested computation budget. Image Flash Attention is enabled. An actual 2048 × 880, four-step Web UI run completed in 449 seconds, including 322 seconds diffusion and 117 seconds image decoding. This establishes a real full-resolution output, **not Desktop performance parity**.

`--image-vae-matmul-probe` builds an optional 512-pixel tiled image VAE matrix-multiplication experiment. It is off by default; benchmark the same seed/prompt/resolution before promoting it. Tiling can change pixels.

The full-resolution probe took 365 seconds, with 32.1 seconds decoding, but produced a PNG whose channels were all exactly 255. **Reject this result**: it is faster but invalid. Keep the normal direct-convolution path. `--heap-probe` enables allocator and stack diagnostics for investigating the separate upscaler failure; diagnostic builds are not performance references.

The later range-scaled probe (power-of-two input/output compensation, no activation clipping) matches the small direct reference within one 8-bit channel level, but still produces stripes and a color veil at 2048 × 880 in 366 seconds. **It remains disabled by default.** Reject non-finite decoded pixels before PNG conversion; finite output alone still does not certify rendering quality. The final normal-build integrated 2048 × 880 plus x2 run passed in 483 seconds and reproduced the valid 4096 × 1760 PNG byte-for-byte.

The experimental ×2 path accepts only the hash-verified official Desktop RealESRGAN_x2plus weights. The topology patch implements the official [BasicSR x2 layout](https://github.com/XPixelGroup/BasicSR/blob/v1.4.2/basicsr/archs/rrdbnet_arch.py), retaining both learned upsampling blocks after pixel unshuffle. Run `python scripts/browser-media/check-esrgan-x2-layout.py --source <patched-sdcpp>/src/model/upscaler/esrgan.hpp --cxx <GNU-compatible-compiler>` with the Desktop upscaler Python environment to compare the compiled C++ loop with PyTorch. Six exact comparisons passed.

The initial upscaler failed with memory corruption. A guarded diagnostic identified a 64-KiB stack overflow; the main module now has an 8-MiB guarded stack. Implement F32 Leaky-ReLU on WebGPU so ESRGAN's in-place activations do not fall back to CPU on GPU-owned buffers. Six real GPU/CPU comparisons have identical finite values, including offset/strided views, in-place operations, odd lengths, different slopes and values beyond F16 range; all twelve existing IM2COL comparisons still pass byte-for-byte.

The actual packaged worker enlarged 256 × 256 to 512 × 512 in 3.435 seconds, and the genuine 2048 × 880 landscape to 4096 × 1760 in 31.889 seconds. These are standalone upscaling stages, not combined FLUX-generation times. Comparing the small output with the actual Desktop Python upscaler gives mean absolute RGB channel error 0.357/255 (95th percentile 1, maximum 26); Web F16 weights and tile blending differ from Desktop F32 and padded/cropped tiles. Run `node scripts/browser-media/create-upscale-probe.mjs web-app/dist <build>` after the opt-in production build to create local file-picker diagnostics at `/upscale-probe.html` and `/numerical-probe.html`. They are omitted from normal builds.

Keep 128-pixel x2 tiles in the normal worker. Larger explicit diagnostic tiles reduce the isolated time to about 26 seconds but change the rendering; 512 visibly reduces warm colors. The tile helper validates explicit probes against the GPU budget and single-buffer limit, without silently increasing the normal tile size.

`python scripts/browser-media/test_build.py` passes seven offline checks for repeat/resumed source patch chains, tampering, unknown edits, noncontiguous guards and traversal. Repeated builds accept only whole-file digests already recorded in the reviewed contiguous chain.

The source archive digests and Emscripten release are pinned in `sources.json`. Upstream sd.cpp exposes image and video generation; its GGML WebGPU backend has Emscripten support. That is a starting point, **not proof that all operations and model quantizations work in a browser**.

Install and activate Emscripten **7.0.0** in a local SDK directory using the [official SDK instructions](https://emscripten.org/docs/getting_started/downloads.html). CMake and Ninja must also be available. No global environment changes are required. From the Novera root:

```powershell
python scripts/browser-media/build.py --emsdk C:/path/to/emsdk --cmake C:/path/to/cmake.exe --ninja C:/path/to/ninja.exe
```

The helper verifies source archives before extracting them into `.build/browser-media`, builds the dedicated target with two workers, and writes hashes plus `modelInferenceValidated: false`. It neither publishes assets nor alters the native Desktop release. Existing nonmatching cache contents are preserved and rejected rather than overwritten.

The binding owns a single context and its result buffers. FLUX uses `generate_image`; Wan uses `generate_video`, including one-frame work. The worker caller must mount the selected model files into the virtual filesystem, await JSPI generation, copy the result pixels before releasing them, encode valid PNG/WebM output, and terminate/release the worker on cancellation. Memory64 is used because the complete model bundles exceed a 32-bit heap's practical budget. Actual browser support, GPU limits and peak memory must be measured.

Do not enable this runtime in the normal Web UI until the build and exact-model image/video tests pass. A successful compile alone does not validate inference, interruption, output encoding, file retention or acceptable performance. Keep upstream and model licenses with any distributed runtime; generated binaries stay out of source commits.

The dedicated `novera-browser-media.yml` workflow builds an experimental artifact with upstream licenses and a verification receipt. It does not deploy the Web app or change a Desktop update feed.

The Web Pages workflow builds a separate Wan binary with `--kernel-tuning --wan-tuning` and stages the linked `/Novera/web/video-performance/` page. The public page defaults to profile 12742898, the 512 × 224 Desktop preset at 16 FPS, Flash Attention, separate CFG passes and 4 GiB. Users select the original three Wan components locally and can export the WebM and its measurement report. The image composer uses its own binary with profile 143602.

## Browser findings, November 7, 2026

An actual Edge test on an RTX 5070 Laptop generated the same FLUX.2 Klein Q4 bundle at 256 × 256, four steps. The first compatibility fallback used CPU VAE decoding: 207.88 seconds for decoding and 237.87 seconds inside generation. A second test completed the full file-load/generation/PNG path in **31.768 seconds**, with **2.77 seconds** for VAE decoding. This small test does not establish larger-image, music or video performance.

Digest-checked source patches cover threadless loading, affine buffer ownership and WebGPU 3D convolution preparation. The loader must not construct a native thread in a threadless Emscripten build. CPU normalization or 3D convolution fallback must not leave an in-place CPU result buffer for a following GPU affine operation; that produced a trap in `wgpuBufferAddRef`. Native execution retains its existing behavior.

The default experimental binding now uses WebGPU VAE convolution with that buffer-ownership correction. `--gpu-vae-probe` enables per-node diagnostics; `--cpu-vae-fallback` retains the slower diagnostic fallback. Compilation receipts deliberately keep `modelInferenceValidated: false`: browser inference evidence belongs to a separate observed test, not the compiler.

To include the reviewed runtime in a local preview build, set `VITE_NOVERA_WEB_LOCAL_MEDIA=true` and `NOVERA_BROWSER_MEDIA_BUILD` to the absolute build directory, then run `corepack yarn build:web:browser`. The Vite plugin checks artifact bytes against their build receipt and includes both upstream licenses. Select the three files in Novera's creation settings; they stay on the device for that session. Image output uses the usual conversation player, durable media store and download control. The corrected GPU integration completed in **32.7 seconds displayed by Novera**, retained the image after reload and exported the PNG. Both the fast result and the slower fallback have qualified provenance in `examples/media/novera-web-flux`.

## Wan video findings

The added `IM2COL_3D` GPU operation avoids repeated CPU/GPU transfers during Wan VAE decoding. Twelve comparisons against the actual GGML CPU implementation produced byte-identical F16/F32 outputs, covering padding, dilation, batches, strides, non-contiguous offset views and odd F16 output lengths. Compile the separate reference module with `--numerical-checks`; run its `novera_check_im2col` export in a browser worker. Compilation alone does not pass these tests.

A five-frame, 256 × 144, four-step compatibility clip at 8 FPS took **65.102 seconds** with CPU convolution preparation and **32.046 seconds** with GPU preparation, including loading and encoding. The two WebM files were byte-identical; VAE decoding fell from 31.33 to 1.72 seconds. This is only 0.625 seconds of video and does not establish useful final quality or Desktop parity.

A larger 17-frame, 20-step test took **91.273 seconds** and had poor visual quality at the same low resolution. A native reference reproduced poor low-resolution output; a separate native 832 × 480, 30-step reference produced a recognizable scene but took **138.823 seconds**. These native tests use the Desktop engine, not the Desktop UI, and its source revision differs from this browser port. The 480p browser quality check remains separate and unfinished.

New video requests default to CFG 6 and flow shift 3; `novera_configure_video` can set bounded explicit values before generation. Earlier compatibility measurements used CFG 7 and the model's automatic shift 5. Do not compare them as identical settings. Wan uses the regular convolution path so unsupported direct 3D convolution does not force CPU fallback. The normal Novera browser UI still enables local images only; this port does not claim integrated local video readiness.

The separate local benchmark can be created with `node scripts/browser-media/create-video-probe.mjs web-app/dist <verified-build-directory>`. It is not part of a normal build or the conversation flow. It accepts the original three Wan files and two fixed test presets, releases the worker on completion/error/cancellation, and exports the measured records separately from the encoded video. All controls are experimental; no paid API is used.

At 832 × 480, five frames, eight FPS, 20 steps, CFG 6, shift 3 and seed 42, a real Edge run took **320.056 s total**, including 313.470 s generation, 18.12 s text encoding, 249.32 s diffusion and 46.00 s VAE decoding. The 0.625-second WebM was byte-identical to the previous 346.512-second reference. Forced flash attention was stopped while still at step 8/20 after several minutes and is not retained as the default; no completed timing is claimed for it.

A nominal six-GiB run took 322.215 s but its logs revealed an effective two-GiB budget. The independent auto-fit planner still clamped the explicit request to WebGPU's reported single-buffer limit. A guarded Emscripten/WebGPU-only planner patch preserves the requested budget; it changes neither native backends nor actual buffer/allocation limits. Physical free VRAM remains unknown. The first real six-GiB run encoded text in 13.96 s and sampled in 249.87 s, then failed during an oversized VAE dispatch with a GPU queue timeout. It produced no usable clip and is not a performance improvement. Bounded VAE tiles and optional in-memory DiT linear-weight expansion require separate output and performance validation; original model files are never rewritten. Image budgets also pass through this shared planner, so earlier nominal-six-GiB image measurements retain their historical results but do not validate the new planner at that budget.

The combined bounded-tile/F16-matrix candidate subsequently completed the same short test in **289.631 s total** (5.819 s load, 283.523 s generation; text 13.85 s, diffusion 233.02 s, VAE 36.61 s), about 9.5% below the 320.056 s baseline. All five 832 × 480 frames decoded at eight FPS; the WebM is 21,640 bytes, SHA-256 `648c25ab776fbd19d8089671c8a0498053b57b5ccda6677e1430c2b378277493`. First/middle/last frames remain visually close; decoded RGB mean absolute difference from the old WebM is 0.920/255, maximum 48/255, including lossy VP8 encoding. The files are not identical. These combined changes do not isolate each optimization's contribution and the 0.625-second clip does not validate longer temporal decoding or general motion quality. Weight expansion stays explicit and off by default, requiring at least six GiB.

A serial run of the installed Desktop engine with the same files, prompt, resolution, five frames, seed, 20 steps, CFG and shift took **40.539 s** to save five PNGs (text 14.54 s, diffusion 19.30 s, VAE 4.01 s). It used CUDA diffusion/VAE, CPU text encoding, CPU weight offloading and the native engine's own revision/defaults, rather than the WebGPU/F16 candidate; it is not a measured Desktop conversation or a WebM export. The substantial diffusion/decode gap remains. Do not claim Desktop parity or general Web video readiness.

The Web Pages build enables the guarded WebGPU image profile (143602) with
`--kernel-tuning`. The release manifest pins all source patches by SHA-256.
Local 2048×880 four-step reference images match the decoded RGB of the earlier
profile. On the validated RTX 5070 Laptop configuration, the latest standalone
reference control took 111.967 seconds. See `docs/WEB_DELIVERY.md` for the
published channel. Other devices select the supported kernels through the
existing capability guards.
