# Build-time configuration only. Runtime statistics and error consent stay off.
function Set-NoveraAndroidTelemetry {
    param([switch]$Enabled, [string]$ConfigurationPath)
    $env:NOVERA_ANALYTICS_HOST=''
    $env:NOVERA_ANALYTICS_PROJECT_KEY=''
    $env:NOVERA_MONITORING_BUILD='false'
    if (!$Enabled) { return }
    . (Join-Path $PSScriptRoot '../distribution/read-novera-telemetry.ps1')
    $telemetry = Read-NoveraTelemetry $ConfigurationPath
    $env:NOVERA_ANALYTICS_HOST=$telemetry.Host
    $env:NOVERA_ANALYTICS_PROJECT_KEY=$telemetry.Key
    $env:NOVERA_MONITORING_BUILD='true'
    Write-Output "Telemetry destination configured: $($telemetry.Host). User consent remains required."
}
