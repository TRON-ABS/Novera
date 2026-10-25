# Build the renamed worker before Tauri resolves bundle resources.
# RunStep is shared with the launcher so each failure keeps its own log.
function Get-NoveraEngineSourceKey([string]$Repo) {
    $plugin = 'src-tauri/plugins/tauri-plugin-llamacpp'
    $files = @()
    foreach ($dir in @("$plugin/src", "$plugin/shim", 'src-tauri/utils/src', 'src-tauri/plugins/tauri-plugin-hardware/src')) {
        $path = Join-Path $Repo $dir
        if (Test-Path -LiteralPath $path) { $files += Get-ChildItem -LiteralPath $path -Recurse -File }
    }
    foreach ($name in @("$plugin/build.rs", "$plugin/Cargo.toml", "$plugin/Cargo.lock", 'rust-toolchain.toml',
        'src-tauri/utils/Cargo.toml', 'src-tauri/plugins/tauri-plugin-hardware/Cargo.toml',
        'src-tauri/build-utils/stage-engine.sh', 'scripts/distribution/prepare-novera-engine.ps1')) {
        $path = Join-Path $Repo $name
        if (Test-Path -LiteralPath $path -PathType Leaf) { $files += Get-Item -LiteralPath $path }
    }
    $entries = @($files | Sort-Object FullName | ForEach-Object {
        $_.FullName.Substring($Repo.Length).Replace('\','/') + ':' + (Get-FileHash -LiteralPath $_.FullName).Hash
    })
    $sha = [Security.Cryptography.SHA256]::Create()
    try { return [BitConverter]::ToString($sha.ComputeHash([Text.Encoding]::UTF8.GetBytes(($entries -join "`n")))).Replace('-','') }
    finally { $sha.Dispose() }
}

function Get-NoveraEngineFeatures([string]$Resources, [string]$Variant) {
    $features = @('engine')
    if ($Variant) {
        $tokens = $Variant.Split('-')
        foreach ($token in $tokens) {
            switch ($token) {
                'cpu' { }
                'cuda12' { $features += 'engine-cuda' }
                'cuda13' { $features += 'engine-cuda' }
                'vulkan' { $features += 'engine-vulkan' }
                'hip' { $features += 'engine-hip' }
                'rocm' { $features += 'engine-hip' }
                default { throw "Unsupported Windows engine variant: $Variant" }
            }
        }
        if ($tokens -contains 'cuda12' -and $tokens -contains 'cuda13') { throw 'Choose one CUDA major.' }
    } else {
        # Preserve the prepared runtime's backends instead of silently replacing
        # an existing GPU build with a CPU-only worker.
        if (Test-Path -LiteralPath (Join-Path $Resources 'ggml-cuda.dll')) { $features += 'engine-cuda' }
        if (Test-Path -LiteralPath (Join-Path $Resources 'ggml-vulkan.dll')) { $features += 'engine-vulkan' }
        if (Test-Path -LiteralPath (Join-Path $Resources 'ggml-hip.dll')) { $features += 'engine-hip' }
        if ($features.Count -eq 1 -and !(Test-Path -LiteralPath (Join-Path $Resources 'ggml.dll'))) {
            $features += 'engine-vulkan'
        }
    }
    return (($features | Select-Object -Unique) -join ',')
}

function Prepare-NoveraEngine([string]$Repo, [string]$Cargo, [scriptblock]$RunStep) {
    $resources = Join-Path $Repo 'src-tauri/resources/bin'
    $worker = Join-Path $resources 'novera-llama-worker.exe'
    $features = Get-NoveraEngineFeatures $resources $env:JAN_ENGINE_VARIANT
    $sourceKey = Get-NoveraEngineSourceKey $Repo
    $recordPath = Join-Path $resources '.novera-engine-build.json'
    $buildOptions = @('JAN_ENGINE_VARIANT','JAN_ENGINE_CUDA_ARCHS','JAN_ENGINE_HIP_TARGETS',
        'JAN_LLAMA_CPP_DIR','JAN_LLAMA_PREBUILT_DIR','CUDA_PATH','CUDACXX')
    # Reuse only our own successfully staged build, with matching sources and
    # unchanged binaries. This lets an Explorer double-click reuse its prepared
    # engine without needing a native-toolchain environment every time.
    if (Test-Path -LiteralPath $recordPath -PathType Leaf) {
        try {
            $record = Get-Content -LiteralPath $recordPath -Raw | ConvertFrom-Json
            $reuse = $record.source_key -eq $sourceKey -and $record.features -eq $features
            foreach ($option in $buildOptions) {
                $requested = [Environment]::GetEnvironmentVariable($option)
                $recorded = $record.options.$option
                if ($requested -and $recorded -and $option -in @('CUDA_PATH','JAN_LLAMA_CPP_DIR','JAN_LLAMA_PREBUILT_DIR')) {
                    $requested = [IO.Path]::GetFullPath($requested).TrimEnd('\','/')
                    $recorded = [IO.Path]::GetFullPath($recorded).TrimEnd('\','/')
                }
                if ($requested -and $requested -ne $recorded) { $reuse = $false }
            }
            $names = @(Get-ChildItem -LiteralPath $resources -File | Where-Object { $_.Name -eq 'novera-llama-worker.exe' -or $_.Extension -eq '.dll' } | ForEach-Object Name)
            if (Compare-Object $names @($record.files | ForEach-Object name)) { $reuse = $false }
            foreach ($entry in $record.files) {
                if ($entry.name -notmatch '^(novera-llama-worker\.exe|[A-Za-z0-9_.-]+\.dll)$') { $reuse = $false; break }
                $path = Join-Path $resources $entry.name
                if (!(Test-Path -LiteralPath $path -PathType Leaf) -or (Get-FileHash -LiteralPath $path).Hash -ne $entry.hash) { $reuse = $false; break }
            }
            if ($reuse -and @($record.files | Where-Object name -eq 'novera-llama-worker.exe').Count -eq 1) {
                Write-Output 'Moteur : sources et ressources verifiees, reutilisation du build local.'
                & $RunStep 'engine-version' $worker @('--version-json')
                return
            }
        } catch { Write-Output 'Moteur : cache non utilisable, reconstruction.' }
    }
    $bash = Get-Command bash.exe -ErrorAction SilentlyContinue | Select-Object -First 1
    $bashPath = if ($bash) { $bash.Source } else { $null }
    if (!$bashPath) {
        foreach ($candidate in @("$env:ProgramFiles/Git/bin/bash.exe", 'C:/msys64/usr/bin/bash.exe')) {
            if (Test-Path -LiteralPath $candidate -PathType Leaf) { $bashPath = $candidate; break }
        }
    }
    if (!$bashPath) { throw 'Engine preparation needs Bash (Git for Windows or MSYS2) on PATH.' }
    $bashTools = Split-Path $bashPath -Parent
    $gitTools = Join-Path (Split-Path $bashTools -Parent) 'usr/bin'
    if (Test-Path -LiteralPath (Join-Path $gitTools 'od.exe')) { $bashTools = $gitTools }
    # Bash needs GNU find rather than Windows find.exe. Scope that ordering to
    # the shell steps, restoring MSVC's linker precedence before Cargo runs.
    $bashStep = {
        param($Name, $Arguments)
        $previousPath = $env:PATH
        try {
            $env:PATH = "$bashTools;" + $env:PATH
            & $RunStep $Name $bashPath $Arguments
        } finally { $env:PATH = $previousPath }
    }
    Write-Output "Moteur : novera-llama-worker ($features)"
    # Do not let the source-fetch helper remove a partially prepared directory.
    $vendor = Join-Path $Repo 'src-tauri/plugins/tauri-plugin-llamacpp/vendor/llama.cpp'
    if (!$env:JAN_LLAMA_CPP_DIR -and (Test-Path -LiteralPath $vendor) -and
        !(Test-Path -LiteralPath (Join-Path $vendor 'CMakeLists.txt'))) {
        throw 'Incomplete llama.cpp source directory; prepare JAN_LLAMA_CPP_DIR before building.'
    }
    & $bashStep 'engine-source' @('src-tauri/build-utils/fetch-engine-source.sh')
    $variant = if ($env:JAN_ENGINE_VARIANT) { $env:JAN_ENGINE_VARIANT } else { 'prepared' }
    & $bashStep 'engine-toolchain' @('src-tauri/build-utils/check-engine-toolchain.sh',$variant,$features)
    & $RunStep 'engine' $Cargo @('build','--offline','--locked','--release','--manifest-path',
        'src-tauri/plugins/tauri-plugin-llamacpp/Cargo.toml','--features',$features,'--bin','novera-llama-worker')
    & $bashStep 'engine-resources' @('src-tauri/build-utils/stage-engine.sh','release')
    if (!(Test-Path -LiteralPath $worker -PathType Leaf) -or !(Get-Item -LiteralPath $worker).Length) {
        throw 'Engine preparation did not produce novera-llama-worker.exe.'
    }
    & $RunStep 'engine-version' $worker @('--version-json')
    $files = @(Get-ChildItem -LiteralPath $resources -File | Where-Object { $_.Name -eq 'novera-llama-worker.exe' -or $_.Extension -eq '.dll' } |
        Sort-Object Name | ForEach-Object { [ordered]@{name=$_.Name; hash=(Get-FileHash -LiteralPath $_.FullName).Hash} })
    $options = [ordered]@{}
    foreach ($option in $buildOptions) { $options[$option] = [Environment]::GetEnvironmentVariable($option) }
    [ordered]@{source_key=$sourceKey; features=$features; files=$files; options=$options} | ConvertTo-Json -Depth 4 |
        Set-Content -LiteralPath $recordPath -Encoding UTF8
}
