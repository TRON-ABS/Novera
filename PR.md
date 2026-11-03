# docs(community): link the official Novera Facebook page

The showcase and both READMEs did not link the newly created Novera Facebook page. Add its exact public profile URL and invite users to share creations, models, settings, questions, issues and ideas through Facebook or the project email. Remind users to remove personal information and credentials from public feedback.

The page was created with explicit maintainer approval and configured with the original cyan hand, official banner, project website, contact email and public biography. The authenticated page view is verified; logged-out Facebook access and the welcome post remain unverified because a saved browser permission denies Facebook access. This change does not claim either is complete.

No dependency on the still-open iOS/mobile PR #22; no workflow or application code changes. Preserve its separate work and existing distribution links. No paid promotion.

Validation: `node --test scripts/distribution/__tests__/prepare-pages-site.test.mjs scripts/distribution/__tests__/web-delivery.test.mjs` — 5 passed. Scoped whitespace check passed. Pages deployment and public HTML verification follow merge and are recorded separately.
