# test(macos): exercise signed packages without visual checks

Mac candidates were built and inspected, but lacked a single automated battery exercising the exact DMG/updater pair, packaged helpers, native signed update replacement and real-model engine regressions on both CPU architectures. Add target=macos-tests to the existing distribution workflow, retaining separate Intel and Apple Silicon jobs and explicit signed-updater requirements.

The battery runs the shared theme, clipboard/share, web search, memory, model and consent tests; pins a 105 MB SmolLM2 GGUF fixture by revision/size/SHA-256; executes the existing engine/HTTP/supervision suites with that model; and tests native updater signatures, corrupt payload rejection, equal-version behavior, exact bundle replacement and synthetic profile preservation. Compare all application files including hidden resources, modes and internal links across built app, DMG and archive. Spawned app/probe processes receive isolated profiles and no runner/provider/signing credentials. No screenshots, WebDriver or visual assertions are performed. Receipts explicitly leave UI, MLX inference and Apple distribution unverified where not exercised.

Validation before CI:

- Selected frontend regression suites: 15 files, 226 tests passed locally.
- Five Python tests cover runner isolation, secret removal, hidden-resource changes and hostile/valid archives.
- Candidate/macOS compatibility/distribution Node suites: 17 passed, one POSIX case skipped on Windows.
- Bash syntax, workflow YAML parsing, actionlint and git diff --check passed.

GitHub Actions Intel/Apple Silicon execution is next; no native Mac result is claimed yet. The maintainer explicitly requests both Mac and subsequent iOS automated validation, public availability and showcase/Markdown updates, with visual checks deferred. Apple Developer credentials are still absent (only the two Novera updater secrets exist), and the maintainer confirms no Apple Developer account yet. This test path does not bypass the Apple distribution preflight or announce a simulator as an iPhone release.

No open PR overlap found. Existing public binaries/feeds remain unchanged. Follow-up iOS work will reuse mobile frontend behavior and address native platform differences, including startup window configuration. See docs/MACOS_HEADLESS_VALIDATION.md.

The maintainer explicitly authorizes following both jobs, fixing failures, merging the reviewed Mac sources, publishing the official direct-download release after both batteries pass, then updating showcases and Markdown. Developer ID/notarization is absent and must be disclosed; visual checks are deferred by request. Run 41589024310 is in progress at commit 79c034280807be4c5ff66e6a05a24985beab4baf; no native success is claimed yet. PR #22 depends on this PR and changes the shared workflow for iOS/mobile separately. Preserve every current desktop/CLI/portable update channel during publication.

CI failure diagnosed: Apple Silicon compiled successfully but Tauri bundling tried to import an empty APPLE_CERTIFICATE supplied by the workflow. In the explicitly non-Apple distribution path, unset all six Apple variables before Tauri, keeping Novera updater credentials intact. The Apple-required path is unchanged. Add a shell-environment regression for both modes. No package from the failed run is published.

Second native run: packaging, signing and nine upgrade tests passed on Apple Silicon; 187 engine unit tests and nine engine smoke tests passed. Five HTTP persistence tests failed because the tiny fixture is trained for only 128 tokens while the cache-save threshold is 256 and the prompt contains 588 tokens. Replace the fixture with pinned SmolLM2-135M-Instruct Q4_K_M (8192-token context), retaining every persistence assertion. The rejected oversized request is expected behavior; no production context guard is changed. Full revalidation remains required.

Third run: all 18 HTTP tests now pass with the corrected fixture. The supervision test exposed a Linux-only /proc implementation incorrectly enabled on all Unix systems; macOS therefore reported a live worker as absent before stop. Use /bin/ps process states on non-Linux Unix, retaining the real before/after stop assertions and zombie exclusion. Add a positive current-process probe test. This is test-harness-only; native Mac revalidation remains pending. Exact packages from this run are retained in diagnostics, but the native test executables/build tree were not retained, so the full suite needs a fresh build.
