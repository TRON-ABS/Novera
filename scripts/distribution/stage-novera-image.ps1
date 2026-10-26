$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
. (Join-Path $PSScriptRoot 'prepare-novera-image.ps1')
Prepare-NoveraImageEngine $repoRoot
