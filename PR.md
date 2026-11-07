# fix(ci): accommodate clean Android and portable native builds

The portable 1.0.1 job is cancelled at its 90-minute limit while compiling Rust after building the current pinned CUDA/Vulkan worker. Increase its native build budget to 180 minutes while retaining all compilation, signatures and validation steps. No older worker is substituted.

Fresh Android run 42347394466 now compiles the adapted Kotlin task, then fails because the generated project enables Gradle configuration caching. The settings-time Node refresh and execution-time native task project paths are incompatible with that cache. Explicitly disable this performance option in generated Gradle properties; retain Lint and all package checks. The production release APK already built and published is unchanged.

Validation: nine Android configuration tests pass, including a newly generated properties file initially enabling configuration caching; actionlint passes for the portable workflow. New clean native runs are dispatched for both targets. No successful portable or Android CI candidate is claimed before they finish.

Depends on merged #28/#32/#38/#40. Update the release lessons with actual current platform prerequisites, the Web frontend/hosted-app distinction, and the two confirmed clean-host failures. Desktop x64 remains on its independent pinned compilation.
