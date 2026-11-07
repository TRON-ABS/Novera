$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot '../environment.ps1')
$original=$env:LOCALAPPDATA
$fixture=Join-Path ([IO.Path]::GetTempPath()) ('novera-signing-path-'+[Guid]::NewGuid().ToString('N'))
New-Item -ItemType Directory -Path $fixture | Out-Null
try {
    $env:LOCALAPPDATA=$fixture
    $stable=Join-Path $fixture 'Novera-Signing/Android'
    $legacy=Join-Path $fixture 'Novera/Signing/Android'
    if ((Get-NoveraAndroidSigningDirectory) -ne $stable) {throw 'New identities must stay outside the installation directory.'}
    New-Item -ItemType Directory -Path $stable,$legacy | Out-Null
    [IO.File]::WriteAllText((Join-Path $legacy 'novera-android.p12'),'synthetic fixture')
    if ((Get-NoveraAndroidSigningDirectory) -ne $legacy) {throw 'An empty stable directory must not hide an existing legacy identity.'}
    [IO.File]::WriteAllText((Join-Path $stable 'password.dpapi'),'synthetic fixture')
    if ((Get-NoveraAndroidSigningDirectory) -ne $stable) {throw 'An incomplete stable identity must remain visible to initialization guards.'}
    Write-Output '3 signing directory preservation checks passed.'
} finally {
    $env:LOCALAPPDATA=$original
    $resolved=[IO.Path]::GetFullPath($fixture)
    $tempRoot=[IO.Path]::GetFullPath([IO.Path]::GetTempPath())
    if (!$resolved.StartsWith($tempRoot,[StringComparison]::OrdinalIgnoreCase) -or !(Split-Path $resolved -Leaf).StartsWith('novera-signing-path-')) {throw 'Refusing cleanup outside the owned fixture.'}
    Remove-Item -LiteralPath $resolved -Recurse -Force
}
