# fix(validation): support Ubuntu's Python in production CLI checks

The public-release workflow runs on Ubuntu 22.04 with Python 3.10. Its CLI production check used `hashlib.file_digest`, introduced in Python 3.11, so it would fail before checking the real signed CLI against the public feed.

Compute the same SHA-256 incrementally with the supported hashlib API. The expected checksum, selected signed archive, isolated profile, command and success conditions are unchanged. No application payload is rebuilt or modified.

Validation: local Python syntax and diff checks pass. The existing eleven Python tests pass. The real production command will also execute in the public verification workflow after the canonical v1.0.0 release is available; this PR does not claim that result in advance.

This follows merged PR #5 and does not overlap an equivalent open PR. The release tag correction transfers the exact already-verified assets separately and does not change their signatures or provenance.
