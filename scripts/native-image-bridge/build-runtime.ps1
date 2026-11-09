param(
    [Parameter(Mandatory=$true)][string]$NativeBuild,
    [Parameter(Mandatory=$true)][string]$Source,
    [string]$Output
)
$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if (!$Output) { $Output=Join-Path $repoRoot '.build/native-image-bridge/runtime' }
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$vs=& $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if (!$vs) { throw 'MSVC x64 Build Tools are required.' }
$vcvars=Join-Path ($vs | Select-Object -First 1) 'VC/Auxiliary/Build/vcvars64.bat'
$lines=& cmd.exe /d /s /c "`"$vcvars`" >nul && set"
if ($LASTEXITCODE -ne 0) { throw 'MSVC initialization failed.' }
foreach ($line in $lines) {
    if ($line -match '^([^=]+)=(.*)$' -and $Matches[1] -notin @('HOME','CODEX_HOME')) {
        [Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process')
    }
}
$ninja=Join-Path ($vs | Select-Object -First 1) 'Common7/IDE/CommonExtensions/Microsoft/CMake/Ninja/ninja.exe'
python (Join-Path $PSScriptRoot 'build_runtime.py') --source $Source --build $NativeBuild --output $Output --ninja $ninja
if ($LASTEXITCODE -ne 0) { throw 'Native bridge runtime build failed; inspect its build.log.' }
