# Novera — revue de la modification courante

## fix(i18n): add four complete interface locales

The next four languages in the roadmap were unavailable in setup and settings. Add Gujarati (`gu`), Kannada (`kn`), Levantine Arabic (`apc`) and Sudanese Arabic (`apd`), each with all 1,516 English keys across 14 namespaces. Novera now exposes 40 complete catalogs.

Register selector labels, persisted language types, system-locale matching, regional Intl formatting and RTL document/menu direction for both Arabic variants. Keep all 36 existing catalogs intact. Gujarati/Kannada use machine-assisted drafts and curated terminology; Arabic variants share technical Arabic and receive separate editorial adaptations. Native-speaker review remains pending; key coverage does not certify linguistic quality.

## Validation

- `python scripts/check-novera-locales.py`: 40 catalogs, 1,516 keys each, no errors (6,064 new entries).
- `node node_modules/vitest/vitest.mjs run src/locales/__tests__ src/containers/__tests__/LanguageSwitcher src/lib/__tests__/systemLanguage.test.ts src/hooks/__tests__/useGeneralSetting.language.test.ts` from `web-app`: 660 passed in 45 files, no failures. Covers complete keys/literals, native labels, persisted selection, system matching, hydration, interpolation and RTL menu restoration.
- `node node_modules/typescript/bin/tsc --noEmit` from `web-app`: passed.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed; `node scripts/check-architecture.mjs`: 13 modules, no violations.
- Documentation links and roadmap order checked; all 504 existing locale JSON files preserved byte-for-byte after line-ending normalization. Native review and a rebuilt runtime remain unvalidated.
- No application compilation, user-profile modification, remote CI activation or binary release. The previous full web suite remains a historical baseline; it was not rerun for this addition.

## References

- [Language inventory and methods](docs/LANGUAGES.md)
- [Current source/build status](TABLEAU_DE_BORD_NOVERA.md)
- [Remaining work](ROADMAP.md)
