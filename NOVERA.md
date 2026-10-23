# Novera — project instructions

Novera is maintained by TRON-ABS at https://github.com/TRON-ABS/Novera. Its purpose is **Knowledge for everyone.**

- Work from the checked-out project root; do not assume a maintainer-specific drive or home directory.
- Desktop identity: Novera-Desktop, application identifier `io.github.tronabs.novera`.
- Agent instructions: `NOVERA.md`, with configurable `AGENTS.md` fallback. Agent state lives under `~/.novera`; desktop data uses the Novera application directory.
- Preserve user conversations, models, credentials and unrelated local changes. Any data migration or deletion needs an explicit scope.
- Contributions target this repository. Publishing builds, signing releases and enabling workflows require maintainer authorization.
- Automatic updates remain disabled until an independent signed feed is ready. Inherited release workflows are not a verified Novera distribution pipeline.
- Preserve applicable Apache and third-party licensing and attribution. Product branding changes do not establish ownership of inherited code.
- Keep external model/service names and compatibility interfaces accurate.

The recommended setup model is LiquidAI LFM2.5-2.6B Q6_K: temperature 0.1, top-k 50, repetition penalty 1.1, context 32768. Its initial engine settings are defined in `extensions/llamacpp-extension/src/novera-model-defaults.ts`; its setup catalog is in `web-app/src/lib/noveraRecommendedModel.ts`.

See [contribution guidance](CONTRIBUTING.md), [current source notes](docs/UPDATES_2026-10-23.md), [identity policy](BRANDING.md) and [official release policy](OFFICIAL_RELEASES.md).

Current source version: **Novera 1.0.0**. The 35 Windows fixes are integrated and a local Windows release build has been validated. See [current source notes](docs/UPDATES_2026-10-24.md) and the [integration record](docs/NOVERA_1_INTEGRATION.md). This source publication includes no binaries; Actions and automatic updates remain disabled.
