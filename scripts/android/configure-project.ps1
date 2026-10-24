# Reapply the versioned Android configuration to generated files only.
[CmdletBinding()]
param([string]$ProjectPath)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
$arguments=@((Join-Path $PSScriptRoot 'configure-project.mjs'))
if($ProjectPath){$arguments+=@('--project',$ProjectPath)}
& node @arguments
if($LASTEXITCODE -ne 0){throw 'Configuration Android Novera en echec.'}
