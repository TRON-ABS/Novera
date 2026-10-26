# Called by the Windows build launcher before Tauri resolves its resources.
# Models are deliberately excluded; only the pinned engine/runtime and notices ship.
function Prepare-NoveraImageEngine([string]$Repo) {
    $runtime = if ($env:NOVERA_IMAGE_RUNTIME) { [IO.Path]::GetFullPath($env:NOVERA_IMAGE_RUNTIME) } else { Join-Path $Repo '.build/novera-image-cuda134/runtime' }
    if (!(Test-Path -LiteralPath (Join-Path $runtime 'manifest.json'))) {
        & (Join-Path $Repo 'media-server/image-launcher/prepare.ps1')
        if ($LASTEXITCODE -ne 0) { throw 'Image engine preparation failed.' }
    }
    $record = Get-Content -LiteralPath (Join-Path $runtime 'manifest.json') -Raw | ConvertFrom-Json
    $pin = Get-Content -LiteralPath (Join-Path $Repo 'media-server/image-launcher/toolchain.json') -Raw | ConvertFrom-Json
    if ($record.source_revision -ne $pin.revision -or $record.cuda_toolkit -ne $pin.cudaToolkit) { throw 'Image runtime is not the pinned build.' }
    $destination = Join-Path $Repo 'src-tauri/resources/image-engine'
    foreach ($entry in $record.files) {
        $source = [IO.Path]::GetFullPath((Join-Path $runtime $entry.path))
        if (!$source.StartsWith([IO.Path]::GetFullPath($runtime) + [IO.Path]::DirectorySeparatorChar, [StringComparison]::OrdinalIgnoreCase)) { throw 'Invalid image runtime manifest path.' }
        $item = Get-Item -LiteralPath $source -ErrorAction Stop
        if ($item.PSIsContainer -or ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) -or $item.Length -ne $entry.bytes -or (Get-FileHash -LiteralPath $source).Hash -ne $entry.sha256) { throw "Image runtime checksum mismatch: $($entry.path)" }
    }
    foreach ($required in @('novera-image-engine.exe','cuda/sd-cli.exe','vulkan/sd-cli.exe','cpu/sd-cli.exe')) {
        if (!(Test-Path -LiteralPath (Join-Path $runtime $required))) { throw "Image runtime incomplete: $required" }
    }
    New-Item -ItemType Directory -Force $destination | Out-Null
    foreach ($entry in $record.files) {
        $target = Join-Path $destination $entry.path
        New-Item -ItemType Directory -Force (Split-Path $target -Parent) | Out-Null
        Copy-Item -LiteralPath (Join-Path $runtime $entry.path) -Destination $target
    }
    Copy-Item -LiteralPath (Join-Path $runtime 'manifest.json') -Destination $destination
    Write-Output 'Image engine: bundled CUDA / Vulkan / CPU runtime verified and staged.'
}
