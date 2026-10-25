# Novera — revue de la modification courante

## fix(i18n): add ten complete interface catalogs

The next ten roadmap locales were unavailable in the language selector. Add Yoruba, Bhojpuri, Jin, Min Nan, Burmese, Algerian Arabic, Hakka, Lingala, Moroccan Arabic and Odia with all 1,516 English keys in 14 namespaces each (15,160 new entries). Novera now registers 50 catalogs.

Connect selection, persisted types, system matching, RTL document/menu direction and compatible Intl regional formats. Preserve all 40 existing catalogs. Five catalogs use machine-assisted drafts; five use shared written Arabic/Chinese technical text with dialect-specific editorial adaptations. The language guide records the shared/adapted entry counts. Full key coverage is not a claim of complete vernacular translation or native review; both review and deeper vernacular adaptation remain open.

## Validation

- `python scripts/check-novera-locales.py`: 50 catalogs with 1,516 keys each, no errors; all 15,160 new entries preserve variables and code literals.
- `node node_modules/vitest/vitest.mjs run src/locales/__tests__ src/containers/__tests__/LanguageSwitcher src/lib/__tests__/systemLanguage.test.ts src/hooks/__tests__/useGeneralSetting.language.test.ts` from `web-app`: 757 passed in 45 files, no failures. Covers explicit text loading, native labels, persistence/hydration, system matching, interpolation, regional formats and RTL menu restoration.
- `node node_modules/typescript/bin/tsc --noEmit` from `web-app`: passed.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed; `node scripts/check-architecture.mjs`: 13 modules, no violations.
- 175 local documentation links valid; 100 roadmap rows retained and remaining priorities renumbered to 1–52. All 560 existing locale JSON files preserved after line-ending normalization.
- Removed 2,904 spurious translation prefixes in Bhojpuri/Lingala drafts and added a regression guard; reviewed DSpark memory/context explanations. Native review and complete vernacular adaptation of the five editorial variants remain open.
- No application build, user-profile modification, remote CI activation or binary release. The full web suite was not rerun; earlier full-suite results remain historical.

## References

- [Language inventory, methods and limits](docs/LANGUAGES.md)
- [Current source/build status](TABLEAU_DE_BORD_NOVERA.md)
- [Remaining work](ROADMAP.md)
