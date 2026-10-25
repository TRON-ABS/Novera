# Novera — current change review

## fix(build): prepare the engine before Windows desktop resources

After the worker rename, the Windows BAT compiled the interface and launched the desktop build while only `jan-llama-worker.exe` was present. Tauri failed with `resource path resources\\bin\\novera-llama-worker.exe doesn't exist`.

Prepare the pinned worker before desktop/portable/setup/MSI builds: check source and tools, build the real `novera-llama-worker` Cargo target offline/locked, stage the engine runtime and verify its version. Preserve prepared GPU backends. Fail at the relevant logged step. Reuse only a local build whose worker sources, explicit build options and binary hashes match, so Explorer launches can use an unchanged prepared engine. Scope GNU tools to Bash steps to preserve MSVC linker precedence.

The real rebuild also exposed CUDA staging selecting `bin/arm64` before `bin/x64`. Compare PE machine fields with the worker when selecting and copying DLLs; reject another architecture. Retain cudart for Windows runtime validation and allow dependency-chain leaves with no further CUDA imports. The user BAT itself already delegates to the repository launcher and needs no edit.

## Validation

- `pwsh -NoProfile -File scripts/tests/prepare-novera-engine.Tests.ps1` and Windows PowerShell 5.1 equivalent: 19 assertions each; covers backends, order, failure propagation, empty artifacts, source/binary cache invalidation and equivalent Windows paths. No real compilation in these tests.
- `pwsh -NoProfile -File scripts/tests/build-launcher.Tests.ps1`: 69 assertions, plans/disabled variants/Android guards; no app compilation.
- `node --test scripts/__tests__/engine-staging.test.mjs`: 3 passed; synthetic multi-architecture toolkit, wrong-architecture-only toolkit and mismatched backend.
- `pwsh -NoProfile -File scripts/tests/package-windows-portable.Tests.ps1`: 223 assertions in 12 scenarios.
- `pwsh -NoProfile -File scripts/tests/telemetry-config.Tests.ps1`: 16 assertions; no network.
- `node --test scripts/__tests__/architecture.test.mjs`: 7 passed. `node scripts/check-architecture.mjs`: 13 modules, no violations. Locale checker: 70 catalogs, 1,516 keys each, zero errors.
- Real user BAT completed engine, interface and desktop. Output: `deliverables/Novera-desktop-1.0.0-2026-10-25_23-59-09-633`, completed 26 October at 00:04 Paris. EXE: 65,208,832 bytes, SHA-256 `1D3E1F545BF11CDC50F6E5F031ABFCA2DBD1E6293818F3D12A049263CDAC187A`.
- Audited all 26 EXE/DLL files as x64. Packaged worker reports llama.cpp b11823, commit `5c19a5a7560024bb19745b4ae04a75613d4b9aa3`, and detects the RTX 5070 Laptop through CUDA. No legacy worker shipped. Verified cache reuse separately from a normal environment.

## Limits

The local build reused native C++ archives whose b11823 pin was checked, rebuilt the renamed Rust worker and C shim, and retained the historical CUDA SM120 configuration for this machine. It is not a fresh native build for every GPU or a signed distribution validation. No desktop UI launch, model generation, upgrade test, installation or user-profile change was performed. Automatic updates/statistics remain disabled, no telemetry destination was configured, and no public binary is released. Raw logs and binaries stay local. Previous locale tests remain historical; this change does not modify locale JSONs.

## References

- [Build procedure](docs/BUILD_AND_RELEASE.md#desktop)
- [Current source and local binary](TABLEAU_DE_BORD_NOVERA.md)
- [Remaining functional validation](ROADMAP.md)
