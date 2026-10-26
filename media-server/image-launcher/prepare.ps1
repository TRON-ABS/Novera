param(
 [string]$ToolkitRoot='C:/Program Files/NVIDIA GPU Computing Toolkit/CUDA/v13.4',
 [string]$BuildRoot,
 [string]$Output,
 [string]$VulkanArchive,
 [string]$CpuArchive,
 [ValidateRange(1,8)][int]$Jobs=4,
 [switch]$SkipEngineBuild
)
$ErrorActionPreference='Stop'
$repoRoot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
if(!$BuildRoot){$BuildRoot=Join-Path $repoRoot '.build/novera-image-cuda134'}
if(!$Output){$Output=Join-Path $BuildRoot 'runtime'}
$BuildRoot=[IO.Path]::GetFullPath($BuildRoot);$Output=[IO.Path]::GetFullPath($Output)
foreach($path in @($BuildRoot,$Output)) {
 if(!$path.StartsWith($repoRoot+[IO.Path]::DirectorySeparatorChar,[StringComparison]::OrdinalIgnoreCase)){throw 'Build and output must stay inside this workspace.'}
}
$pin=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'toolchain.json') -Raw | ConvertFrom-Json
$version=Get-Content -LiteralPath (Join-Path $ToolkitRoot 'version.json') -Raw | ConvertFrom-Json
if($version.cuda.version -ne $pin.cudaToolkit){throw "CUDA Toolkit $($pin.cudaToolkit) is required."}
$nvcc=Join-Path $ToolkitRoot 'bin/nvcc.exe'
if((& $nvcc --version | Out-String) -notmatch [regex]::Escape($pin.nvcc)){throw 'Unexpected NVCC version.'}
New-Item -ItemType Directory -Force $BuildRoot | Out-Null
if((Test-Path -LiteralPath $Output) -and (Get-ChildItem -LiteralPath $Output -Force) -and !(Test-Path -LiteralPath (Join-Path $Output '.novera-image-runtime'))){throw 'Refusing to overwrite an unmarked output directory.'}
New-Item -ItemType Directory -Force $Output | Out-Null
Set-Content -LiteralPath (Join-Path $Output '.novera-image-runtime') -Value $pin.revision
$source=Join-Path $BuildRoot 'source'
if(!(Test-Path -LiteralPath (Join-Path $source 'CMakeLists.txt'))) {
 & git clone --filter=blob:none --no-checkout $pin.source $source
 if($LASTEXITCODE -ne 0){throw 'Source clone failed'}
 & git -C $source checkout --detach $pin.revision
 if($LASTEXITCODE -ne 0){throw 'Pinned source checkout failed'}
 & git -C $source submodule update --init --recursive --depth 1
 if($LASTEXITCODE -ne 0){throw 'Pinned submodule checkout failed'}
}
if((& git -C $source rev-parse HEAD) -ne $pin.revision){throw 'Unexpected source revision'}
if((& git -C (Join-Path $source 'ggml') rev-parse HEAD) -ne $pin.ggmlRevision){throw 'Unexpected GGML revision'}
if(& git -C $source status --porcelain --untracked-files=no){throw 'Pinned source has tracked local changes'}
$vswhere=Join-Path ${env:ProgramFiles(x86)} 'Microsoft Visual Studio/Installer/vswhere.exe'
$vs=& $vswhere -latest -products '*' -requires Microsoft.VisualStudio.Component.VC.Tools.x86.x64 -property installationPath
if(!$vs){throw 'MSVC x64 Build Tools are required'}
$vcvars=Join-Path ($vs | Select-Object -First 1) 'VC/Auxiliary/Build/vcvars64.bat'
$lines=& cmd.exe /d /s /c "`"$vcvars`" >nul && set"
if($LASTEXITCODE -ne 0){throw 'MSVC environment initialization failed'}
foreach($line in $lines){if($line -match '^([^=]+)=(.*)$' -and $Matches[1] -notin @('HOME','CODEX_HOME')){[Environment]::SetEnvironmentVariable($Matches[1],$Matches[2],'Process')}}
$env:CUDA_PATH=$ToolkitRoot
$env:PATH=(Join-Path $ToolkitRoot 'bin')+';'+$env:PATH
$cmake=Join-Path $vs 'Common7/IDE/CommonExtensions/Microsoft/CMake/CMake/bin/cmake.exe'
$ninja=Join-Path $vs 'Common7/IDE/CommonExtensions/Microsoft/CMake/Ninja/ninja.exe'
$build=Join-Path $BuildRoot 'build-cuda'
if(!$SkipEngineBuild){
 & $cmake -S $source -B $build -G Ninja "-DCMAKE_MAKE_PROGRAM=$ninja" -DCMAKE_BUILD_TYPE=Release -DCMAKE_C_COMPILER=cl -DCMAKE_CXX_COMPILER=cl "-DCMAKE_CUDA_COMPILER=$nvcc" "-DCMAKE_CUDA_ARCHITECTURES=$($pin.cudaArchitectures)" -DSD_CUDA=ON -DGGML_NATIVE=OFF -DGGML_BACKEND_DL=ON -DSD_BUILD_SHARED_LIBS=ON -DSD_BUILD_SHARED_GGML_LIB=ON -DSD_WEBM=OFF
 if($LASTEXITCODE -ne 0){throw 'CUDA engine configuration failed'}
 & $cmake --build $build --target sd-cli --parallel $Jobs
 if($LASTEXITCODE -ne 0){throw 'CUDA engine build failed'}
}
if(!(Test-Path -LiteralPath (Join-Path $build 'bin/sd-cli.exe'))){throw 'CUDA engine executable missing'}
if(!$VulkanArchive){$VulkanArchive=Join-Path $BuildRoot 'vulkan-official.zip'}
if(!(Test-Path -LiteralPath $VulkanArchive)){Invoke-WebRequest -Uri $pin.vulkanArchive -OutFile $VulkanArchive}
if((Get-FileHash -LiteralPath $VulkanArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.vulkanSHA256){throw 'Vulkan archive checksum mismatch'}
$unpacked=Join-Path $BuildRoot 'vulkan-unpacked'
if(!(Test-Path -LiteralPath $unpacked)){Expand-Archive -LiteralPath $VulkanArchive -DestinationPath $unpacked}
$vk=@(Get-ChildItem -LiteralPath $unpacked -Recurse -File -Filter 'sd-cli.exe')
if($vk.Count -ne 1){throw 'Ambiguous Vulkan runtime archive'}
foreach($dir in @('cuda','vulkan','cpu','licenses')){New-Item -ItemType Directory -Force (Join-Path $Output $dir) | Out-Null}
$cudaOut=Join-Path $Output 'cuda';$vkOut=Join-Path $Output 'vulkan'
foreach($item in Get-ChildItem -LiteralPath (Join-Path $build 'bin') -File){if($item.Extension -eq '.dll' -or $item.Name -eq 'sd-cli.exe'){Copy-Item -LiteralPath $item.FullName -Destination $cudaOut -Force}}
foreach($name in @('cudart64_13.dll','cublas64_13.dll','cublasLt64_13.dll')) {
 $dll=Join-Path $ToolkitRoot "bin/x64/$name"
 if(!(Test-Path -LiteralPath $dll)){$dll=Join-Path $ToolkitRoot "bin/$name"}
 Copy-Item -LiteralPath $dll -Destination $cudaOut -Force
}
foreach($item in Get-ChildItem -LiteralPath $vk[0].DirectoryName -File){if($item.Extension -eq '.dll' -or $item.Name -eq 'sd-cli.exe'){Copy-Item -LiteralPath $item.FullName -Destination $vkOut -Force}}
# The official same-revision CPU variants preserve host ISA selection in both engines.
foreach($item in Get-ChildItem -LiteralPath $vkOut -File -Filter 'ggml-cpu-*.dll'){Copy-Item -LiteralPath $item.FullName -Destination $cudaOut -Force}
if(!$CpuArchive){$CpuArchive=Join-Path $BuildRoot 'cpu-official.zip'}
if(!(Test-Path -LiteralPath $CpuArchive)){Invoke-WebRequest -Uri $pin.cpuArchive -OutFile $CpuArchive}
if((Get-FileHash -LiteralPath $CpuArchive -Algorithm SHA256).Hash.ToLowerInvariant() -ne $pin.cpuSHA256){throw 'CPU archive checksum mismatch'}
$cpuUnpacked=Join-Path $BuildRoot 'cpu-unpacked'
if(!(Test-Path -LiteralPath $cpuUnpacked)){Expand-Archive -LiteralPath $CpuArchive -DestinationPath $cpuUnpacked}
$cpu=@(Get-ChildItem -LiteralPath $cpuUnpacked -Recurse -File -Filter 'sd-cli.exe')
if($cpu.Count -ne 1){throw 'Ambiguous CPU runtime archive'}
foreach($item in Get-ChildItem -LiteralPath $cpu[0].DirectoryName -File){if($item.Extension -eq '.dll' -or $item.Name -eq 'sd-cli.exe'){Copy-Item -LiteralPath $item.FullName -Destination (Join-Path $Output 'cpu') -Force}}
Copy-Item -LiteralPath (Join-Path $source 'LICENSE') -Destination (Join-Path $Output 'licenses/stable-diffusion.cpp-LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $source 'ggml/LICENSE') -Destination (Join-Path $Output 'licenses/ggml-LICENSE') -Force
Copy-Item -LiteralPath (Join-Path $ToolkitRoot 'EULA.txt') -Destination (Join-Path $Output 'licenses/CUDA-EULA.txt') -Force
$launcherBuild=Join-Path $BuildRoot 'launcher-build'
New-Item -ItemType Directory -Force $launcherBuild | Out-Null
Push-Location $launcherBuild
try {
 & cl /nologo /std:c++17 /EHsc /O2 /MT /utf-8 "/I$PSScriptRoot" "/I$ToolkitRoot/include" (Join-Path $PSScriptRoot 'main.cpp') "/Fe:$Output/novera-image-engine.exe"
 if($LASTEXITCODE -ne 0){throw 'Image launcher build failed'}
 & cl /nologo /std:c++17 /EHsc /O2 /MT /UNDEBUG "/I$PSScriptRoot" (Join-Path $PSScriptRoot 'test_policy.cpp') "/Fe:$launcherBuild/test-policy.exe"
 if($LASTEXITCODE -ne 0){throw 'Policy test build failed'}
 & (Join-Path $launcherBuild 'test-policy.exe')
 if($LASTEXITCODE -ne 0){throw 'Policy checks failed'}
}finally{Pop-Location}
$files=@(Get-ChildItem -LiteralPath $Output -File -Recurse | Where-Object Name -ne 'manifest.json' | ForEach-Object { @{path=[IO.Path]::GetRelativePath($Output,$_.FullName);bytes=$_.Length;sha256=(Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant()} })
$manifest=@{schema=1;cuda_toolkit=$pin.cudaToolkit;nvcc=$pin.nvcc;source_revision=$pin.revision;ggml_revision=$pin.ggmlRevision;architectures=$pin.cudaArchitectures;legacy_route='Vulkan when exposed by driver, otherwise CPU';platform=$pin.platform;files=$files}
$manifest | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $Output 'manifest.json') -Encoding utf8
Write-Output "Image engine launcher: $Output/novera-image-engine.exe"
