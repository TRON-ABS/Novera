<div align="center">
  <img src=".github/assets/novera-banner-en.png" alt="Novera — Knowledge for everyone. Cyan holographic hand above a connected world." width="100%" />
  <p><strong>Knowledge for everyone. AI that keeps moving forward.</strong></p>
  <p>An independent AI assistant by TRON-ABS, bringing local models, cloud providers and evolving tools into one project.</p>
  <p><strong>In development</strong> · 70 interface language options · Apache 2.0</p>
  <p>Official contact: <a href="mailto:contact.novera.tronabs@gmail.com">contact.novera.tronabs@gmail.com</a></p>
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
| Multilingual interface | 70 selectable locales, each covering all 1,516 current English keys. Native-speaker review remains pending. |
| An extensible application | A desktop application with extension points for model engines, tools and future capabilities. |

These describe the source foundation. The current 1.0.0 source has been built and launched locally on Windows x64; public packaging and broader runtime validation remain in preparation.

## 70 interface language options

All 19 of our language contributions are integrated alongside the 17 inherited locales and 34 new Novera catalogs. The latest ten are Northern Uzbek, Zulu, Saidi Arabic, Northern Pashto, West Central Oromo, Saraiki, Dutch, Somali, Romanian and Assamese. **All 70 catalogs cover 1,516 / 1,516 current English keys (100%)**, including Wu / Shanghainese. The last 9,219 inherited-locale entries and 757 Wu entries were completed on 25 October 2026. This measures key coverage; native-speaker review remains outstanding. The local Windows build completed on 26 October includes these translations; no public binary has been released. Some catalogs are editorial variants partly based on shared written technical text; full vernacular adaptation remains open. See the language guide for their exact scope.

Arabic, Egyptian Arabic, Levantine Arabic, Sudanese Arabic, Algerian Arabic, Moroccan Arabic, Sindhi, Dari, Urdu, Western Punjabi and Iranian Persian include right-to-left interface support. Model language capabilities depend on the selected model and are separate from interface localization.

**[Explore every language, native label and coverage level →](docs/LANGUAGES.md)**

## Project status

**Novera 1.0.0 is in development; no public binary is available yet.** The source includes 35 Windows fixes, 70 interface catalogs with complete key coverage (1,516 keys each), the small-model Hub and updated cloud-provider presets. Native-language review is still needed.

First launch saves the system language, recommends LFM2.5-2.6B Q6_K on desktop with optional DSpark, and asks separately about error reporting, off by default. The latest local executable predates these final additions. See the [dashboard](TABLEAU_DE_BORD_NOVERA.md) for exact validation and limitations. GitHub Actions and automatic updates remain disabled.

## Documentation and contributions

- [User guide](docs/USER_GUIDE.md): setup, models, conversations and privacy.
- [Development](docs/DEVELOPMENT.md) and [build/release guide](docs/BUILD_AND_RELEASE.md).
- [Languages](docs/LANGUAGES.md), [roadmap](ROADMAP.md), [changelog](docs/CHANGELOG.md) and [contribution guide](CONTRIBUTING.md).

## Identity and license

Novera is maintained by **TRON-ABS** in [this repository](https://github.com/TRON-ABS/Novera). See the [identity policy](BRANDING.md) and [official release policy](OFFICIAL_RELEASES.md).

Novera builds on [Jan](https://github.com/janhq/jan), created by Menlo Research and its contributors. Original and third-party attributions and the [Apache 2.0 license](LICENSE) are retained. Jan downloads are not Novera releases.
