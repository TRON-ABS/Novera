# docs(readme): add eight translations and repository language navigation

The repository landing page offered only English and French READMEs. Add complete Spanish, German, Italian, Brazilian Portuguese, Russian, Simplified Chinese, Japanese and Arabic versions, with the same ten-language selector at the top of every README. Readers can select a language directly from the repository home page. Arabic uses an RTL container; stable section anchors preserve navigation after heading translation.

Each translation retains the 14 main sections, nine tables, 124 table rows, release links, limitations, social profiles, attribution and support address from the English source dated 3 November 2026. Google Translate assisted the drafts; editorial corrections and structural checks do not replace native review. Linked guides retain their original languages. Update the existing language guide with this documentation scope.

Validation: Python MarkdownIt parsing confirmed matching heading/table/row/cell/list counts in all eight translations. Automated checks passed for exact inline code, external and relative link multiplicities, local asset/file existence, image syntax, section anchors, ten-language navigation, Bitcoin address and absence of translation placeholders or empty links. Scoped `git diff --check` passed. Documentation only; no application build or runtime certification. These checks are local, not CI or native-language approval.

The social-link change is already merged in #25 and is retained. No dependency on the open iOS PR #22; existing unrelated working-copy edits are excluded. Publication targets this repository's default branch so the selector is visible on its landing page.
