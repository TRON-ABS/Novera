# Experimental ACE-Step browser runtime

This separate WASM64/WebGPU target uses the four **original Desktop GGUFs**: ACE-Step 1.5 Turbo Q4_K_M, its 1.7B Q8 planner, Qwen3 Embedding 0.6B Q8, and the BF16 VAE. It does not use a paid API or a converted substitute pack. An opt-in Novera browser integration now connects it to conversations, local media storage, playback, download and cancellation. It is not enabled in a public production release.

Build with Emscripten 7.0.0, CMake and Ninja:

```powershell
python scripts/browser-music/build.py --emsdk C:/path/to/emsdk --cmake C:/path/to/cmake.exe --ninja C:/path/to/ninja.exe
```

The helper verifies source archives, patch bytes and patched file hashes before compiling. It preserves unexpected cache contents and rejects them. Build receipts record artifact hashes and `modelInferenceValidated: false`; a successful compiler does not establish real generation. Retain the upstream ACE-Step and GGML MIT licenses with distributed binaries and review model licenses separately.

## Corrections and resource bounds

- Preserve F32 activation values in WebGPU register-tiled matrix multiplication. A real Qwen3 SwiGLU activation of approximately -70011 overflowed half precision and turned all 217204 first-prefill logits into NaNs. The corrected first prefill had 217204 finite logits. Quantized weight decoding retains its existing precision; this does not clamp activations.
- Use threadless CPU fallback and a read-only WORKERFS loader. Share one composite DiT file's CPU copy across its sequential component loaders, then free it after releasing the model store. This retains an extra approximately 1.45 GB during a request; the worker owns all memory.
- Lock the user's caption and lyrics. Caption enrichment otherwise added drums despite an explicit prohibition. Limit an explicit duration to its 5 Hz audio-code budget; an earlier EOS can still finish slightly sooner. Reaching the budget can stop without a natural musical ending, so listening quality remains a separate check.
- Keep the strict GPU eviction policy, a 2048-token planner context, one output, eight synthesis steps, and a 10–30 second experimental duration range. The binding accepts at most 512 UTF-8 bytes each for caption and lyrics. These are prototype limits, not Desktop feature parity.
- Validate finite PCM output and apply the same percentile normalization as the Desktop exporter. Cancellation must terminate the owning worker; copy output before releasing it. Selected files and generated audio stay on the device.

## Observed tests on November 7, 2026

An isolated Edge prototype on an RTX 5070 Laptop GPU generated three real outputs with the original Desktop model files, seed 42, eight steps and a requested ten-second duration:

| Requested mode | Actual audio | Total time including loading |
| --- | --- | --- |
| Instrumental | 10.00 s | 38.691 s |
| French song with piano and guitar | 9.84 s | 34.911 s |
| French a cappella | 10.00 s | 37.294 s |

The instrumental took 43.601 seconds before composite-file caching. Its complete WAV was **byte-identical** afterward: SHA-256 `dbde0d33c4514229f77952890f4aa9a6575d87a20f83ec248dddde73b2a46531`. This isolates a loading improvement without changing that output.

These measurements belong to the development prototype before removal of temporary numerical diagnostics. A real Novera conversation rerun with the source-shaped build produced the French song in **42.3 s** on its first UI run: 9.84 s of 48 kHz stereo float32 WAV, 3,778,604 bytes. Downloaded WAV SHA-256 `e3cd16ab1fd431adfed7fb7055a1da85fbbabd542e0c2145f5583253a98f95ef` matches the prototype's song byte-for-byte. The saved conversation reopened in a fresh tab, and playback reached the end without a media error. This first UI run does **not** meet the sub-40-second target.

Numerical validity, encoding and duration do not certify intelligible French lyrics, instrument exclusion, a natural ending or musical quality. Listening review, further performance measurements and update/cancellation checks remain necessary before claiming readiness. Desktop CUDA and browser WebGPU also need comparisons at matching settings, caption policy and actual output duration.

## Music performance follow-up

The maintainer reports **14.5 s in Desktop 1.0.1** for the fixed-seed instrumental comparison. This is a user-reported UI result, not a new automated Desktop measurement.

- Buffer GGUF metadata reads with a bounded 1 MiB libc buffer on Emscripten. WORKERFS otherwise issues thousands of synchronous Blob reads while parsing tokenizer strings. The buffer remains alive until `fclose`; tensor values and model files are unchanged.
- Execute contiguous F32 `COL2IM_1D` on WebGPU. Match the CPU gather order, preserve F32 sums, and avoid repeated audio activation transfers to the single-threaded CPU. Reject unsupported precision, strided layouts and invalid parameter/index ranges at backend dispatch.
- Preserve phase timings through the conversation metadata and display them under “Mesures de performance”. Loading is included in the planning/synthesis/decode phases; the total also includes startup, export and saving. Timings accept only known, finite, bounded fields.

With the same four GGUFs, caption, instrumental marker, `unknown` language, seed 42, eight steps and ten seconds requested, a fresh-worker diagnostic measured **37.5965 s before**, **21.2555 s with buffered reads**, then **16.5904 s with GPU COL2IM**. The initial run with Desktop's text model still resident took 75.578 s and is excluded from the optimization comparison. Actual output is 9.44 s, stereo float32/48 kHz. All three downloaded WAVs match the earlier 39.0-second UI output byte-for-byte: SHA-256 `03e4ea7612f883405061330939d4620d15bfbefd56e4bf17cef8a0629db63c67`.

The production-shaped Novera Web conversation then measured **16.2 s and 16.0 s** on two consecutive fresh-worker runs, with the same prompt, controls and output format. Both downloaded WAVs match the same hash; phase details appear in the real interface. The second WAV also played to its end without a decode error. This is approximately 59% less total time than the earlier 39.0-second UI reference, and about 1.5–1.7 seconds above the maintainer's Desktop report. OS file/shader caches and GPU contention affect these observations; do not promise these times on every device.

Compile the optional CPU/WebGPU reference module with `--numerical-checks`, then invoke `novera_check_col2im` from its dedicated browser worker. Twelve real GPU comparisons match finite CPU F32 results exactly, including all VAE strides, padding, channel counts, offset views and a 4.48-million-sample output that crosses the two-dimensional dispatch boundary. Two additional guards reject F16 and strided sources. The passing module returns 14; compilation alone is not a passing numerical test.

For an internal browser build, set `VITE_NOVERA_WEB_LOCAL_MUSIC=true` and `NOVERA_BROWSER_MUSIC_BUILD` to the verified build directory, then run `corepack yarn build:web:browser`. Packaging checks module/WASM hashes and includes the ACE and GGML licenses in a content-versioned directory. Select the four local files under Music in creation settings; file handles remain session-only, while musical settings and finished WAVs persist locally. The trial accepts 10–30 s, eight steps, automatic WebGPU placement and float32 WAV. Unsupported settings are rejected before model loading.

## Web 1.0.1 release profile

The Pages build selects `--web-release` and enables the reviewed music profile in its worker. The planner, Qwen3-Embedding and the composite DiT use 64 MiB weight windows. The planner reads the next window during GPU uploads, and its partial audio head copies quantized rows between GPU buffers. The DiT groups reads in file order when destination ranges are independent. Sampling reuses the same exponentials without changing the accumulation order.

Rebuild this profile with `python scripts/browser-music/build.py --web-release --emsdk C:/path/to/emsdk` and a dedicated build cache. The deployment packages the content-addressed module, WASM, build receipt and both upstream licenses. The Web application version remains 1.0.1.

The Web worker can now encode the normalized PCM to MP3 locally with ACE-Step's pinned encoder. New songs select MP3 320 kb/s by default. MP3 128 kb/s and the lossless WAV 32-bit format remain selectable.
