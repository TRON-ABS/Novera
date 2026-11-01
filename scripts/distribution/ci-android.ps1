$ErrorActionPreference = 'Stop'
if ($env:GITHUB_ACTIONS -ne 'true') { throw 'Ephemeral GitHub Actions runner required.' }
$pin = Get-Content scripts/android/toolchain.json -Raw | ConvertFrom-Json
$stage = Join-Path $PWD '.build/android-ci-tools'
New-Item -ItemType Directory -Force $stage | Out-Null
$jdkArchive = Join-Path $stage 'jdk.zip'
Invoke-WebRequest 'https://download.oracle.com/java/27/latest/jdk-27_windows-x64_bin.zip' -OutFile $jdkArchive
if ((Get-FileHash $jdkArchive).Hash.ToLowerInvariant() -ne '9655f039e3482fd365eec297fe6bd85885ea408853ca4a4e799affc2989df313') { throw 'Pinned JDK checksum mismatch.' }
Expand-Archive -LiteralPath $jdkArchive -DestinationPath (Join-Path $stage 'jdk')
$env:JAVA_HOME = (Get-ChildItem (Join-Path $stage 'jdk') -Directory | Select-Object -First 1).FullName
$env:NOVERA_ANDROID_JAVA_HOME = $env:JAVA_HOME
if (!$env:ANDROID_HOME) { throw 'GitHub runner Android SDK is missing.' }
$archive = Join-Path $stage 'command-line.zip'
Invoke-WebRequest $pin.commandLineTools.url -OutFile $archive
if ((Get-FileHash $archive).Hash.ToLowerInvariant() -ne $pin.commandLineTools.sha256) { throw 'Android command-line tools checksum mismatch.' }
Expand-Archive -LiteralPath $archive -DestinationPath (Join-Path $stage 'command-line')
$tools = Join-Path $env:ANDROID_HOME ('cmdline-tools/' + $pin.commandLineTools.directory)
if (!(Test-Path $tools)) { Copy-Item -LiteralPath (Join-Path $stage 'command-line/cmdline-tools') -Destination $tools -Recurse }
# Hosted runner SDK licenses are provisioned by its image. Do not silently
# accept new terms: sdkmanager must fail if a required license is absent.
& (Join-Path $tools 'bin/sdkmanager.bat') "--sdk_root=$env:ANDROID_HOME" --install "platforms;android-$($pin.sdkPlatform)" "build-tools;$($pin.buildTools)" "ndk;$($pin.ndk)" 'platform-tools'
if ($LASTEXITCODE) { throw 'Android SDK provisioning failed; inspect version and license diagnostics.' }
& rustup target add $pin.rustTarget
if ($LASTEXITCODE) { throw 'Android Rust target installation failed.' }
& scripts/android/initialize-project.ps1
if ($LASTEXITCODE) { throw 'Android project initialization failed.' }
& scripts/android/build-engine.ps1
if ($LASTEXITCODE) { throw 'Android engine build failed.' }
$env:NOVERA_BUILD_ANDROID = '1'
Copy-Item -LiteralPath '.build/candidates/SIGNATURE.txt' -Destination 'src-tauri/gen/android/app/src/main/assets/resources/SIGNATURE.txt' -Force
& scripts/android/build-apk.ps1 -AllowUnreviewedTestBuild
if ($LASTEXITCODE) { throw 'Android candidate build failed.' }
