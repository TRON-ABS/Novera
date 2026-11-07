# chore(release): pin reviewed CLI 1.0.1 staging descriptors

The three signed CLI packages have completed run 42343121038. Pin their exact artifact IDs, source commit, archive digests and payload sizes/digests so GitHub-hosted staging can transfer those reviewed bytes directly into the existing private CLI draft.

Validation: all three original archives match GitHub digests and retained file checksums; all three final CLI update signatures verify against the pinned Novera updater key. The run also executes the signed-archive replacement test in an isolated directory on Windows, Linux and macOS ARM64. This does not claim a user-facing upgrade between two public versions.

Depends on merged #36. Payloads remain private until the channel and public-release checks are complete. No signing keys or generated packages are added to Git.
