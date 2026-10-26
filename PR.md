# fix(hub): add adaptive model advice and Safetensors execution

The Hub previously exposed limited task discovery, duplicated compatibility estimates and manual pagination. Add 23 navigation categories from public Hugging Face metadata, explainable local recommendations and a hardware/engine review before weight transfer. Replace the Next button with progressive loading near the bottom of the selected category, preserve existing row order, and ignore stale observers after category changes.

Add a desktop Transformers engine for complete local text-model folders with Safetensors weights. Python 3.15.1 environments use PyTorch 2.14.1 CPU or CUDA; loading stays offline, remote model code is disabled, requests are authenticated on loopback and cancellation is scoped to the request. Imported source weights are retained when unregistering a model. All 70 interface catalogs cover 1,587 English keys; native-language review remains outstanding.

## Validation

- Real Python server: 10 CPU tests and 10 CUDA tests passed with a generated, untrained 39,168-byte model; no model weights downloaded for this fixture.
- Native import/probe/load/generate/unregister: two CPU tests and two CUDA tests passed. The Windows test executable required a local Common Controls v6 manifest; this does not certify a clean-PC installation.
- Real Novera SDK: normal generation and streaming passed on CPU and CUDA, eight output tokens per request.
- Hub/service tests: 158 passed in 13 files; advice/localization/import tests: 195 passed in four files. These are recorded test batches, not a count of unique tests.
- Latest scrolling/order/category/badge suite: 16 tests passed in five files; TypeScript without emission, architecture checks and the 70-catalog check passed.
- Public metadata smoke check: all 47 current task identifiers mapped; image, video and medical discovery exercised with 13 metadata requests, no account token or weight download.

- Final publication selection: **309 tests passed in 17 files**, TypeScript without emission passed. Exact selected test paths and output are retained locally in `.build/safetensors-2026-10-26/publication/final-tests.log`.

Reproducible checks from the repository root:

```sh
cd web-app
node ../node_modules/vitest/vitest.mjs run src/containers/__tests__/HubInfiniteScroll.test.tsx src/hooks/__tests__/useHubProgressiveOrder.test.ts src/services/models/__tests__/hubCategories.test.ts src/modules/engines/hub-catalog.test.ts src/containers/__tests__/ModelInfoHoverCard.test.tsx
cd ..
node web-app/node_modules/typescript/bin/tsc --noEmit -p web-app/tsconfig.app.json
node scripts/check-architecture.mjs
python scripts/check-novera-locales.py
```

The first test command reproduces the 16-test scrolling/category/badge selection; the final 309-test selection also includes engine, import, model factory and locale coverage.

## Limits and publication scope

Image, video and other new tasks remain discoverable until their execution engines are integrated. Medical categorization is not clinical validation. Safetensors currently requires a complete local folder; automated download of an entire remote Safetensors repository is not implemented. Quantized custom formats, tools, vision/audio generation and CPU/GPU layer offload are excluded from this engine. CUDA was tested on an RTX 5070 Laptop; Linux, macOS and other accelerators are not validated here. Memory estimates and recommendations do not guarantee throughput.

Source publication was authorized by the maintainer on 26 October 2026. Exclude environments, downloaded packages, model weights, test runtime data, binaries, logs and personal data. No new compilation, installation, binary release or Actions activation accompanies this source update; the maintainer will compile the latest fixes. There is no open PR to reuse at preparation time. Versions, actual results and limitations: [engine tracking](docs/SUIVI_MOTEURS.md).
