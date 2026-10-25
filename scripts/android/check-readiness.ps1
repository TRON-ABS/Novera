[CmdletBinding()]
param([switch]$Json,[switch]$RequireReady)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
$state=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'readiness.json') -Raw | ConvertFrom-Json
$checks=New-Object 'System.Collections.Generic.List[object]'
function Check([string]$Id,[bool]$Ok,[string]$Detail){$checks.Add([pscustomobject]@{id=$Id;ok=$Ok;detail=$Detail})}
Check 'jdk' ([bool]$android.java -and (Test-Path -LiteralPath (Join-Path $(if($android.java){$android.java}else{$android.sdk}) 'bin/javac.exe'))) "JDK epingle $($android.pin.jdkVersion)."
Check 'sdk' (Test-Path -LiteralPath $android.sdk -PathType Container) 'SDK Android existant.'
Check 'platform-tools' (Test-Path -LiteralPath (Join-Path $android.sdk 'platform-tools/adb.exe')) 'ADB pour les essais sur appareil.'
Check 'sdk-platform' (Test-Path -LiteralPath (Join-Path $android.sdk "platforms/android-$($android.pin.sdkPlatform)/android.jar")) "Platform Android $($android.pin.sdkPlatform)."
Check 'build-tools' (Test-Path -LiteralPath (Join-Path $android.sdk "build-tools/$($android.pin.buildTools)/aapt2.exe")) "Build-Tools $($android.pin.buildTools)."
Check 'command-line-tools' (Test-Path -LiteralPath $android.manager) 'Command-line Tools officiels verifies.'
Check 'ndk' (Test-Path -LiteralPath (Join-Path $android.llvm 'clang.exe')) "NDK $($android.pin.ndk)."
$rustStd=Join-Path (Split-Path $android.rustBin -Parent) "lib/rustlib/$($android.pin.rustTarget)/lib/libstd-*.rlib"
Check 'rust-android' (@(Get-ChildItem -Path $rustStd -File -ErrorAction SilentlyContinue).Count -gt 0) "Rust $($android.rustVersion) pour $($android.pin.rustTarget)."
try { Add-NoveraAndroidBuildTools $android; $nativeTools=$true } catch { $nativeTools=$false }
Check 'cmake-ninja' $nativeTools 'Outils de compilation du moteur CPU ARM64.'
$project=Join-Path $android.repo 'src-tauri/gen/android'
$generated=(Test-Path -LiteralPath (Join-Path $project 'gradlew.bat')) -and (Test-Path -LiteralPath (Join-Path $project 'app/build.gradle.kts')) -and (Test-Path -LiteralPath (Join-Path $project 'app/src/main/AndroidManifest.xml'))
Check 'gradle-project' $generated 'Vrai projet Gradle genere, pas seulement des assets.'
$configured=$false
$stamp=Join-Path $project 'novera-toolchain.json'
if(Test-Path -LiteralPath $stamp){
    $actual=Get-Content -LiteralPath $stamp -Raw | ConvertFrom-Json
    $configured=$true
    foreach($field in @('jdkVersion','sdkPlatform','compileSdk','compileSdkMinor','targetSdk','minimumSdk','buildTools','ndk','gradle','agp','kotlin')){
        if($actual.$field -ne $android.pin.$field){$configured=$false}
    }
}
Check 'toolchain-configuration' $configured 'Versions generees alignees sur toolchain.json ; lancer initialize-project.ps1 apres changement.'
$builder=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'build-apk.ps1') -Raw
Check 'mobile-feature-selection' ($builder -match '--no-default-features' -and $builder -match 'mobile') 'Le build mobile exclut explicitement les features desktop par defaut.'
$jni=Join-Path $project 'app/src/main/jniLibs/arm64-v8a'
$payload=$true
foreach($name in @('libnovera_llama_worker.so','libggml.so','libggml-base.so','libggml-cpu.so','libc++_shared.so')){if(!(Test-Path -LiteralPath (Join-Path $jni $name))){$payload=$false}}
$engineManifest=Join-Path $android.repo '.build/android-engine-manifest.json'
if(!(Test-Path -LiteralPath $engineManifest)){$payload=$false}else{
    $engine=Get-Content -LiteralPath $engineManifest -Raw | ConvertFrom-Json
    if($engine.ndk -ne $android.pin.ndk){$payload=$false}
}
Check 'local-engine' $payload 'Worker CPU et bibliotheques ARM64 a inclure dans APK.'
foreach($review in $state.reviews.PSObject.Properties){Check "review-$($review.Name)" ([bool]$review.Value) 'Audit du portage mobile et preuve dans docs/ANDROID_PREPARATION.md.'}
$cap=Get-Content -LiteralPath (Join-Path $android.repo 'src-tauri/capabilities/mobile.json') -Raw | ConvertFrom-Json
Check 'permissions' (!$cap.PSObject.Properties['remote'] -and ($cap.permissions -notcontains 'shell:allow-spawn')) 'Aucun acces distant IPC ni lancement shell dans la capacite mobile.'
$blocked=@($checks | Where-Object {!$_.ok})
$report=[ordered]@{ready=($blocked.Count -eq 0);readyForTestBuild=($blocked.Count -eq 0);deviceValidated=$false;compiled=$false;installed=$false;target=$state.target;packageId=$state.packageId;sdk=$android.sdk;java=$android.java;ndk=$android.ndk;checks=@($checks.ToArray());blockers=@($blocked | ForEach-Object id)}
if($Json){$report|ConvertTo-Json -Depth 6}else{Write-Output 'Preparation APK locale ARM64 : diagnostic sans compilation.';$checks|Format-Table id,ok,detail -Wrap;Write-Output "Blocages avant build de test : $($blocked.Count). Validation sur telephone distincte."}
if($RequireReady -and $blocked.Count){exit 1}
