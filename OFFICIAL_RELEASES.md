# Official Novera releases and governance

## Authoritative channels

- Source and project decisions: [TRON-ABS/Novera](https://github.com/TRON-ABS/Novera).
- Published releases: [TRON-ABS/Novera/releases](https://github.com/TRON-ABS/Novera/releases).
- Responsible maintainer: [TRON-ABS](https://github.com/TRON-ABS).

A fork, a renamed package, a tag or a third-party download does not by itself establish an official Novera release. Official release publication requires the maintainer's authorization and publication through the repository above. A GitHub username in a commit author field is not proof of authorization.

At adoption of this policy on 23 October 2026, no Novera binary release has been published. Jan downloads and the historical Novera-Jan-archive repository are not Novera distribution channels.

## Changes to the official project

The maintainer sets the roadmap, accepts contributions and authorizes releases. Community suggestions and pull requests are welcome. [CODEOWNERS](.github/CODEOWNERS) routes review requests to TRON-ABS; that file is a review convention, not an access-control mechanism on its own.

GitHub repository rules control updates to `main` and tag creation. Separate history rules prevent force pushes and branch deletion, and tag-integrity rules prevent rewriting or deleting existing tags. The repository owner can administer these settings, so this is not a claim that repository administration is technically impossible.

## Preparing a release

1. Obtain explicit maintainer approval for the release scope and supported environments.
2. Validate the candidate, document the actual tests and their limits, and retain the original license and third-party notices.
3. Prepare a draft release from a reviewed commit, with Novera-specific versioning, assets, release notes and checksums.
4. Complete the applicable signing and verification process before publication. Signing infrastructure and an independent update feed are still to be established; this policy does not assert that binaries are already signed or attested.
5. Publish only after the maintainer authorizes the completed draft. With GitHub release immutability enabled, prepare all intended assets before publishing; published assets and their associated tag are then protected by GitHub's immutability controls.

Check the repository's current settings to confirm enforcement. The settings can change independently of this document. The repository's public rulesets provide the current technical controls.

GitHub Actions and application update checks remain disabled. The maintainer explicitly authorized a local Novera-Desktop build on 23 October 2026. That local build is not an installer, a published release or an authorization to enable automatic updates or remote CI.

## Identity and source permissions

See [BRANDING.md](BRANDING.md) for identity use and the distinction between official and independent projects. The [Apache 2.0 license](LICENSE) remains unchanged; repository controls do not prevent lawful copies or independent development.
