$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot '../telemetry.ps1')
$fixture=Join-Path ([IO.Path]::GetTempPath()) ('novera-android-telemetry-'+[Guid]::NewGuid().ToString('N')+'.env')
$saved=@{}
foreach ($name in @('NOVERA_ANALYTICS_HOST','NOVERA_ANALYTICS_PROJECT_KEY','NOVERA_MONITORING_BUILD')) {
    $saved[$name]=[Environment]::GetEnvironmentVariable($name,'Process')
}
$passed=0
try {
    $publicToken='phc_'+('x'*30)
    $env:NOVERA_ANALYTICS_HOST='https://inherited.example'
    $env:NOVERA_ANALYTICS_PROJECT_KEY='inherited'
    Set-NoveraAndroidTelemetry -ConfigurationPath $fixture
    if ($env:NOVERA_ANALYTICS_HOST -or $env:NOVERA_ANALYTICS_PROJECT_KEY -or $env:NOVERA_MONITORING_BUILD -ne 'false') { throw 'Default build inherited telemetry.' }
    $passed++
    [IO.File]::WriteAllText($fixture,"NOVERA_ANALYTICS_HOST=https://stats.example.com`nNOVERA_ANALYTICS_PROJECT_KEY=$publicToken`n")
    Set-NoveraAndroidTelemetry -Enabled -ConfigurationPath $fixture | Out-Null
    if ($env:NOVERA_ANALYTICS_HOST -ne 'https://stats.example.com' -or $env:NOVERA_ANALYTICS_PROJECT_KEY -ne $publicToken -or $env:NOVERA_MONITORING_BUILD -ne 'true') { throw 'Explicit build configuration lost.' }
    $passed++
    foreach ($content in @(
        "NOVERA_ANALYTICS_HOST=http://stats.example.com`nNOVERA_ANALYTICS_PROJECT_KEY=$publicToken",
        "NOVERA_ANALYTICS_HOST=https://api.jan.ai`nNOVERA_ANALYTICS_PROJECT_KEY=$publicToken",
        "NOVERA_ANALYTICS_HOST=https://stats.example.com/path`nNOVERA_ANALYTICS_PROJECT_KEY=$publicToken",
        "NOVERA_ANALYTICS_HOST=https://stats.example.com`nNOVERA_ANALYTICS_PROJECT_KEY=phx_private",
        'NOVERA_ANALYTICS_HOST=https://stats.example.com'
    )) {
        [IO.File]::WriteAllText($fixture,$content)
        $rejected=$false
        try { Set-NoveraAndroidTelemetry -Enabled -ConfigurationPath $fixture | Out-Null } catch { $rejected=$true }
        if (!$rejected -or $env:NOVERA_ANALYTICS_HOST -or $env:NOVERA_ANALYTICS_PROJECT_KEY -or $env:NOVERA_MONITORING_BUILD -ne 'false') { throw 'Invalid configuration not rejected safely.' }
        $passed++
    }
    Write-Output "$passed Android telemetry configuration checks passed; no network requests."
} finally {
    if (Test-Path -LiteralPath $fixture) { Remove-Item -LiteralPath $fixture }
    foreach ($name in $saved.Keys) { [Environment]::SetEnvironmentVariable($name,$saved[$name],'Process') }
}
