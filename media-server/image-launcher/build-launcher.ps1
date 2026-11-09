param([Parameter(Mandatory=$true)][string]$Output)
$ErrorActionPreference='Stop'
$Output=[IO.Path]::GetFullPath($Output)
New-Item -ItemType Directory -Force (Split-Path $Output -Parent) | Out-Null
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$vs=& $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if(!$vs){throw 'MSVC x64 Build Tools are required.'}
$vcvars=Join-Path ($vs | Select-Object -First 1) 'VC/Auxiliary/Build/vcvars64.bat'
$lines=& cmd.exe /d /s /c "`"$vcvars`" >nul && set"
if($LASTEXITCODE -ne 0){throw 'MSVC initialization failed.'}
foreach($line in $lines){if($line -match '^([^=]+)=(.*)$' -and $Matches[1] -notin @('HOME','CODEX_HOME')){[Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process')}}
Push-Location (Split-Path $Output -Parent)
try {
 & cl.exe /nologo /std:c++17 /EHsc /O2 /MT /utf-8 "/I$PSScriptRoot" (Join-Path $PSScriptRoot 'main.cpp') "/Fe:$Output"
 if($LASTEXITCODE -ne 0){throw 'Native launcher build failed.'}
 & cl.exe /nologo /std:c++17 /EHsc /O2 /MT /UNDEBUG "/I$PSScriptRoot" (Join-Path $PSScriptRoot 'test_policy.cpp') '/Fe:test-policy.exe'
 if($LASTEXITCODE -ne 0){throw 'Policy tests build failed.'}
 & './test-policy.exe'
 if($LASTEXITCODE -ne 0){throw 'Policy tests failed.'}
} finally {Pop-Location}
