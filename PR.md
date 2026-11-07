# feat(web): prepare local browser inference in the existing Novera UI

The static showcase cannot run a Novera conversation. Add an explicit browser preparation build that reuses the application UI, themes, language preference handling and model picker, with real WebGPU inference and IndexedDB conversation storage.

Default to the pinned LiquidAI LFM3 Omni Q4_K_M model with the Q8 projector required by its current official Web SDK. The Q4 projector was tried in Edge and rejected by a missing SDK quantization kernel. Include a separately pinned LFM3 1.7B text alternative in the picker. Verify the remote SDK digest before import and bypass native localhost inference and desktop-only startup calls.

Validation:
- Browser runtime/transport and browser media readiness: 10 tests passed.
- `corepack yarn build:web:browser`: TypeScript and production build passed; existing large-chunk warnings remain.
- Actual Edge: Omni Q4/Q8 loads and answers in French; saved messages survive reload; alternative model selection works.

Limits: the alternative model has not yet completed a real generation test. Image/music/video output, audio/vision inputs, full offline behavior, selective model cache deletion and broader browser/device testing remain unfinished. The three media streams explicitly refuse the browser path; these tests do not claim real media generation. Clarify the Omni SDK redistribution license before public distribution. No public website or Desktop updater is changed by this PR. This is an opt-in preparation, separate from the 1.0.1 release delivery work in #42.
