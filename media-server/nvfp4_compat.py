"""Read-only Comfy NVFP4 -> cached BF16 Safetensors bridge for sd-cli.

Format: FP4 E2M1, block-16 FP8 scales in cuBLAS tiled order, scalar scale.
Specification: https://github.com/Comfy-Org/comfy-quants/blob/main/docs/formats/nvfp4.md
No ComfyUI import, model code execution, weight download or source overwrite.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import struct
import sys
import uuid

VERSION = 1


def emit(**data):
    print(json.dumps(data), flush=True)


def header(path):
    with Path(path).open('rb') as stream:
        raw = stream.read(8)
        if len(raw) != 8:
            raise ValueError('Invalid Safetensors header')
        size = struct.unpack('<Q', raw)[0]
        if not 2 <= size <= 64 * 1024 * 1024:
            raise ValueError('Oversized Safetensors header')
        data = json.loads(stream.read(size))
    return data, size + 8


def quantized_layers(data):
    metadata = json.loads(data.get('__metadata__', {}).get('_quantization_metadata', '{}'))
    layers = metadata.get('layers', {})
    found = {}
    for name, config in layers.items():
        if config.get('format') != 'nvfp4':
            raise ValueError('Mixed or unsupported quantization; conversion refused')
        weight, scales, scale2 = (name + suffix for suffix in ('.weight', '.weight_scale', '.weight_scale_2'))
        if not all(key in data for key in (weight, scales, scale2)):
            raise ValueError('Missing NVFP4 tensors')
        shape = data[weight]['shape']
        if data[weight]['dtype'] != 'U8' or len(shape) != 2 or shape[1] % 8:
            raise ValueError('Unsupported packed NVFP4 layout')
        rows, cols = shape[0], shape[1] * 2
        expected = [((rows + 127) // 128) * 128, ((cols // 16 + 3) // 4) * 4]
        if data[scales]['shape'] != expected or data[scales]['dtype'] not in ('F8_E4M3', 'U8') or data[scale2]['shape'] not in ([], [1]):
            raise ValueError('Unsupported NVFP4 scales')
        found[weight] = name
    if not found:
        raise ValueError('No supported Comfy NVFP4 metadata')
    return found


def decode(weight, block_scales, tensor_scale):
    import torch
    rows, packed_cols = weight.shape
    cols = packed_cols * 2
    nrb, ncb = (rows + 127) // 128, (cols // 16 + 3) // 4
    # Inverse cuBLAS scale tiling. Decode in float32 before final BF16 storage.
    scale = block_scales.view(torch.float8_e4m3fn).float()
    scale = scale.reshape(nrb * ncb, 32, 4, 4).transpose(1, 2)
    scale = scale.reshape(nrb, ncb, 128, 4).permute(0, 2, 1, 3)
    scale = scale.reshape(nrb * 128, ncb * 4)[:rows, :cols // 16]
    lut = torch.tensor([0., .5, 1., 1.5, 2., 3., 4., 6., -0., -.5, -1., -1.5, -2., -3., -4., -6.])
    nibbles = torch.stack((weight >> 4, weight & 15), dim=-1).reshape(rows, cols)
    values = lut[nibbles.long()].reshape(rows, cols // 16, 16)
    values.mul_(scale.unsqueeze(-1)).mul_(tensor_scale.float().reshape(()))
    return values.reshape(rows, cols).to(torch.bfloat16).contiguous()


def prepare(source, cache, staging=None):
    import torch
    from safetensors import safe_open
    source, cache = Path(os.path.abspath(source)), Path(os.path.abspath(cache))
    if sys.version_info[:3] != (3, 15, 1):
        raise ValueError('Select Python 3.15.1 for NVFP4 preparation')
    torch.set_num_threads(min(8, os.cpu_count() or 1))
    data, data_start = header(source)
    source_info = source.stat()
    layers = quantized_layers(data)
    emit(stage='loading', progress=0)
    with source.open('rb') as stream:
        digest = hashlib.file_digest(stream, 'sha256').hexdigest()
    cache.mkdir(parents=True, exist_ok=True)
    target = cache / f'nvfp4-v{VERSION}-{digest}.safetensors'
    excluded = {name + suffix for name in layers.values() for suffix in ('.weight_scale', '.weight_scale_2', '.input_scale', '.comfy_quant')}
    output = {'__metadata__': {'novera.compat': str(VERSION), 'novera.source_sha256': digest, 'novera.storage': 'bf16'}}
    offset = 0
    for name, tensor in data.items():
        if name == '__metadata__' or name in excluded:
            continue
        shape = tensor['shape']
        if name in layers:
            shape = [shape[0], shape[1] * 2]
            size, dtype = shape[0] * shape[1] * 2, 'BF16'
        else:
            size, dtype = tensor['data_offsets'][1] - tensor['data_offsets'][0], tensor['dtype']
        output[name] = dict(dtype=dtype, shape=shape, data_offsets=[offset, offset + size])
        offset += size
    encoded = json.dumps(output, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 8)
    expected_size = 8 + len(encoded) + offset
    if target.exists():
        existing, _ = header(target)
        if existing == output and target.stat().st_size == expected_size:
            emit(stage='prepared', progress=100, model_path=str(target), cached=True)
            return target
        raise ValueError('Inconsistent compatibility cache; refusing to overwrite')
    if shutil.disk_usage(cache).free < expected_size + 256 * 1024 * 1024:
        raise ValueError('Not enough disk space for BF16 compatibility cache')
    staged = Path(staging) if staging else cache / f'.{target.name}.{uuid.uuid4()}.partial'
    try:
        with staged.open('xb') as destination, source.open('rb') as raw, safe_open(str(source), framework='pt', device='cpu') as tensors:
            destination.write(struct.pack('<Q', len(encoded))); destination.write(encoded)
            names = [name for name in output if name != '__metadata__']
            for i, name in enumerate(names):
                if name in layers:
                    prefix = layers[name]
                    tensor = decode(tensors.get_tensor(name), tensors.get_tensor(prefix + '.weight_scale'), tensors.get_tensor(prefix + '.weight_scale_2'))
                    destination.write(tensor.view(torch.uint8).numpy().tobytes()); del tensor
                else:
                    begin, end = data[name]['data_offsets']; raw.seek(data_start + begin)
                    remaining = end - begin
                    while remaining:
                        chunk = raw.read(min(8 * 1024 * 1024, remaining))
                        if not chunk:
                            raise ValueError('Truncated source tensor')
                        destination.write(chunk); remaining -= len(chunk)
                emit(stage='loading', progress=round(95 * (i + 1) / len(names)))
            destination.flush(); os.fsync(destination.fileno())
        if staged.stat().st_size != expected_size:
            raise ValueError('Incomplete compatibility output')
        after = source.stat()
        if (after.st_size, after.st_mtime_ns) != (source_info.st_size, source_info.st_mtime_ns):
            raise ValueError('Source model changed during preparation')
        if os.name == 'nt':
            os.rename(staged, target)
        else:
            os.link(staged, target); staged.unlink()
        emit(stage='prepared', progress=100, model_path=str(target), cached=False)
        return target
    finally:
        staged.unlink(missing_ok=True)


if __name__ == '__main__':
    try:
        config = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
        if config.get('parent_pid'):
            from worker import watch_parent
            watch_parent(config['parent_pid'])
        if config.get('compat_models'):
            paths = {item['role']: str(prepare(item['path'], config['compat_cache'], config.get('compat_staging'))) for item in config['compat_models']}
            emit(stage='prepared', progress=100, paths=paths)
        else:
            prepare(config['model'], config['compat_cache'])
    except Exception as error:
        emit(stage='error', error=str(error)); sys.exit(1)
