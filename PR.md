# fix(distribution): validate signed Novera desktop packages and CLI updates

Novera's launch candidates previously lacked a verified update path, and raw Windows packaging could differ from the signed installer. Add explicit signed build modes, authenticate final bundle bytes with the pinned Novera key, retain source/runtime provenance and exercise installation and native replacement on disposable GitHub hosts. Public release stays blocked until all remaining delivery requirements are met.

## Desktop results

- Windows x64/ARM64: run [41336767111](https://github.com/TRON-ABS/Novera/actions/runs/41336767111) passes. Actual NSIS installation and native replacement preserve 106/nine runtime file hashes, a synthetic profile witness and startup before/after. A standard isolated Windows profile fixes the test harness's known-folder lookup; no Novera rebuild was required for that issue.
- Linux x64 and both macOS architectures: run [41334675673](https://github.com/TRON-ABS/Novera/actions/runs/41334675673) passes those three jobs. The AppImage is restored to its exact digest; 22 ARM64 and 30 Intel app files match before/after.
- Downloaded receipts match their GitHub artifact digests. Every scenario checks the real native updater signature, altered-payload rejection and same-version behavior.

The probe advertises synthetic version 0.9.9 and installs the real 1.0.0 package. These tests do not certify the production UI route, two released-app version transitions, visual behavior or all inference engines. No personal maintainer profile is used.

## Signed CLI channel

Add an opt-in feature with the official Novera endpoint, pinned key, Minisign and SHA-256 authentication, signed version/platform/commit identity, native architecture checks, downgrade refusal and staged executable replacement. Default and older CLI candidates retain their disabled updater policy. CI produces signed archives and exercises replacement on three hosts.

The first signed CLI matrix compiled and signed its archives, then failed the public probe fixture test after Git normalized its CRLF bytes. Preserve the authenticated 36-byte probe as a binary file; the committed blob matches SHA-256 7171a7c951ed39095b4d4c398f5efbe45c45df3a2e82245e060fb0927d0e3e14 and the pinned-key Node verifier succeeds. The corrected three-host retry is pending; no CLI installation success is claimed.

The corrected Linux retry passes all seven signed-channel tests. Its separate replacement test then fails before opening the archive because Cargo starts library tests from the package directory. Pass a native absolute archive path on Windows and Unix. The other two jobs continue; no successful CLI replacement is inferred from the signature tests.

## Validation and publication limits

Web preparation records a reviewed revision and file digests, and checks an HTTP response contract for no-store version metadata, revalidated HTML and matching payloads. Three local HTTP tests cover successive revisions at one origin, stale content refusal and unsafe transport rejection. GitHub Pages is not configured (read-only API check returns 404). No hosting is enabled, browser upgrade is claimed or public deployment is made; the selected origin and real browser renewal test remain required. See [Web delivery](docs/WEB_DELIVERY.md).

Local checks: 49 Node distribution contracts, six Python guard/package tests, two signed-feature CLI policy/help tests and seven Rust signed-channel tests pass. The CI-only signed executable replacement test is explicitly ignored locally and must run against real CI-produced archives. GitHub source checks pass. Windows runtime provenance and the incomplete original Actions archive remain documented separately from prepared candidates.

The private draft contains 15 verified assets below 2 GiB each and remains draft/prerelease. No public latest.json or latest-cli.json exists. Production UI/feed validation, Apple signing/notarization, mobile production channels/device tests, Web deployment/renewal and MSI/Debian/portable scenarios remain distinct requirements. No certification or public release is implied. See [launch status](docs/LAUNCH_STATUS.md) and [test protocol](docs/INSTALL_UPDATE_VALIDATION.md).
