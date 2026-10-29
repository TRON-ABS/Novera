# Contributing to Novera

Development targets [TRON-ABS/Novera](https://github.com/TRON-ABS/Novera). Contributions and release preparation belong here. Do not open or update contributions against `janhq/jan` on behalf of Novera without an explicit request. This contribution policy does not replace the source license or restrict previously published contributions.

## Start here

- [Dashboard](TABLEAU_DE_BORD_NOVERA.md): current source/build status and validation limits.
- [Development guide](docs/DEVELOPMENT.md): architecture, compatibility and dependency references.
- [Build and release guide](docs/BUILD_AND_RELEASE.md): local toolchain, Windows, Android and distribution.
- [Roadmap](ROADMAP.md): remaining tasks; [user guide](docs/USER_GUIDE.md): intended behavior.

Use versions declared by `package.json`, `rust-toolchain.toml` and the relevant manifests. Android versions come from `scripts/android/toolchain.json`. Platform tools and resources are required separately. For local development, use the repository's `make dev` entry point after preparing its dependencies; see the build guide for the Windows launcher and its disabled targets.

## Required translations

Every new or changed user-facing text must be translated in **all 80 supported interface locales** in the same change: buttons, tooltips, menus, hints, confirmations, success messages and errors. Use translation keys, preserve interpolation variables and technical identifiers, and update `docs/language-support.json` and [the language inventory](docs/LANGUAGES.md). English fallback does not count as a translation. All catalogs currently have complete key coverage; native-language review remains open.

Run `python scripts/check-novera-locales.py` after changing interface text. Review assistance by native speakers is welcome; explain terminology changes and preserve message variables.

## Reports and focused changes

Search [issues](https://github.com/TRON-ABS/Novera/issues) and existing pull requests before starting. A useful report includes the exact version, operating system, hardware where relevant, steps, expected/actual behavior and a small reproduction. Remove secrets and personal conversation data from logs and screenshots. Send reports to this repository; Jan support channels are not Novera support channels.

Keep changes focused and preserve user data, saved preferences, compatibility interfaces, licenses and notices. Add regression coverage for meaningful behavioral fixes. Run the affected tests and type checks; run `yarn check:architecture` and `yarn test:architecture` when changing module boundaries. Native Rust tests compile code, so distinguish them from documentation or static checks. Do not claim CI, runtime or platform validation that has not happened.

## Commits and pull requests

Use a concise English Conventional Commit title describing the real change, for example `fix(chat): preserve drafts after save failure`. Stage relevant files only. Signing with an existing configured GPG/SSH identity helps verify authorship; never publish private signing material or change global Git configuration as part of an unrelated patch.

Write the PR title and description in English. Lead with the concrete problem and corrected behavior; include a short reproduction or before/after evidence, actual test commands/results and known limits. Use screenshots for visual changes when useful. Identify dependencies and overlaps, reference related issues, and use `Closes #…` only when the issue is fully resolved. Reuse an existing PR when continuing the same work and update [PR.md](PR.md) with its current scope and validation.

## Documentation and release policy

Update the existing guide for the topic, the dashboard for current status, the roadmap for remaining work and the changelog for dated evidence. Avoid a new Markdown file for every task or validation run. Technical subproject references and runnable agent examples remain separate where their consumers need them.

Sources can be newer than the last executable. GitHub Actions remains disabled; source publication is not binary-release authorization. Follow [official release policy](OFFICIAL_RELEASES.md) and [branding policy](BRANDING.md), retain the [Apache 2.0 license](LICENSE) and third-party attribution, and obtain maintainer authorization before publishing a binary release.
