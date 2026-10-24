# Shared, process-local Android tool resolution. Never changes persistent variables.
function Get-NoveraAndroidEnvironment {
    $repoRoot=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
    $pin=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain.json') -Raw | ConvertFrom-Json
    $sdk=if ($env:ANDROID_HOME) {$env:ANDROID_HOME} elseif ($env:ANDROID_SDK_ROOT) {$env:ANDROID_SDK_ROOT} else {Join-Path $env:USERPROFILE 'AppData/Local/Android/Sdk'}
    $candidates=@($env:NOVERA_ANDROID_JAVA_HOME,$env:JAVA_HOME)
    $candidates+=@(Get-ChildItem -LiteralPath (Join-Path $env:USERPROFILE '.jdks') -Directory -ErrorAction SilentlyContinue | Sort-Object Name -Descending | ForEach-Object FullName)
    $candidates+=@(Join-Path $env:ProgramFiles 'Android/Android Studio/jbr')
    $java=$null
    foreach ($candidate in $candidates) {
        if (!$candidate -or !(Test-Path -LiteralPath (Join-Path $candidate 'release'))) {continue}
        $release=Get-Content -LiteralPath (Join-Path $candidate 'release') -Raw
        if ($release -match '(?m)^JAVA_VERSION="(\d+)' -and [int]$Matches[1] -eq $pin.jdkMajor) {$java=$candidate;break}
    }
    $ndk=Join-Path $sdk "ndk/$($pin.ndk)"
    $llvm=Join-Path $ndk 'toolchains/llvm/prebuilt/windows-x86_64/bin'
    $versionText=Get-Content -LiteralPath (Join-Path $repoRoot 'rust-toolchain.toml') -Raw
    if ($versionText -notmatch 'channel\s*=\s*"([0-9.]+)"') {throw 'Version Rust du projet absente.'}
    $rustVersion=$Matches[1]
    $rustRoot=if ($env:RUSTUP_HOME) {$env:RUSTUP_HOME} else {Join-Path $env:USERPROFILE '.rustup'}
    $rustBin=Join-Path $rustRoot "toolchains/$rustVersion-x86_64-pc-windows-msvc/bin"
    [pscustomobject]@{repo=$repoRoot;pin=$pin;sdk=$sdk;java=$java;ndk=$ndk;llvm=$llvm;rustVersion=$rustVersion;rustBin=$rustBin;manager=(Join-Path $sdk "cmdline-tools/$($pin.commandLineTools.directory)/bin/sdkmanager.bat")}
}
function Set-NoveraAndroidEnvironment($Android) {
    if (!$Android.java) {throw "JDK $($Android.pin.jdkMajor) introuvable. Definir NOVERA_ANDROID_JAVA_HOME."}
    $env:JAVA_HOME=$Android.java
    $env:ANDROID_HOME=$Android.sdk
    $env:NDK_HOME=$Android.ndk
    $env:PATH="$($Android.rustBin);$($Android.java)/bin;$($Android.llvm);"+$env:PATH
    $env:RUSTC=Join-Path $Android.rustBin 'rustc.exe'
    $env:CARGO_TARGET_AARCH64_LINUX_ANDROID_LINKER=Join-Path $Android.llvm 'aarch64-linux-android24-clang.cmd'
    $env:CARGO_TARGET_AARCH64_LINUX_ANDROID_RUSTFLAGS='-C link-arg=-Wl,-z,max-page-size=16384'
    $env:CC_aarch64_linux_android=Join-Path $Android.llvm 'clang.exe'
    $env:CXX_aarch64_linux_android=Join-Path $Android.llvm 'clang++.exe'
    $env:AR_aarch64_linux_android=Join-Path $Android.llvm 'llvm-ar.exe'
    $env:CFLAGS_aarch64_linux_android='--target=aarch64-linux-android24'
    $env:CXXFLAGS_aarch64_linux_android='--target=aarch64-linux-android24'
    $env:NOVERA_ENABLE_UPDATER='false'
    $env:NOVERA_ANALYTICS_HOST=''
    $env:NOVERA_ANALYTICS_PROJECT_KEY=''
}

function Add-NoveraAndroidBuildTools($Android) {
    $candidates=@((Join-Path $env:ProgramFiles 'CMake/bin'))
    $candidates+=@(Get-ChildItem -Path (Join-Path $Android.sdk 'cmake/*/bin') -Directory -ErrorAction SilentlyContinue | ForEach-Object FullName)
    $vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
    if (Test-Path -LiteralPath $vswhere) {
        $vs=& $vswhere -latest -products '*' -property installationPath
        if ($vs) {
            $base=Join-Path ($vs | Select-Object -First 1) 'Common7/IDE/CommonExtensions/Microsoft/CMake'
            $candidates+=@(Join-Path $base 'CMake/bin');$candidates+=@(Join-Path $base 'Ninja')
        }
    }
    foreach ($dir in $candidates) {if (Test-Path -LiteralPath $dir) {$env:PATH="$dir;"+$env:PATH}}
    if (!(Get-Command cmake.exe -ErrorAction SilentlyContinue) -or !(Get-Command ninja.exe -ErrorAction SilentlyContinue)) {throw 'CMake et Ninja requis pour le moteur CPU Android.'}
}
