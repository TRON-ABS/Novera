param([Parameter(Mandatory=$true)][string]$BuildId)
$ErrorActionPreference = 'Stop'
if ($BuildId -notmatch '^[A-Za-z0-9._-]{1,96}$') { throw 'Invalid build identifier' }
$repo = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
. (Join-Path $repo 'scripts/distribution/read-novera-telemetry.ps1')
$destination = Read-NoveraTelemetry (Join-Path $repo 'web-app/.env.local')
if ($destination.Host -ne 'https://eu.i.posthog.com') { throw 'Expected the configured PostHog EU ingestion origin' }
$id = [Guid]::NewGuid().ToString()
$payload = @{
    api_key=$destination.Key;event='$exception';distinct_id=$id
    properties=@{
        '$exception_list'=@(@{type='NoveraMonitoringTest';value='Synthetic maintenance pipeline test';mechanism=@{type='handled';handled=$true;synthetic=$true};stacktrace=@{type='raw';frames=@()}})
        '$exception_fingerprint'='novera-monitoring-smoke-v2'
        '$issue_name'='Novera monitoring: pipeline test'
        '$exception_level'='info';'$lib'='novera';'$lib_version'='2';'$session_id'=$id
        '$process_person_profile'=$false;'$geoip_disable'=$true
        app_version=(Get-Content (Join-Path $repo 'web-app/package.json') -Raw | ConvertFrom-Json).version
        build_id=$BuildId;build_environment='test';operation='smoke_test';error_code='monitoring_test';task='unknown';engine='unknown';test_only=$true;occurrence_count=1
    }
} | ConvertTo-Json -Depth 8 -Compress
$null = Invoke-RestMethod -Method Post -Uri ($destination.Host + '/i/v0/e/') -ContentType 'application/json' -Body $payload -TimeoutSec 20
Write-Output "Synthetic monitoring test accepted by the ingestion endpoint. Build: $BuildId. Event session: $id. Verify it in project 319433; HTTP acceptance alone does not certify ingestion."
