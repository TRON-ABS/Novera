# Compatibility entry point for the read-only Android preparation report.
[CmdletBinding()]
param([switch]$Json,[switch]$RequireReady)
& (Join-Path $PSScriptRoot 'check-readiness.ps1') @PSBoundParameters