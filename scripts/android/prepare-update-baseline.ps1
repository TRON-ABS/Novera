# Package an internal lower-versionCode baseline from the same native/frontend bytes.
# This never modifies the already signed final APK and never rebuilds application code.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$FinalApk,[Parameter(Mandatory=$true)][string]$OutputApk)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$release=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'release.json') -Raw | ConvertFrom-Json
$config=Get-Content -LiteralPath (Join-Path $android.repo 'src-tauri/tauri.android.conf.json') -Raw | ConvertFrom-Json
if ($release.versionCode -ne $config.bundle.android.versionCode) { throw 'VersionCode de distribution incoherent.' }
if (Test-Path -LiteralPath $OutputApk) { throw 'Paquet de depart deja present.' }
$finalHash=(Get-FileHash -LiteralPath $FinalApk -Algorithm SHA256).Hash
$project=Join-Path $android.repo 'src-tauri/gen/android'
$properties=Join-Path $project 'app/tauri.properties'
$saved=[IO.File]::ReadAllBytes($properties)
$baselineCode=[int]$release.versionCode-1
try {
    $text=[Text.Encoding]::UTF8.GetString($saved)
    if ($text -notmatch '(?m)^tauri.android.versionCode=\d+') { throw 'VersionCode genere absent.' }
    $text=$text -replace '(?m)^tauri.android.versionCode=\d+',"tauri.android.versionCode=$baselineCode"
    [IO.File]::WriteAllText($properties,$text,(New-Object Text.UTF8Encoding($false)))
    Push-Location -LiteralPath $project
    try {
        & ./gradlew.bat :app:assembleArm64Release -x :app:rustBuildArm64Release --no-daemon
        if ($LASTEXITCODE) { throw 'Conditionnement du paquet de depart en echec.' }
    } finally { Pop-Location }
    $unsigned=Join-Path $project 'app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk'
    # Make sure packaging did not pick up any other runtime or frontend.
    & python -c 'import sys,zipfile,hashlib; a,b=map(zipfile.ZipFile,sys.argv[1:]); select=lambda z:{n:hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith(("lib/","assets/"))}; assert select(a)==select(b), "Baseline native/frontend differs from final APK"' $FinalApk $unsigned
    if ($LASTEXITCODE) { throw 'Le paquet de depart ne correspond pas aux sources finales.' }
    & (Join-Path $PSScriptRoot 'sign-apk.ps1') -InputApk $unsigned -OutputApk $OutputApk
    if ($LASTEXITCODE) { throw 'Signature du paquet de depart en echec.' }
    & python (Join-Path $PSScriptRoot 'verify-apk.py') $OutputApk --sdk $android.sdk --java $android.java --expected-version-code $baselineCode --receipt ($OutputApk+'.verification.json')
    if ($LASTEXITCODE) { throw 'Inspection du paquet de depart en echec.' }
    if ((Get-FileHash -LiteralPath $FinalApk -Algorithm SHA256).Hash -ne $finalHash) { throw 'Le paquet final a change.' }
} finally { [IO.File]::WriteAllBytes($properties,$saved) }
