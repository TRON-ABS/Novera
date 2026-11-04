# docs(readme): correct translation errors across eighty languages

The eighty README drafts contain technical mistranslations and contaminated translation fragments. For example, test fixtures became lighting/accessories, median results became means, and temporary numeric identifiers leaked into Cantonese, Nepali, Sindhi and Pashto prose. Correct those passages against the English/French source, restore the managed-components paragraph in Kinyarwanda, clarify test terminology in the source documents, preserve the CUDA Attention backend name, and correct damaged dates. Align creation-mode names with the existing interface catalogs and express the benchmark unit as tokens/s.

All eighty README files receive editorial corrections. Existing link destinations, images, inline/fenced code, numeric benchmark results and language navigation remain intact. Creation labels use the existing catalog terminology with explicit corrections where the catalog draft translates Auto as a car or contains stray newlines/separators. Update the language guide and changelog, including the precise section count: thirteen main sections and one subsection. This is assisted technical/editorial review; native and regional language approval remains outstanding.

Validation completed locally:

- `python .tmp/readme-review-2026-11-04/apply.py`: corrections across eighty README files, using an immutable pre-review snapshot and explicit source-to-correction mappings.
- `python .tmp/readme-review-2026-11-04/validate.py`: PASS for all eighty complete files. Compare Markdown block structure, emphasis, exact link/image destination multiplicities, local asset existence, inline/fenced code, eighty-language selectors, RTL containers and the three measured benchmark values against the pre-review snapshot; reject temporary translation identifiers and replacement characters. Each file retains nine tables, 124 rows and 277 data cells.
- Scoped `git diff --check`: PASS.

Task helpers and translation caches remain local. No application runtime tests or CI/native-language approval are claimed for this documentation change. Publication targets main as requested, with verification of the public files after pushing.

Based on a119d7b4c, which already includes the preceding forty-language additions (ca90c332c) and initial eight translations (2be3b6b91). Remote main was checked before publication; no equivalent review is merged or open. The only open PR, #22 (iOS window creation and simulator installs), has no source overlap or merge dependency. Unrelated working-copy changes are excluded.
