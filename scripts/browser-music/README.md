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

For an internal browser build, set `VITE_NOVERA_WEB_LOCAL_MUSIC=true` and `NOVERA_BROWSER_MUSIC_BUILD` to the verified build directory, then run `corepack yarn build:web:browser`. Packaging checks module/WASM hashes and includes the ACE and GGML licenses in a content-versioned directory. Select the four local files under Music in creation settings; file handles remain session-only, while musical settings and finished WAVs persist locally. The trial accepts 10–30 s, eight steps, automatic WebGPU placement and float32 WAV. Unsupported settings are rejected before model loading.
