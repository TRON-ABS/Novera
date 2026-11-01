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
if (!(Test-Path -LiteralPath (Join-Path $project 'tauri.settings.gradle'))) {
    # Tauri init creates Gradle's skeleton. Its plugin settings are emitted by
    # the first mobile Cargo build; configuring them before that is circular.
    $env:IS_TAURI='true'
    $env:IS_ANDROID='true'
    $env:TAURI_ENV_PLATFORM='android'
    $env:TAURI_ENV_ARCH='aarch64'
    $env:TAURI_ENV_TARGET_TRIPLE='aarch64-linux-android'
    $env:WRY_ANDROID_PACKAGE='io.github.tronabs.novera'
    $env:WRY_ANDROID_LIBRARY='app_lib'
    $env:TAURI_ANDROID_PACKAGE_UNESCAPED='io.github.tronabs.novera'
    $env:TAURI_ANDROID_PROJECT_PATH=$project
    $env:WRY_ANDROID_KOTLIN_FILES_OUT_DIR=Join-Path $project 'app/src/main/java/io/github/tronabs/novera/generated'
    New-Item -ItemType Directory -Force -Path $env:WRY_ANDROID_KOTLIN_FILES_OUT_DIR | Out-Null
    & corepack yarn build:web
    if ($LASTEXITCODE -ne 0) { throw 'Android frontend bootstrap failed.' }
    Write-Output 'Bootstrapping Android Cargo plugin settings before Gradle configuration.'
    & (Join-Path $android.rustBin 'cargo.exe') check --locked --lib --manifest-path src-tauri/Cargo.toml --no-default-features --features mobile --target aarch64-linux-android
    if ($LASTEXITCODE -ne 0) { throw 'Android native bootstrap failed.' }
    if (!(Test-Path -LiteralPath (Join-Path $project 'tauri.settings.gradle'))) { throw 'Cargo did not generate the Android plugin settings.' }
}
& (Join-Path $PSScriptRoot 'configure-project.ps1')
