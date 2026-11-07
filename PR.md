# fix(build): prepare clean CLI and Android release environments

The 1.0.1 CLI builds fail because the new shared inference crate requires the pinned llama.cpp checkout, and Android initialization rejects Tauri 2.7's new declarative Gradle binding. Fetch the verified engine source before CLI Cargo builds and accept both known generated dependency bindings while retaining lint and idempotent regeneration.

Android signing also resolves to different LocalAppData storage when launched through packaged Codex. The existing production identity was recovered without replacement; its exported certificate matches the published SHA-256. Keep new signing files outside the Novera installation directory in `Novera-Signing/Android`, share path resolution across all four signing scripts, and preserve existing or incomplete legacy identities rather than silently generating a new one.

Reproduction: CLI run 42341133260 fails on an empty vendor/llama.cpp; Android run 42341140220 rejects `val implementation = configurations.getByName("implementation")`. Both follow the source integration in #26. The tar/runtime correction in #27 is already merged and its desktop rebuilds continue independently.

Validation: 16 targeted Node tests pass, including the new generated-Gradle fixture and repeated plugin refresh; three PowerShell signing-path preservation checks pass. The recovered PKCS12 opens using its DPAPI-protected password and exports the exact production certificate. The actual local Android release build has started; new CLI/Android CI runs will verify clean-runner behavior. Earlier 8,069 application tests remain source-baseline evidence; they do not certify the new native packages.

Update the release lessons with Codex storage virtualization, safe key locations, identity verification and clean-runner source prerequisites. No private key or password enters Git, logs or artifacts. Depends on merged #26 and #27. The separate iOS PR #22 remains independent.
