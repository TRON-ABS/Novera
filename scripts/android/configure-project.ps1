# Reapply Novera's Android build choices after `tauri android init`.
[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
$project=Join-Path $android.repo 'src-tauri/gen/android'
$app=Join-Path $project 'app/build.gradle.kts'
if (!(Test-Path -LiteralPath $app)) {throw 'Projet Gradle absent : initialiser Android avant configuration.'}
$utf8=New-Object Text.UTF8Encoding($false)
$gradle=Get-Content -LiteralPath $app -Raw
$gradle=[regex]::Replace($gradle,'(?m)^\s*compileSdk\s*=.*$',"    compileSdk = $($android.pin.compileSdk)")
if ($gradle -notmatch '(?m)^\s*ndkVersion\s*=') {$gradle=$gradle.Replace('android {',"android {`n    ndkVersion = `"$($android.pin.ndk)`"`n    buildToolsVersion = `"$($android.pin.buildTools)`"")}
$gradle=[regex]::Replace($gradle,'(?m)^\s*targetSdk\s*=.*$',"        targetSdk = $($android.pin.compileSdk)")
if ($gradle -notmatch 'applicationIdSuffix') {
    $gradle=$gradle.Replace('getByName("debug") {',"getByName(`"debug`") {`n            applicationIdSuffix = `".debug`"`n            versionNameSuffix = `"-debug`"")
}
[IO.File]::WriteAllText($app,$gradle,$utf8)
$task=Join-Path $project 'buildSrc/src/main/java/io/github/tronabs/novera/kotlin/BuildTask.kt'
$kotlin=Get-Content -LiteralPath $task -Raw
$kotlin=[regex]::Replace($kotlin,'(?m)^\s*val executable = .*$', '        val executable = System.getenv("NOVERA_NODE_BINARY") ?: "node"')
$kotlin=[regex]::Replace($kotlin,'(?m)^\s*val args = listOf\(.*$', '        val args = listOf("../node_modules/@tauri-apps/cli/tauri.js", "android", "android-studio-script")')
[IO.File]::WriteAllText($task,$kotlin,$utf8)
$manifest=Join-Path $project 'app/src/main/AndroidManifest.xml'
$xml=Get-Content -LiteralPath $manifest -Raw
if ($xml -notmatch 'android:allowBackup=') {$xml=$xml.Replace('<application',"<application`n        android:allowBackup=`"false`"`n        android:fullBackupContent=`"false`"")}
if ($xml -notmatch 'android:extractNativeLibs=') {$xml=$xml.Replace('<application',"<application`n        android:extractNativeLibs=`"true`"")}
[IO.File]::WriteAllText($manifest,$xml,$utf8)
if ($gradle -notmatch 'useLegacyPackaging') {
    $gradle=$gradle.Replace('android {',"android {`n    packaging { jniLibs.useLegacyPackaging = true }")
    [IO.File]::WriteAllText($app,$gradle,$utf8)
}
$paths=@'
<?xml version="1.0" encoding="utf-8"?>
<paths xmlns:android="http://schemas.android.com/apk/res/android">
  <files-path name="novera_exports" path="exports/" />
  <cache-path name="novera_export_cache" path="exports/" />
</paths>
'@
[IO.File]::WriteAllText((Join-Path $project 'app/src/main/res/xml/file_paths.xml'),$paths,$utf8)
New-Item -ItemType Directory -Force -Path (Join-Path $project 'app/src/main/java/io/github/tronabs/novera/generated') | Out-Null
Write-Output 'Projet Android configure : JDK 21, SDK/NDK epingles, lancement Node portable et partage limite aux exports.'
