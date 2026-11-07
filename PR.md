# feat(release): stage reviewed signed artifacts directly into private drafts

Large signed Actions packages otherwise require downloading and uploading again through the maintainer's PC. Add a GitHub-hosted transfer workflow that accepts a reviewed repository descriptor and an existing private draft ID. It verifies the successful source run, original archive digest, exact payload bytes, pinned-key signatures and desktop publication prerequisites before upload; it then checks GitHub's stored size and digest. It neither receives signing keys nor publishes a release.

The initial descriptor uses the reviewed 1.0.1 Windows ARM64 artifact already staged locally, allowing an idempotent CI check against those exact existing bytes. Invalid paths, tags, versions, duplicate payloads, missing signatures, oversized files and public release destinations are rejected. Record the transfer and verified private signing-backup lessons in the release memo without storing private material.

Validation: three targeted Python staging tests pass. Full distribution Python checks and actionlint are run before submission. The actual GitHub transfer will be dispatched after the workflow reaches the default branch; local tests alone do not claim a successful remote transfer.

Depends on the merged 1.0.1 signing/publication prerequisites and preparation fixes (#26–#35). This delivery-only change does not alter the native application packages already compiling. Historical 1.0.0 release bytes remain unchanged.
