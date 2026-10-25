# Wu (Shanghainese) catalog completion — 25 October 2026

Added 757 missing Wu translations across ten namespaces. The 756 existing
translations were preserved. Wu now covers all 1,513 English keys across the
14 registered namespaces. Coverage means key presence; native-speaker review
of translation quality remains pending.

The draft in `translations.txt` was matched against the exact missing-key set
before any catalog was written. Interpolation variables, code literals and
technical identifiers were compared with English. `additions.json` records
the per-namespace counts; `locale-validation.json` records the final audit.

Validation:

- `python scripts/check-novera-locales.py`: passed, zero errors, Wu 1513/1513.
- From `web-app`, `node ../node_modules/vitest/vitest.mjs run src/locales/__tests__/wu.test.ts src/containers/__tests__/LanguageSwitcher.wu.test.tsx`:
  two suites passed, 19 tests passed. Checks include complete key coverage,
  placeholders, technical identifiers, language selection, preference restoration
  and newly translated messages with interpolation.
- `git diff --check -- web-app/src/locales/wuu web-app/src/locales/__tests__/wu.test.ts web-app/src/containers/__tests__/LanguageSwitcher.wu.test.tsx`: passed
  for tracked changes. The Wu files and tests are currently untracked in this
  checkout; their contents were checked by the validator and Vitest above.

Updated `SUIVI_LANGUES.md`, `docs/LANGUAGES.md` and
`docs/language-support.json`. No application compilation, publication, CI run
or external PR-state verification was performed for this change.

## Repository evidence export — 25 October 2026

This report and selected structured validation summaries are included in the
source synchronization. Raw drafts, translation caches, original-catalog
baselines, screenshots, local profiles and execution logs remain local.
References above to those working files describe the local audit workspace.
