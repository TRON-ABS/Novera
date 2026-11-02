# docs(distribution): announce the verified Windows x64 portable release

The presentation site and README availability tables still list portable as internal. Announce the published, immutable 1.0.0 Windows x64 portable release only after its exact public files and production current-version check pass. Add a portable download link, explain that Data travels with the complete folder, and link the usage/limitations guide. Update the release status and evidence without changing application binaries.

Public verification [41504580547](https://github.com/TRON-ABS/Novera/actions/runs/41504580547) passes all 26 unauthenticated files, three feeds and seven payload signatures, plus the actual Linux AppImage Settings check and CLI production check. The exact signed Windows portable also displays the production current-version message and preserves its synthetic profile after movement and native replacement. Native component checks remain recorded separately in run 41499152235; Windows Server graphical coverage is not claimed.

The footer retains the authorized maintainer name, independent researcher status and country, collective thanks/future wishes, and GPT-6.1 Sol credit delivered by merged PR #10. Existing original-project attributions, Bitcoin support information and both presentation images remain intact. Application version stays 1.0.0; the hosted Web client remains internal.

Validation: targeted Pages/public-feed tests, showcase copy checks and diff checks; source checks are required before merge. Depends on merged PR #10 and the already published portable release; no open PR dependency remains.
