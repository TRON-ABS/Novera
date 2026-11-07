# fix(release): gate publication notes on the verified release state

The 1.0.1 README and showcase preparation is separate from public package availability. A blind version replacement would carry forward the Android 1000012 phone-test claim and could announce unverified packages. Add a publication-only transformation for all 104 READMEs, with a preview that leaves source unchanged and an explicit refusal while release facts are unpublished.

Prepare complete public release-copy drafts in every repository language, preserve provider/model tables, and retain the prior version in the upgrade evidence statement. Regional written variants and assisted translation still require native editorial review. Refresh Android links/counters and state its actual package-only validation without inventing a device test. The showcase supports a separately tested published state while its default facts remain unchanged at public 1.0.0 / prepared 1.0.1.

Validation: 22 source/version/publication tests pass, including a preview of all 104 READMEs, an unpublished-state write guard, repeated transformation, old/new showcase states and the Android evidence boundary. Actionlint passes. No native application source changes and no 1.0.1 availability is published by this PR. Keep `published=false` until public release assets and update endpoints pass their checks.

Depends on merged #26–#32. Record the single-version desktop-manifest rule and safe disk cleanup in the release lessons. The cleanup removed only regenerable debug/test caches, freeing approximately 50 GB while preserving release artifacts, sources and signing keys.
