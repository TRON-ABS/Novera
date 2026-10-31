# Windows Tauri unit-test startup

Date: 31 October 2026. Local source correction; no publication, CI approval or installed-application upgrade.

## Diagnosis

The desktop library unit-test executable failed before running any test with `0xc0000139` (`STATUS_ENTRYPOINT_NOT_FOUND`). Its PE imports include `comctl32.dll!TaskDialogIndirect`. The legacy DLL in `C:/Windows/System32` does not export that function; the Common-Controls v6 side-by-side DLL does. The original test executable had no resource section or application manifest, as confirmed with the Windows SDK manifest tool.

The pinned `tauri-build`/`tauri-winres` resource helper emits `cargo:rustc-link-arg-bins=.../resource.lib`. That directive supplies the existing v6 application manifest to executable bin targets, but not to the library unit-test harness. The repository's `__TAURI_WORKSPACE__` setting did not repair this missing resource.

## Correction

- Publish the generated resource directory as a native linker search path only for Windows/MSVC Tauri builds.
- Link the existing `resource.lib` from a `cfg(test)` declaration in the library, scoped to Windows/MSVC with `tauri-app`. The normal app continues to receive its resources once through Tauri's existing binary linkage. No DLL is copied, downloaded or replaced.
- Add a Windows regression test that loads the selected Common-Controls DLL and resolves `TaskDialogIndirect`, without opening a window.
- Correct two failures exposed after startup was repaired: the built-in skill assertion still expected `jan` despite the existing `novera` branding, and the allowlist fixture used Unix `touch`. The fixture now creates its marker with portable shell redirection; all allowlist assertions remain intact.

## Verification

The actual Tauri ONNX tests passed: **2 passed, 0 failed**, including import, probe, load, authenticated HTTP inference, session tracking, unregister/unload and preservation of the model graph. This replaces the earlier limitation to the isolated Rust supervisor harness.

The first complete run successfully executed 1,155 tests: **1,151 passed, 2 failed, 2 ignored**. Its two assertion failures are the stale test fixtures described above; the new Common-Controls regression passed. After correcting these fixtures, the complete rerun passed: **1,153 passed, 0 failed, 2 ignored**, in 25.93 seconds. The Common-Controls regression passed. The normal desktop debug build also passed (`cargo build --locked --bin Novera-Desktop`, 3m 30s); its embedded manifest was extracted with the Windows SDK tool and confirmed to request Common-Controls v6. No duplicate-resource linker error occurred.

```powershell
$env:NOVERA_ONNX_TEST_PYTHON = (Resolve-Path .build/onnx/runtime/Scripts/python.exe).Path
$env:NOVERA_ONNX_TEST_MODEL = (Resolve-Path .build/onnx/tensor-fixture).Path
cargo test --manifest-path src-tauri/Cargo.toml --locked --lib core::onnx::tests -- --include-ignored --test-threads=1
cargo test --manifest-path src-tauri/Cargo.toml --locked --lib -- --test-threads=1
cargo build --manifest-path src-tauri/Cargo.toml --locked --bin Novera-Desktop
```

Diagnostic executables, generated manifests and logs are under ignored `.build/tauri-dll-diagnostic/`. The full default suite leaves the optional ONNX/Transformers environment-dependent tests ignored; ONNX is exercised separately with the configured CPU fixture. Windows/MSVC only was executed.

References: [Tauri manifest requirements](https://docs.rs/tauri-build/latest/src/tauri_build/lib.rs.html), [Cargo unit-test linker-argument limitation](https://github.com/rust-lang/cargo/issues/10937).
