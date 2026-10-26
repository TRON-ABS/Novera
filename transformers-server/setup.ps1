param(
    [string]$Python = "$env:LOCALAPPDATA/Python/pythoncore-3.15-64/python.exe",
    [string]$Environment = "$PSScriptRoot/../.build/safetensors-python315",
    [ValidateSet('cpu', 'cu126', 'cu130', 'cu132')]
    [string]$Backend = 'cpu'
)
$ErrorActionPreference = 'Stop'
$version = & $Python -c 'import sys; print(".".join(map(str, sys.version_info[:3])))'
if ($LASTEXITCODE -ne 0 -or $version.Trim() -ne '3.15.1') { throw 'Python 3.15.1 is required for this setup.' }
& $Python -m venv $Environment
if ($LASTEXITCODE -ne 0) { throw 'Cannot create the Python environment.' }
$runtime = Join-Path $Environment 'Scripts/python.exe'
& $runtime -m pip install --upgrade "torch==2.14.1+$Backend" --index-url "https://download.pytorch.org/whl/$Backend"
if ($LASTEXITCODE -ne 0) { throw "Cannot install PyTorch $Backend." }
& $runtime -m pip install -r "$PSScriptRoot/requirements.txt"
if ($LASTEXITCODE -ne 0) { throw 'Cannot install the Safetensors dependencies.' }
Write-Output "Python executable to select in Novera: $([IO.Path]::GetFullPath($runtime))"
