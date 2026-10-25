# Completion of all 36 interface catalogs — 25 October 2026

All 36 selectable interface locales now explicitly cover all 1,513 current
English keys across 14 namespaces. Added 9,219 missing translations in 176
JSON files across the 16 formerly incomplete inherited locales.

| Locale | Added keys | Final coverage |
| --- | ---: | ---: |
| es | 530 | 1513/1513 |
| fr | 586 | 1513/1513 |
| it | 463 | 1513/1513 |
| hi | 530 | 1513/1513 |
| id | 628 | 1513/1513 |
| pl | 628 | 1513/1513 |
| vn | 628 | 1513/1513 |
| zh-CN | 628 | 1513/1513 |
| zh-TW | 628 | 1513/1513 |
| de-DE | 628 | 1513/1513 |
| cs | 599 | 1513/1513 |
| pt-BR | 626 | 1513/1513 |
| ko | 531 | 1513/1513 |
| ja | 418 | 1513/1513 |
| ru | 583 | 1513/1513 |
| ca | 585 | 1513/1513 |

## Translation method and review

The user explicitly approved Google Translate after reviewing the proposed
scope: 650 distinct English UI strings, 23,185 characters, translated into the
16 languages. The exact source payload is in `translation-payload.json`.
Translation drafts are cached by locale under `cache/`.

Variables, code literals, HTML tags, URLs and technical identifiers were
protected before translation and checked after restoration. Batch delimiters
were checked; individual requests were used when batch output did not pass.
All drafts passed structural checks before any catalog was written.

Applied 98 targeted corrections, documented in `reviewed-corrections.json`,
including context-window counts, token budgets, Markdown, shell terminology,
French embeddings and upload wording, Chinese token terminology and the Polish
API-key fallback explanation. This is targeted review, not native-speaker
approval of every translation. Native-speaker review remains pending.
100% describes key coverage, not a certification of translation quality.

## Preservation and migrations

`baseline.json` records the original affected catalogs and the missing keys.
`post-integration-audit.json` confirms:

- Exactly 9,219 missing leaves were added.
- 14,488 existing leaves in affected files were retained unchanged.
- Two existing messages were repaired: Italian
  `common:toast.modelValidationStarted.description` had lost `{{modelId}}`;
  Polish `common:toast.downloadComplete.description` used `{{modelId}}`
  instead of the current `{{item}}`. See `existing-placeholder-corrections.json`.
- The obsolete flat `common.preview` string in each of the 16 inherited
  catalogs conflicted with the current nested `preview.*` messages. Its value
  was archived in `legacy-leaf-migrations.json` before that node was migrated.
  Other obsolete upstream keys were retained.
- No unexpected translation changes were found against the baseline.

The validator now checks missing keys, empty values, interpolation and code
literals for inherited catalogs as well as contributed ones. It continues to
allow historical extra keys in inherited catalogs. The language inventory,
`docs/LANGUAGES.md`, `SUIVI_LANGUES.md` and `PR.md` reflect the completion.

## Validation

`python scripts/check-novera-locales.py`: passed, zero errors, 36 locales at
1513/1513. Full output: `locale-validation.json`.

From `web-app`:

```text
node ../node_modules/vitest/vitest.mjs run src/locales/__tests__/complete-catalogs.test.ts src/locales/__tests__/localeKeys.test.ts src/locales/__tests__/wu.test.ts src/containers/__tests__/LanguageSwitcher.wu.test.tsx src/i18n/__tests__/keys.test.ts src/__tests__/i18n.test.ts
```

Six suites passed, 193 tests passed. Tests cover all-catalog key presence,
non-empty values, interpolation and code preservation, documentation inventory,
the existing localization regressions and runtime resolution of nested preview
messages and setup-step interpolation for each newly completed locale.

`git diff --check -- scripts/check-novera-locales.py web-app/src/locales web-app/src/containers/__tests__/LanguageSwitcher.wu.test.tsx`:
passed for tracked changes. New files were covered by the locale validator,
the baseline comparison and the targeted Vitest run.

No application compilation, installer, CI run, publication or external PR-state
verification was performed. The installed executable does not automatically
receive these source changes.

## Repository evidence export — 25 October 2026

This report and selected structured validation summaries are included in the
source synchronization. Raw drafts, translation caches, original-catalog
baselines, screenshots, local profiles and execution logs remain local.
References above to those working files describe the local audit workspace.
