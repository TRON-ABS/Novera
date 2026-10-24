# Future APK entry point; disabled by default and guarded by preparation checks.
[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
if ($env:NOVERA_BUILD_ANDROID -ne '1') { Write-Output 'Android desactive. Seule Novera-Desktop est activee dans le BAT.'; exit 2 }
$repo=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$report=& (Join-Path $PSScriptRoot 'check-android.ps1') -Json | ConvertFrom-Json
if (!$report.ready) { Write-Output ('APK non prete : '+($report.blockers -join ', ')); exit 3 }
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
& node (Join-Path $repo 'node_modules/@tauri-apps/cli/tauri.js') android build --debug --apk --target aarch64 --features mobile -- --no-default-features
exit $LASTEXITCODE
