# APK entry point; disabled by default and guarded by preparation checks.
[CmdletBinding()]
param([switch]$AllowUnreviewedTestBuild)
$ErrorActionPreference='Stop'
if ($env:NOVERA_BUILD_ANDROID -ne '1') { Write-Output 'Android desactive. Seule Novera-Desktop est activee dans le BAT.'; exit 2 }
$repo=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$report=& (Join-Path $PSScriptRoot 'check-android.ps1') -Json | ConvertFrom-Json
. (Join-Path $PSScriptRoot 'build-policy.ps1')
if (!$report.ready) {
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
$env:NOVERA_ANALYTICS_HOST=''
$env:NOVERA_ANALYTICS_PROJECT_KEY=''
Remove-Item Env:__TAURI_BUNDLE_TYPE -ErrorAction SilentlyContinue
# Yarn supplies project-local tools to Tauri's beforeBuildCommand (cross-env).
& corepack yarn tauri android build --debug --apk --target aarch64 --features mobile -- --no-default-features
exit $LASTEXITCODE
