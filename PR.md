# fix(build): load the current tar namespace in runtime staging

All five desktop CI candidates stop before native application compilation with `SyntaxError: The requested module 'tar' does not provide an export named 'default'`. The dependency update in #26 uses tar 7, which exposes named exports. Load its namespace so the existing `tar.x` archive extraction works with the pinned version.

Reproduce: run the desktop candidate from #26 on a clean runner with Node 24. The Windows x64 run 42341089285 and Linux/ARM64/Mac runs fail at `scripts/download-bin.mjs:7`. The production Web build and 8,069 application tests pass independently; those checks did not execute runtime staging.

Validation: Node syntax check and a real gzip-tar creation/extraction round trip against the installed dependency pass. Signed Desktop CI is relaunched to exercise the full runtime download and staging path; no native success is claimed before it finishes. Existing source contracts are rerun for this commit.

Depends on #26, already merged. No overlap with the independent iOS PR #22. The release lessons now require exercising build-time dependency imports after dependency migrations. See [1.0.1 tracking](docs/RELEASE_1.0.1_2026-11-07.md).
