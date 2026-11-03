# docs(community): publish all official Novera social links

The showcase and both READMEs exposed only Facebook. Add the verified Instagram, TikTok, YouTube, X and Bluesky profile URLs alongside Facebook, with the existing invitation to share creations, models, settings, questions and ideas. The showcase navigation now jumps to the community section, whose buttons wrap on small screens. Keep the original cyan hand and banner assets.

LinkedIn has no official Novera page yet and is excluded. Link TikTok’s existing profile without claiming its welcome post has cleared moderation. Supersedes the Facebook-only coverage added in #24. No dependency or file overlap with the open iOS PR #22.

Validation: `node --test scripts/distribution/__tests__/prepare-pages-site.test.mjs scripts/distribution/__tests__/web-delivery.test.mjs` — 5 passed. Generated HTML and both READMEs contain all six exact profile URLs from the private verified registry. Browser preview shows all six labeled buttons. Scoped `git diff --check` passed. Pages deployment and live HTML verification follow merge. Scope: documentation and showcase links only.
