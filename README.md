<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Knowledge for everyone. AI that keeps moving forward.</strong></p>
  <p>An independent AI assistant by TRON-ABS, bringing local models, cloud providers and evolving tools into one project.</p>
  <p><strong>In development</strong> · 36 interface language options · Apache 2.0</p>
  <p>
    <a href="README.fr.md">Français</a> ·
    <a href="docs/LANGUAGES.md">Languages</a> ·
    <a href="ROADMAP.md">Roadmap</a> ·
    <a href="CONTRIBUTING.md">Contribute</a>
  </p>
</div>

---

## Why Novera

Our goal is to make knowledge and useful AI capabilities accessible to as many people as possible, across languages and levels of technical experience. We want Novera to grow into a tool for learning, creating and understanding, with education and schools part of its long-term direction.

We are building around a clear product direction: keep a dependable foundation, explore new capabilities quickly, and turn useful experiments into features people can understand and use.

## The foundation

| Area | What the source includes |
| --- | --- |
| Local and cloud AI | Local model engines alongside connections to remote model providers. Compatibility depends on the model, provider and hardware. |
| Tools and documents | MCP integrations, document retrieval and assistant workflows inherited from the existing codebase. |
| Multilingual interface | 36 selectable locales, including regional and script variants. Translation coverage varies. |
| An extensible application | A desktop application with extension points for model engines, tools and future capabilities. |

These describe the source foundation. The current 1.0.0 source has been built and launched locally on Windows x64; public packaging and broader runtime validation remain in preparation.

## 36 interface language options

All 19 of our language contributions are integrated alongside the 17 inherited locales. The 18 new full catalogs each cover all **1,481 English keys**. **Wu / Shanghainese remains partial at 724 keys**, with English fallback for missing text. Native-speaker review remains outstanding.

Arabic, Egyptian Arabic, Urdu, Western Punjabi and Iranian Persian include right-to-left interface support. Model language capabilities depend on the selected model and are separate from interface localization.

**[Explore every language, native label and coverage level →](docs/LANGUAGES.md)**

First launch selects and saves the system language when no preference exists. A manual language change replaces the saved choice and is used at subsequent launches. This [first-launch language feature](docs/SYSTEM_LANGUAGE.md) is available in source and awaits the next desktop build.

## Where we are today

Novera has its own product identity and source repository. **No Novera installer or binary has been released yet.** Existing Jan downloads are not Novera releases.

The current source includes the Novera desktop identity, updated engine/chat integration and a fixed first-model recommendation: **LiquidAI LFM2.5-2.6B Q6_K**, with temperature **0.1**, top-k **50**, repetition penalty **1.1** and a **32,768-token context**. Its download remains a user action in setup.

Novera **1.0.0** includes **35 integrated Windows fixes**. A local Windows x64 release build with fat LTO and isolated startup have been verified. The latest local build passed **4,975 web tests (2 skipped)**, native startup and saved-language persistence checks. **96 targeted native tests** passed on the earlier build and were not rerun for this build. This does not establish complete model-generation or cross-platform validation. Application updates and GitHub Actions remain disabled while the independent distribution process is prepared.

See [the source update notes](docs/UPDATES_2026-10-24.md) for scope and validation.

**[Read the development roadmap →](ROADMAP.md)**

## Follow and contribute

Development lives at **[TRON-ABS/Novera](https://github.com/TRON-ABS/Novera)**. Contributions should target this repository. Useful contributions include language review, reproducible bug reports, model compatibility work, accessibility improvements and focused code changes.

- [Contribution guide](CONTRIBUTING.md)
- [Language inventory and translation checks](docs/LANGUAGES.md)
- [Project and compatibility notes](NOVERA.md)
- [Development roadmap](ROADMAP.md)

## Official project and identity

Official Novera development and releases are maintained by **TRON-ABS** in this repository. See the [identity policy](BRANDING.md) and [official release policy](OFFICIAL_RELEASES.md) to distinguish official versions from independent derivatives. Source permissions under Apache 2.0 remain unchanged.

## Origins and license

Novera builds on [Jan](https://github.com/janhq/jan), created by Menlo Research and its contributors. We retain the original attribution and [Apache License 2.0](LICENSE), together with the contributions of the open-source projects it depends on. Novera is maintained by TRON-ABS with its own direction.

## Development control center

Start with the [Novera development dashboard](TABLEAU_DE_BORD_NOVERA.md) for essential source files, current status, validation records and remaining work.

See the [six-domain architecture](docs/ARCHITECTURE.md) for extracted policies, platform/UI adapters, compatibility entry points and the remaining migration work. These changes are included in this source publication.

Current local source changes to [conversation controls](docs/CONVERSATION_CONTROLS.md) add exports and confirmed deletion. These changes, the modular refactor and system-language selection are included in the local build of 24 October 2026. Native startup and saved-language persistence were verified on an isolated profile. Native save/print dialogs still require manual validation.

Latest source update (24 October 2026): message-action tooltips in all 36 locales, localized dates/statistics, Internet search enabled by default with saved choices preserved, raw tool-protocol filtering and outside-click dismissal of the export menu. Novera-only signed updates and opt-in statistics are prepared but remain disabled without production configuration. See [update and telemetry setup](docs/UPDATES_AND_TELEMETRY.md). The latest local desktop build passed isolated startup; no binary is published with these sources. Earlier test counts above describe their recorded builds.
