# feat(web): publish the experimental browser client with the showcase

The repository exposed the Web sources but its Pages deployment only hosted the showcase. Publish the actual 1.0.1 browser client at `/Novera/web/`, linked first on the showcase and in all 104 README presentations. Keep Desktop colors, local text at 32k, Exa search, and opt-in FLUX/ACE creation; state memory/performance limits and that Wan video is not integrated.

The reusable Pages workflow builds both hash-pinned WASM runtimes with their licenses, builds the browser application and stages both sites together. No model weights, personal profiles, API keys or source maps are shipped. Future showcase deployments reuse this workflow. Resolve bundled logos against the deployment base and refresh manifest/reload URLs while preserving the origin, local data and draft/generation guards.

Validation: production browser build passed; ten distribution/publication checks passed. 29 targeted frontend tests passed across five suites. Public deployment verification remains pending. GitHub Pages controls CDN caching; strict no-store headers, full security audit and Desktop performance parity are not claimed. iOS, portable and legacy CLI status are unchanged.
