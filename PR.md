# fix(release): verify the current public version and reviewed CLI platform scope

The public-release workflow and native CLI production check still reference 1.0.0 filenames and success messages, so they cannot validate the new 1.0.1 channels. Accept a reviewed repository descriptor, require its version to match the checked-out application, and derive the download and CLI identity expectations from it.

Canonical CLI verification can now include the reviewed macOS ARM64 package alongside the required Windows/Linux packages, and runs on all three native hosts. Unknown, duplicated, missing or unplanned platforms remain rejected. No public asset or channel is changed by these checks.

Validation: 12 Node public-feed/CLI contracts pass, Python syntax compilation passes, and actionlint passes. Actual anonymous downloads and native production checks will run only after signed packages and the final descriptor are published. This PR does not claim a successful public 1.0.1 release.

Depends on merged #36–#38 and overlaps only delivery verification scripts. Record the version-pinning lesson in the release memo. The final public descriptor will be added after all package identities are reviewed.
