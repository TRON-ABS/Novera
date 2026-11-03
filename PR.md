# docs(web): announce the confirmed Android 1.0.0 release

The launch website still says Android is in testing and offers no Android download button, although signed build 1000012 is public and the maintainer now confirms it works on their phone. Add the verified Android APK link to GitHub Pages, show Android availability in the hero and metadata, and retain the clean-package disclosure, default batch 512, modern-phone/API recommendation and at least 16K context for web search.

Record the maintainer’s global phone confirmation separately from the immutable build/publication receipts. Update both READMEs, launch status, Android follow-up and editable release notes. The APK and all four published asset digests stay unchanged; this is a showcase/documentation update. This report does not assert a separate per-feature device test matrix.

Validation: `node --test scripts/distribution/__tests__/prepare-pages-site.test.mjs`: two passed, including the exact 1000012 download link, updated availability/recommendations and rejection of the removed 1000011 URL. `git diff --check` passed. Existing public APK digest verified against GitHub metadata. Deployment uses the existing Pages workflow after merge; deployed commit, links and assets will be checked separately.

Follows merged #18 and #19. No open PR overlap found. The maintainer explicitly asks to send the working version and update the showcases; publication already exists, so no duplicate binary upload or new signing is needed. Existing authorization includes updating and merging release documentation and links. No desktop/CLI/portable feeds or assets change.
