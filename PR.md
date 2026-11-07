# fix(cli): keep ordinary Windows paths for the native engine build

The shared CLI inference build canonicalizes its sibling plugin directory. On Windows this adds the verbatim `\\?\` prefix; CMake rewrites it to `//?/D:/...`, and Clang cannot find the generated source paths. Derive the sibling path directly from Cargo's already absolute manifest directory, then check that the shared build source exists.

Reproduction: Windows CLI job 128312114370 in run 42342173025 fails with Clang `no such file or directory` / `no input files` for ggml sources. The initial missing-checkout issue was fixed in merged #28; this failure occurs after that checkout and CMake configuration.

Validation: Rust formatting and syntax checks pass; the Windows/Linux/Mac CLI CI matrix is relaunched to exercise the actual source compiler. No successful native result is claimed before it completes. Update the release lessons with Windows verbatim paths and the distinction between PowerShell 5 stderr handling and a native build failure.

Depends on merged #28. Portable changes are already merged in #29 and do not change installed desktop code. The separate iOS PR #22 remains independent.
