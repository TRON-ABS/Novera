# fix(hub): discover Hugging Face models directly and update repository counts

The Hub depended on Jan's remote GitHub JSON feed despite supporting direct Hugging Face downloads. Replace that feed with paginated public Hugging Face discovery while keeping all six pinned Novera presets. Prioritize recognized original publishers, retain hardware-fit ordering, and distinguish original model publishers from community GGUF converters.

Discover text/multimodal GGUF repositories and MLX only on supported platforms. Cache pages for ten minutes, bound file-metadata concurrency to three, validate next-page URLs, deduplicate repositories and retain usable data on failure. HTTP 429 does not trigger automatic retries. Remove the unused Jan recommendation API and Vite catalog constants; invalidate only the regenerable old catalog cache. Installed models, credentials, conversations and profiles remain unchanged.

Promote the dated Hugging Face counts in both READMEs and the dashboard: 3,187,159 total model repositories (about 3.19 million), 214,900 GGUF and 27,295 MLX, observed on 26 October 2026. These are upstream repository counts, including variants, not a claim that every repository works in Novera. All six presets remain documented.

## Validation

- Targeted Vitest service, pagination/cache, Hub merge/ranking/conversion, comparison and localization tests: **257 passed across 11 files**.
- TypeScript app check without emission: passed.
- Architecture checker: six areas, 13 extracted files, zero violations; seven architecture tests passed.
- Locale checker: **70 catalogs with 1,516/1,516 keys**. UI controls reuse existing translations; no locale JSON changed.
- Public API smoke test through the new discovery code: **44 repositories**, all with file sizes, a next-page cursor and 49 metadata requests. No account token or model weights used.
- Documentation audit: 14 main Markdown files, 178 local links valid, all 980 locale JSONs and six pinned presets unchanged. No open overlapping PR; GitHub Actions disabled.

## Limits

The complete upstream index is not downloaded. Name filtering applies to loaded pages; exact repository IDs/URLs retain direct lookup. Unknown architectures and access-restricted weights are not guaranteed to work. Mac/MLX behavior and error cases are mocked for this change; no native Mac validation or desktop executable rebuild. No binary release, telemetry activation or user-profile change. GitHub Actions remain disabled.
