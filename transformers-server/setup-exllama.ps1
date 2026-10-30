param(
    [Parameter(Mandatory = $true)][string]$Python,
    [string]$Environment = "$PSScriptRoot/../.build/exllama/runtime",
    [switch]$TabbyAPI,
    [string]$TabbyDirectory = "$PSScriptRoot/../.build/exllama/tabby-source"
)
$ErrorActionPreference = 'Stop'
$version = & $Python -c 'import sys,platform; print(f"{sys.version_info.major}.{sys.version_info.minor} {platform.system()} {platform.machine()}")'
if ($LASTEXITCODE -ne 0 -or $version.Trim() -ne '3.12 Windows AMD64') {
    throw 'This tested wheel stack requires Windows x64 and Python 3.12. Select that interpreter explicitly; the existing Python 3.15 environment is separate.'
}
if (-not (Test-Path (Join-Path $Environment 'pyvenv.cfg'))) {
    & $Python -m venv $Environment
    if ($LASTEXITCODE -ne 0) { throw 'Cannot create the isolated ExLlama environment.' }
}
$runtime = Join-Path $Environment 'Scripts/python.exe'
& $runtime -c 'import sys; assert sys.version_info[:2] == (3,12), "Select a new Python 3.12 environment directory"'
if ($LASTEXITCODE -ne 0) { throw 'The selected environment has the wrong Python ABI.' }
& $runtime -m ensurepip --upgrade
if ($LASTEXITCODE -ne 0) { throw 'Cannot bootstrap pip in the isolated environment.' }
& $runtime -m pip install 'torch==2.9.0+cu128' --index-url https://download.pytorch.org/whl/cu128
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the pinned CUDA torch build.' }
& $runtime -m pip install -r "$PSScriptRoot/requirements-exllama.txt"
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the official ExLlama wheels.' }
if ($TabbyAPI) {
    $pin = 'b1c225394d0fb45e8d26bddec344318dfd85096e'
    if (-not (Test-Path -LiteralPath $TabbyDirectory)) {
        & git clone --no-checkout https://github.com/theroyallab/tabbyAPI.git $TabbyDirectory
        if ($LASTEXITCODE -ne 0) { throw 'Cannot retrieve official TabbyAPI.' }
    }
    $remote = & git -C $TabbyDirectory remote get-url origin
    $dirty = & git -C $TabbyDirectory status --porcelain
    if ($LASTEXITCODE -ne 0 -or $remote.Trim() -ne 'https://github.com/theroyallab/tabbyAPI.git' -or $dirty) {
        throw 'Use a clean checkout of official TabbyAPI in a separate directory.'
    }
    & git -C $TabbyDirectory fetch --depth 1 origin $pin
    if ($LASTEXITCODE -ne 0) { throw 'Cannot retrieve the pinned TabbyAPI revision.' }
    & git -C $TabbyDirectory checkout --detach $pin
    if ($LASTEXITCODE -ne 0) { throw 'Cannot select the pinned TabbyAPI revision.' }
    & $runtime -m pip install $TabbyDirectory -c "$PSScriptRoot/requirements-exllama.txt"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot install TabbyAPI without changing the ExLlama pins.' }
    Write-Output "TabbyAPI source: $([IO.Path]::GetFullPath($TabbyDirectory))"
}
$probeJson = & $runtime "$PSScriptRoot/server.py" --probe
if ($LASTEXITCODE -ne 0) { throw 'The ExLlama environment probe failed.' }
$probe = $probeJson | ConvertFrom-Json
if (-not $probe.cudaAvailable -or -not $probe.quantization.exl3.available -or -not $probe.quantization.exl2.available) {
    throw "The CUDA ExLlama loaders are not ready: $probeJson"
}
Write-Output $probeJson
Write-Output "Python executable to select in Novera's Safetensors engine: $([IO.Path]::GetFullPath($runtime))"
