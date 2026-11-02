# Repackage the verified runtime with local-only startup diagnostics; no Rust rebuild.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$ReferenceApk,[Parameter(Mandatory=$true)][string]$OutputApk,[int]$VersionCode=0)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
if (!$VersionCode) { $VersionCode=[int](Get-Content (Join-Path $PSScriptRoot 'release.json') -Raw | ConvertFrom-Json).versionCode+1 }
$project=Join-Path $android.repo 'src-tauri/gen/android'
$java=Join-Path $project 'app/src/main/java/io/github/tronabs/novera'
$main=Join-Path $java 'MainActivity.kt'
$diagnostic=Join-Path $java 'StartupDiagnostics.kt'
$properties=Join-Path $project 'app/tauri.properties'
if ((Test-Path -LiteralPath $OutputApk) -or (Test-Path -LiteralPath $diagnostic)) { throw 'Sortie ou diagnostic deja present.' }
$savedMain=[IO.File]::ReadAllBytes($main)
$savedProperties=[IO.File]::ReadAllBytes($properties)
try {
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'templates/MainActivityDiagnostic.kt') -Destination $main -Force
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'templates/StartupDiagnostics.kt') -Destination $diagnostic
    $text=[Text.Encoding]::UTF8.GetString($savedProperties) -replace '(?m)^tauri.android.versionCode=\d+',"tauri.android.versionCode=$VersionCode"
    [IO.File]::WriteAllText($properties,$text,(New-Object Text.UTF8Encoding($false)))
    Push-Location -LiteralPath $project
    try {
        & ./gradlew.bat :app:assembleArm64Release -x :app:rustBuildArm64Release --no-daemon
        if ($LASTEXITCODE) { throw 'Assemblage du diagnostic Android en echec.' }
    } finally { Pop-Location }
    $unsigned=Join-Path $project 'app/build/outputs/apk/arm64/release/app-arm64-release-unsigned.apk'
    & python -c 'import sys,zipfile,hashlib; a,b=map(zipfile.ZipFile,sys.argv[1:]); select=lambda z:{n:hashlib.sha256(z.read(n)).hexdigest() for n in z.namelist() if n.startswith(("lib/","assets/")) and not n.startswith("assets/dexopt/")}; assert select(a)==select(b), "Diagnostic runtime differs from reference APK"' $ReferenceApk $unsigned
    if ($LASTEXITCODE) { throw 'Le runtime natif/frontend ne correspond pas au paquet verifie.' }
    & (Join-Path $PSScriptRoot 'sign-apk.ps1') -InputApk $unsigned -OutputApk $OutputApk
    if ($LASTEXITCODE) { throw 'Signature du diagnostic en echec.' }
    & python (Join-Path $PSScriptRoot 'verify-apk.py') $OutputApk --sdk $android.sdk --java $android.java --expected-version-code $VersionCode --receipt ($OutputApk+'.verification.json')
    if ($LASTEXITCODE) { throw 'Inspection du diagnostic en echec.' }
} finally {
    [IO.File]::WriteAllBytes($main,$savedMain)
    [IO.File]::WriteAllBytes($properties,$savedProperties)
    if (Test-Path -LiteralPath $diagnostic) { Remove-Item -LiteralPath $diagnostic }
}
