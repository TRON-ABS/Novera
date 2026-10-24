param([string]$ReportPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$testBase = [IO.Path]::GetFullPath((Join-Path $repoRoot '.build'))
$testRoot = Join-Path $testBase ('novera-portable-tests-' + [Guid]::NewGuid().ToString('N'))
$fixture = Join-Path $testRoot 'repo with spaces'
$oldTarget = $env:CARGO_TARGET_DIR; $oldOutput = $env:GITHUB_OUTPUT
$checks = 0; $scenarios = New-Object Collections.Generic.List[string]
function Assert-True([bool]$Condition, [string]$Message) {
    if (!$Condition) { throw $Message }; $script:checks++
}
function Pass([string]$Message) { $scenarios.Add($Message); Write-Output "PASS: $Message" }
function Write-FixtureFile([string]$Relative, [string]$Content = 'fixture') {
    $destination = Join-Path $fixture $Relative
    New-Item -ItemType Directory -Force -Path (Split-Path $destination -Parent) | Out-Null
    [IO.File]::WriteAllText($destination, $Content)
}
# Synthetic PE headers for architecture checks; never executed.
function Write-FixturePE([string]$Relative, [string]$Marker = 'synthetic PE', [UInt16]$Machine = 0x8664) {
    Write-FixtureFile $Relative; $bytes = New-Object byte[] 1024
    $bytes[0] = 0x4D; $bytes[1] = 0x5A
    [BitConverter]::GetBytes([int]128).CopyTo($bytes, 0x3C)
    [BitConverter]::GetBytes([int]0x4550).CopyTo($bytes, 128)
    [BitConverter]::GetBytes($Machine).CopyTo($bytes, 132)
    [BitConverter]::GetBytes([UInt16]0x20B).CopyTo($bytes, 152)
    [Text.Encoding]::UTF8.GetBytes($Marker).CopyTo($bytes, 256)
    [IO.File]::WriteAllBytes((Join-Path $fixture $Relative), $bytes)
}
function Package { & "$fixture/scripts/package-windows-portable.ps1" | Out-Null }
function Assert-Failure {
    $failed = $false; try { Package } catch { $failed = $true }
    Assert-True $failed 'Packaging must reject invalid input'
    Assert-True ((Get-FileHash -LiteralPath $archivePath).Hash -eq $previousHash) 'Failed packaging replaced a valid ZIP'
    Assert-True ((Get-FileHash -LiteralPath "$archivePath.sha256").Hash -eq $previousChecksum) 'Failed packaging replaced its checksum'
    Assert-True (@(Get-ChildItem -LiteralPath $outputDir -Directory).Count -eq 0) 'Staging was not cleaned'
}
function Read-Entry($Zip, [string]$Name) {
    $entry = $Zip.GetEntry($Name); Assert-True ($null -ne $entry) "Missing ZIP entry: $Name"
    $reader = New-Object IO.StreamReader($entry.Open())
    try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}
try {
    Write-FixtureFile 'scripts/distribution/placeholder'
    Copy-Item -LiteralPath "$repoRoot/scripts/package-windows-portable.ps1" -Destination "$fixture/scripts/"
    Copy-Item -LiteralPath "$repoRoot/scripts/distribution/package-windows-portable.ps1" -Destination "$fixture/scripts/distribution/"
    $windowsJson = '{"bundle":{"resources":["resources/LICENSE","resources/bin/jan-llama-worker.exe","resources/bin/*.dll"],"externalBin":["resources/bin/bun","resources/bin/uv"]}}'
    Write-FixtureFile 'src-tauri/tauri.windows.conf.json' $windowsJson
    foreach ($notice in @('LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md', 'src-tauri/resources/LICENSE')) { Write-FixtureFile $notice 'license and attribution fixture' }
    foreach ($binary in @('jan-llama-worker.exe', 'ggml-base.dll', 'ggml.dll', 'ggml-cpu-x64.dll', 'ggml-vulkan.dll', 'sqlite-vec.dll', 'bun-x86_64-pc-windows-msvc.exe', 'uv-x86_64-pc-windows-msvc.exe')) { Write-FixturePE "src-tauri/resources/bin/$binary" }
    Write-FixturePE 'custom target/release/extra.dll'
    Write-FixtureFile 'custom target/release/private-token.txt' 'must never ship'
    $env:CARGO_TARGET_DIR = Join-Path $fixture 'custom target'
    $env:GITHUB_OUTPUT = Join-Path $testRoot 'github-output.txt'
    $outputDir = Join-Path $fixture 'src-tauri/target/portable'
    foreach ($channel in @('stable', 'beta', 'nightly')) {
        $suffix = if ($channel -eq 'stable') { '' } else { "-$channel" }
        $product = "Novera$suffix"; $desktop = "Novera-Desktop$suffix"
        Write-FixtureFile 'src-tauri/tauri.conf.json' (@{ productName = $product; mainBinaryName = $desktop; version = '1.0.0' } | ConvertTo-Json)
        Write-FixturePE "custom target/release/$desktop.exe" "desktop $channel"
        Package
        $archivePath = Join-Path $outputDir "${product}_1.0.0_x64-portable.zip"
        $zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
        try {
            foreach ($name in @("$desktop.exe", 'bun.exe', 'uv.exe', 'extra.dll', 'resources/LICENSE', 'resources/bin/jan-llama-worker.exe', 'resources/bin/ggml-cpu-x64.dll', 'resources/bin/ggml-vulkan.dll', 'resources/bin/sqlite-vec.dll', 'README.txt', 'LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md', 'portable-manifest.json', 'SHA256SUMS')) {
                Assert-True ($null -ne $zip.GetEntry($name)) "Missing ZIP entry: $name"
            }
            Assert-True ($null -eq $zip.GetEntry('private-token.txt')) 'Private files were included'
            Assert-True (@($zip.Entries | Where-Object { $_.FullName.Contains('\') -or $_.FullName.StartsWith('/') -or $_.FullName.Contains('../') }).Count -eq 0) 'Unsafe ZIP entry'
            $manifest = (Read-Entry $zip 'portable-manifest.json') | ConvertFrom-Json
            foreach ($file in $manifest.files) {
                $entry = $zip.GetEntry($file.path)
                Assert-True ($null -ne $entry -and $entry.Length -eq $file.bytes) "Bad manifest length: $($file.path)"
                $sha = [Security.Cryptography.SHA256]::Create(); $stream = $entry.Open()
                try { $actual = [BitConverter]::ToString($sha.ComputeHash($stream)).Replace('-', '').ToLowerInvariant() } finally { $stream.Dispose(); $sha.Dispose() }
                Assert-True ($actual -eq $file.sha256) "Bad manifest hash: $($file.path)"
            }
            Assert-True ((Read-Entry $zip 'README.txt').Contains('Novera')) 'Wrong product README'
        } finally { $zip.Dispose() }
        $hash = (Get-FileHash -LiteralPath $archivePath).Hash.ToLowerInvariant()
        Assert-True ([IO.File]::ReadAllText("$archivePath.sha256").StartsWith($hash)) 'Invalid ZIP checksum'
        $outputs = [IO.File]::ReadAllText($env:GITHUB_OUTPUT)
        Assert-True ($outputs.Contains("PORTABLE_FILE_NAME=${product}_1.0.0_x64-portable.zip")) 'Missing filename output'
        Assert-True ($outputs.Contains("PORTABLE_SHA256=$hash")) 'Missing digest output'
        Pass "$channel layout, hashes, notices and Actions outputs"
    }
    $previousHash = (Get-FileHash -LiteralPath $archivePath).Hash
    $previousChecksum = (Get-FileHash -LiteralPath "$archivePath.sha256").Hash
    Package
    Assert-True ((Get-FileHash -LiteralPath $archivePath).Hash -eq $previousHash) 'Same inputs produced a different ZIP'
    Pass 'reproducible ZIP within the same PowerShell/.NET runtime'
    foreach ($relative in @('src-tauri/resources/bin/uv-x86_64-pc-windows-msvc.exe', 'src-tauri/resources/bin/jan-llama-worker.exe', 'src-tauri/resources/bin/ggml-base.dll', 'src-tauri/resources/bin/ggml-cpu-x64.dll', "custom target/release/$desktop.exe")) {
        $path = Join-Path $fixture $relative; $saved = [IO.File]::ReadAllBytes($path)
        Remove-Item -LiteralPath $path; Assert-Failure
        [IO.File]::WriteAllBytes($path, @()); Assert-Failure
        [IO.File]::WriteAllBytes($path, $saved)
    }
    Pass 'missing/empty dependencies rejected; previous ZIP/checksum preserved; staging cleaned'
    Write-FixturePE "custom target/release/$desktop.exe" 'wrong architecture' 0xAA64; Assert-Failure
    Write-FixturePE "custom target/release/$desktop.exe" 'desktop nightly'
    Write-FixtureFile 'src-tauri/resources/bin/ggml-cpu-x64.dll' 'not a PE binary'; Assert-Failure
    Write-FixturePE 'src-tauri/resources/bin/ggml-cpu-x64.dll'
    Pass 'ARM64 and non-PE binaries rejected'
    Write-FixtureFile 'src-tauri/tauri.windows.conf.json' '{"bundle":{"resources":["resources/../../private-token.txt"],"externalBin":[]}}'; Assert-Failure
    Write-FixtureFile 'src-tauri/tauri.windows.conf.json' $windowsJson
    Pass 'resource traversal rejected'
    Write-FixturePE 'src-tauri/resources/bin/ggml-cuda.dll'; Assert-Failure
    Remove-Item -LiteralPath "$fixture/src-tauri/resources/bin/ggml-cuda.dll"
    Pass 'incomplete CUDA runtime rejected'
    $env:CARGO_TARGET_DIR = 'custom target'; Package
    Assert-True ((Get-FileHash -LiteralPath $archivePath).Hash -eq $previousHash) 'Relative CARGO_TARGET_DIR did not resolve from repo'
    Pass 'relative target directory supported'
    Remove-Item -LiteralPath "$fixture/src-tauri/resources/bin/ggml-vulkan.dll"
    & "$fixture/scripts/package-windows-portable.ps1" -ReleaseDir "$fixture/custom target/release" -OutputDir "$outputDir/" | Out-Null
    $zip = [IO.Compression.ZipFile]::OpenRead($archivePath)
    try { Assert-True ($null -eq $zip.GetEntry('resources/bin/ggml-vulkan.dll')) 'Stale GPU backend retained' } finally { $zip.Dispose() }
    Pass 'explicit release/output paths and replacement of old backends'
    $runtime = Join-Path $fixture 'staged runtime'
    [IO.Compression.ZipFile]::ExtractToDirectory($archivePath, $runtime)
    Write-FixtureFile 'staged runtime/data/conversations.json' 'private discussions must not ship'
    Write-FixtureFile 'staged runtime/BUILD_INFO.md' 'existing binary provenance'
    & "$fixture/scripts/package-windows-portable.ps1" -RuntimeDir $runtime -OutputDir "$fixture/runtime packages" | Out-Null
    $zip = [IO.Compression.ZipFile]::OpenRead("$fixture/runtime packages/${product}_1.0.0_x64-portable.zip")
    try {
        Assert-True ($null -eq $zip.GetEntry('data/conversations.json')) 'User data was included'
        Assert-True ($null -ne $zip.GetEntry('BUILD_INFO.md')) 'Build provenance was lost'
        Assert-True (((Read-Entry $zip 'portable-manifest.json') | ConvertFrom-Json).inputKind -eq 'staged-runtime') 'Wrong input kind'
    } finally { $zip.Dispose() }
    Pass 'staged runtime preserves provenance and excludes user data'
    Push-Location -LiteralPath $fixture
    try { & './scripts/package-windows-portable.ps1' -RuntimeDir 'staged runtime' -OutputDir 'relative packages' | Out-Null } finally { Pop-Location }
    Assert-True (Test-Path -LiteralPath "$fixture/relative packages/${product}_1.0.0_x64-portable.zip") 'Relative options ignored the PowerShell working directory'
    Pass 'relative options follow PowerShell location instead of process working directory'

    if ($ReportPath) {
        $report = @{ powershell = $PSVersionTable.PSVersion.ToString(); assertions = $checks; scenarios = @($scenarios.ToArray()); app_compiled = $false; scope = 'Synthetic PE fixtures, never launched' }
        [IO.File]::WriteAllText([IO.Path]::GetFullPath($ReportPath), ($report | ConvertTo-Json -Depth 4), (New-Object Text.UTF8Encoding($false)))
    }
    Write-Output "PASS: $checks assertions; $($scenarios.Count) scenarios; no app compilation"
} finally {
    $env:CARGO_TARGET_DIR = $oldTarget; $env:GITHUB_OUTPUT = $oldOutput
    $resolved = [IO.Path]::GetFullPath($testRoot)
    if ((Split-Path $resolved -Parent) -ne $testBase -or (Split-Path $resolved -Leaf) -notmatch '^novera-portable-tests-[a-f0-9]{32}$') { throw 'Invalid test cleanup target' }
    if (Test-Path -LiteralPath $resolved) { Remove-Item -LiteralPath $resolved -Recurse -Force }
}
