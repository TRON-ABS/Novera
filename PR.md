# docs(android): link the published 1000012 consent fix

The public 1000012 APK fixes the missing error-reporting destination. Update download links and availability to the verified replacement. Record that the maintainer explicitly authorized deleting the complete old 1000011 release after GitHub rejected deleting only its immutable APK asset. Preserve historical receipts and tags, and document that the old release API/download now return 404.

Validation: the four new assets were downloaded anonymously and their sizes and SHA-256 matched. New APK 1000012: 42,256,746 bytes; SHA-256 `ac828c2d87db6d4db6f1e9253ef7ca98df6779be2e424b1b47f836cf6e1eed6f`. Source PR #18 is merged; final source-contract CI 41581774090 passed. No conversations, downloaded models, private keys or source maps packaged. The existing latest release and its asset digests remain unchanged. Documentation only; no new application tests required. Phone retest remains pending.

This documentation update and its merge are included in the maintainer’s explicit approval to finalize the 1000011 → 1000012 replacement. No remaining dependencies or source overlap.
