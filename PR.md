# Novera — current change review

## fix(i18n): add ten complete locale catalogs

The next ten planned interface locales were unavailable. Add Northern Uzbek (Latin), Zulu, Saidi Arabic, Northern Pashto, West Central Oromo, Saraiki, Dutch, Somali, Romanian and Assamese: 1,516 English keys in 14 namespaces each. Novera registers 70 catalogs, adding 15,160 entries in 140 JSON files and preserving all 840 existing locale JSON files.

Connect native labels, persisted language types, automatic selection, document language, RTL menus and compatible regional formatting. Handle Intl canonicalization of uzn/pbu/gaz; skip explicit incompatible scripts and Southern Pashto rather than replacing those preferences with the new catalogs. Saved user choices retain priority.

Translation drafts combine Microsoft Translator, earlier DeepL results, local MADLAD-400/CTranslate2 inference and editorial corrections. Google returned HTTP 429 for this batch; DeepL reached its free quota. No paid service, account creation or quota bypass was used. Rejected local Oromo/Saraiki outputs are excluded. Uzbek is transliterated into Latin. Oromo includes 490 editorial completions. Saidi/Saraiki share 1,266/1,196 technical entries with existing Egyptian/Shahmukhi catalogs and adapt 250/320 entries. Their vernacular adaptation remains partial; key coverage does not certify linguistic accuracy. Native and regional review remain pending, as documented in the language guide.

## Validation

- `python scripts/check-novera-locales.py`: 70 catalogs, 1,516 keys each, zero errors; interpolation and code literals preserved.
- From `web-app`: `node node_modules/vitest/vitest.mjs run src/locales/__tests__ src/containers/__tests__/LanguageSwitcher src/lib/__tests__/systemLanguage.test.ts src/hooks/__tests__/useGeneralSetting.language.test.ts`: 963 passed in 45 files. Covers catalog completeness, selection, saved choice/hydration, canonical locale aliases, script selection, regional formats and RTL restoration.
- From `web-app`: `node node_modules/typescript/bin/tsc --noEmit`: passed.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed. `node scripts/check-architecture.mjs`: 13 modules, no violations.
- Documentation audit: 177 valid local links, 14 main documents, 100 historical roadmap rows, numbered priorities 1–32. All 840 previous locale JSONs unchanged after line-ending normalization. Unrelated model top-k, logo dimensions and binary sizes are preserved.
- Remote check: no equivalent open pull request; GitHub Actions remains disabled. Source publication is distinct from CI approval and binary release.
- No application build, installation or user-profile change. The full web suite was not rerun; previous full-suite results remain historical.

## References

- [Language inventory, translation methods and limitations](docs/LANGUAGES.md)
- [Current source and build status](TABLEAU_DE_BORD_NOVERA.md)
- [Remaining work](ROADMAP.md)
