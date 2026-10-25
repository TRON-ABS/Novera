# Adapted from TRON-ABS's Jan PR #9302. Does not build, sign or publish.
[CmdletBinding(DefaultParameterSetName = 'Build')]
param(
    [Parameter(ParameterSetName = 'Build')][string]$ReleaseDir,
    [Parameter(Mandatory = $true, ParameterSetName = 'Runtime')][string]$RuntimeDir,
    [string]$OutputDir
)
$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$config = Get-Content -LiteralPath (Join-Path $repoRoot 'src-tauri/tauri.conf.json') -Raw | ConvertFrom-Json
$windows = Get-Content -LiteralPath (Join-Path $repoRoot 'src-tauri/tauri.windows.conf.json') -Raw | ConvertFrom-Json
if ($config.productName -notmatch '^Novera(?:-(?:beta|nightly))?$' -or
    $config.mainBinaryName -ne ($config.productName -replace '^Novera', 'Novera-Desktop') -or
    $config.version -notmatch '^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$') {
    throw 'Expected a Novera stable/beta/nightly configuration with a valid version'
}
function Full-InputPath([string]$Path) {
    if (![IO.Path]::IsPathRooted($Path)) { $Path = Join-Path $PWD.Path $Path }
    return [IO.Path]::GetFullPath($Path)
}
$runtimeMode = $PSCmdlet.ParameterSetName -eq 'Runtime'
if ($runtimeMode) {
    $binaryRoot = (Full-InputPath $RuntimeDir)
    $resourceRoot = $binaryRoot
} else {
    if (!$ReleaseDir) {
        $target = if ($env:CARGO_TARGET_DIR) { $env:CARGO_TARGET_DIR } else { 'src-tauri/target' }
        if (![IO.Path]::IsPathRooted($target)) { $target = Join-Path $repoRoot $target }
        $ReleaseDir = Join-Path $target 'release'
    }
    $binaryRoot = (Full-InputPath $ReleaseDir)
    $resourceRoot = Join-Path $repoRoot 'src-tauri'
}
if (!$OutputDir) { $OutputDir = Join-Path $repoRoot 'src-tauri/target/portable' }
$fullOutput = Full-InputPath $OutputDir
if ($fullOutput.TrimEnd('\', '/') -eq [IO.Path]::GetPathRoot($fullOutput).TrimEnd('\', '/')) { throw 'OutputDir must not be a filesystem root' }
$OutputDir = $fullOutput.TrimEnd('\', '/')
if ($OutputDir -eq $binaryRoot.TrimEnd('\', '/')) { throw 'OutputDir must differ from the input directory' }
$desktop = "$($config.mainBinaryName).exe"
$archiveName = "$($config.productName)_$($config.version)_x64-portable.zip"
$archivePath = Join-Path $OutputDir $archiveName
$utf8 = New-Object Text.UTF8Encoding($false)
New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
$stage = Join-Path $OutputDir ('novera-portable-stage-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $stage | Out-Null
$temporaryArchive = "$stage.zip"
$temporaryChecksum = "$stage.sha256"

function Write-Utf8([string]$Path, [string]$Content) {
    [IO.File]::WriteAllText($Path, $Content.Replace("`r`n", "`n"), $utf8)
}
function Copy-RequiredFile([string]$Source, [string]$Destination) {
    if (!(Test-Path -LiteralPath $Source -PathType Leaf)) { throw "Missing portable dependency: $Source" }
    $item = Get-Item -LiteralPath $Source
    if ($item.Length -eq 0 -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
        throw "Empty or linked portable dependency: $Source"
    }
    New-Item -ItemType Directory -Force -Path (Split-Path $Destination -Parent) | Out-Null
    Copy-Item -LiteralPath $Source -Destination $Destination -Force
}
function Assert-X64PE([string]$Path) {
    $stream = [IO.File]::OpenRead($Path)
    $reader = New-Object IO.BinaryReader($stream)
    try {
        if ($stream.Length -lt 90 -or $reader.ReadUInt16() -ne 0x5A4D) { throw "Not a Windows PE binary: $Path" }
        $stream.Position = 0x3C
        $offset = $reader.ReadInt32()
        if ($offset -lt 64 -or $offset -gt $stream.Length - 26) { throw "Invalid PE header: $Path" }
        $stream.Position = $offset
        if ($reader.ReadUInt32() -ne 0x4550 -or $reader.ReadUInt16() -ne 0x8664) { throw "Expected Windows x64 binary: $Path" }
        $stream.Position = $offset + 24
        if ($reader.ReadUInt16() -ne 0x20B) { throw "Expected PE32+ binary: $Path" }
    } finally { $reader.Dispose() }
}
function Relative-Name([string]$Path) { $Path.Substring($stage.Length + 1).Replace('\', '/') }
function Sorted-Files {
    $names = [string[]]@(Get-ChildItem -LiteralPath $stage -Recurse -File -Force | ForEach-Object { Relative-Name $_.FullName })
    [Array]::Sort($names, [StringComparer]::Ordinal)
    return $names
}
function Commit-File([string]$Source, [string]$Destination) {
    if (Test-Path -LiteralPath $Destination) { [IO.File]::Replace($Source, $Destination, [NullString]::Value) }
    else { [IO.File]::Move($Source, $Destination) }
}
try {
    Copy-RequiredFile (Join-Path $binaryRoot $desktop) (Join-Path $stage $desktop)
    $info = [Diagnostics.FileVersionInfo]::GetVersionInfo((Join-Path $binaryRoot $desktop))
    if ($info.ProductVersion -and $info.ProductVersion -ne $config.version) {
        throw "Binary version $($info.ProductVersion) differs from requested $($config.version); rebuild first"
    }
    foreach ($pattern in $windows.bundle.resources) {
        if ($pattern -isnot [string] -or $pattern -notmatch '^resources[\\/]' -or $pattern -match '(^|[\\/])\.\.([\\/]|$)') {
            throw "Unsupported or escaping resource pattern: $pattern"
        }
        $matches = @(Get-Item -Path (Join-Path $resourceRoot $pattern) -ErrorAction SilentlyContinue)
        if ($matches.Count -eq 0) { throw "No portable resource matches: $pattern" }
        foreach ($item in $matches) {
            $relative = $item.FullName.Substring($resourceRoot.TrimEnd('\', '/').Length + 1)
            Copy-RequiredFile $item.FullName (Join-Path $stage $relative)
        }
    }
    foreach ($binary in $windows.bundle.externalBin) {
        if ($binary -isnot [string] -or $binary -notmatch '^resources[\\/]bin[\\/][A-Za-z0-9_-]+$') { throw "Unsupported sidecar: $binary" }
        $name = "$(Split-Path $binary -Leaf).exe"
        $source = if ($runtimeMode) { Join-Path $binaryRoot $name } else { Join-Path $resourceRoot "$binary-x86_64-pc-windows-msvc.exe" }
        Copy-RequiredFile $source (Join-Path $stage $name)
    }
    # Optional acceleration and root DLLs are files only; never copy user profiles.
    $sqlite = Join-Path $resourceRoot 'resources/bin/sqlite-vec.dll'
    if (Test-Path -LiteralPath $sqlite) { Copy-RequiredFile $sqlite (Join-Path $stage 'resources/bin/sqlite-vec.dll') }
    Get-ChildItem -LiteralPath $binaryRoot -Filter '*.dll' -File | ForEach-Object {
        Copy-RequiredFile $_.FullName (Join-Path $stage $_.Name)
    }
    foreach ($required in @($desktop, 'bun.exe', 'uv.exe', 'resources/LICENSE',
        'resources/bin/novera-llama-worker.exe', 'resources/bin/ggml.dll', 'resources/bin/ggml-base.dll')) {
        if (!(Test-Path -LiteralPath (Join-Path $stage $required) -PathType Leaf)) { throw "Incomplete runtime: $required" }
    }
    if (@(Get-ChildItem -LiteralPath (Join-Path $stage 'resources/bin') -Filter 'ggml-cpu*.dll' -File).Count -eq 0) {
        throw 'Incomplete runtime: a CPU backend is required'
    }
    if (Test-Path -LiteralPath (Join-Path $stage 'resources/bin/ggml-cuda.dll')) {
        foreach ($dependency in @('cublas64_*.dll', 'cublasLt64_*.dll', 'cudart64_*.dll')) {
            if (@(Get-ChildItem -LiteralPath (Join-Path $stage 'resources/bin') -Filter $dependency -File).Count -eq 0) {
                throw "Incomplete CUDA runtime: $dependency"
            }
        }
    }
    Get-ChildItem -LiteralPath $stage -Recurse -File | Where-Object { $_.Extension -in @('.exe', '.dll') } | ForEach-Object { Assert-X64PE $_.FullName }
    foreach ($notice in @('LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md')) {
        Copy-RequiredFile (Join-Path $repoRoot $notice) (Join-Path $stage $notice)
    }
    if ($runtimeMode -and (Test-Path -LiteralPath (Join-Path $binaryRoot 'BUILD_INFO.md'))) {
        Copy-RequiredFile (Join-Path $binaryRoot 'BUILD_INFO.md') (Join-Path $stage 'BUILD_INFO.md')
    }
    Write-Utf8 (Join-Path $stage 'README.txt') @"
Novera $($config.version) - Windows x64 portable

Extract the entire ZIP to a writable folder, then run $desktop.
Keep resources/, bun.exe, uv.exe and the other files together.
Requires Microsoft Edge WebView2 Runtime and Microsoft Visual C++ x64 runtime.
GPU acceleration requires a compatible graphics driver. Models are not included.

This is an installation-free application package. Settings, chats and models
remain in Novera's normal user profile (normally %APPDATA%/Novera on Windows),
not beside the executable. This ZIP does not transfer your personal data.
Automatic app updates remain disabled. To update, close Novera and extract the
new complete ZIP into a new folder, then launch its executable.

Repackaging does not compile recent source changes. When present, BUILD_INFO.md
describes the input binary. A checksum verifies integrity, not publisher identity.
An unsigned local package is not a signed official release. See
OFFICIAL_RELEASES.md and BRANDING.md. Original licenses and credits are retained.
"@
    $entries = @(foreach ($relative in (Sorted-Files)) {
        $path = Join-Path $stage $relative
        [ordered]@{ path = $relative; bytes = (Get-Item -LiteralPath $path).Length; sha256 = (Get-FileHash -LiteralPath $path -Algorithm SHA256).Hash.ToLowerInvariant() }
    })
    $manifest = [ordered]@{ format = 'novera-windows-portable'; version = 1; product = $config.productName;
        appVersion = $config.version; architecture = 'x86_64'; executable = $desktop;
        inputKind = $(if ($runtimeMode) { 'staged-runtime' } else { 'release-build' }); files = $entries }
    Write-Utf8 (Join-Path $stage 'portable-manifest.json') (($manifest | ConvertTo-Json -Depth 6 -Compress) + "`n")
    $lines = foreach ($relative in (Sorted-Files)) {
        "$((Get-FileHash -LiteralPath (Join-Path $stage $relative) -Algorithm SHA256).Hash.ToLowerInvariant())  $relative"
    }
    Write-Utf8 (Join-Path $stage 'SHA256SUMS') (($lines -join "`n") + "`n")
    Add-Type -AssemblyName System.IO.Compression
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    Write-Output "Packaging $archiveName ($(@(Sorted-Files).Count) files)"
    $archive = [IO.Compression.ZipFile]::Open($temporaryArchive, [IO.Compression.ZipArchiveMode]::Create, [Text.Encoding]::UTF8)
    try {
        foreach ($relative in (Sorted-Files)) {
            $entry = $archive.CreateEntry($relative, [IO.Compression.CompressionLevel]::Optimal)
            $entry.LastWriteTime = [DateTimeOffset]::Parse('1980-01-01T00:00:00+00:00')
            $entry.ExternalAttributes = 0
            $input = [IO.File]::OpenRead((Join-Path $stage $relative))
            $output = $entry.Open()
            try { $input.CopyTo($output) } finally { $output.Dispose(); $input.Dispose() }
        }
    } finally { $archive.Dispose() }
    $digest = (Get-FileHash -LiteralPath $temporaryArchive -Algorithm SHA256).Hash.ToLowerInvariant()
    Write-Utf8 $temporaryChecksum "$digest  $archiveName`n"
    Commit-File $temporaryArchive $archivePath
    Commit-File $temporaryChecksum "$archivePath.sha256"
    if ($env:GITHUB_OUTPUT) {
        [IO.File]::AppendAllText($env:GITHUB_OUTPUT, "PORTABLE_FILE_NAME=$archiveName`nPORTABLE_PATH=$archivePath`nPORTABLE_SHA256=$digest`nPORTABLE_SHA256_PATH=$archivePath.sha256`n", $utf8)
    }
    Write-Output "Portable package: $archivePath"
    Write-Output "SHA256: $digest"
} finally {
    # Check the absolute target before recursive cleanup; never delete an input.
    $resolvedStage = [IO.Path]::GetFullPath($stage)
    if ((Split-Path $resolvedStage -Parent).TrimEnd('\', '/') -ne $OutputDir -or
        (Split-Path $resolvedStage -Leaf) -notmatch '^novera-portable-stage-[a-f0-9]{32}$') { throw 'Invalid staging directory' }
    if (Test-Path -LiteralPath $resolvedStage) {
        if ((Get-Item -LiteralPath $resolvedStage).Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Refusing linked staging directory' }
        Remove-Item -LiteralPath $resolvedStage -Recurse -Force
    }
    foreach ($temporary in @($temporaryArchive, $temporaryChecksum)) {
        if ((Split-Path ([IO.Path]::GetFullPath($temporary)) -Parent).TrimEnd('\', '/') -ne $OutputDir) { throw 'Invalid temporary path' }
        if (Test-Path -LiteralPath $temporary) { Remove-Item -LiteralPath $temporary -Force }
    }
}
