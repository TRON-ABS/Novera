param(
    [Parameter(Mandatory=$true)][string]$Config,
    [Parameter(Mandatory=$true)][string]$WebOrigin,
    [string]$ConnectionFile
)
$ErrorActionPreference='Stop'
if (!$ConnectionFile) { $ConnectionFile=Join-Path $env:LOCALAPPDATA 'Novera/native-image-bridge/connection.json' }
python (Join-Path $PSScriptRoot 'server.py') --config $Config --origin $WebOrigin --connection-file $ConnectionFile
if ($LASTEXITCODE -ne 0) { throw 'Native image bridge stopped with an error.' }
