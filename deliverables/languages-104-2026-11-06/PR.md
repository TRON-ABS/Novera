# feat(i18n): expand interface catalogs and READMEs to 104 locales

The selector contained 80 locales and did not expose the 22 remaining roadmap entries or Turkish and Swedish. Add 24 catalogs with all 2,429 English keys in 15 namespaces, register them in the selector and system-language matching, and extend RTL handling, Intl aliases and translated creation commands. Add the corresponding 24 READMEs and update all 104 README selectors and inventory counts.

For example, selecting Turkish now loads the Turkish catalog and persists `tr`; selecting Uyghur loads its catalog and changes both document and menu direction to RTL. Explicit incompatible script preferences continue to fall back safely.

## Scope and provenance

All additions are assisted drafts requiring native review. Seven are explicitly partial written regional adaptations: `gan`, `pbt`, `ars`, `acm`, `tts`, `azb`, `ctg`. They retain shared written technical language and are not claimed to be fully vernacular. Pashto uses Google `ps` with Southern spelling conventions; Azerbaijani uses Google `az` plus Arabic-script conversion. Other methods and limitations are recorded in [RAPPORT.md](RAPPORT.md) and [source-decisions.json](source-decisions.json).

Turkish reuses compatible strings from Jan [#8939](https://github.com/janhq/jan/pull/8939), with [#9000](https://github.com/janhq/jan/pull/9000) also checked; Swedish reuses compatible strings from [#8829](https://github.com/janhq/jan/pull/8829). These upstream PRs were open and unmerged when checked. Neither locale was present in the checked Jan main branch. The checked Novera open PR list contained an unrelated iOS contribution. No equivalent merged addition was found during this preparation.

## Local validation

- `python scripts/check-novera-locales.py`: 104 locales × 2,429 keys, zero errors.
- From `web-app`, `node ../node_modules/vitest/vitest.mjs run` with the seven paths in [final-validation.json](final-validation.json): 1,118 tests pass together in the final run. Twenty-four added regression cases prevent merged labels, unrelated scripts, altered interpolation syntax and lost numeric signs in the new catalogs.
- From `web-app`, `node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit`: exit 0.
- Authoring-workspace integrity checks: 360 new JSON files, 24 new READMEs, 104 selectors with 104 links each, unchanged hashes for the 1,200 existing catalog files and preserved existing README bodies except the documented counter/selector/source notes. Translation helpers, caches and raw model references are excluded from the repository payload; the compact results are in `final-validation.json`.
- Markdown structure, emphasis, code, links, images, anchors, local destinations and the Bitcoin address are checked before README files are copied into the repository.

Native build, CI, native linguistic approval and publication have not been performed. No merge-order dependency is introduced. The existing engine preparation in the root `PR.md` remains separate; both changes may touch the root README selectors or documentation and should be reviewed together if combined.

## Follow-up content review

The extended audit examines all 68,064 new catalog strings and README fragments. At least 245 distinct locale/text pairs were corrected, covering 329 JSON key occurrences and 22 README fragments with recorded before/after evidence. Corrections include neighboring button labels appended by batch translation, untranslated actions, descriptions reduced to technical identifiers, repetitive output and missing numeric signs. Isolated translation requests, short community terminology references and editorial review replace these cases. The 24 READMEs were regenerated and validated afterward; existing 80 catalog hashes and README body baselines remain preserved.

These automated checks and targeted semantic corrections do not establish complete native linguistic quality. The seven regional adaptations remain explicitly partial. A local NLLB research pilot did not resolve their limitations and none of its output was integrated. See [full-review-summary.json](full-review-summary.json).
