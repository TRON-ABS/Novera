# fix(distribution): validate Windows ARM64 at application version 1.0.0

Windows ARM64 is built and cryptographically verified, but its actual Settings UI and public update target are not certified. Add a disposable native ARM64 installation/UI lane and prepare the additive Windows ARM64 publication without changing the application version or existing immutable Windows/Linux assets.

The `validate-arm64` target installs the exact staged NSIS, exercises native replacement and preservation checks, then drives the actual installed ARM64 WebView2 through the documented Playwright CDP connection. A fresh profile and loopback diagnostic port belong only to the CI child process. No shipped binary, IPC service or privacy setting is mocked or modified. Local, x64 and self-hosted executions are refused.

The public verifier supports reviewed per-platform URLs across the canonical and supplemental releases. It preserves x64/Linux desktop and CLI links, rejects other repositories/versions, checks the combined nineteen files and all five payload signatures. The ARM64 feed is prepared privately; publication waits for the native result.

Local validation: eight targeted Node tests, eleven Python tests, Node/Python syntax, actionlint and diff checks pass. The exact ARM64 installer again passes `ci-check-updater.mjs --publication-check`; its SHA-256 is `85cab2cb6ececd8d85cb9198769a5076f03ba72c3847ab857af9b3406762a3f3`. Native and public UI results will be recorded only after execution.

ARM64 ships the native CPU text engine, excluding the x64 CUDA image runtime. Updater signing is not Authenticode. Onboarding, all models, a CLI ARM64 build and an upgrade between two public versions are outside these checks. The portable distribution follows separately. No equivalent open PR was found; this extends merged PRs #5–#7.
