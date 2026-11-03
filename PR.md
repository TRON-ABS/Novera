# test(macos): exercise signed packages without visual checks

Mac candidates were built and inspected, but lacked a single automated battery exercising the exact DMG/updater pair, packaged helpers, native signed update replacement and real-model engine regressions on both CPU architectures. Add target=macos-tests to the existing distribution workflow, retaining separate Intel and Apple Silicon jobs and explicit signed-updater requirements.

The battery runs the shared theme, clipboard/share, web search, memory, model and consent tests; pins a 19 MB ggml-org GGUF fixture by revision/size/SHA-256; executes the existing engine/HTTP/supervision suites with that model; and tests native updater signatures, corrupt payload rejection, equal-version behavior, exact bundle replacement and synthetic profile preservation. Compare all application files including hidden resources, modes and internal links across built app, DMG and archive. Spawned app/probe processes receive isolated profiles and no runner/provider/signing credentials. No screenshots, WebDriver or visual assertions are performed. Receipts explicitly leave UI, MLX inference and Apple distribution unverified where not exercised.

Validation before CI:

- Selected frontend regression suites: 15 files, 226 tests passed locally.
- Five Python tests cover runner isolation, secret removal, hidden-resource changes and hostile/valid archives.
- Candidate/macOS compatibility/distribution Node suites: 17 passed, one POSIX case skipped on Windows.
- Bash syntax, workflow YAML parsing, actionlint and git diff --check passed.

GitHub Actions Intel/Apple Silicon execution is next; no native Mac result is claimed yet. The maintainer explicitly requests both Mac and subsequent iOS automated validation, public availability and showcase/Markdown updates, with visual checks deferred. Apple Developer credentials are still absent (only the two Novera updater secrets exist), and the maintainer confirms no Apple Developer account yet. This test path does not bypass the Apple distribution preflight or announce a simulator as an iPhone release.

No open PR overlap found. Existing public binaries/feeds remain unchanged. Follow-up iOS work will reuse mobile frontend behavior and address native platform differences, including startup window configuration. See docs/MACOS_HEADLESS_VALIDATION.md.
