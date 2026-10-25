$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot '../distribution/read-novera-telemetry.ps1')
$fixtureRoot = Join-Path ([IO.Path]::GetTempPath()) ('novera-telemetry-config-' + [Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixtureRoot | Out-Null
$fixture = Join-Path $fixtureRoot 'settings.env'
$marker = Join-Path $fixtureRoot 'must-not-exist.txt'
$publicFixtureKey = 'phc_' + ('x' * 24)
$assertions = 0
function Assert([bool]$Condition, [string]$Message) {
    if (!$Condition) { throw $Message }
    $script:assertions++
}
function Reject([string]$Contents, [string]$Message) {
    [IO.File]::WriteAllText($fixture, $Contents)
    $rejected = $false
    try { $null = Read-NoveraTelemetry $fixture } catch { $rejected = $true }
    Assert $rejected $Message
}
try {
    [IO.File]::WriteAllText($fixture, "NOVERA_ANALYTICS_HOST='https://eu.i.posthog.com'`nNOVERA_ANALYTICS_PROJECT_KEY=`"$publicFixtureKey`"")
    $result = Read-NoveraTelemetry $fixture
    Assert ($result.Host -eq 'https://eu.i.posthog.com') 'Public HTTPS destination must be preserved'
    Assert ($result.Key -eq $publicFixtureKey) 'Public project key must be preserved'
    $rejected = $false
    try { $null = Read-NoveraTelemetry (Join-Path $fixtureRoot 'missing.env') } catch { $rejected = $true }
    Assert $rejected 'Missing configuration must be rejected'
    foreach ($hostValue in @('http://eu.i.posthog.com', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?query=1', 'https://example.com#fragment', 'https://jan.ai', 'https://sub.jan.ai')) {
        Reject "NOVERA_ANALYTICS_HOST=$hostValue`nNOVERA_ANALYTICS_PROJECT_KEY=$publicFixtureKey" "Unsafe telemetry origin: $hostValue"
    }
    Reject "NOVERA_ANALYTICS_HOST=https://eu.i.posthog.com`nNOVERA_ANALYTICS_PROJECT_KEY=phx_private_fixture" 'Private tokens must be rejected'
    Reject "NOVERA_ANALYTICS_HOST=https://eu.i.posthog.com`nNOVERA_ANALYTICS_PROJECT_KEY=$publicFixtureKey`nNOVERA_ANALYTICS_PROJECT_KEY=$publicFixtureKey" 'Duplicate keys must be rejected'
    Reject "NOVERA_ANALYTICS_HOST=https://eu.i.posthog.com`nNOVERA_ANALYTICS_HOST=https://example.com`nNOVERA_ANALYTICS_PROJECT_KEY=$publicFixtureKey" 'Duplicate destinations must be rejected'
    $inertCommand = '$(Set-Content -LiteralPath ''' + $marker + ''' -Value executed)'
    [IO.File]::WriteAllText($fixture, "IGNORED=$inertCommand`nNOVERA_ANALYTICS_HOST=https://eu.i.posthog.com`nNOVERA_ANALYTICS_PROJECT_KEY=$publicFixtureKey")
    $null = Read-NoveraTelemetry $fixture
    Assert (!(Test-Path -LiteralPath $marker)) 'Unrelated dotenv content must never execute'
    Reject "NOVERA_ANALYTICS_HOST=https://eu.i.posthog.com`nNOVERA_ANALYTICS_PROJECT_KEY=$inertCommand" 'Commands inside telemetry values must be rejected'
    Assert (!(Test-Path -LiteralPath $marker)) 'Telemetry values must never execute'
    "PASS: $assertions telemetry configuration assertions; no network calls or app compilation"
} finally {
    foreach ($path in @($fixture, $marker)) {
        if (Test-Path -LiteralPath $path -PathType Leaf) { Remove-Item -LiteralPath $path -Force }
    }
    if (Test-Path -LiteralPath $fixtureRoot -PathType Container) { Remove-Item -LiteralPath $fixtureRoot }
}
