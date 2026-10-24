# Guard and plan tests only: never compile the application.
$ErrorActionPreference='Stop'
$repo=Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$bat=Join-Path $repo 'scripts/Compiler-Novera.bat'
$exe=Join-Path $repo 'deliverables/Novera-Desktop-local-1.0.0/Novera-Desktop.exe'
$before=if (Test-Path -LiteralPath $exe) { Get-FileHash -LiteralPath $exe } else { $null }
$previous=[Environment]::GetEnvironmentVariable('NOVERA_BUILD_NO_PAUSE')
$env:NOVERA_BUILD_NO_PAUSE='1'
$previousAndroid=[Environment]::GetEnvironmentVariable('NOVERA_BUILD_ANDROID')
$env:NOVERA_BUILD_ANDROID='0'
$count=0
function Assert([bool]$Value,[string]$Message) { if (!$Value) { throw $Message }; $script:count++ }
try {
    foreach ($path in @('scripts/distribution/build-novera-local.ps1') + @(Get-ChildItem -LiteralPath (Join-Path $repo 'scripts/android') -Filter '*.ps1' -File | ForEach-Object FullName)) {
        $tokens=$null;$errors=$null
        $source=if ([IO.Path]::IsPathRooted($path)) {$path} else {Join-Path $repo $path}
        [System.Management.Automation.Language.Parser]::ParseFile($source,[ref]$tokens,[ref]$errors) | Out-Null
        Assert ($errors.Count -eq 0) "PowerShell syntax: $path"
    }
    $variants=@('desktop','setup','msi','portable','arm64','linux','macos','android','ios','web','cli')
    foreach ($id in $variants) {
        $output=& $env:ComSpec /d /c "`"$bat`" /plan $id"
        Assert ($LASTEXITCODE -eq 0) "Plan failed: $id"
        $plan=($output -join "`n") | ConvertFrom-Json
        Assert ($plan.variant -eq $id) "Wrong plan: $id"
        Assert ($plan.enabled -eq ($id -eq 'desktop')) "Wrong default activation: $id"
        Assert (!$plan.compiled -and !$plan.published -and !$plan.automatic_updates -and !$plan.statistics) "Unexpected side effect: $id"
        if ($id -ne 'desktop') {
            $null=& $env:ComSpec /d /c "`"$bat`" $id"
            Assert ($LASTEXITCODE -eq 2) "Disabled variant was not blocked: $id"
        }
    }
    $null=& $env:ComSpec /d /c "`"$bat`" unknown"
    Assert ($LASTEXITCODE -eq 2) 'Unknown variant was not rejected'
    $null=& $env:ComSpec /d /c "`"$bat`" /list"
    Assert ($LASTEXITCODE -eq 0) 'List failed'
    $report=& (Join-Path $repo 'scripts/android/check-android.ps1') -Json | ConvertFrom-Json
    Assert (!$report.ready) 'Android unexpectedly ready before source review'
    Assert (!$report.compiled -and !$report.installed) 'Android check must remain read-only'
    Assert ($report.blockers -contains 'review-mobileDependencies') 'Unfinished dependency review must block APK builds'
    Assert (@($report.checks | Where-Object {$_.id -eq 'mobile-feature-selection' -and $_.ok}).Count -eq 1) 'APK builder must exclude desktop defaults'
    $null=& (Join-Path $repo 'scripts/android/build-apk.ps1')
    Assert ($LASTEXITCODE -eq 2) 'APK entry point was not disabled'
    if ($before) {
        $after=Get-FileHash -LiteralPath $before.Path
        Assert ($after.Hash -eq $before.Hash) 'Existing desktop executable changed'
    }
    Write-Output "PASS: $count assertions; plans, disabled targets, Android blockers and unchanged desktop. No compilation."
} finally {
    [Environment]::SetEnvironmentVariable('NOVERA_BUILD_NO_PAUSE',$previous,'Process')
    [Environment]::SetEnvironmentVariable('NOVERA_BUILD_ANDROID',$previousAndroid,'Process')
}
