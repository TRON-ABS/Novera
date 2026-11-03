# Package an already compiled Android library without requiring Windows symlinks.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$NativeLibrary)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$library=[IO.Path]::GetFullPath($NativeLibrary)
if ([IO.Path]::GetFileName($library) -ne 'libapp_lib.so' -or !(Test-Path -LiteralPath $library)) { throw 'Bibliotheque applicative Android absente.' }
$readelf=Join-Path $android.llvm 'llvm-readelf.exe'
$header=& $readelf -h $library
if ($LASTEXITCODE -or ($header -join "`n") -notmatch 'Machine:\s+AArch64') { throw 'La bibliotheque doit etre ARM64.' }
$project=Join-Path $android.repo 'src-tauri/gen/android'
$destination=Join-Path $project 'app/src/main/jniLibs/arm64-v8a/libapp_lib.so'
$hash=(Get-FileHash -LiteralPath $library -Algorithm SHA256).Hash
Copy-Item -LiteralPath $library -Destination $destination -Force
if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash -ne $hash) { throw 'Copie native differente.' }
Push-Location -LiteralPath $project
try {
    & ./gradlew.bat :app:assembleArm64Release -x :app:rustBuildArm64Release --no-daemon
    if ($LASTEXITCODE) { throw 'Conditionnement Gradle release en echec.' }
} finally { Pop-Location }
if ((Get-FileHash -LiteralPath $library -Algorithm SHA256).Hash -ne $hash -or (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash -ne $hash) { throw 'Bibliotheque native modifiee pendant le conditionnement.' }
[ordered]@{mode='copy-native-library';nativeSource=$library;sha256=$hash;architecture='arm64';gradleRustTaskSkipped=$true;deviceValidated=$false} | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $android.repo '.build/android-native-packaging.json') -Encoding UTF8
