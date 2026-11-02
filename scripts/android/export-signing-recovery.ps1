# Run interactively to back up the signing identity with a portable password.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Destination)
$ErrorActionPreference='Stop'
. (Join-Path $PSScriptRoot 'environment.ps1')
$android=Get-NoveraAndroidEnvironment
$repo=[IO.Path]::GetFullPath($android.repo).TrimEnd('\','/')
$destinationPath=[IO.Path]::GetFullPath($Destination)
if ($destinationPath.StartsWith($repo+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)) { throw 'La sauvegarde doit rester hors du depot.' }
if (Test-Path -LiteralPath $destinationPath) { throw 'Destination deja presente.' }
$directory=Join-Path $env:LOCALAPPDATA 'Novera/Signing/Android'
$first=Read-Host 'Mot de passe de recuperation (16 caracteres minimum ; a conserver separement)' -AsSecureString
$second=Read-Host 'Confirmer le mot de passe de recuperation' -AsSecureString
function Plain([Security.SecureString]$value) {
    $pointer=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($value)
    try { [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
}
try {
    $password=Plain $first
    if ($password.Length -lt 16 -or $password -cne (Plain $second)) { throw 'Mot de passe trop court ou confirmation differente.' }
    $env:NOVERA_ANDROID_RECOVERY_PASSWORD=$password
    Add-Type -AssemblyName System.Security
    $env:NOVERA_ANDROID_STORE_PASSWORD=[Text.Encoding]::UTF8.GetString([System.Security.Cryptography.ProtectedData]::Unprotect([IO.File]::ReadAllBytes((Join-Path $directory 'password.dpapi')),$null,[System.Security.Cryptography.DataProtectionScope]::CurrentUser))
    & (Join-Path $android.java 'bin/keytool.exe') -importkeystore -noprompt -srckeystore (Join-Path $directory 'novera-android.p12') -srcstoretype PKCS12 -srcstorepass:env NOVERA_ANDROID_STORE_PASSWORD -srcalias novera-android -destkeystore $destinationPath -deststoretype PKCS12 -deststorepass:env NOVERA_ANDROID_RECOVERY_PASSWORD -destkeypass:env NOVERA_ANDROID_RECOVERY_PASSWORD -destalias novera-android 2>&1 | Out-Null
    if ($LASTEXITCODE) { throw 'Export de recuperation en echec.' }
    Write-Output 'Identite exportee chiffree. Conserver le fichier hors machine et le mot de passe dans un emplacement distinct.'
} finally {
    Remove-Item Env:NOVERA_ANDROID_STORE_PASSWORD,Env:NOVERA_ANDROID_RECOVERY_PASSWORD -ErrorAction SilentlyContinue
    $password=$null
    $first.Dispose(); $second.Dispose()
}
