# Internal higher-versionCode update of the exact runtime already tested on-device.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$ReferenceApk,[Parameter(Mandatory=$true)][string]$OutputApk)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$reference=[IO.Path]::GetFullPath($ReferenceApk)
$output=[IO.Path]::GetFullPath($OutputApk)
if (Test-Path -LiteralPath $output) { throw 'Paquet de test deja present : ne pas ecraser les octets signes.' }
$receiptPath=Join-Path (Split-Path $reference -Parent) 'ANDROID-VERIFICATION.json'
$receipt=Get-Content -LiteralPath $receiptPath -Raw | ConvertFrom-Json
$release=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'release.json') -Raw | ConvertFrom-Json
$referenceHash=(Get-FileHash -LiteralPath $reference -Algorithm SHA256).Hash.ToLowerInvariant()
if ($receipt.sha256 -ne $referenceHash -or $receipt.apk -ne [IO.Path]::GetFileName($reference) -or $receipt.certificateSha256 -ne $release.certificateSha256 -or !$receipt.signatureVerified) { throw 'Le paquet de reference ne correspond pas a son recu signe.' }
$nextCode=[int]$receipt.versionCode+1
if ($nextCode -gt 2100000000) { throw 'VersionCode Android hors limites.' }
$project=Join-Path $android.repo 'src-tauri/gen/android'
$properties=Join-Path $project 'app/tauri.properties'
$saved=[IO.File]::ReadAllBytes($properties)
try {
    $text=[Text.Encoding]::UTF8.GetString($saved)
    if ($text -notmatch '(?m)^tauri.android.versionCode=\d+') { throw 'VersionCode genere absent.' }
    $text=$text -replace '(?m)^tauri.android.versionCode=\d+',"tauri.android.versionCode=$nextCode"
    [IO.File]::WriteAllText($properties,$text,(New-Object Text.UTF8Encoding($false)))
    Push-Location -LiteralPath $project
    try {
        & ./gradlew.bat :app:assembleArm64Release -x :app:rustBuildArm64Release --no-daemon
        if ($LASTEXITCODE) { throw 'Conditionnement du test de mise a jour en echec.' }
    } finally { Pop-Location }
    $unsigned=Join-Path $project 'app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk'
    & python -c 'import sys,zipfile,hashlib; a,b=map(zipfile.ZipFile,sys.argv[1:]); select=lambda z:{n:hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith(("lib/","assets/"))}; assert select(a)==select(b), "Update test runtime/frontend differs from reference APK"' $reference $unsigned
    if ($LASTEXITCODE) { throw 'Fichiers natifs/frontend differents du paquet deja teste.' }
    & (Join-Path $PSScriptRoot 'sign-apk.ps1') -InputApk $unsigned -OutputApk $output
    if ($LASTEXITCODE) { throw 'Signature du test de mise a jour en echec.' }
    & python (Join-Path $PSScriptRoot 'verify-apk.py') $output --sdk $android.sdk --java $android.java --expected-version-code $nextCode --receipt ($output+'.verification.json')
    if ($LASTEXITCODE) { throw 'Inspection du test de mise a jour en echec.' }
    if ((Get-FileHash -LiteralPath $reference -Algorithm SHA256).Hash.ToLowerInvariant() -ne $referenceHash) { throw 'Le paquet de reference a change.' }
    [ordered]@{purpose='internal-data-preserving-update-test';referenceApkSha256=$referenceHash;fromVersionCode=[int]$receipt.versionCode;toVersionCode=$nextCode;sameNativeAndAssets=$true;certificateSha256=$release.certificateSha256;nativeCompilationPerformed=$false;generatedVersionCodeRestored=$true;deviceUpdateValidated=$false;published=$false} | ConvertTo-Json | Set-Content -LiteralPath ($output+'.provenance.json') -Encoding UTF8
} finally { [IO.File]::WriteAllBytes($properties,$saved) }
