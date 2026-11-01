# fix(distribution): validate signed desktop and CLI update packages

Novera's launch candidates previously lacked a verified update path, and the copied Windows runtime could differ from its signed installer. Add explicit signed build modes, authenticate final bytes with the pinned Novera key, preserve source/runtime provenance and exercise installation and native replacement on disposable GitHub hosts. Public release remains blocked until the outstanding production and format-specific requirements are met.

## Verified desktop behavior

- [Windows run 41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) passes x64 and ARM64 NSIS installation and native replacement. The 106/nine runtime file hashes, synthetic profile witness and startup before/after match. The test harness uses a standard isolated Windows profile and checks its known folders before starting the app.
- [Linux/macOS run 41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) passes those three jobs. The AppImage is restored to its exact digest; 22 ARM64 and 30 Intel app files match before/after.
- Downloaded receipts match GitHub digests. Each scenario verifies the native signature, modified-payload rejection and same-version behavior.

The probe advertises synthetic version 0.9.9 and installs the real 1.0.0 package. These tests do not certify the production UI route, a transition between two released applications, visual behavior or all inference engines. The incomplete original Windows Actions ZIP remains separate from its prepared candidate. No installer runs on the maintainer's personal profile.

## Verified CLI behavior and manifest preparation

[Run 41341759700](https://github.com/TRON-ABS/Novera/actions/runs/41341759700) passes Windows x64, Linux x64 and macOS ARM64. Each downloaded artifact passes eleven checksums; native architecture, embedded trust key, signed archive identity and cryptographic signatures are independently rechecked. Receipts confirm tamper refusal, executable replacement, successful execution and witness preservation. This replaces a synthetic file with the real CLI; it does not certify every in-use process replacement or a production endpoint.

The opt-in feature uses only the official Novera endpoint, Minisign plus SHA-256, signed version/platform/commit identity, native architecture checks, downgrade refusal and staged replacement. Default and earlier CLI builds retain their disabled updater policy. The offline feed generator requires all three independently reviewed proofs, rechecks actual archive signatures and internal identities, refuses mismatched receipts or versions and creates canonical release URLs without overwriting existing output. Both desktop and CLI manifests are prepared locally; none is publicly served.

## Web renewal and validation

[Web run 41339452516](https://github.com/TRON-ABS/Novera/actions/runs/41339452516) passes. Its downloaded candidate passes 595 checksums, and HTTP validation checks all 588 frontend files with no-store version metadata and revalidated HTML. A real isolated browser reload between builds 307fbb16 and a1fe94cc loads a different hashed entry bundle and preserves the visible dark-theme preference and settings route. Native-feature warnings remain documented; complete Web functionality is not certified. GitHub Pages is not configured (API 404), and no public hosting is enabled.

## Tests and remaining gates

- 55 Node distribution contracts and seven Python guard/package tests pass locally. The workflow runs the same source checks.
- The three CLI jobs each pass two help/policy tests, seven signed-channel tests and the separately executed CI-only replacement test. No local Rust rebuild is needed for manifest preparation.
- `node --test scripts/distribution/__tests__/prepare-cli-feed.test.mjs scripts/distribution/__tests__/web-delivery.test.mjs` covers feed prerequisites and HTTP revision/cache behavior; `python -m unittest discover -s scripts/distribution/checks -p 'test_*.py'` covers packaging identities and isolated validation guards.
- The internal CLI manifest was generated from the three real signed packages, rechecking their archive identities and signatures.

Source-only run [41345584039](https://github.com/TRON-ABS/Novera/actions/runs/41345584039), commit 6129a15a, passes: 55 Node tests (53 passed, two Windows-specific tests skipped on Ubuntu) and seven Python tests. Later documentation-only changes report these results without requiring another application build. See the [consolidated evidence and outstanding inputs](docs/VALIDATION_RESULTS_2026-11-01.md).

The private draft contains 15 verified assets below 2 GiB each and remains draft/prerelease. No public latest.json or latest-cli.json exists. Production UI/feed validation, Apple signing/notarization, mobile production channels and devices, real Web hosting/cache behavior and MSI/Debian/portable scenarios remain distinct requirements. No certification or public release is implied. See [launch status](docs/LAUNCH_STATUS.md) and [the test protocol](docs/INSTALL_UPDATE_VALIDATION.md).
