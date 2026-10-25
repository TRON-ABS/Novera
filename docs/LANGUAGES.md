# Novera interface languages

**36 selectable interface locales**, including regional and script variants. All 19 language contributions previously maintained on separate branches are integrated into Novera source.

This is interface localization. The languages a model understands or generates depend on the selected model; this list makes no claim about model quality in those languages.

## Required localization for new features

**Tout ajout de fonctionnalité comportant du texte visible doit être traduit dans l’ensemble des langues d’interface prises en charge, actuellement 36, dans la même modification.** Cette règle couvre aussi toute modification de texte : boutons, infobulles, menus, explications, confirmations, messages de succès et erreurs. Elle s’applique également aux catalogues historiquement partiels. Un repli vers l’anglais ne remplace pas une traduction. Utiliser les clés de traduction, préserver les variables et identifiants techniques, actualiser l’inventaire de couverture, puis exécuter `python scripts/check-novera-locales.py` avant compilation. Toute nouvelle langue prise en charge entre dans cette obligation.

24 October 2026: the five composer labels (advanced parameters, model defaults, assistant overrides, PDF and export hint), save/delete actions and their confirmation texts are now present in all 36 catalogs. This update adds 77 translations; historical gaps elsewhere in partial catalogs remain separate. Native-speaker review remains necessary. These latest translations are included in the local desktop executable rebuilt on 24 October 2026.

## Coverage and review

24 October 2026: message-footer action tooltips, accessible names, generation statistics and message-delete confirmation now have explicit entries in all 36 catalogs. This adds 436 translations, including seven existing memory/retry action keys absent from sixteen inherited catalogs. Message dates and numeric formatting follow the selected interface locale. These changes are included in the local desktop build of 24 October 2026.

All **36 interface catalogs contain all 1,513 current English keys** across 14 namespaces. On 25 October 2026, the remaining 16 inherited catalogs were completed with 9,219 additional translations after Wu was completed. This measures key coverage, not native-language review or translation quality. These translations were machine-assisted and still need native-speaker review. The Alibaba workspace and region help added on 25 October 2026 is present in all 36 locales; it has not yet been compiled into the desktop executable.

**Wu (Shanghainese): 1,513 / 1,513 keys (100%)**. On 25 October 2026, the 757 missing entries were translated across ten namespaces, preserving the 756 existing entries. Interpolation variables, code literals and technical identifiers were checked. Native-speaker review remains pending; these additions have not been compiled into the desktop executable. The 16 formerly incomplete inherited catalogs now also have full key coverage; this does not imply native-speaker review.

Arabic, Egyptian Arabic, Urdu, Western Punjabi and Iranian Persian use right-to-left layout, synchronized with document metadata and Radix menus/dialogs. Technical URL, email and number inputs remain left-to-right; free-text inputs use automatic direction.

## Complete selector inventory

| Locale | Language | Native selector label | Direction | English keys covered | Source |
| --- | --- | --- | --- | ---: | --- |
| `en` | English | English | LTR | 1513 / 1,513 | Inherited from Jan |
| `bn` | Bengali | বাংলা | LTR | 1513 / 1,513 | [Contribution 9381](https://github.com/TRON-ABS/Novera/commit/5affd45c30b10057f5f7751f5550ce148a7adcfc) |
| `ar` | Modern Standard Arabic | العربية | RTL | 1513 / 1,513 | [Contribution 9382](https://github.com/TRON-ABS/Novera/commit/a4bca7f321e6ea296de0e9d4fa45923e6828b689) |
| `ur` | Urdu | اردو | RTL | 1513 / 1,513 | [Contribution 9397](https://github.com/TRON-ABS/Novera/commit/8aefadf68b30506d7327e55a978c85d68607d762) |
| `pcm` | Nigerian Pidgin | Naijíriá Píjin | LTR | 1513 / 1,513 | [Contribution 9398](https://github.com/TRON-ABS/Novera/commit/9c6f6ae3caf4c9dd85f715ca38d44157bca2a245) |
| `arz` | Egyptian Arabic | مصري | RTL | 1513 / 1,513 | [Contribution 9400](https://github.com/TRON-ABS/Novera/commit/482d429940d2cbdb68d5a0b3c7d685667c73533b) |
| `mr` | Marathi | मराठी | LTR | 1513 / 1,513 | [Contribution 9401](https://github.com/TRON-ABS/Novera/commit/5d1787d233aa8edb6afed65985749fd970ea5dba) |
| `te` | Telugu | తెలుగు | LTR | 1513 / 1,513 | [Contribution 9402](https://github.com/TRON-ABS/Novera/commit/039bf57e59537eaa043ab22ddc4a75e7a5567f8b) |
| `ta` | Tamil | தமிழ் | LTR | 1513 / 1,513 | [Contribution 9403](https://github.com/TRON-ABS/Novera/commit/df665fdf9b70d06b9f10203d53eb5167bbd21e03) |
| `sw` | Swahili | Kiswahili | LTR | 1513 / 1,513 | [Contribution 9404](https://github.com/TRON-ABS/Novera/commit/fc7127b9e45db9bd2c150b448c15edfe23f94123) |
| `ha` | Hausa | Hausa | LTR | 1513 / 1,513 | [Contribution 9406](https://github.com/TRON-ABS/Novera/commit/e4259f6a100b26f71fa2e775fe43c054671149d8) |
| `pnb` | Western Punjabi (Shahmukhi) | پنجابی (شاہ مکھی) | RTL | 1513 / 1,513 | [Contribution 9408](https://github.com/TRON-ABS/Novera/commit/cef56cd697fe9edfbcc1441ae97b69f03f0ea7a6) |
| `tl` | Tagalog | Tagalog | LTR | 1513 / 1,513 | [Contribution 9409](https://github.com/TRON-ABS/Novera/commit/9a5c67ec3631d45bf9d093523c46c239ae6f3ea7) |
| `pt-PT` | Portuguese (Portugal) | Português (Portugal) | LTR | 1513 / 1,513 | [Contribution 9410](https://github.com/TRON-ABS/Novera/commit/feebfd09e9790284a48c4412eec8bd0a1c725d48) |
| `yue` | Cantonese | 粵語 | LTR | 1513 / 1,513 | [Contribution 9411](https://github.com/TRON-ABS/Novera/commit/c08f3313b074d6449fb4d08f9d6a7a1a10973723) |
| `wuu` | Wu (Shanghainese) | 吴语（上海话） | LTR | 1513 / 1,513 | [Contribution 9412](https://github.com/TRON-ABS/Novera/commit/cea04c0e641ce91656c02ca79d11db318508afa7), completed locally on 25 October 2026 |
| `fa-IR` | Iranian Persian | فارسی (ایران) | RTL | 1513 / 1,513 | [Contribution 9413](https://github.com/TRON-ABS/Novera/commit/7390c493df3373aae20a3598d6942fc59db71e3c) |
| `am` | Amharic | አማርኛ | LTR | 1513 / 1,513 | [Contribution 9414](https://github.com/TRON-ABS/Novera/commit/5834c83c2c0134af807454ba5f9d155dd0c0cfae) |
| `th` | Thai | ไทย | LTR | 1513 / 1,513 | [Contribution 9415](https://github.com/TRON-ABS/Novera/commit/9b9a4cab272ad9b96ae52a0c9c33f3d6ca891e70) |
| `jv` | Javanese | Basa Jawa | LTR | 1513 / 1,513 | [Contribution 9416](https://github.com/TRON-ABS/Novera/commit/ea9a66394fcbee0da167ab8776fbb857285aa865) |
| `es` | Spanish | Español | LTR | 1513 / 1,513 | Inherited from Jan |
| `fr` | French | Français | LTR | 1513 / 1,513 | Inherited from Jan |
| `it` | Italian | Italiano | LTR | 1513 / 1,513 | Inherited from Jan |
| `hi` | Hindi | हिंदी | LTR | 1513 / 1,513 | Inherited from Jan |
| `id` | Indonesian | Bahasa | LTR | 1513 / 1,513 | Inherited from Jan |
| `pl` | Polish | Polski | LTR | 1513 / 1,513 | Inherited from Jan |
| `vn` | Vietnamese | Tiếng Việt | LTR | 1513 / 1,513 | Inherited from Jan |
| `zh-CN` | Chinese (Simplified) | 简体中文 | LTR | 1513 / 1,513 | Inherited from Jan |
| `zh-TW` | Chinese (Traditional) | 繁體中文 | LTR | 1513 / 1,513 | Inherited from Jan |
| `de-DE` | German | Deutsch | LTR | 1513 / 1,513 | Inherited from Jan |
| `cs` | Czech | Čeština | LTR | 1513 / 1,513 | Inherited from Jan |
| `pt-BR` | Portuguese (Brazil) | Português (Brasil) | LTR | 1513 / 1,513 | Inherited from Jan |
| `ko` | Korean | 한국어 | LTR | 1513 / 1,513 | Inherited from Jan |
| `ja` | Japanese | 日本語 | LTR | 1513 / 1,513 | Inherited from Jan |
| `ru` | Russian | Русский | LTR | 1513 / 1,513 | Inherited from Jan |
| `ca` | Catalan | Català | LTR | 1513 / 1,513 | Inherited from Jan |

## Validation and release status

JSON parsing, namespace/key coverage, interpolation variables, code literals, selector/type registration and TypeScript syntax were checked without compiling the application. Regression tests from the original contributions are retained in source but were not executed during this integration. No type check, frontend build, Rust build, installer, runtime UI validation or CI validation is claimed.

Source availability does not mean an installed build already contains these languages. A local Windows x64 1.0.0 build has been verified; no public binary release exists. GitHub Actions is disabled on this repository while the no-compilation instruction is in effect.

The historical top-100 planning document is [SUIVI_LANGUES.md](../SUIVI_LANGUES.md). It is a roadmap, not a claim that 100 languages are supported.

Reproduce the catalog checks without compiling: `python scripts/check-novera-locales.py`. The selector inventory and measured coverage are also available in [language-support.json](language-support.json).

## Novera 1.0.0 integration in progress

At this integration stage, the local source had 1,465 English keys after adding assistant-deletion and project-save error messages. All 18 then-complete contributed catalogs included these two messages; native-speaker review remained pending. Wu then had partial coverage of 706 keys with English fallback; see the current coverage above for its completion on 25 October. This historical count describes that source stage, not the previously built 0.8.7 executable. The resulting source integration was subsequently built locally and approved for source publication on 24 October 2026; no public binary release is included.

## Local composer update — 24 October 2026

At this update stage, the five interface keys for advanced parameters and conversation export had translations in all 36 catalogs, along with save/delete actions and their confirmation texts. The 18 then-full contributed catalogs covered 1,510 keys; Wu was still partial at 753 keys. These are historical counts; see the current coverage above. Historical gaps elsewhere still use the English fallback. Native-speaker review remains pending. The local executable rebuilt on 24 October 2026 includes the controls and their updated placement, those 77 translations and six emoji icons. See [conversation controls](CONVERSATION_CONTROLS.md).

25 October 2026: Error tracking has a separate, default-off privacy control. Its title and data disclosure are translated in all 36 locales (72 entries). Translation coverage is checked; native-speaker review remains pending. No application compilation.

## Completion of inherited catalogs — 25 October 2026

Added 9,219 missing translations across 176 JSON files for Spanish, French, Italian, Hindi, Indonesian, Polish, Vietnamese, Simplified Chinese, Traditional Chinese, German, Czech, Brazilian Portuguese, Korean, Japanese, Russian and Catalan. All 36 locales now cover 1,513/1,513 English keys. Google Translate drafts were generated with the user’s explicit permission; 98 targeted terminology and phrasing corrections were applied locally. Native-speaker review remains pending.

Existing current-key translations were retained except for two repaired interpolation errors in Italian and Polish. The obsolete flat `common.preview` label in each inherited catalog was archived and replaced by the current nested preview messages. Other historical extra keys were retained. The validator now enforces full coverage, non-empty text, interpolation and code literals for inherited catalogs as well as contributed ones. Evidence: [completion report](../deliverables/locale-completion-2026-10-25/report.md). These additions have not been compiled into the desktop executable.
