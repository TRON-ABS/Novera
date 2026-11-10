"""Prepare the native core with the reviewed ESRGAN fix and Qwen GGUF entry point.

Usable by Windows, Linux and macOS engine builds. It never claims that an
unmodified upstream archive implements the official x2 topology.
"""
import argparse
import importlib.util
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
spec = importlib.util.spec_from_file_location('native_build_guard', ROOT/'scripts/native-image-bridge/build_runtime.py')
guard = importlib.util.module_from_spec(spec)
spec.loader.exec_module(guard)
QWEN_SOURCE = Path(__file__).with_name('qwen_encoder.cpp')


def prepare_source(source):
    guard.prepare_source(source)
    destination = source/'src/novera_qwen_encoder.cpp'
    content = QWEN_SOURCE.read_bytes()
    if not destination.is_file() or destination.read_bytes() != content:
        destination.write_bytes(content)


def receipt(runtime):
    executable = next((runtime/name for name in ('sd-cli.exe', 'sd-cli') if (runtime/name).is_file()), None)
    library = next((runtime/name for name in ('stable-diffusion.dll', 'libstable-diffusion.so', 'libstable-diffusion.dylib') if (runtime/name).is_file()), None)
    if not executable or not library:
        raise ValueError('The native CLI and shared core library must both exist.')
    result = {'version': '1.0.1', 'compiled': True, 'sourceRevision': guard.REVISION,
              'ggmlRevision': guard.GGML_REVISION, 'esrganSha256': guard.AFTER,
              'patchSha256': guard.PATCH_SHA256, 'nativeUpscaleFactors': [2, 4],
              'qwenEncoderSha256': guard.sha(QWEN_SOURCE),
              'artifacts': [{'name': path.name, 'bytes': path.stat().st_size, 'sha256': guard.sha(path)} for path in (executable, library)]}
    (runtime/'BUILD-VERIFICATION.json').write_text(json.dumps(result, indent=2)+'\n')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--receipt', type=Path)
    parser.add_argument('--check-receipt', type=Path)
    options = parser.parse_args()
    source = options.source.resolve()
    prepare_source(source)
    if options.receipt:
        receipt(options.receipt.resolve())
    if options.check_receipt:
        directory = options.check_receipt.resolve()
        value = json.loads((directory/'BUILD-VERIFICATION.json').read_text())
        if (value.get('compiled') is not True or value.get('esrganSha256') != guard.AFTER
                or value.get('qwenEncoderSha256') != guard.sha(QWEN_SOURCE)):
            raise ValueError('Rebuild the native core before using this cache.')
        entries = value.get('artifacts', [])
        if not any(e.get('name') in ('sd-cli.exe', 'sd-cli') for e in entries) or not any(e.get('name') in ('stable-diffusion.dll', 'libstable-diffusion.so', 'libstable-diffusion.dylib') for e in entries):
            raise ValueError('Incomplete native runtime receipt.')
        for entry in entries:
            if entry['name'] not in ('sd-cli.exe', 'sd-cli', 'stable-diffusion.dll', 'libstable-diffusion.so', 'libstable-diffusion.dylib'):
                raise ValueError('Unexpected runtime artifact.')
            path = directory/entry['name']
            if path.stat().st_size != entry['bytes'] or guard.sha(path) != entry['sha256']:
                raise ValueError('Native build artifact no longer matches its receipt.')


if __name__ == '__main__': main()
