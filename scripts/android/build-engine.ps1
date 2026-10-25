[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
Add-NoveraAndroidBuildTools $android
Set-Location -LiteralPath $android.repo
$buildSource=Get-Content -LiteralPath 'src-tauri/plugins/tauri-plugin-llamacpp/build.rs' -Raw
if ($buildSource -notmatch 'LLAMA_CPP_COMMIT:\s*&str\s*=\s*"([a-f0-9]{40})"') {throw 'Revision llama.cpp absente.'}
$commit=$Matches[1]
$source=if ($env:JAN_LLAMA_CPP_DIR) {$env:JAN_LLAMA_CPP_DIR} else {Join-Path $android.repo ".build/android-llama-$($commit.Substring(0,12))"}
if (!(Test-Path -LiteralPath $source)) {
    & git init $source
    if ($LASTEXITCODE -ne 0) {throw 'Creation du cache llama.cpp impossible.'}
    & git -C $source fetch --depth 1 https://github.com/ggml-org/llama.cpp.git $commit
    if ($LASTEXITCODE -ne 0) {throw 'Telechargement llama.cpp impossible.'}
    & git -C $source checkout --detach FETCH_HEAD
    if ($LASTEXITCODE -ne 0) {throw 'Checkout llama.cpp impossible.'}
}
$actual=& git -C $source rev-parse HEAD
if ($LASTEXITCODE -ne 0 -or $actual -ne $commit) {throw 'Le moteur Android exige la revision llama.cpp epinglee.'}
$env:JAN_LLAMA_CPP_DIR=[IO.Path]::GetFullPath($source)
if (!$env:CARGO_TARGET_DIR) {$env:CARGO_TARGET_DIR=if (Test-Path -LiteralPath 'C:/jb') {'C:/jb'} else {Join-Path $android.repo 'src-tauri/target'}}
$env:CARGO_TARGET_DIR=[IO.Path]::GetFullPath($env:CARGO_TARGET_DIR)
$env:JAN_ENGINE_BUILD_DIR=Join-Path $env:CARGO_TARGET_DIR ("android-engine-ndk-"+$android.pin.ndk)
$env:CARGO_BUILD_JOBS='4'
$env:WRY_ANDROID_PACKAGE='io.github.tronabs.novera'
$env:WRY_ANDROID_LIBRARY='app_lib'
$env:TAURI_ANDROID_PACKAGE_UNESCAPED='io.github.tronabs.novera'
$env:TAURI_ANDROID_PROJECT_PATH=Join-Path $android.repo 'src-tauri/gen/android'
$env:WRY_ANDROID_KOTLIN_FILES_OUT_DIR=Join-Path $env:TAURI_ANDROID_PROJECT_PATH 'app/src/main/java/io/github/tronabs/novera/generated'
New-Item -ItemType Directory -Force -Path $env:WRY_ANDROID_KOTLIN_FILES_OUT_DIR | Out-Null
& (Join-Path $android.rustBin 'cargo.exe') build --locked --release --manifest-path src-tauri/android-worker/Cargo.toml --target aarch64-linux-android --bin novera-llama-worker
if ($LASTEXITCODE -ne 0) {throw 'Compilation du worker CPU Android en echec.'}
$release=Join-Path $env:CARGO_TARGET_DIR 'aarch64-linux-android/release'
$worker=Join-Path $release 'novera-llama-worker'
if (!(Test-Path -LiteralPath $worker)) {throw 'Worker Android absent.'}
$markers=@(Get-ChildItem -Path (Join-Path $release 'build/tauri-plugin-llamacpp-*/out/engine-build-root.txt') -File | Sort-Object LastWriteTime -Descending)
if (!$markers.Count) {throw 'Preuve de construction du moteur absente.'}
$engineRoot=(Get-Content -LiteralPath $markers[0].FullName -Raw).Trim()
$libs=Join-Path $engineRoot 'ggml-prefix/lib'
$destination=Join-Path $android.repo 'src-tauri/gen/android/app/src/main/jniLibs/arm64-v8a'
New-Item -ItemType Directory -Force -Path $destination | Out-Null
Copy-Item -LiteralPath $worker -Destination (Join-Path $destination 'libnovera_llama_worker.so') -Force
foreach ($name in @('libggml.so','libggml-base.so','libggml-cpu.so')) {
    $library=Join-Path $libs $name
    if(!(Test-Path -LiteralPath $library)){$library=Join-Path $engineRoot "ggml-prefix/bin/$name"}
    if(!(Test-Path -LiteralPath $library)){throw "Bibliotheque moteur absente : $name"}
    Copy-Item -LiteralPath $library -Destination $destination -Force
}
Copy-Item -LiteralPath (Join-Path $android.ndk 'toolchains/llvm/prebuilt/windows-x86_64/sysroot/usr/lib/aarch64-linux-android/libc++_shared.so') -Destination $destination -Force
$readelf=Join-Path $android.llvm 'llvm-readelf.exe'
foreach ($file in Get-ChildItem -LiteralPath $destination -Filter '*.so' -File) {
    $header=& $readelf -h $file.FullName
    if (($header -join "`n") -notmatch 'Machine:\s+AArch64') {throw "Architecture invalide : $($file.Name)"}
    $segments=@(& $readelf -lW $file.FullName | Where-Object {$_ -match '^\s*LOAD\s'})
    if($LASTEXITCODE -ne 0 -or !$segments.Count){throw "Segments ELF absents : $($file.Name)"}
    foreach ($segment in $segments) {if ([Convert]::ToInt64(($segment.Trim() -split '\s+')[-1].Replace('0x',''),16) -lt 16384) {throw "Alignement 16 Kio absent : $($file.Name)"}}
}
$assets=Join-Path $android.repo 'src-tauri/gen/android/app/src/main/assets/resources'
New-Item -ItemType Directory -Force -Path $assets | Out-Null
Copy-Item -LiteralPath (Join-Path $android.repo 'LICENSE') -Destination (Join-Path $assets 'LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $source 'LICENSE') -Destination (Join-Path $assets 'llama.cpp-LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $android.ndk 'toolchains/llvm/prebuilt/windows-x86_64/NOTICE') -Destination (Join-Path $assets 'NDK-toolchain-NOTICE') -Force
$record=[ordered]@{ndk=$android.pin.ndk;llama_commit=$commit;target='aarch64-linux-android';backend='cpu';models_max=1;slot_cache_mib=0;directory=$destination;files=@(Get-ChildItem -LiteralPath $destination -Filter '*.so' -File | ForEach-Object {@{name=$_.Name;sha256=(Get-FileHash -LiteralPath $_.FullName).Hash;bytes=$_.Length}})}
$proof=Join-Path $android.repo '.build/android-engine-manifest.json'
$record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $proof -Encoding UTF8
Write-Output "Moteur CPU ARM64 prepare : $destination"
