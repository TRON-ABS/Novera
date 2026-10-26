# fix(docs): show all cloud provider icons on the repository homepage

The 27 cloud provider logos existed in the application source but were missing from the repository homepage. Add a complete three-column gallery to both READMEs, using the provider names, bundled official icons and documentation links from the application catalog. Promote the gallery near the top, add header navigation and show the provider count alongside the existing language count.

Keep the Hugging Face repository counts dated and distinguish them from Novera compatibility. Retain the development status and link to the detailed setup and brand-provenance guides. Reuse existing SVG/PNG assets; derive four documentation-only PNGs from the ICO originals without changing decoded RGBA pixels.

## Validation

- Both galleries checked against all 27 configured providers: no omitted or duplicate provider; all local image paths, dimensions and alternative text verified.
- Four PNG derivatives decoded and compared with their ICO originals: identical RGBA dimensions and pixels.
- Documentation audit: 14 main Markdown files and 182 valid local links; application sources, all 980 locale JSONs and six pinned model presets remain unchanged.
- GitHub page rendering is checked separately after publication. No application tests or executable rebuild for this documentation-only change.

## Limits

The gallery describes source integrations, not live account certification or a new compiled release. Trademarks remain owned by their respective holders. GitHub Actions remain disabled; no application behavior, credentials, consent or model files change.
