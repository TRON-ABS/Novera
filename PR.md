# feat(web): prepare local inference and persistent media conversations

The static showcase cannot run a Novera conversation. Add an explicit browser preparation build that reuses the application UI, themes, language preference handling and model picker, with real WebGPU inference and IndexedDB conversation storage.

Default to the pinned LiquidAI LFM3 Omni Q4_K_M model with the Q8 projector required by its current official Web SDK. The Q4 projector was tried in Edge and rejected by a missing SDK quantization kernel. Include a separately pinned LFM3 1.7B text alternative in the picker. Verify the remote SDK digest before import and bypass native localhost inference and desktop-only startup calls.

Validation:
- Browser runtime/transport and browser media readiness: 10 tests passed.
- `corepack yarn build:web:browser`: TypeScript and production build passed; existing large-chunk warnings remain.
- Actual Edge: Omni Q4/Q8 loads and answers in French; saved messages survive reload; alternative model selection works.

Optional browser media now reuses the existing fal queue adapter for image/music/video and saves bounded, typed files in IndexedDB before exposing stable conversation references. Reuse Novera players, sharing, exports and model configuration; hide native installers and filesystem claims in the browser panel. Remove retired Pika 2.2 from the catalog, whose official page says requests stopped on October 29.

Media validation: 219 targeted tests passed. Actual Edge tests load public PNG/MP3/MP4 fixtures into the real Novera UI, play audio/video without decoding errors, retain all three after reload, and download the expected byte lengths. These are existing public fixtures, not newly generated media. Queue protocol tests use synthetic credentials and responses. No paid generation ran; the maintainer specifies a zero-euro test budget.

The maintainer prioritizes the exact local Desktop models (FLUX.2 Klein, ACE-Step 1.5 Turbo and Wan2.1), so fal remains secondary. Browser-local media runtime porting is unfinished; static hosting cannot run the existing native engines. Do not claim free media inference or silently substitute converted model packs.

Limits: the alternative text model has not yet completed a real generation test. Real media inference, audio/vision inputs, full offline behavior, orphan-media cleanup, selective model cache deletion and broader browser/device testing remain unfinished. The normal non-preview Web path retains its explicit refusal; none of these tests claims real media inference. Clarify the Omni SDK redistribution license before public distribution. No public website or Desktop updater is changed by this PR. This is an opt-in preparation, separate from the 1.0.1 release delivery work in #42.
