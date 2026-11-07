# fix(release): validate the current signed candidate instead of old fixtures

The 1.0.1 installation/UI lanes still reference 1.0.0 bundles, a fixed old ARM64 executable hash and a hardcoded interface version. Require a reviewed descriptor matching the application version, exact platform bundle/signature names, commit and Windows runtime hash. Reject missing targets instead of silently testing an old package.

Stage the exact verified Windows ARM64 1.0.1 installer/signature in private draft 437373617 and bind the descriptor to their server IDs and SHA-256 values. The candidate archive matches GitHub's digest; the Novera updater signature and nine migration tests pass. Native installation/replacement and UI checks are launched separately; these outcomes do not certify a two-public-version upgrade.

Make the ARM64 no-update UI lane check the actual application version and accept a reviewed older production feed before publication. Record both versions explicitly, use anchored official asset URLs and retain the Windows/disposable-runner guards. The fast UI lane verifies the current descriptor's executable hash rather than a stale literal.

Validation: 19 Python distribution tests and three Windows UI contracts pass, including rejection of old, missing and cross-platform candidates and unsafe URLs. The real ARM64 CI lane is rerun against the staged bytes. Other desktop builds and the maintainer's future Windows x64 1.0.0-to-1.0.1 test remain distinct.

Depends on merged #26–#33. Only ARM64 is currently in the new descriptor; add other verified 1.0.1 targets as they finish. No public feed or binary is changed by this PR.
