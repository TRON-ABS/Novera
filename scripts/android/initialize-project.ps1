[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$project=Join-Path $android.repo 'src-tauri/gen/android'
Set-Location -LiteralPath $android.repo
if (!(Test-Path -LiteralPath (Join-Path $project 'gradlew.bat'))) {
    if (Test-Path -LiteralPath $project) {
        $absolute=[IO.Path]::GetFullPath($project)
        $expected=[IO.Path]::GetFullPath((Join-Path $android.repo 'src-tauri/gen/android'))
        $saved=[IO.Path]::GetFullPath((Join-Path $android.repo ('.build/android-assets-'+(Get-Date -Format 'yyyy-MM-dd_HH-mm-ss-fff'))))
        if ($absolute -ne $expected -or !$saved.StartsWith([IO.Path]::GetFullPath($android.repo)+[IO.Path]::DirectorySeparatorChar)) {throw 'Chemins de sauvegarde Android invalides.'}
        New-Item -ItemType Directory -Force -Path (Split-Path $saved -Parent) | Out-Null
        Move-Item -LiteralPath $absolute -Destination $saved
    }
    & node (Join-Path $android.repo 'node_modules/@tauri-apps/cli/tauri.js') android init --ci --skip-targets-install
    if ($LASTEXITCODE -ne 0 -or !(Test-Path -LiteralPath (Join-Path $project 'gradlew.bat'))) {throw 'Generation Android incomplete ; voir les messages Tauri.'}
}
& (Join-Path $PSScriptRoot 'configure-project.ps1')
