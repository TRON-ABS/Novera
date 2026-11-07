# feat(web): prepare local conversations, image inference and safe updates

Desktop follow-up found during 1.0.1 user testing: a retained custom Python path pointed into a deleted development directory, blocking Real-ESRGAN before diffusion. Reject missing custom interpreter files with actionable component diagnostics while preserving existing overrides. Fix managed-component verification to derive the expected Python version from its profile: installation requested 3.12.15 but verification still required 3.12.12. Source regression checks and the user's installed-runtime repair are tracked separately from the published binary.

Desktop repair validation: installed the hash-locked upscale CUDA dependencies into a durable external runtime and changed the Image/Python setting through the installed 1.0.1 UI. `uv pip check` passed for all 12 packages; official local Real-ESRGAN x2 weights produced 192 x 128 from a synthetic 96 x 64 input on RTX 5070 Laptop in 1.257 s. Three focused Python upscaler tests passed; the separate Diffusers publication test lacks Diffusers in this minimal profile. Explicit native `real_private_video_lifecycle --ignored --exact --test-threads=1` passed (installation, verification, repair, rollback, cancellation and uninstall), exercising the corrected Python-version probe. This does not replace the published Desktop binary or prove a full FLUX UI run.

`cargo test --manifest-path src-tauri/Cargo.toml --lib core::components::tests --no-default-features --features desktop,tauri/tray-icon --locked -- --test-threads=1`: **8 passed, 3 explicit network tests ignored**; the video lifecycle was run separately above. Existing dependency/deprecation warnings remain.

The static showcase cannot run a Novera conversation. Add an opt-in browser build that reuses the Desktop interface, colors, language preferences and model picker, with WebGPU text inference and IndexedDB conversation/media storage.

Pin LiquidAI LFM3 Omni Q4_K_M and its supported Q8 projector, verify the official SDK digest before import, and offer the pinned LFM3 1.7B alternative. Avoid native localhost startup calls. Preserve the text KV cache only across an exact continuation of the prior conversation; deterministic browser titles avoid background generation taking over the GPU. Show measured response timing and defer update reloads during generation or storage writes.

Add a reproducible experimental WASM64/WebGPU image runtime using the exact Desktop FLUX.2 Klein 4B Q4_K_M, Qwen3 Q4 encoder and FLUX.2 VAE files. Pin source archives and guarded patches, verify runtime receipts before packaging, and keep the runtime optional. Fix threadless loading and the WebGPU VAE normalization affine buffer path. Save generated media before exposing conversation references; reuse existing players and exports.

## Validation

- 23 targeted Vitest files: **290 tests passed**, covering runtime, cache continuation, titles, storage, update notices, media and related browser behavior.
- `corepack yarn build:web:browser`: TypeScript and production build passed. Existing chunk-size and mixed storage-import warnings remain.
- Web delivery tests: **4 passed**. Runtime asset packaging contracts: **3 passed**, including stale/tampered bytes and cache-version isolation. The 3 focused image-stream tests passed with the versioned runtime path. Showcase preparation tests: **3 passed**.
- Actual Edge: Omni Q4/Q8 answered in French; one response reported 95.58 tokens/s for 93 tokens. It did not fully obey the requested answer structure. The new cache optimization still needs a real follow-up benchmark.
- Actual Novera image UI: genuine 256 x 256, four-step image in **32.7 seconds**, downloaded and retained after reload. Earlier CPU VAE baseline: 3 min 54 s. Both images have qualified provenance under `examples/media/novera-web-flux/`.
- Public PNG/MP3/MP4 fixtures validated rendering, playback, downloads and persistence only. They are not newly generated Novera music/video. No paid generation ran.

## Limits and dependencies

Wan now has a pinned GPU IM2COL_3D implementation and a separate CPU-reference validation module. Twelve numerical cases passed byte-for-byte. The same tiny 256 x 144, five-frame, four-step video improved from 65.102 to 32.046 seconds with an identical encoded WebM. A real 832 x 480, five-frame, 20-step clip completed, exported and played to its end, but took 346.512 seconds. It is only 0.625 seconds long. Low-resolution visual quality is poor; the target latency at useful resolution is not achieved. Runtime assets now share a content-versioned directory to prevent mixed cached JS/WASM versions. TypeScript and the production build including the verified runtime passed.

Browser-local ACE-Step and Wan integration remains experimental and is not enabled as validated production functionality. Isolated ACE prototypes generated instrumental, French song and a-cappella files in 38.691, 34.911 and 37.294 seconds, respectively; musical quality and intelligible lyrics remain unverified. The maintainer can now time the Desktop song after the video worker was stopped. Music/video UI integration, quality and matched Desktop performance still require validation. The image result does not establish larger-resolution performance or Desktop parity. The alternative text model has not completed a real generation test; audio/vision inputs, full offline behavior, cache cleanup and broader device testing remain unfinished.

The beginner music/video guide was published separately in #45. Desktop 1.0.1 delivery and native updater validation are tracked separately in #44. This PR does not publish the Web application or change the public Desktop updater. Clarify the Omni SDK redistribution license and complete the requested security audit after functional/performance testing, before public Web release. Keep the zero-euro generation budget and genuine Novera-only demo policy.
