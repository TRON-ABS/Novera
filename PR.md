# docs(macos): publish official Mac downloads and installation guidance

The Mac release now provides validated Intel and Apple Silicon packages. Add the direct DMG downloads to both READMEs and the Pages showcase, explain the architecture-specific macOS minimum, and document first-launch authorization for packages without Developer ID/notarization. Keep iOS explicitly unavailable for iPhone installation.

Document exact native/build/revalidation provenance and the limits: no visual or physical-Mac validation and no MLX-inference claim. The native worker fix passes all engine/HTTP/supervision suites on both architectures; Intel reused the exact signed packages after cold Metal discovery exceeded the old harness deadline. Native signed replacement, corrupt-payload rejection and profile preservation pass.

Extend public-feed verification for the two Darwin Desktop updater archives and add the reviewed Mac descriptor, preserving Windows/Linux/ARM64 URLs and the byte-identical CLI/portable feeds. Update the public verification workflow to use that descriptor.

Depends on merged PR #21. PR #22 contains separate iOS/mobile changes and remains open; this documentation PR must not overwrite them. Public asset transfer/verification and Pages deployment are completed before final availability is reported.

Validation: 11 targeted Pages/feed tests passed, workflow actionlint and git diff --check passed. Both architecture publication checks passed locally against exact downloaded signed archives; the Intel metadata is explicitly reconstructed from verified CI/native provenance. Public transfer and final anonymous validation are pending before merge/availability announcement.
