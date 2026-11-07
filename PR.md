# feat(web): prepare local conversations, image inference and safe updates

The static showcase cannot run a Novera conversation. Add an opt-in browser build that reuses the Desktop interface, colors, language preferences and model picker, with WebGPU text inference and IndexedDB conversation/media storage.

Pin LiquidAI LFM3 Omni Q4_K_M and its supported Q8 projector, verify the official SDK digest before import, and offer the pinned LFM3 1.7B alternative. Avoid native localhost startup calls. Preserve the text KV cache only across an exact continuation of the prior conversation; deterministic browser titles avoid background generation taking over the GPU. Show measured response timing and defer update reloads during generation or storage writes.

Add a reproducible experimental WASM64/WebGPU image runtime using the exact Desktop FLUX.2 Klein 4B Q4_K_M, Qwen3 Q4 encoder and FLUX.2 VAE files. Pin source archives and guarded patches, verify runtime receipts before packaging, and keep the runtime optional. Fix threadless loading and the WebGPU VAE normalization affine buffer path. Save generated media before exposing conversation references; reuse existing players and exports.

## Validation

- 23 targeted Vitest files: **290 tests passed**, covering runtime, cache continuation, titles, storage, update notices, media and related browser behavior.
- `corepack yarn build:web:browser`: TypeScript and production build passed. Existing chunk-size and mixed storage-import warnings remain.
- Web delivery tests: **4 passed**. Showcase preparation tests: **3 passed**.
- Actual Edge: Omni Q4/Q8 answered in French; one response reported 95.58 tokens/s for 93 tokens. It did not fully obey the requested answer structure. The new cache optimization still needs a real follow-up benchmark.
- Actual Novera image UI: genuine 256 x 256, four-step image in **32.7 seconds**, downloaded and retained after reload. Earlier CPU VAE baseline: 3 min 54 s. Both images have qualified provenance under `examples/media/novera-web-flux/`.
- Public PNG/MP3/MP4 fixtures validated rendering, playback, downloads and persistence only. They are not newly generated Novera music/video. No paid generation ran.

## Limits and dependencies

Browser-local ACE-Step and Wan porting remains experimental and is not enabled as validated production functionality. Music planner correctness, instrumental/song/a-cappella quality, video generation and matched Desktop performance still require validation. The image result does not establish larger-resolution performance or Desktop parity. The alternative text model has not completed a real generation test; audio/vision inputs, full offline behavior, cache cleanup and broader device testing remain unfinished.

The beginner music/video guide was published separately in #45. Desktop 1.0.1 delivery and native updater validation are tracked separately in #44. This PR does not publish the Web application or change the public Desktop updater. Clarify the Omni SDK redistribution license and complete the requested security audit after functional/performance testing, before public Web release. Keep the zero-euro generation budget and genuine Novera-only demo policy.
