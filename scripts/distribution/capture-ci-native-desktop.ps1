# Failure diagnostics only, on the disposable test VM; no user desktop is read.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][int]$OwnedProcessId,[Parameter(Mandatory=$true)][string]$OutputFile)
$ErrorActionPreference='Stop'
if ($env:GITHUB_ACTIONS -ne 'true' -or $env:RUNNER_ENVIRONMENT -ne 'github-hosted') { throw 'Disposable GitHub runner required' }
$runnerPath=[IO.Path]::GetFullPath($env:RUNNER_TEMP).TrimEnd('\')+'\'
$exePath=[IO.Path]::GetFullPath($Executable)
$outPath=[IO.Path]::GetFullPath($OutputFile)
$validationPath=[IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE '.build/validation')).TrimEnd('\')+'\'
if (!$exePath.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase) -or !$outPath.StartsWith($validationPath,[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($exePath) -ne 'Novera-Desktop.exe' -or [IO.Path]::GetExtension($outPath) -ne '.png') { throw 'Owned CI app and validation screenshot required' }
$owned=Get-CimInstance Win32_Process -Filter "ProcessId=$OwnedProcessId" | Where-Object { $_.ExecutablePath -eq $exePath }
$result=[ordered]@{ownedAppRunning=[bool]$owned;processId=$OwnedProcessId}
if ($owned) {
    $process=Get-Process -Id $OwnedProcessId
    $result.windowTitle=$process.MainWindowTitle
}
try {
    Add-Type -AssemblyName System.Windows.Forms,System.Drawing
    $bounds=[Windows.Forms.SystemInformation]::VirtualScreen
    $bitmap=[Drawing.Bitmap]::new($bounds.Width,$bounds.Height)
    $graphics=[Drawing.Graphics]::FromImage($bitmap)
    try {
        $graphics.CopyFromScreen($bounds.Left,$bounds.Top,0,0,$bounds.Size)
        $bitmap.Save($outPath,[Drawing.Imaging.ImageFormat]::Png)
        $result.desktopScreenshotSaved=$true
    } finally { $graphics.Dispose();$bitmap.Dispose() }
} catch { $result.desktopScreenshotSaved=$false;$result.captureError=$_.Exception.Message }
$events=Get-WinEvent -FilterHashtable @{LogName='Application';StartTime=(Get-Date).AddMinutes(-5)} -MaxEvents 50 -ErrorAction SilentlyContinue | Where-Object { $_.Message -match 'Novera-Desktop' } | Select-Object -First 3 -ExpandProperty Message
if ($events) { $result.nativeErrorEvents=$events }
$result | ConvertTo-Json -Depth 4 -Compress
