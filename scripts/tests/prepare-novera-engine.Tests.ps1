$ErrorActionPreference = 'Stop'
Set-StrictMode -Version 2
. (Join-Path $PSScriptRoot '../distribution/prepare-novera-engine.ps1')
$root = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$fixtures = Join-Path $root ('.build/engine-preparation-tests-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixtures | Out-Null
$count = 0
function Assert([bool]$Value, [string]$Message) { if (!$Value) { throw $Message }; $script:count++ }
function Assert-Throws([scriptblock]$Action, [string]$Message) {
    $threw = $false
    try { & $Action | Out-Null } catch { $threw = $true }
    Assert $threw $Message
}
$cpu = Join-Path $fixtures 'cpu'
New-Item -ItemType Directory -Path $cpu | Out-Null
Assert ((Get-NoveraEngineFeatures $cpu '') -eq 'engine,engine-vulkan') 'Fresh builds must keep the Vulkan default'
Set-Content (Join-Path $cpu 'ggml.dll') 'fixture'
Assert ((Get-NoveraEngineFeatures $cpu '') -eq 'engine') 'Prepared CPU runtime must remain CPU'
Set-Content (Join-Path $cpu 'ggml-cuda.dll') 'fixture'
Assert ((Get-NoveraEngineFeatures $cpu '') -eq 'engine,engine-cuda') 'CUDA runtime must retain CUDA'
Set-Content (Join-Path $cpu 'ggml-vulkan.dll') 'fixture'
Assert ((Get-NoveraEngineFeatures $cpu '') -eq 'engine,engine-cuda,engine-vulkan') 'Retain the Vulkan fallback'
Assert ((Get-NoveraEngineFeatures $cpu 'cpu') -eq 'engine') 'Explicit CPU variant'
Assert ((Get-NoveraEngineFeatures $cpu 'cuda13-vulkan') -eq 'engine,engine-cuda,engine-vulkan') 'Explicit GPU variant'
Assert-Throws { Get-NoveraEngineFeatures $cpu 'unknown' } 'Reject unknown variants'
Assert-Throws { Get-NoveraEngineFeatures $cpu 'cuda12-cuda13' } 'Reject ambiguous CUDA major'
$script:fixtureRepo = Join-Path $fixtures 'repo'
$script:worker = Join-Path $fixtureRepo 'src-tauri/resources/bin/novera-llama-worker.exe'
New-Item -ItemType Directory -Path (Split-Path $worker -Parent) -Force | Out-Null
$oldVariant = $env:JAN_ENGINE_VARIANT
$oldCudaPath = $env:CUDA_PATH
$env:JAN_ENGINE_VARIANT = 'cpu'
$env:CUDA_PATH = Join-Path $fixtures 'cuda'
try {
    $script:steps = @()
    Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' {
        param($Name, $Exe, $Arguments)
        $script:steps += [pscustomobject]@{Name=$Name; Exe=$Exe; Arguments=$Arguments}
        if ($Name -eq 'engine-resources') { Set-Content -LiteralPath $script:worker 'fixture-worker' }
    } | Out-Null
    Assert (($steps.Name -join ',') -eq 'engine-source,engine-toolchain,engine,engine-resources,engine-version') 'Build then stage then verify'
    Assert (($steps[2].Arguments -join ' ') -like '*--offline --locked*--features engine --bin novera-llama-worker') 'Build the real renamed binary'
    Assert ($steps[4].Exe -eq $worker -and $steps[4].Arguments[0] -eq '--version-json') 'Verify the staged worker'
    $script:steps = @()
    Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' { param($Name,$Exe,$Arguments) $script:steps += $Name } | Out-Null
    Assert (($steps -join ',') -eq 'engine-version') 'Reuse only a verified unchanged worker'
    $recordPath = Join-Path (Split-Path $worker -Parent) '.novera-engine-build.json'
    $record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
    $record.options.CUDA_PATH = $record.options.CUDA_PATH.Replace('\','/') + '/'
    $record | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $recordPath -Encoding UTF8
    $script:steps = @()
    Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' { param($Name,$Exe,$Arguments) $script:steps += $Name } | Out-Null
    Assert (($steps -join ',') -eq 'engine-version') 'Equivalent Windows path spelling must reuse the build'
    $source = Join-Path $fixtureRepo 'src-tauri/plugins/tauri-plugin-llamacpp/src/engine.rs'
    New-Item -ItemType Directory -Path (Split-Path $source -Parent) -Force | Out-Null
    Set-Content -LiteralPath $source '// changed worker source'
    $script:steps = @()
    Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' { param($Name,$Exe,$Arguments) $script:steps += $Name } | Out-Null
    Assert ($steps -contains 'engine') 'Changed worker sources must rebuild'
    Set-Content -LiteralPath $worker 'modified-worker'
    $script:steps = @()
    Assert-Throws {
        Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' {
            param($Name, $Exe, $Arguments)
            $script:steps += $Name
            if ($Name -eq 'engine') { throw 'simulated compiler failure' }
        }
    } 'Compiler failure must propagate'
    Assert (($steps -join ',') -eq 'engine-source,engine-toolchain,engine') 'Never stage after build failure'
    Set-Content -LiteralPath $worker '' -NoNewline
    Assert-Throws { Prepare-NoveraEngine $fixtureRepo 'cargo-fixture.exe' { param($Name,$Exe,$Arguments) } } 'Reject an empty worker'
    $launcher = Get-Content (Join-Path $root 'scripts/distribution/build-novera-local.ps1') -Raw
    $prepare = $launcher.IndexOf('Prepare-NoveraEngine $repo')
    Assert ($prepare -gt 0 -and $prepare -lt $launcher.IndexOf("Run-Step 'interface'")) 'Prepare before the interface build'
    Assert ($prepare -lt $launcher.IndexOf("Run-Step 'setup'")) 'Prepare before the Tauri bundler'
    Write-Output "PASS: $count engine preparation assertions; no real compilation."
} finally { $env:JAN_ENGINE_VARIANT = $oldVariant; $env:CUDA_PATH = $oldCudaPath }
