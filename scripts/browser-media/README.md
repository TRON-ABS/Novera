# Experimental port for Novera's local media models

This target investigates the **same model bundles used by Desktop**: FLUX.2 Klein 4B with Qwen3 and FLUX.2 VAE, and Wan2.1 T2V 1.3B with UMT5 and Wan VAE. It does not substitute SD1.5, a hosted API, or a converted music package. ACE-Step's existing GGUF runtime needs its own port; this target does not implement music.

The source archive digests and Emscripten release are pinned in `sources.json`. Upstream sd.cpp exposes image and video generation; its GGML WebGPU backend has Emscripten support. That is a starting point, **not proof that all operations and model quantizations work in a browser**.

Install and activate Emscripten **7.0.0** in a local SDK directory using the [official SDK instructions](https://emscripten.org/docs/getting_started/downloads.html). CMake and Ninja must also be available. No global environment changes are required. From the Novera root:

```powershell
python scripts/browser-media/build.py --emsdk C:/path/to/emsdk --cmake C:/path/to/cmake.exe --ninja C:/path/to/ninja.exe
```

The helper verifies source archives before extracting them into `.build/browser-media`, builds the dedicated target with two workers, and writes hashes plus `modelInferenceValidated: false`. It neither publishes assets nor alters the native Desktop release. Existing nonmatching cache contents are preserved and rejected rather than overwritten.

The binding owns a single context and its result buffers. FLUX uses `generate_image`; Wan uses `generate_video`, including one-frame work. The worker caller must mount the selected model files into the virtual filesystem, await JSPI generation, copy the result pixels before releasing them, encode valid PNG/WebM output, and terminate/release the worker on cancellation. Memory64 is used because the complete model bundles exceed a 32-bit heap's practical budget. Actual browser support, GPU limits and peak memory must be measured.

Do not enable this runtime in the normal Web UI until the build and exact-model image/video tests pass. A successful compile alone does not validate inference, interruption, output encoding, file retention or acceptable performance. Keep upstream and model licenses with any distributed runtime; generated binaries stay out of source commits.

The dedicated `novera-browser-media.yml` workflow builds an experimental artifact with upstream licenses and a verification receipt. It does not deploy the Web app or change a Desktop update feed.

## Browser findings, November 7, 2026

An actual Edge test on an RTX 5070 Laptop generated the same FLUX.2 Klein Q4 bundle at 256 × 256, four steps. The first compatibility fallback used CPU VAE decoding: 207.88 seconds for decoding and 237.87 seconds inside generation. A second test completed the full file-load/generation/PNG path in **31.768 seconds**, with **2.77 seconds** for VAE decoding. This small test does not establish larger-image, music or video performance.

Two digest-checked source patches are required. The model loader must not construct a native thread in a threadless Emscripten build. Group normalization may run on CPU because WebGPU lacks that operation; its following affine multiply/add must own fresh output buffers. In-place views retained CPU buffers while those operations ran on WebGPU, producing a trap in `wgpuBufferAddRef`. Native builds retain their original behavior under both patches.

The default experimental binding now uses WebGPU VAE convolution with that buffer-ownership correction. `--gpu-vae-probe` enables per-node diagnostics; `--cpu-vae-fallback` retains the slower diagnostic fallback. Compilation receipts deliberately keep `modelInferenceValidated: false`: browser inference evidence belongs to a separate observed test, not the compiler.

To include the reviewed runtime in a local preview build, set `VITE_NOVERA_WEB_LOCAL_MEDIA=true` and `NOVERA_BROWSER_MEDIA_BUILD` to the absolute build directory, then run `corepack yarn build:web:browser`. The Vite plugin checks artifact bytes against their build receipt and includes both upstream licenses. Select the three files in Novera's creation settings; they stay on the device for that session. Image output uses the usual conversation player, durable media store and download control. The corrected GPU integration completed in **32.7 seconds displayed by Novera**, retained the image after reload and exported the PNG. Both the fast result and the slower fallback have qualified provenance in `examples/media/novera-web-flux`.
