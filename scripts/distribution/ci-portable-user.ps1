# A real standard account is needed: WebView2 cannot run under restricted tokens.
[CmdletBinding()]
param([ValidateSet('Create','Remove')][string]$Action='Create')
$ErrorActionPreference='Stop'
if ($env:GITHUB_ACTIONS -ne 'true' -or $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or $env:RUNNER_ARCH -ne 'X64') { throw 'Disposable x64 GitHub runner required' }
$accountFile=Join-Path $env:RUNNER_TEMP 'novera-portable-ui-account.json'
$accountName='nv-ui-'+$env:GITHUB_RUN_ID.Substring([Math]::Max(0,$env:GITHUB_RUN_ID.Length-8))
if ($Action -eq 'Remove') {
    $existing=Get-LocalUser -Name $accountName -ErrorAction SilentlyContinue
    if ($existing) {
        if ($existing.Description -ne ('Novera disposable UI test '+$env:GITHUB_RUN_ID)) { throw 'Refusing to remove an unrelated account' }
        Remove-LocalUser -Name $accountName
    }
    if (Test-Path -LiteralPath $accountFile) { Remove-Item -LiteralPath $accountFile }
    exit
}
if (Test-Path -LiteralPath $accountFile) { throw 'Disposable account receipt already exists' }
$randomBytes=New-Object byte[] 32
$rng=[Security.Cryptography.RandomNumberGenerator]::Create()
try { $rng.GetBytes($randomBytes) } finally { $rng.Dispose() }
$accountPassword=[Convert]::ToBase64String($randomBytes)+'aA1!'
$securePassword=ConvertTo-SecureString -String $accountPassword -AsPlainText -Force
$account=New-LocalUser -Name $accountName -Password $securePassword -Description ('Novera disposable UI test '+$env:GITHUB_RUN_ID) -AccountNeverExpires
$usersGroup=Get-LocalGroup -SID 'S-1-5-32-545'
Add-LocalGroupMember -Group $usersGroup -Member $account
[IO.File]::WriteAllText($accountFile,(@{name=$accountName;password=$accountPassword;sid=$account.SID.Value}|ConvertTo-Json -Compress))
# Only the CI controller and SYSTEM may read the short-lived login credential.
$acl=Get-Acl -LiteralPath $accountFile
$acl.SetAccessRuleProtection($true,$false)
foreach ($sid in @([Security.Principal.WindowsIdentity]::GetCurrent().User.Value,'S-1-5-18')) {
    $acl.AddAccessRule([Security.AccessControl.FileSystemAccessRule]::new([Security.Principal.SecurityIdentifier]::new($sid),'FullControl','Allow'))
}
Set-Acl -LiteralPath $accountFile -AclObject $acl
Write-Output 'Created disposable standard UI account; credential remains private to the CI controller.'
