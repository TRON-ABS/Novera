# Windows entry point used by Compiler-Novera.bat. No publication or CI calls.
[CmdletBinding()]
param([switch]$WithTelemetry)
$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2

$repo = if ($env:NOVERA_BUILD_REPO) { [IO.Path]::GetFullPath($env:NOVERA_BUILD_REPO) } else { Split-Path (Split-Path $PSScriptRoot -Parent) -Parent }
$variants = @(
    [pscustomobject]@{Id='desktop'; Flag='DESKTOP'; Name='Novera-Desktop Windows x64'; Host='Windows x64'; Command='yarn build:web + cargo build --offline --locked --release --bin Novera-Desktop'},
    [pscustomobject]@{Id='setup'; Flag='SETUP'; Name='Setup Windows x64 (NSIS .exe)'; Host='Windows x64'; Command='yarn tauri build --bundles nsis'},
    [pscustomobject]@{Id='msi'; Flag='MSI'; Name='Setup Windows x64 (MSI)'; Host='Windows x64'; Command='yarn tauri build --bundles msi'},
    [pscustomobject]@{Id='portable'; Flag='PORTABLE'; Name='Portable Windows x64 (.zip)'; Host='Windows x64'; Command='desktop + scripts/package-windows-portable.ps1 -RuntimeDir <nouveau-runtime>'},
    [pscustomobject]@{Id='arm64'; Flag='ARM64'; Name='Windows ARM64'; Host='Windows + ressources ARM64'; Command='yarn tauri build --target aarch64-pc-windows-msvc --bundles nsis'},
    [pscustomobject]@{Id='linux'; Flag='LINUX'; Name='Linux (.deb / AppImage)'; Host='Linux'; Command='yarn build:tauri:linux'},
    [pscustomobject]@{Id='macos'; Flag='MACOS'; Name='macOS (.app / .dmg universel)'; Host='macOS + Xcode'; Command='yarn build:tauri:darwin'},
    [pscustomobject]@{Id='android'; Flag='ANDROID'; Name='Android APK ARM64'; Host='SDK Android + NDK + JDK + audit mobile'; Command='scripts/android/build-apk.ps1 (APK ARM64 apres diagnostic /android-check)'},
    [pscustomobject]@{Id='ios'; Flag='IOS'; Name='iOS (appareil)'; Host='macOS + Xcode + signature'; Command='yarn build:ios:device'},
    [pscustomobject]@{Id='web'; Flag='WEB'; Name='Interface Web (dist)'; Host='Node.js + dependances'; Command='yarn build:web'},
    [pscustomobject]@{Id='cli'; Flag='CLI'; Name='CLI sans interface (binaire historique jan)'; Host='Rust + dependances natives'; Command='cargo build --locked --release --manifest-path src-tauri/novera-cli/Cargo.toml'}
)
foreach ($variant in $variants) {
    $enabled = [Environment]::GetEnvironmentVariable('NOVERA_BUILD_' + $variant.Flag)
    $variant | Add-Member -NotePropertyName Enabled -NotePropertyValue ($enabled -eq '1' -or ($null -eq $enabled -and $variant.Id -eq 'desktop'))
}
$action = if ($env:NOVERA_BUILD_ACTION) { $env:NOVERA_BUILD_ACTION.ToLowerInvariant() } else { 'desktop' }
if ($action -eq '/android-check') { & (Join-Path $repo 'scripts/android/check-android.ps1'); exit 0 }
if ($action -in @('/list','/help')) {
    Write-Output 'Novera : variantes de compilation (aucune compilation avec /list ou /plan)'
    $variants | Select-Object Id, @{n='Active';e={$_.Enabled}}, Name, Host | Format-Table -AutoSize
    Write-Output 'Double-clic : desktop. Exemples : Compiler-Novera.bat /plan ; Compiler-Novera.bat /plan portable'
    Write-Output 'Pour activer une variante : remplacer son 0 par 1 en haut du BAT.'
    Write-Output 'Les commandes Linux/macOS/iOS doivent etre lancees sur leur environnement natif.'
    Write-Output 'Future APK : Compiler-Novera.bat /android-check (diagnostic sans installation).'
    exit 0
}
$planOnly = $action -eq '/plan'
$id = if ($planOnly) { if ($env:NOVERA_BUILD_OPTION) { $env:NOVERA_BUILD_OPTION.ToLowerInvariant() } else { 'desktop' } } else { $action }
$selected = $variants | Where-Object Id -eq $id
if (!$selected) { Write-Output "ERREUR : variante inconnue '$id'. Utiliser /list."; exit 2 }
if ($planOnly) {
    [ordered]@{variant=$selected.Id; enabled=$selected.Enabled; repository=$repo; required_host=$selected.Host; command=$selected.Command; compiled=$false; published=$false; automatic_updates=$false; statistics=$false; telemetry_requested=[bool]$WithTelemetry; consent_default=$false} | ConvertTo-Json
    exit 0
}
if (!$selected.Enabled) { Write-Output "DESACTIVE : $($selected.Name). Mettre NOVERA_BUILD_$($selected.Flag)=1 dans le BAT pour preparer son activation."; exit 2 }
if ($id -in @('linux','macos','ios','arm64')) {
    Write-Output "Environnement requis : $($selected.Host). Cette cible n'est pas executee automatiquement par le lanceur Windows."
    Write-Output "Commande native, apres preparation des dependances et ressources : $($selected.Command)"
    exit 3
}
if ($id -eq 'android') { & (Join-Path $repo 'scripts/android/build-apk.ps1'); exit $LASTEXITCODE }
if ($env:OS -ne 'Windows_NT' -or ![Environment]::Is64BitOperatingSystem) { Write-Output 'ERREUR : ce lanceur exige Windows 64 bits.'; exit 3 }
if (!(Test-Path -LiteralPath (Join-Path $repo 'src-tauri/Cargo.toml'))) { Write-Output 'ERREUR : depot invalide.'; exit 2 }

$mutex = New-Object Threading.Mutex($false, 'Local\NoveraLocalBuild')
$locked = $false
try {
    try { $locked = $mutex.WaitOne(0) } catch [Threading.AbandonedMutexException] { $locked = $true }
    if (!$locked) { throw 'Une autre compilation de ce lanceur est en cours.' }
    Set-Location -LiteralPath $repo
    $nodeDir = Join-Path $env:ProgramFiles 'nodejs'
    $env:PATH = "$nodeDir;" + $env:PATH
    $corepack = (Get-Command corepack.cmd -ErrorAction Stop).Source
    if (!(Test-Path -LiteralPath 'node_modules') -or !(Test-Path -LiteralPath 'web-app/node_modules')) { throw 'Dependances absentes : preparer yarn install avant de compiler.' }
    $stamp = Get-Date -Format 'yyyy-MM-dd_HH-mm-ss-fff'
    $logs = Join-Path $repo ".build/launcher-$id-$stamp"
    New-Item -ItemType Directory -Path $logs | Out-Null
    $config = Get-Content -LiteralPath 'src-tauri/tauri.conf.json' -Raw | ConvertFrom-Json
    $output = Join-Path $repo "deliverables/Novera-$id-$($config.version)-$stamp"
    $env:NOVERA_ENABLE_UPDATER = 'false'
    $env:NOVERA_ANALYTICS_HOST = ''
    $env:NOVERA_ANALYTICS_PROJECT_KEY = ''
    $telemetryConfigured = $false
    if ($WithTelemetry) {
        . (Join-Path $PSScriptRoot 'read-novera-telemetry.ps1')
        $telemetry = Read-NoveraTelemetry (Join-Path $repo 'web-app/.env.local')
        $env:NOVERA_ANALYTICS_HOST = $telemetry.Host
        $env:NOVERA_ANALYTICS_PROJECT_KEY = $telemetry.Key
        $telemetryConfigured = $true
        Write-Output "Telemetry destination configured: $($telemetry.Host). User consent remains required."
    }
    $env:CARGO_BUILD_JOBS = '4'
    if (!$env:CARGO_TARGET_DIR) {
        $env:CARGO_TARGET_DIR = if (Test-Path -LiteralPath 'C:/jb' -PathType Container) { 'C:/jb' } else { Join-Path $repo 'src-tauri/target' }
    }
    $env:CARGO_TARGET_DIR = [IO.Path]::GetFullPath($env:CARGO_TARGET_DIR)
    Write-Output "Novera : $($selected.Name)"
    Write-Output "Journaux : $logs"
    Write-Output "Resultat : $output"

    function Run-Step([string]$Name, [string]$Exe, [string[]]$Arguments) {
        Write-Output "Etape : $Name"
        $previous = $ErrorActionPreference
        try {
            $ErrorActionPreference = 'Continue'
            & $Exe @Arguments *> (Join-Path $logs "$Name.log")
            $code = $LASTEXITCODE
        } finally { $ErrorActionPreference = $previous }
        if ($code -ne 0) {
            Get-Content -LiteralPath (Join-Path $logs "$Name.log") -Tail 35
            throw "Echec de $Name (code $code). Voir le journal."
        }
    }
    if ($id -ne 'web') {
        $toolchainText = Get-Content -LiteralPath 'rust-toolchain.toml' -Raw
        if ($toolchainText -notmatch 'channel\s*=\s*"([0-9.]+)"') { throw 'Version Rust du projet introuvable.' }
        $rustVersion = $Matches[1]
        $rustRoot = if ($env:RUSTUP_HOME) { $env:RUSTUP_HOME } else { Join-Path $env:USERPROFILE '.rustup' }
        $toolchain = Join-Path $rustRoot "toolchains/$rustVersion-x86_64-pc-windows-msvc/bin"
        if (!(Test-Path -LiteralPath (Join-Path $toolchain 'cargo.exe'))) { throw "Rust $rustVersion MSVC absent. Installer cette chaine avec rustup avant de relancer." }
        $env:PATH = "$toolchain;" + $env:PATH
        $env:RUSTC = Join-Path $toolchain 'rustc.exe'
        $vswhere = Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
        if (!(Test-Path -LiteralPath $vswhere)) { throw 'Visual Studio Build Tools C++ et Windows SDK requis.' }
        $vs = & $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
        if (!$vs) { throw 'Outils MSVC x64 introuvables.' }
        $vcvars = Join-Path ($vs | Select-Object -First 1) 'VC/Auxiliary/Build/vcvars64.bat'
        $lines = & cmd.exe /d /s /c "`"$vcvars`" >nul && set"
        if ($LASTEXITCODE -ne 0) { throw 'Initialisation MSVC impossible.' }
        foreach ($line in $lines) {
            if ($line -match '^([^=]+)=(.*)$' -and $Matches[1] -notin @('HOME','CODEX_HOME')) {
                [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process')
            }
        }
    }
    if ($id -eq 'web') { Remove-Item Env:IS_TAURI -ErrorAction SilentlyContinue } else { $env:IS_TAURI = 'true' }
    Remove-Item Env:CARGO_BUILD_TARGET -ErrorAction SilentlyContinue
    $env:TAURI_ENV_PLATFORM = 'windows'
    $env:TAURI_ENV_ARCH = 'x86_64'
    $env:TAURI_ENV_TARGET_TRIPLE = 'x86_64-pc-windows-msvc'
    $env:TAURI_ENV_FAMILY = 'windows'
    $env:__TAURI_BUNDLE_TYPE = 'nsis'
    if ($id -in @('setup','msi')) {
        $bundle = if ($id -eq 'setup') { 'nsis' } else { 'msi' }
        Run-Step 'setup' $corepack @('yarn','tauri','build','--bundles',$bundle)
        $bundleDir = Join-Path $env:CARGO_TARGET_DIR "release/bundle/$bundle"
        New-Item -ItemType Directory -Path $output | Out-Null
        Copy-Item -LiteralPath $bundleDir -Destination $output -Recurse
    } elseif ($id -eq 'cli') {
        Run-Step 'cli' (Join-Path $toolchain 'cargo.exe') @('build','--offline','--locked','--release','--manifest-path','src-tauri/novera-cli/Cargo.toml')
        Write-Output "CLI : $env:CARGO_TARGET_DIR/release (nom historique defini par le manifeste CLI)."
    } else {
        Run-Step 'interface' $corepack @('yarn','build:web')
        if ($id -eq 'web') {
            New-Item -ItemType Directory -Path $output | Out-Null
            Copy-Item -LiteralPath (Join-Path $repo 'web-app/dist') -Destination $output -Recurse
        } else {
            Run-Step 'desktop' (Join-Path $toolchain 'cargo.exe') @('build','--offline','--locked','--release','--manifest-path','src-tauri/Cargo.toml','--bin','Novera-Desktop')
            New-Item -ItemType Directory -Path $output | Out-Null
            $binaryRoot = Join-Path $env:CARGO_TARGET_DIR 'release'
            Copy-Item -LiteralPath (Join-Path $binaryRoot 'Novera-Desktop.exe') -Destination $output
            $windows = Get-Content -LiteralPath 'src-tauri/tauri.windows.conf.json' -Raw | ConvertFrom-Json
            foreach ($pattern in $windows.bundle.resources) {
                if ($pattern -notmatch '^resources[\\/]' -or $pattern -match '(^|[\\/])\.\.([\\/]|$)') { throw "Ressource invalide : $pattern" }
                $files = @(Get-Item -Path (Join-Path $repo "src-tauri/$pattern") -ErrorAction Stop)
                if (!$files.Count) { throw "Ressource absente : $pattern" }
                foreach ($file in $files) {
                    if ($file.PSIsContainer -or !$file.Length -or ($file.Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw "Ressource invalide : $($file.FullName)" }
                    $relative = $file.FullName.Substring((Join-Path $repo 'src-tauri').Length + 1)
                    $dest = Join-Path $output $relative
                    New-Item -ItemType Directory -Force -Path (Split-Path $dest -Parent) | Out-Null
                    Copy-Item -LiteralPath $file.FullName -Destination $dest
                }
            }
            foreach ($sidecar in $windows.bundle.externalBin) {
                if ($sidecar -notmatch '^resources[\\/]bin[\\/][A-Za-z0-9_-]+$') { throw "Auxiliaire invalide : $sidecar" }
                $source = Join-Path $repo "src-tauri/$sidecar-x86_64-pc-windows-msvc.exe"
                Copy-Item -LiteralPath $source -Destination (Join-Path $output "$(Split-Path $sidecar -Leaf).exe")
            }
            Get-ChildItem -LiteralPath $binaryRoot -Filter '*.dll' -File | ForEach-Object { Copy-Item -LiteralPath $_.FullName -Destination $output }
            foreach ($name in @('ggml.dll','ggml-base.dll','novera-llama-worker.exe')) {
                if (!(Test-Path -LiteralPath (Join-Path $output "resources/bin/$name"))) { throw "Moteur incomplet : $name" }
            }
            if (!(Get-ChildItem -LiteralPath (Join-Path $output 'resources/bin') -Filter 'ggml-cpu*.dll' -File)) { throw 'Backend CPU absent.' }
            if (Test-Path -LiteralPath (Join-Path $output 'resources/bin/ggml-cuda.dll')) {
                foreach ($pattern in @('cublas64_*.dll','cublasLt64_*.dll','cudart64_*.dll')) {
                    if (!(Get-ChildItem -LiteralPath (Join-Path $output 'resources/bin') -Filter $pattern -File)) { throw "Dependance CUDA absente : $pattern" }
                }
            }
            foreach ($name in @('LICENSE','BRANDING.md','OFFICIAL_RELEASES.md')) { Copy-Item -LiteralPath (Join-Path $repo $name) -Destination $output }
            if ($id -eq 'portable') {
                & (Join-Path $repo 'scripts/package-windows-portable.ps1') -RuntimeDir $output -OutputDir (Join-Path $output 'portable')
            }
        }
    }
    $record = [ordered]@{variant=$id;version=$config.version;completed_utc=[DateTime]::UtcNow.ToString('o');output=$output;logs=$logs;published=$false;automatic_updates=$false;statistics=$false;telemetry_configured=$telemetryConfigured;consent_default=$false}
    $record | ConvertTo-Json | Set-Content -LiteralPath (Join-Path $logs 'result.json') -Encoding UTF8
    if (Test-Path -LiteralPath $output) {
        $checksums = Get-ChildItem -LiteralPath $output -File -Recurse | ForEach-Object { "$((Get-FileHash -LiteralPath $_.FullName).Hash)  $($_.FullName.Substring($output.Length + 1))" }
        $checksums | Set-Content -LiteralPath (Join-Path $output 'SHA256SUMS') -Encoding UTF8
    }
    Write-Output "TERMINE : $($selected.Name). Journaux : $logs"
    if (Test-Path -LiteralPath $output) { Write-Output "Ouvrir : $output" }
    exit 0
} catch {
    Write-Output "ERREUR : $($_.Exception.Message)"
    exit 1
} finally {
    if ($locked) { $mutex.ReleaseMutex() }
    $mutex.Dispose()
}
