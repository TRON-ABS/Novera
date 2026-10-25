# Novera — revue de la modification courante

## fix(docs): consolidate and refresh project documentation

The project had 36 main Markdown files with overlapping task journals, stale dependency snapshots and conflicting current/build status. Consolidate them into 14 maintained entry points and guides, keeping one current dashboard, one task roadmap and one dated changelog.

Preserve the 100-language planning table, all 35 Windows fix references, licensing and provenance guidance, provider-logo sources and technical agent examples. Replace references in active documentation and source comments/messages. The latest source baseline remains 36 locales at 1,516 keys; the latest local executable predates the final translations, internal renames and onboarding changes.

No new dependency, application build, user-profile change, remote CI activation or binary release. Source publication follows the maintainer’s existing authorization. No new pull request is created; check the remote for overlapping work before publishing.

## Validation

- Documentation audit: 14 main Markdown files instead of 36; 16 documents checked, 174 local links and anchors valid, no active references to retired documents. All 100 language-planning rows, 35 Windows-fix rows and four verbatim ADK excerpts preserved. License, branding policy and locale inventory unchanged.
- `python scripts/check-novera-locales.py`: 36 catalogs, 1,516 keys each, no errors.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed, 0 failed.
- `node scripts/check-architecture.mjs`: 6 areas, 13 modules, no violations.
- No application compilation or full web-suite rerun. The previous full web suite (5,187 passed, 2 skipped) is a historical source baseline.

## Review references

- [Current status](TABLEAU_DE_BORD_NOVERA.md)
- [Development and maintenance](docs/DEVELOPMENT.md)
- [Consolidated changelog](docs/CHANGELOG.md)
- [Remaining validation tasks](ROADMAP.md)
