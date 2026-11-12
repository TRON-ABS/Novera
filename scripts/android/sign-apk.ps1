[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$InputApk,[Parameter(Mandatory=$true)][string]$OutputApk)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$directory=Get-NoveraAndroidSigningDirectory
$store=Join-Path $directory 'novera-android.p12'
$passwordFile=Join-Path $directory 'password.dpapi'
if (!(Test-Path -LiteralPath $store) -or !(Test-Path -LiteralPath $passwordFile)) { throw 'Identite Android absente : initialize-signing.ps1 requis.' }
if (Test-Path -LiteralPath $OutputApk) { throw 'Le paquet de destination existe deja ; ne pas ecraser des octets signes.' }
& python (Join-Path $PSScriptRoot 'verify-apk.py') $InputApk --sdk $android.sdk --native-only
if ($LASTEXITCODE) { throw 'APK Android refuse avant signature : protocole Tauri ou compatibilite native invalide.' }
New-Item -ItemType Directory -Force -Path (Split-Path ([IO.Path]::GetFullPath($OutputApk)) -Parent) | Out-Null
$tools=Join-Path $android.sdk "build-tools/$($android.pin.buildTools)"
$aligned=$OutputApk+'.aligned-unsigned'
if (Test-Path -LiteralPath $aligned) { throw 'Fichier de travail deja present.' }
Add-Type -AssemblyName System.Security
$env:NOVERA_ANDROID_STORE_PASSWORD=[Text.Encoding]::UTF8.GetString([System.Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes($passwordFile),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser))
try {
    & (Join-Path $tools 'zipalign.exe') -P 16 -f 4 $InputApk $aligned
    if ($LASTEXITCODE) { throw 'Alignement APK en echec.' }
    & (Join-Path $tools 'apksigner.bat') sign --ks $store --ks-type PKCS12 --ks-key-alias novera-android --ks-pass env:NOVERA_ANDROID_STORE_PASSWORD --key-pass env:NOVERA_ANDROID_STORE_PASSWORD --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true --out $OutputApk $aligned
    if ($LASTEXITCODE) { throw 'Signature APK en echec.' }
    & (Join-Path $tools 'apksigner.bat') verify --verbose --print-certs $OutputApk
    if ($LASTEXITCODE) { throw 'Verification de signature APK en echec.' }
    & (Join-Path $tools 'zipalign.exe') -c -P 16 4 $OutputApk
    if ($LASTEXITCODE) { throw 'Verification zipalign en echec.' }
} finally {
    Remove-Item Env:NOVERA_ANDROID_STORE_PASSWORD -ErrorAction SilentlyContinue
    if (Test-Path -LiteralPath $aligned) { Remove-Item -LiteralPath $aligned }
}
