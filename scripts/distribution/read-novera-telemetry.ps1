# Reads only the two public telemetry settings; never executes dotenv content.
function Read-NoveraTelemetry([string]$Path) {
    if (!(Test-Path -LiteralPath $Path -PathType Leaf)) { throw 'Telemetry configuration file missing.' }
    $values = @{}
    foreach ($line in [IO.File]::ReadAllLines($Path)) {
        if ($line -match '^\s*(NOVERA_ANALYTICS_HOST|NOVERA_ANALYTICS_PROJECT_KEY)\s*=\s*(.*?)\s*$') {
            $name = $Matches[1]
            $value = $Matches[2]
            if ($values.ContainsKey($name)) { throw 'Duplicate telemetry setting.' }
            if ($value.Length -ge 2 -and (($value.StartsWith('"') -and $value.EndsWith('"')) -or ($value.StartsWith("'") -and $value.EndsWith("'")))) { $value = $value.Substring(1, $value.Length - 2) }
            $values[$name] = $value
        }
    }
    $hostValue = [string]$values['NOVERA_ANALYTICS_HOST']
    $keyValue = [string]$values['NOVERA_ANALYTICS_PROJECT_KEY']
    $uri = $null
    if (![Uri]::TryCreate($hostValue, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or $uri.AbsolutePath -ne '/' -or $uri.Host -match '(^|\.)jan\.ai$') { throw 'Telemetry requires an HTTPS origin without credentials, path or query.' }
    if ($keyValue -notmatch '^phc_[A-Za-z0-9]{20,}$') { throw 'Telemetry requires a public PostHog project token.' }
    return [pscustomobject]@{Host=$uri.GetLeftPart([UriPartial]::Authority); Key=$keyValue}
}
