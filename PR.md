# fix(showcase): announce the verified Windows and Linux release

The public Novera v1.0.0 packages are available, but the README files and GitHub Pages still say downloads are closed. Link the canonical release, list the two supported desktop/CLI targets, and keep other platforms and formats explicitly internal. The Pages site remains an informational site; it does not host the Web application.

Update launch status, CLI availability and the official release policy. Mark the earlier validation documents as historical and record the canonical tag, unchanged asset transfer and exact build/test provenance. The provisional immutable tag is marked superseded; it is not rewritten or deleted.

Validation: both existing Pages contracts and diff checks pass locally. Public verification run 41388605836 succeeds: two unauthenticated HTTPS feeds, all fifteen exact asset sizes/SHA-256 hashes, updater signatures, the real Linux UI and CLI production check. Native installation/replacement run 41386813422 succeeds on both selected hosts. The real Windows candidate displays the current-version message on the available feed; the actual Windows CLI also passes its production check.

The first public version does not certify an upgrade between two public versions. Windows updater signing is not Authenticode. ARM64 visual checks, Apple credentials, mobile/device channels, hosted Web, MSI/Debian/portable scenarios remain separate gates. Pages deployment and its public HTML/image checks follow merging this PR.
