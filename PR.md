# fix(providers): add nine cloud providers with current chat catalogs

Novera omitted Meta AI, Cohere, Z.ai, AI21 Labs, BytePlus, Baidu Qianfan, Tencent TokenHub, Amazon Bedrock and IBM watsonx. Add all nine with official bundled icons and documented API endpoints. Display all 70 language names as autonyms with language/reading-direction attributes and a scrollable wider menu. Add official Liquid AI/Qwen publisher icons to the six curated local Hub models and their detail pages. The catalog now offers 27 providers and 69 curated chat model IDs; IBM obtains deployment-specific aliases from its configured Model Gateway rather than assuming a universal Granite ID.

Use Cohere's native chat catalog with its OpenAI inference endpoint. Route Bedrock Mantle model listing separately from GPT-6/GPT-OSS inference. Preserve custom gateways, existing keys, model settings and provider deletion records; restore Cohere migration compatibility. Expose account/region URLs without new untranslated UI prose. Five services with no verified list-models contract use maintained presets and disable catalog-based key checks.

## Validation

- `node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json` (web-app): passed.
- Targeted Vitest checks for cloud catalogs/endpoints, model factory, utilities, provider store/migrations/tombstones, provider settings UI and Tauri provider service: 310 distinct tests passed across 14 files. This includes the Mantle protocol-filter regression, all 70 native menu names, 27 cloud icons and six local model publisher icons.
- `python scripts/check-novera-locales.py`: 70/70 catalogs, each 1,516/1,516 keys; no locale JSON changed (980 files compared against origin/main).
- Documentation audit: 14 main Markdown documents, 177 local links checked, no broken links; language roadmap preserved.
- Official icons: ten downloaded files with source URLs and SHA-256 recorded, existing Cohere SVG reused; 36/36 initial preview images decoded at 18/40 px; a complete 27-cloud/six-local preview decoded all 66 images on light/dark backgrounds.
- Remote check: no open pull request overlaps this work; GitHub Actions disabled. Official icon provenance is in docs/DEVELOPMENT.md; model sources and account/region restrictions are in docs/USER_GUIDE.md.

## Limits

Documentation and mocked transport tests do not validate live account access. Availability depends on subscription, region and model enablement. No paid inference, user credential access, profile change, executable rebuild or binary release. All 70 locale catalogs retain their existing 1,516 keys. Previous desktop build evidence remains in docs/BUILD_AND_RELEASE.md and the dashboard. GitHub Actions remain disabled.
