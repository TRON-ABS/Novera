# Create once, outside the repository. Never print or persist a plaintext password.
[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
Set-NoveraAndroidEnvironment $android
$directory=Join-Path $env:LOCALAPPDATA 'Novera/Signing/Android'
$store=Join-Path $directory 'novera-android.p12'
$passwordFile=Join-Path $directory 'password.dpapi'
if ((Test-Path -LiteralPath $store) -or (Test-Path -LiteralPath $passwordFile)) { throw 'Identite Android deja presente : la reutiliser, ne jamais la remplacer.' }
New-Item -ItemType Directory -Force -Path $directory | Out-Null
$account=[System.Security.Principal.WindowsIdentity]::GetCurrent().User
$acl=New-Object System.Security.AccessControl.DirectorySecurity
$acl.SetAccessRuleProtection($true,$false)
$acl.SetOwner($account)
$acl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($account,'FullControl','ContainerInherit,ObjectInherit','None','Allow')))
Set-Acl -LiteralPath $directory -AclObject $acl
$bytes=New-Object byte[] 48
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$password=[Convert]::ToBase64String($bytes)
$env:NOVERA_ANDROID_STORE_PASSWORD=$password
try {
    & (Join-Path $android.java 'bin/keytool.exe') -genkeypair -keystore $store -storetype PKCS12 -storepass:env NOVERA_ANDROID_STORE_PASSWORD -keypass:env NOVERA_ANDROID_STORE_PASSWORD -alias novera-android -keyalg RSA -keysize 4096 -sigalg SHA256withRSA -validity 10000 -dname 'CN=Novera Android, OU=Distribution, O=TRON-ABS' 2>&1 | Out-Null
    if ($LASTEXITCODE) { throw 'Creation de la cle Android en echec.' }
    Add-Type -AssemblyName System.Security
    $encrypted=[System.Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($password),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser)
    [IO.File]::WriteAllBytes($passwordFile,$encrypted)
    $certificate=Join-Path $directory 'novera-android.cer'
    & (Join-Path $android.java 'bin/keytool.exe') -exportcert -keystore $store -storetype PKCS12 -storepass:env NOVERA_ANDROID_STORE_PASSWORD -alias novera-android -file $certificate 2>&1 | Out-Null
    if ($LASTEXITCODE) { throw 'Export du certificat public en echec.' }
    $fingerprint=(Get-FileHash -LiteralPath $certificate -Algorithm SHA256).Hash.ToLowerInvariant()
    [pscustomobject]@{created=$true;keystore=$store;certificateSha256=$fingerprint;alias='novera-android';passwordProtection='Windows DPAPI CurrentUser';offMachineRecoveryBackedUp=$false} | ConvertTo-Json
} finally { Remove-Item Env:NOVERA_ANDROID_STORE_PASSWORD -ErrorAction SilentlyContinue; $password=$null }
