# Launch only the owned ARM64 CI app at medium integrity; no machine policy changes.
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$Executable,[Parameter(Mandatory=$true)][string]$Receipt,[Parameter(Mandatory=$true)][string]$LogFile)
$ErrorActionPreference='Stop'
if ($env:GITHUB_ACTIONS -ne 'true' -or $env:RUNNER_ENVIRONMENT -ne 'github-hosted' -or $env:RUNNER_ARCH -ne 'ARM64') { throw 'Disposable ARM64 GitHub runner required' }
$runnerPath=[IO.Path]::GetFullPath($env:RUNNER_TEMP).TrimEnd('\')+'\'
$executablePath=(Resolve-Path -LiteralPath $Executable).Path
$receiptPath=[IO.Path]::GetFullPath($Receipt)
$logPath=[IO.Path]::GetFullPath($LogFile)
$validationPath=[IO.Path]::GetFullPath((Join-Path $env:GITHUB_WORKSPACE '.build/validation')).TrimEnd('\')+'\'
if (!$executablePath.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase) -or [IO.Path]::GetFileName($executablePath) -ne 'Novera-Desktop.exe' -or !$receiptPath.StartsWith($runnerPath,[StringComparison]::OrdinalIgnoreCase) -or !$logPath.StartsWith($validationPath,[StringComparison]::OrdinalIgnoreCase)) { throw 'Owned CI installation, scratch receipt and validation log required' }
# These are owned throwaway CI folders. Grant only the current user's SID the
# access a standard-user install/profile has; never broaden a machine policy.
$currentSid=[Security.Principal.WindowsIdentity]::GetCurrent().User.Value
& icacls.exe (Split-Path -LiteralPath $executablePath -Parent) /grant ('*'+$currentSid+':(OI)(CI)RX') /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot grant the current test user access to its owned installation' }
& icacls.exe (Split-Path -LiteralPath $receiptPath -Parent) /grant ('*'+$currentSid+':(OI)(CI)M') /T /Q | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot grant the current test user access to its owned scratch folder' }
Add-Type -TypeDefinition @'
using System;
using System.Collections;
using System.ComponentModel;
using System.Runtime.InteropServices;
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
  public sealed class Result { public uint ProcessId; public int IntegrityRid; public string Mode; }
  [DllImport("kernel32.dll")] static extern IntPtr GetCurrentProcess();
  [DllImport("kernel32.dll")] static extern bool CloseHandle(IntPtr handle);
  [DllImport("kernel32.dll")] static extern IntPtr LocalFree(IntPtr handle);
  [DllImport("kernel32.dll")] static extern bool TerminateProcess(IntPtr process,uint code);
  [DllImport("advapi32.dll",SetLastError=true)] static extern bool OpenProcessToken(IntPtr process,uint access,out IntPtr token);
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
  static void SetMedium(IntPtr token) {
    IntPtr sid; Require(ConvertStringSidToSid("S-1-16-8192",out sid));
    int label=Marshal.SizeOf(typeof(SidAttributes)); int size=label+(int)GetLengthSid(sid); IntPtr data=Marshal.AllocHGlobal(size);
    try { IntPtr copy=IntPtr.Add(data,label); Require(CopySid(GetLengthSid(sid),copy,sid)); Marshal.StructureToPtr(new SidAttributes { Sid=copy,Attributes=0x20 },data,false); Require(SetTokenInformation(token,25,data,size),"Set restricted token to medium integrity"); }
    finally { LocalFree(sid); Marshal.FreeHGlobal(data); }
  }
  public static Result Start(string executable,string log) {
    IntPtr source=IntPtr.Zero,target=IntPtr.Zero,environment=IntPtr.Zero,output=IntPtr.Zero,input=IntPtr.Zero;
    ProcessInfo process=new ProcessInfo(); string mode="current-medium";
    try {
      Require(OpenProcessToken(GetCurrentProcess(),0x008b,out source),"Open current process token with adjust-default access");
      if (Integrity(source)==8192) Require(DuplicateTokenEx(source,0xf01ff,IntPtr.Zero,2,1,out target),"Duplicate medium token");
      else {
        int needed; IntPtr linked=Marshal.AllocHGlobal(IntPtr.Size);
        try { if (GetTokenInformation(source,19,linked,IntPtr.Size,out needed)) target=Marshal.ReadIntPtr(linked); }
        finally { Marshal.FreeHGlobal(linked); }
        if (target!=IntPtr.Zero && Integrity(target)==8192) mode="linked-medium";
        else {
          if(target!=IntPtr.Zero) { CloseHandle(target); target=IntPtr.Zero; }
          IntPtr admins; Require(ConvertStringSidToSid("S-1-5-32-544",out admins));
          try { Require(CreateRestrictedToken(source,1,1,new SidAttributes[] { new SidAttributes { Sid=admins,Attributes=0 } },0,IntPtr.Zero,0,IntPtr.Zero,out target),"Create restricted user token"); }
          finally { LocalFree(admins); }
          SetMedium(target); mode="restricted-medium";
        }
      }
      if(Integrity(target)!=8192) throw new InvalidOperationException("Medium-integrity user token required");
      var values=new System.Collections.Generic.List<string>(); foreach(DictionaryEntry item in Environment.GetEnvironmentVariables()) values.Add(item.Key+"="+item.Value);
      values.Sort(StringComparer.OrdinalIgnoreCase); environment=Marshal.StringToHGlobalUni(string.Join("\0",values)+"\0\0");
      var security=new SecurityAttributes { Length=Marshal.SizeOf(typeof(SecurityAttributes)),Inherit=true };
      output=CreateFile(log,0x4,3,ref security,4,0x80,IntPtr.Zero); Require(output!=new IntPtr(-1),"Open owned UI log");
      input=CreateFile("NUL",0x80000000,3,ref security,3,0x80,IntPtr.Zero); Require(input!=new IntPtr(-1),"Open null input");
      var startup=new StartupInfo { Size=(uint)Marshal.SizeOf(typeof(StartupInfo)),Flags=0x100,Input=input,Output=output,Error=output };
      bool created=mode=="restricted-medium"
        ? CreateProcessAsUserW(target,executable,new StringBuilder("\""+executable+"\""),IntPtr.Zero,IntPtr.Zero,true,0x400,environment,System.IO.Path.GetDirectoryName(executable),ref startup,out process)
        : CreateProcessWithTokenW(target,0,executable,new StringBuilder("\""+executable+"\""),0x400,environment,System.IO.Path.GetDirectoryName(executable),ref startup,out process);
      Require(created,"Create medium-integrity app process ("+mode+")");
      IntPtr child; Require(OpenProcessToken(process.Process,8,out child),"Verify child process token"); int level;
      try { level=Integrity(child); } finally { CloseHandle(child); }
      if(level!=8192) { TerminateProcess(process.Process,1); throw new InvalidOperationException("Child did not start at medium integrity"); }
      return new Result { ProcessId=process.ProcessId,IntegrityRid=level,Mode=mode };
    } finally {
      foreach(IntPtr handle in new IntPtr[] {process.Thread,process.Process,input,output,target,source}) if(handle!=IntPtr.Zero && handle!=new IntPtr(-1)) CloseHandle(handle);
      if(environment!=IntPtr.Zero) Marshal.FreeHGlobal(environment);
    }
  }
}
'@
$launched=[StandardUiProcess]::Start($executablePath,$logPath)
$result=[pscustomobject]@{pid=$launched.ProcessId;integrityRid=$launched.IntegrityRid;mode=$launched.Mode}
[IO.File]::WriteAllText($receiptPath,($result|ConvertTo-Json -Compress),[Text.UTF8Encoding]::new($false))
