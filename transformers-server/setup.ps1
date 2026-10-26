param(
    [string]$Python = "$env:LOCALAPPDATA/Python/pythoncore-3.15-64/python.exe",
    [string]$Environment = "$PSScriptRoot/../.build/safetensors-python315",
    [ValidateSet('cpu', 'cu126', 'cu130', 'cu132')]
    [string]$Backend = 'cpu',
    [switch]$Media,
    [switch]$NativeNvfp4
)
$ErrorActionPreference = 'Stop'
if ($NativeNvfp4 -and $Backend -eq 'cpu') { throw 'Native NVFP4 requires a CUDA backend and a compatible Blackwell GPU.' }
$version = & $Python -c 'import sys; print(".".join(map(str, sys.version_info[:3])))'
if ($LASTEXITCODE -ne 0 -or $version.Trim() -ne '3.15.1') { throw 'Python 3.15.1 is required for this setup.' }
& $Python -m venv $Environment
if ($LASTEXITCODE -ne 0) { throw 'Cannot create the Python environment.' }
$runtime = Join-Path $Environment 'Scripts/python.exe'
& $runtime -m pip install --upgrade "torch==2.14.1+$Backend" --index-url "https://download.pytorch.org/whl/$Backend"
if ($LASTEXITCODE -ne 0) { throw "Cannot install PyTorch $Backend." }
& $runtime -m pip install -r "$PSScriptRoot/requirements.txt"
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the Safetensors dependencies.' }
if ($Media -or $NativeNvfp4) {
    & $runtime -m pip install -r "$PSScriptRoot/../media-server/requirements.txt"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot install the Diffusers image/video dependencies.' }
}
if ($NativeNvfp4) {
    & $runtime -m pip install -r "$PSScriptRoot/../media-server/requirements-nvfp4.txt"
    if ($LASTEXITCODE -ne 0) { throw 'Cannot install native NVFP4 dependencies.' }
}
Write-Output "Python executable to select in Novera: $([IO.Path]::GetFullPath($runtime))"
