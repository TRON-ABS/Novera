# feat(i18n): add ten interface language catalogs

Novera previously exposed 70 interface locales. Add Cebuano, Kazakh, Sinhala, Xhosa, Khmer, Afrikaans, Maithili, Wolof, Northern Kurdish and Kinyarwanda, bringing the source catalogs to 80 locales with all 1,738 English keys across 14 namespaces.

Register native selector labels, persist the selections, recognize the new system locales and handle Northern Kurdish explicitly without selecting it for Arabic-script Kurdish. Preserve placeholders, code literals and technical identifiers. Use the existing translated errorDialog.details key for upscaler diagnostics instead of the missing common:details key.

The new catalogs are machine-assisted drafts: Google provides most translations, Microsoft's public web interface completes Kinyarwanda, and two short commands receive assistant editorial corrections. Native review is pending. Six rare-language Lara smoke tests work without a key or login; the Magahi test returns an artifact, so those tests do not add six catalogs or certify linguistic quality.

Update the English/French README, language inventory and roadmap, dashboard, changelog and project rules. Source publication and GitHub showcase synchronization do not create a new application binary, enable GitHub Actions or establish CI approval. The previous Windows build contains 70 locales.

## Validation

- python scripts/check-novera-locales.py: 80 locales, 1,738 keys each, zero structural errors.
- TypeScript: node node_modules/typescript/bin/tsc --noEmit -p tsconfig.app.json --pretty false passes.
- Targeted locale, system-language, persistence, selector and creation-stream tests: 589 tests pass across 7 files (combined final results after the selector-fixture correction and existing missing-key fix).

No external issue is closed. No PR dependency or required merge order is introduced; linguistic review and real visual checks for the ten new locales remain open.
