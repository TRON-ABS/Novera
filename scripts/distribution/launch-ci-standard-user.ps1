# Launch only the owned native CI app at medium integrity; no machine policy changes.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][string]$Receipt,[Parameter(Mandatory=$true)][string]$LogFile)
$ErrorActionPreference='Stop'
$portable = $env:NOVERA_VALIDATE_PORTABLE -eq 'true' -and $env:RUNNER_ARCH -eq 'X64'
if ($env:GITHUB_ACTIONS -ne 'true' -or $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or ($env:RUNNER_ARCH -ne 'ARM64' -and !$portable)) { throw 'Disposable ARM64 GitHub runner required (or explicit native x64 portable validation)' }
$runnerPath=[IO.Path]::GetFullPath($env:RUNNER_TEMP).TrimEnd('\')+'\'
$executablePath=(Resolve-Path -LiteralPath $Executable).Path
$receiptPath=[IO.Path]::GetFullPath($Receipt)
$logPath=[IO.Path]::GetFullPath($LogFile)
$validationPath=[IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE '.build/validation')).TrimEnd('\')+'\'
if (!$executablePath.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($executablePath) -ne 'Novera-Desktop.exe' -or !$receiptPath.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase) -or !$logPath.StartsWith($validationPath,[StringComparison]::OrdinalIgnoreCase)) { throw 'Owned CI installation, scratch receipt and validation log required' }
if ($portable) {
    $programPath=[IO.Path]::GetDirectoryName($executablePath)
    if ([IO.Path]::GetFileName($programPath) -ne 'Program' -or !(Test-Path -LiteralPath (Join-Path ([IO.Path]::GetDirectoryName($programPath)) 'novera-portable.json') -PathType Leaf)) { throw 'Marked portable Program directory required' }
    $portableRoot=[IO.Path]::GetDirectoryName($programPath)
    $portableBase=[IO.Path]::GetDirectoryName($portableRoot)
    if ([IO.Path]::GetFileName($portableBase) -notlike 'novera-portable-validation-*' -or !$portableBase.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase)) { throw 'Owned portable validation base required' }
}
# These are owned throwaway CI folders. Grant only the current user's SID the
# access a standard-user install/profile has; never broaden a machine policy.
$currentSid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
$testAccount=$null
if ($portable) {
    $testAccount=Get-Content -LiteralPath (Join-Path $env:RUNNER_TEMP 'novera-portable-ui-account.json') -Raw | ConvertFrom-Json
    if ($testAccount.name -notlike 'nv-ui-*' -or $testAccount.sid -notmatch '^S-1-5-21-') { throw 'Owned disposable test account required' }
    $currentSid=$testAccount.sid
}
if ($portable) {
    # The privileged fixture extractor owns these files. A real user extracting
    # their portable folder already has these same read/traverse rights.
    foreach ($ownedDirectory in @($portableBase,$portableRoot)) {
        & icacls.exe $ownedDirectory /grant ('*'+$currentSid+':RX') /Q | Out-Null
        if ($LASTEXITCODE -ne 0) { throw 'Cannot prepare current-user access to its owned portable root' }
    }
    & icacls.exe (Join-Path $portableRoot 'novera-portable.json') /grant ('*'+$currentSid+':R') /Q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Cannot read the owned portable marker as the test user' }
    $portableData=Join-Path $portableRoot 'Data'
    if (!(Test-Path -LiteralPath $portableData -PathType Container) -or ((Get-Item -LiteralPath $portableData).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Plain owned portable Data folder required' }
    & icacls.exe $portableData /grant ('*'+$currentSid+':(OI)(CI)M') /T /Q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw 'Cannot prepare current-user access to its owned portable data' }
}
Write-Output 'CI UI launcher: prepare current-user access to owned installation'
& icacls.exe ([IO.Path]::GetDirectoryName($executablePath)) /grant ('*'+$currentSid+':(OI)(CI)RX') /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot grant the current test user access to its owned installation' }
Write-Output 'CI UI launcher: prepare current-user access to owned scratch folder'
& icacls.exe ([IO.Path]::GetDirectoryName($receiptPath)) /grant ('*'+$currentSid+':(OI)(CI)M') /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot grant the current test user access to its owned scratch folder' }
Write-Output 'CI UI launcher: compile native launcher'
Add-Type -TypeDefinition @'
using System;
using System.Collections;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Security.AccessControl;
using System.Security.Principal;
using System.Text;

public static class StandardUiProcess {
  [StructLayout(LayoutKind.Sequential)] struct SidAttributes { public IntPtr Sid; public uint Attributes; }
  [StructLayout(LayoutKind.Sequential)] struct SecurityAttributes { public int Length; public IntPtr Descriptor; [MarshalAs(UnmanagedType.Bool)] public bool Inherit; }
  [StructLayout(LayoutKind.Sequential, CharSet=CharSet.Unicode)] struct StartupInfo {
    public uint Size; public string Reserved; public string Desktop; public string Title;
    public uint X,Y,XSize,YSize,XCount,YCount,Fill,Flags; public ushort Show,ReservedSize;
    public IntPtr Reserved2,Input,Output,Error;
  }
  [StructLayout(LayoutKind.Sequential)] struct ProcessInfo { public IntPtr Process,Thread; public uint ProcessId,ThreadId; }
  public sealed class Result { public uint ProcessId; public int IntegrityRid; public bool Elevated; public string Mode; }
  [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr handle);
  [DllImport("kernel32.dll")] static extern bool TerminateProcess(IntPtr process,uint code);
  [DllImport("kernel32.dll")] static extern uint GetCurrentThreadId();
  [DllImport("user32.dll")] static extern IntPtr GetProcessWindowStation();
  [DllImport("user32.dll")] static extern IntPtr GetThreadDesktop(uint thread);
  [DllImport("user32.dll",SetLastError=true)] static extern bool GetUserObjectSecurity(IntPtr handle,ref uint information,byte[] descriptor,uint size,out uint needed);
  [DllImport("user32.dll",SetLastError=true)] static extern bool SetUserObjectSecurity(IntPtr handle,ref uint information,byte[] descriptor);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool OpenProcessToken(IntPtr process,uint access,out IntPtr token);
  [DllImport("advapi32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool LogonUser(string user,string domain,string password,uint logonType,uint provider,out IntPtr token);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool GetTokenInformation(IntPtr token,int type,IntPtr data,int size,out int needed);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool SetTokenInformation(IntPtr token,int type,IntPtr data,int size);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool DuplicateTokenEx(IntPtr token,uint access,IntPtr attributes,int level,int type,out IntPtr result);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool CreateRestrictedToken(IntPtr token,uint flags,uint disabledCount,[In] SidAttributes[] disabled,uint deletedCount,IntPtr deleted,uint restrictedCount,IntPtr restricted,out IntPtr result);
  [DllImport("advapi32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool ConvertStringSidToSid(string value,out IntPtr sid);
  [DllImport("advapi32.dll")] static extern uint GetLengthSid(IntPtr sid);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool CopySid(uint size,IntPtr destination,IntPtr source);
  [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthorityCount(IntPtr sid);
  [DllImport("advapi32.dll")] static extern IntPtr GetSidSubAuthority(IntPtr sid,uint index);
  [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr CreateFile(string file,uint access,uint share,ref SecurityAttributes attributes,uint disposition,uint flags,IntPtr template);
  [DllImport("advapi32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcessWithTokenW(IntPtr token,uint logonFlags,string application,StringBuilder command,uint flags,IntPtr environment,string directory,ref StartupInfo startup,out ProcessInfo info);
  [DllImport("advapi32.dll",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool CreateProcessAsUserW(IntPtr token,string application,StringBuilder command,IntPtr processAttributes,IntPtr threadAttributes,bool inherit,uint flags,IntPtr environment,string directory,ref StartupInfo startup,out ProcessInfo info);
  static void Require(bool ok,string operation="Native operation") { if (!ok) { int error=Marshal.GetLastWin32Error(); throw new Win32Exception(error,operation+": "+new Win32Exception(error).Message); } }
  static int Integrity(IntPtr token) {
    int size; GetTokenInformation(token,25,IntPtr.Zero,0,out size);
    IntPtr data=Marshal.AllocHGlobal(size);
    try { Require(GetTokenInformation(token,25,data,size,out size),"Inspect token integrity"); IntPtr sid=Marshal.ReadIntPtr(data); byte count=Marshal.ReadByte(GetSidSubAuthorityCount(sid)); return Marshal.ReadInt32(GetSidSubAuthority(sid,(uint)(count-1))); }
    finally { Marshal.FreeHGlobal(data); }
  }
  static bool Elevated(IntPtr token) {
    int needed; IntPtr data=Marshal.AllocHGlobal(4);
    try { Require(GetTokenInformation(token,20,data,4,out needed),"Inspect process elevation"); return Marshal.ReadInt32(data)!=0; }
    finally { Marshal.FreeHGlobal(data); }
  }
  static void SetMedium(IntPtr token) {
    IntPtr sid; Require(ConvertStringSidToSid("S-1-16-8192",out sid));
    int label=Marshal.SizeOf(typeof(SidAttributes)); int size=label+(int)GetLengthSid(sid); IntPtr data=Marshal.AllocHGlobal(size);
    try { IntPtr copy=IntPtr.Add(data,label); Require(CopySid(GetLengthSid(sid),copy,sid)); Marshal.StructureToPtr(new SidAttributes { Sid=copy,Attributes=0x20 },data,false); Require(SetTokenInformation(token,25,data,size),"Set restricted token to medium integrity"); }
    finally { LocalFree(sid); Marshal.FreeHGlobal(data); }
  }
  static void GrantOwnedCiDesktop(IntPtr token) {
    // Cross-account GUI launch requires access to this disposable VM's desktop.
    // Add only the temporary test SID, preserving all existing desktop entries.
    var sid=new WindowsIdentity(token).User;
    foreach(var handle in new IntPtr[] {GetProcessWindowStation(),GetThreadDesktop(GetCurrentThreadId())}) {
      if(handle==IntPtr.Zero) throw new InvalidOperationException("CI interactive desktop unavailable");
      uint info=4,size; GetUserObjectSecurity(handle,ref info,null,0,out size);
      var bytes=new byte[size]; Require(GetUserObjectSecurity(handle,ref info,bytes,size,out size),"Read CI desktop access");
      var descriptor=new RawSecurityDescriptor(bytes,0);
      if(descriptor.DiscretionaryAcl==null) throw new InvalidOperationException("Explicit CI desktop DACL required");
      descriptor.DiscretionaryAcl.InsertAce(descriptor.DiscretionaryAcl.Count,new CommonAce(AceFlags.None,AceQualifier.AccessAllowed,0x10000000,sid,false,null));
      bytes=new byte[descriptor.BinaryLength]; descriptor.GetBinaryForm(bytes,0);
      Require(SetUserObjectSecurity(handle,ref info,bytes),"Grant only the disposable test SID desktop access");
    }
  }
  public static Result Start(string executable,string log,string user,string password) {
    IntPtr source=IntPtr.Zero,target=IntPtr.Zero,environment=IntPtr.Zero,output=IntPtr.Zero,input=IntPtr.Zero;
    ProcessInfo process=new ProcessInfo(); string mode="current-medium";
    try {
      Require(OpenProcessToken(GetCurrentProcess(),0x008b,out source),"Open current process token with adjust-default access");
      if (!string.IsNullOrEmpty(user)) { Require(LogonUser(user,".",password,2,0,out target),"Log on disposable standard UI user"); mode="standard-account"; }
      else if (Integrity(source)==8192) Require(DuplicateTokenEx(source,0xf01ff,IntPtr.Zero,2,1,out target),"Duplicate medium token");
      else {
        int needed; IntPtr linked=Marshal.AllocHGlobal(IntPtr.Size);
        try { if (GetTokenInformation(source,19,linked,IntPtr.Size,out needed)) target=Marshal.ReadIntPtr(linked); }
        finally { Marshal.FreeHGlobal(linked); }
        if (target!=IntPtr.Zero && Integrity(target)==8192) mode="linked-medium";
        else {
          if(target!=IntPtr.Zero) { CloseHandle(target); target=IntPtr.Zero; }
          IntPtr admins; Require(ConvertStringSidToSid("S-1-5-32-544",out admins));
          try { Require(CreateRestrictedToken(source,0x1|0x4,1,new SidAttributes[] { new SidAttributes { Sid=admins,Attributes=0 } },0,IntPtr.Zero,0,IntPtr.Zero,out target),"Create restricted limited-user token"); }
          finally { LocalFree(admins); }
          SetMedium(target); mode="restricted-medium";
        }
      }
      if(Integrity(target)!=8192) throw new InvalidOperationException("Medium-integrity user token required");
      if(mode=="standard-account") GrantOwnedCiDesktop(target);
      Console.Error.WriteLine("CI UI launcher: token mode={0}, integrity={1}, elevated={2}",mode,Integrity(target),Elevated(target));
      var values=new System.Collections.Generic.List<string>(); foreach(DictionaryEntry item in Environment.GetEnvironmentVariables()) values.Add(item.Key+"="+item.Value);
      values.Sort(StringComparer.OrdinalIgnoreCase); environment=Marshal.StringToHGlobalUni(string.Join("\0",values)+"\0\0");
      var security=new SecurityAttributes { Length=Marshal.SizeOf(typeof(SecurityAttributes)),Inherit=true };
      output=CreateFile(log,0x4,3,ref security,4,0x80,IntPtr.Zero); Require(output!=new IntPtr(-1),"Open owned UI log");
      input=CreateFile("NUL",0x80000000,3,ref security,3,0x80,IntPtr.Zero); Require(input!=new IntPtr(-1),"Open null input");
      var startup=new StartupInfo { Size=(uint)Marshal.SizeOf(typeof(StartupInfo)),Flags=0x100,Input=input,Output=output,Error=output };
      // WithToken copies handle values without inheriting these controller handles.
      // Let Windows initialize standard handles for the cross-account GUI child.
      if(mode=="standard-account") startup=new StartupInfo { Size=(uint)Marshal.SizeOf(typeof(StartupInfo)),Desktop=@"winsta0\default" };
      Console.Error.WriteLine("CI UI launcher: create app process");
      bool created=mode=="restricted-medium"
        ? CreateProcessAsUserW(target,executable,new StringBuilder("\""+executable+"\""),IntPtr.Zero,IntPtr.Zero,true,0x400,environment,System.IO.Path.GetDirectoryName(executable),ref startup,out process)
        : CreateProcessWithTokenW(target,mode=="standard-account" ? 1u : 0u,executable,new StringBuilder("\""+executable+"\""),0x400,environment,System.IO.Path.GetDirectoryName(executable),ref startup,out process);
      Require(created,"Create medium-integrity app process ("+mode+")");
      IntPtr child; Require(OpenProcessToken(process.Process,8,out child),"Verify child process token"); int level; bool elevated;
      try { level=Integrity(child); elevated=Elevated(child); } finally { CloseHandle(child); }
      if(level!=8192 || elevated) { TerminateProcess(process.Process,1); throw new InvalidOperationException("Child did not start as a non-elevated medium-integrity user"); }
      return new Result { ProcessId=process.ProcessId,IntegrityRid=level,Elevated=elevated,Mode=mode };
    } finally {
      foreach(IntPtr handle in new IntPtr[] {process.Thread,process.Process,input,output,target,source}) if(handle!=IntPtr.Zero && handle!=new IntPtr(-1)) CloseHandle(handle);
      if(environment!=IntPtr.Zero) Marshal.FreeHGlobal(environment);
    }
  }
}
'@
Write-Output 'CI UI launcher: start verified app with reduced privileges'
$launched=[StandardUiProcess]::Start($executablePath,$logPath,$testAccount.name,$testAccount.password)
$result=[pscustomobject]@{pid=$launched.ProcessId;integrityRid=$launched.IntegrityRid;elevated=$launched.Elevated;mode=$launched.Mode}
[IO.File]::WriteAllText($receiptPath,($result|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false))
Write-Output 'CI UI launcher: verified process receipt written'
