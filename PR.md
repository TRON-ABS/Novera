# Novera — revue de la modification courante

## fix(i18n): add the next ten locale catalogs

Add Ukrainian, Xiang, Malayalam, Arabic-script Sindhi, Gurmukhi Punjabi, Sundanese, Igbo, Dari, Nepali and Malay with all 1,516 English keys in 14 namespaces each. Novera now registers 60 catalogs (15,160 new entries), preserving all 50 existing catalogs.

Connect selection, persisted types, system detection, RTL and regional formatting. Handle Intl canonicalization of `prs` to `fa-AF`; preserve Iranian Persian and Shahmukhi choices. Do not silently map Sindhi Devanagari to an Arabic-script UI. Eight catalogs use machine-assisted drafts; Xiang/Dari use shared written technical text with editorial adaptations. The language guide records their exact shared/adapted counts; native review and complete vernacular adaptation remain open.

## Validation

- `python scripts/check-novera-locales.py`: 60 catalogs, 1,516 keys each, zero errors; 15,160 new entries preserve interpolation variables and code literals.
- `node node_modules/vitest/vitest.mjs run src/locales/__tests__ src/containers/__tests__/LanguageSwitcher src/lib/__tests__/systemLanguage.test.ts src/hooks/__tests__/useGeneralSetting.language.test.ts` from `web-app`: 856 passed in 45 files, no failures. Covers complete catalogs, loading, native labels, persistence/hydration, canonical Dari, script selection, regional formats and RTL menu restoration.
- `node node_modules/typescript/bin/tsc --noEmit` from `web-app`: passed.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed; `node scripts/check-architecture.mjs`: 13 modules, no violations.
- Documentation audit: 176 valid local links, 14 main documents, 100 roadmap rows and remaining numbered priorities 1–42. All 700 existing locale JSON files preserved after line-ending normalization. Keep model top-k at 50 and the historical logo preview at 18/40 px; locale-count edits must not replace unrelated numbers.
- Reviewed untranslated UI labels and DSpark memory/context terminology; native review and complete Xiang/Dari vernacular adaptation remain open, alongside earlier documented variants.
- No application build, user-profile change, remote CI activation or binary release. The full web suite was not rerun; earlier full-suite results remain historical.

## References

- [Language inventory and methods](docs/LANGUAGES.md)
- [Source/build status](TABLEAU_DE_BORD_NOVERA.md)
- [Remaining work](ROADMAP.md)
