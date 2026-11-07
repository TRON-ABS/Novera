# APK entry point; disabled by default and guarded by preparation checks.
[CmdletBinding()]
param([switch]$AllowUnreviewedTestBuild, [switch]$Release, [switch]$WithTelemetry = $true)
$ErrorActionPreference='Stop'
if ($env:NOVERA_BUILD_ANDROID -ne '1') { Write-Output 'Android desactive. Seule Novera-Desktop est activee dans le BAT.'; exit 2 }
$repo=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$report=& (Join-Path $PSScriptRoot 'check-android.ps1') -Json | ConvertFrom-Json
. (Join-Path $PSScriptRoot 'build-policy.ps1')
if (!$report.ready) {
    if ($Release) { throw ('Release Android bloquee : '+($report.blockers -join ', ')) }
    if (!(Test-NoveraAndroidBuildAllowed $report ([bool]$AllowUnreviewedTestBuild) ($env:GITHUB_ACTIONS -eq 'true'))) {
        Write-Output ('APK non prete : '+($report.blockers -join ', ')); exit 3
    }
    Write-Warning 'Explicit CI test candidate only: mobile reviews remain pending. Not approved for public distribution.'
}
Set-Location -LiteralPath $repo
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
& (Join-Path $PSScriptRoot 'configure-project.ps1')
$env:IS_TAURI='true'
$env:IS_ANDROID='true'
$env:TAURI_ENV_PLATFORM='android'
$env:TAURI_ENV_ARCH='aarch64'
$env:TAURI_ENV_TARGET_TRIPLE='aarch64-linux-android'
$env:NOVERA_ENABLE_UPDATER='false'
. (Join-Path $PSScriptRoot 'telemetry.ps1')
Set-NoveraAndroidTelemetry -Enabled:$WithTelemetry -ConfigurationPath (Join-Path $repo 'web-app/.env.local')
Remove-Item Env:__TAURI_BUNDLE_TYPE -ErrorAction SilentlyContinue
# Yarn supplies project-local tools to Tauri's beforeBuildCommand (cross-env).
$arguments=@('tauri','android','build','--apk','--target','aarch64','--features','mobile')
if (!$Release) { $arguments+='--debug' }
$log=Join-Path $repo '.build/android-tauri-build.log'
New-Item -ItemType Directory -Force -Path (Split-Path $log -Parent) | Out-Null
& corepack yarn @arguments -- --no-default-features 2>&1 | Tee-Object -FilePath $log
$buildCode=$LASTEXITCODE
if ($buildCode -and $Release) {
    $output=Get-Content -LiteralPath $log -Raw
    # Cargo must have completed this invocation; never package a stale library
    # after an unrelated compilation failure. Keep the original failure log.
    if ($output -match 'Finished.*release.*profile' -and $output -match 'Failed to create a symbolic link' -and $output -match 'libapp_lib\.so') {
        $target=if ($env:CARGO_TARGET_DIR) { $env:CARGO_TARGET_DIR } else { Join-Path $repo 'src-tauri/target' }
        Write-Output 'Cargo release complete; packaging its exact library by copy because Windows symlinks are unavailable.'
        & (Join-Path $PSScriptRoot 'package-release.ps1') -NativeLibrary (Join-Path $target 'aarch64-linux-android/release/libapp_lib.so')
        exit 0
    }
}
exit $buildCode
