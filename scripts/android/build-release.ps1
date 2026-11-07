# Reproducible local release path; device approval and publication are separate.
[CmdletBinding()]
param([string]$OutputDirectory, [switch]$WithTelemetry = $true)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$repo=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath $repo
if (!$OutputDirectory) { $OutputDirectory=Join-Path $repo ('deliverables/Novera-Android-'+(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss')) }
$OutputDirectory=[IO.Path]::GetFullPath($OutputDirectory)
if (Test-Path -LiteralPath $OutputDirectory) { throw 'Dossier de sortie deja present : conserver les paquets signes immuables.' }
$release=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'release.json') -Raw | ConvertFrom-Json
$config=Get-Content -LiteralPath (Join-Path $repo 'src-tauri/tauri.android.conf.json') -Raw | ConvertFrom-Json
if ($config.identifier -ne $release.packageId -or $config.bundle.android.versionCode -ne $release.versionCode) { throw 'Identite/versionCode Android non synchronises.' }
$directory=Get-NoveraAndroidSigningDirectory
if (!(Test-Path -LiteralPath (Join-Path $directory 'novera-android.p12'))) { throw 'Initialiser ou restaurer l identite de signature Android avant compilation.' }
& (Join-Path $PSScriptRoot 'build-engine.ps1')
if ($LASTEXITCODE) { throw 'Moteur Android en echec.' }
$env:NOVERA_BUILD_ANDROID='1'
& (Join-Path $PSScriptRoot 'build-apk.ps1') -Release -WithTelemetry:$WithTelemetry
if ($LASTEXITCODE) { throw 'APK release en echec.' }
$inputApk=Join-Path $repo 'src-tauri/gen/android/app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk'
if (!(Test-Path -LiteralPath $inputApk)) { throw 'APK release non signe absent.' }
$version=(Get-Content -LiteralPath (Join-Path $repo 'src-tauri/tauri.conf.json') -Raw | ConvertFrom-Json).version
New-Item -ItemType Directory -Path $OutputDirectory | Out-Null
$outputApk=Join-Path $OutputDirectory "Novera_${version}_android-arm64.apk"
& (Join-Path $PSScriptRoot 'sign-apk.ps1') -InputApk $inputApk -OutputApk $outputApk
if ($LASTEXITCODE) { throw 'Signature APK en echec.' }
$android=Get-NoveraAndroidEnvironment
& python (Join-Path $PSScriptRoot 'verify-apk.py') $outputApk --sdk $android.sdk --java $android.java --receipt (Join-Path $OutputDirectory 'ANDROID-VERIFICATION.json')
if ($LASTEXITCODE) { throw 'Inspection finale du paquet en echec.' }
Write-Output "APK signe et inspecte, essais telephone encore requis : $outputApk"
