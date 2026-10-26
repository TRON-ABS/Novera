# fix(docs): synchronize the GitHub showcase with current Novera sources

The repository About description still advertised 36 interface language options although the published source contains 70. Update the GitHub description to 70 locales, 27 cloud providers and the adaptive model Hub. About is a repository setting and is maintained separately from README commits.

Align both READMEs with progressive category scrolling, the Safetensors/Transformers text engine and the full set of 14 RTL locales. Clarify that earlier Windows builds were tested locally while the latest changes still await the maintainer’s build. Retain upstream and third-party attributions, model task limitations and the absence of public binaries.

Add the maintainer’s permanent instruction to NOVERA.md and the development guide: every repository synchronization must also check the live GitHub showcase, About/homepage, rendered English/French READMEs, counts, links/images, topics and release status, with any access limitation reported explicitly.

## Validation

Both README galleries match the 27 predefined providers, with 27 distinct icons each. All 98 local references, including images and anchors, resolve against the current tree. Source registries confirm 70 catalogs with 1,587 keys each, 14 RTL locales and 23 Hub navigation entries. The live About description was updated and read back successfully; the homepage and topics were retained. No public releases are present and Actions remains disabled. Validate the rendered English/French documents after publishing this commit; audit evidence stays local under `.build/showcase-2026-10-26/`. No application behavior, license text, model weights, credentials or binary artifacts change. Existing 309-test application validation remains historical; no new application tests or compilation are needed for this documentation/metadata change. GitHub Actions stays disabled.
