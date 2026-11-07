# fix(cli): prepare signed 1.0.1 packages for the original updater

The original 1.0.0 CLI updater accepts only a format-1 archive containing `jan`/`jan.exe` at the version-matched `v1.0.1` release URL. Pointing it at the current format-2 `novera` archive would fail validation. Prepare a separate compatibility archive containing the unchanged, already-published 1.0.1 executable with the original authenticated identity contract; preserve the canonical archives and channel.

The manual native workflow downloads canonical assets pinned by the reviewed public descriptor, verifies sizes, SHA-256 and Novera signatures, repackages them, signs the final compatibility bytes, and runs the real legacy-name executable on Windows x64, Linux x64 and macOS ARM64. It retains artifacts without publishing or changing a feed. Publication and a real original-updater migration check remain separate steps.

Validation: `python -I -B scripts/distribution/checks/test_legacy_cli_package.py` passes two tests, including all three target formats, exact executable preservation, old-version relabel rejection and overwrite refusal. `node --check scripts/distribution/prepare-legacy-cli.mjs` passes. Native workflow results are pending; no original public updater transition is claimed yet.

Related: #43 published the browser preparation and release presentation. The maintainer requires updates across all Novera distributions. The signed portable 1.0.1 build is running separately; iOS device signing and public Web release prerequisites remain explicitly tracked.
