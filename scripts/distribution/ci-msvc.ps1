$ErrorActionPreference = 'Stop'
if ($env:GITHUB_ACTIONS -ne 'true') { throw 'GitHub Actions MSVC environment required.' }
if (!$env:VCToolsInstallDir) { throw 'MSVC developer environment is missing.' }
$nativeArm = $env:RUNNER_ARCH -eq 'ARM64'
$hostArch = if ($nativeArm) { 'arm64' } else { 'x64' }
$targetArch = if ($env:VSCMD_ARG_TGT_ARCH) { $env:VSCMD_ARG_TGT_ARCH } else { $hostArch }
if ($targetArch -notin @('x64', 'arm64')) { throw 'Unsupported Windows candidate target.' }
$link = Join-Path $env:VCToolsInstallDir "bin/Host$hostArch/$targetArch/link.exe"
if (!(Test-Path -LiteralPath $link -PathType Leaf)) { throw "MSVC linker missing for host $hostArch / target $targetArch" }
$triple = if ($targetArch -eq 'arm64') { 'AARCH64_PC_WINDOWS_MSVC' } else { 'X86_64_PC_WINDOWS_MSVC' }
Add-Content -LiteralPath $env:GITHUB_ENV "CARGO_TARGET_${triple}_LINKER=$link"
Write-Output "MSVC linker selected for $triple"
