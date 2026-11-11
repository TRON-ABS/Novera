## Automatic Web model discovery

Remember the browser-authorized models directory. Scan it on startup, when the tab regains focus and every 30 seconds while visible. Recognize local text GGUF files and enqueue their Auto Tune tests. The engine streams the browser File through WORKERFS and reports incompatible models during calibration. Existing media packs use the same directory scan.

Focused tests verify startup, unchanged scans, revoked access, new downloads and queue insertion. Hardware validation depends on the browser and model.

## Novera Web 1.0.2

The public Web release adds folder discovery, download links and persistent browser imports for FLUX.2 Klein, ACE-Step and Wan 2.1. In creation settings, select the Novera models folder and open Auto Tune to see compatible packs. Model files are downloaded from their sources. Pages ships the browser engines and the application.

The local Web build passed TypeScript and focused import, persistence and discovery tests. The Pages deployment and public checks are tracked by the release workflow.

## Direct Qwen GGUF for Desktop NVFP4

The NVFP4 image worker previously expanded Qwen3-4B GGUF to BF16 before encoding the prompt. Run the pinned stable-diffusion.cpp conditioner in a short-lived process with the same selected GGUF and keep the existing CPU, CUDA and Auto options. Packaging checks the encoder source fingerprint. Creation settings describe direct GGUF loading in all 104 catalogs.

On Windows with RTX 5070 Laptop, the local worker generated 512 × 512 images at four steps and seed 99474568 using the original Qwen3-4B Q4_K_M, NVFP4 diffusion model and VAE. Two independent CPU encoder runs took 5.23 s and 4.70 s for encoding and produced byte-identical PNGs. CUDA encoding took 2.91 s. All three runs executed 400 native NVFP4 matmuls. The 15 Python NVFP4 tests passed. Desktop installation and the Web 1.0.1 Pages deployment are separate checks.

## Web autonomous text and Wan update

Normal LFM3-Omni text replies in compatible browsers use the pinned single-thread WebAssembly/WebGPU Worker and compact GPU sampling. The Worker verifies the model bytes downloaded from the pinned catalog revision. It caches verified weights when browser storage is available. Voice, tool history, assistant prefills and browsers without JSPI use the autonomous SDK. The 147.39 tokens/s figure is the median of the earlier local 512-token decode series and depends on the browser and device.

Pages builds and checksums the engine, Worker and license. No weights or native bridge are bundled. Local checks cover the production TypeScript configuration and 25 runtime, voice and transport tests. In a fresh Edge profile the packaged chat answered 42 with checksum-verified weights from a local mirror. The next tab reused the weights from browser storage. Five warm 512-token runs measured a 145.65 tokens/s median and a 147.16 tokens/s peak, with identical token IDs. Cancellation and retry passed.

The Pages candidate adds a linked Wan page at `/Novera/web/video-performance/`. It selects profile 12742898, the five-second Desktop preset, Flash Attention, separate CFG passes and a 4 GiB GPU budget. It requires the three original Wan files, processes them in the browser, and offers WebM and a measurement report. Its binary builds separately from FLUX, which continues to use profile 143602.

The November 9 local Edge comparison used the RTX 5070 Laptop, seed 331914466 and 20 steps at 512 × 224. VAE decode fell from 121.41 s to 97.87 s and total through WebM export from 642.876 s to 619.918 s. All 80 RGBA hashes matched. Both WebM SHA-256 values were `c6855682cdf638a3513ab46b68b39cb19f67eb7846f3735d05df788b18fc3f9d`. These are local reference measurements.

The public 1.0.1 build at `a48093137f50351305606375606b9b7ff01aa6a5` was checked before the update. The hosted JS and Wasm files match both the FLUX profile 143602 and the ACE bounded read-ahead receipts. Deployment and browser checks for the new candidate are tracked in [PR #58](https://github.com/TRON-ABS/Novera/pull/58).

# fix(web): record the public release and follow shared version facts

Novera Web 1.0.1 is deployed at `/Novera/web/` from commit 9ec7c5efea4ae669af74082466588399e397970d. Record the successful deployment, 757 public file hash comparisons, actual short text generation and conversation persistence after reload. Preserve the experimental media, Wan, audit and Pages cache limitations; no full upgrade or Desktop performance parity is claimed.

Remove hardcoded 1.0.1 values from Web staging and showcase/README publishing so the next coordinated release follows the application version and shared release facts. README generation remains idempotent.

Validation: ten distribution/publication tests pass. The deployed code is unchanged by this documentation/staging follow-up; the public runtime remains the exact verified #53/#54 build. The real six-GiB image timeout is recorded as a failed test, with no claimed speed improvement.

## Web 1.0.1 music update

The local music worker previously copied the composite model and waited for each planner weight read before uploading it. The Web release now selects 64 MiB windows, planner read-ahead, direct GPU head copies, DiT file-ordered reads and exact sampling exponential reuse. The release version stays at 1.0.1. This PR builds the Pages candidate in CI and keeps deployment on a separate workflow dispatch after merge.

The existing image kernel profile and pinned text SDKs are part of the same Pages build. The four runtime packaging tests passed locally. Combined-model inference and public deployment are verified separately.

The same update makes MP3 320 kb/s the default for new local Web songs. The existing sharing and download flows use the stored MP3. WAV 32-bit remains selectable for exact-reference checks.

The Web search default is DuckDuckGo. Existing saved provider choices are still restored, and Exa remains available as an explicit option for full search.

## Native video export

Apply the Web clip export limit to the shared Desktop worker. FFmpeg returns only the frames needed from each Wan AVI. Diffusers sends contiguous RGB frames to the encoder directly, avoiding a separate byte copy. Windows validation passed all nine video worker tests. Both native export paths produced byte-identical before and after MP4s with 80 frames at 512 × 224, 16 FPS, using controlled test clips and the same pinned FFmpeg. These checks exercise export rather than model inference or VAE speed. The worker is used by Desktop on Windows, Linux and macOS. CLI, Android and iOS do not include it.

## Native FLUX and RealESRGAN

Transfer the reviewed RealESRGAN ×2 topology correction from the native Web image bridge. Desktop checks the native image runtime receipt and can run generation and upscaling in one process. The combined path verifies the final PNG dimensions. It is opt-in via `NOVERA_NATIVE_IMAGE_FAST=1` because its decoded pixels differ from the default path. Windows builds can prepare the corrected CUDA and portable cores. The native build helper also accepts CPU, CUDA, Vulkan and Metal backends.

The November 8 Windows benchmark used a RTX 5070 Laptop, FLUX.2 Klein 4B Q4_K_M, seed 42 and four steps at 2048 × 880. The complete ×2 pipeline took 36.023 s before and 31.572 s with the combined process. Both PNGs were 4096 × 1760. Their mean absolute RGB difference was 7.35 levels per channel, with a maximum of 184. This measures the engine pipeline outside the Desktop UI. Linux and macOS performance remains unmeasured.
