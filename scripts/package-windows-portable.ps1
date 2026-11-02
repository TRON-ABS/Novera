# Compatibility entry point; implementation belongs to Distribution.
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$RuntimeDir,
    [Parameter(Mandatory=$true)][string]$BuildInfo,
    [Parameter(Mandatory=$true)][string]$Helper,
    [Parameter(Mandatory=$true)][string]$OutputDir
)
& (Join-Path $PSScriptRoot 'distribution/package-windows-portable.ps1') @PSBoundParameters
