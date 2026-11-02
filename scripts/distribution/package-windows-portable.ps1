# Package only an actual portable-feature compilation, never an installed-app ZIP.
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RuntimeDir,
    [Parameter(Mandatory=$true)][string]$BuildInfo,
    [Parameter(Mandatory=$true)][string]$Helper,
    [Parameter(Mandatory=$true)][string]$OutputDir
)
$ErrorActionPreference='Stop'
$repoRoot=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
& python (Join-Path $PSScriptRoot 'package-portable.py') --runtime $RuntimeDir --helper $Helper --build-info $BuildInfo --output $OutputDir
if ($LASTEXITCODE) { throw 'Portable packaging failed; no release is authorized' }
