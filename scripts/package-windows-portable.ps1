# Compatibility entry point; implementation belongs to Distribution.
[CmdletBinding(DefaultParameterSetName = 'Build')]
param(
    [Parameter(ParameterSetName = 'Build')][string]$ReleaseDir,
    [Parameter(Mandatory = $true, ParameterSetName = 'Runtime')][string]$RuntimeDir,
    [string]$OutputDir
)
& (Join-Path $PSScriptRoot 'distribution/package-windows-portable.ps1') @PSBoundParameters
