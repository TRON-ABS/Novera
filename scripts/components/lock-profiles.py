"""Refresh Windows x64 component locks from official indexes; never install them.

Run explicitly by a maintainer. Review the resulting locks before distribution.
"""
import json
import pathlib
import subprocess
import hashlib
import sys
import os

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / 'src-tauri/components'
UV = ROOT / 'src-tauri/resources/bin/uv.exe'
BASE = ['transformers==5.20.2', 'safetensors==0.8.0']
MEDIA = ['diffusers==0.42.0', 'Pillow==12.0.0', 'imageio==2.37.0', 'imageio-ffmpeg==0.6.0', 'numpy==2.5.4']
PROFILES = [
    ('transformers-cpu', '3.12.12', 'cpu', BASE + ['torch==2.14.1+cpu', 'peft==0.21.2', 'accelerate==1.15.0']),
    ('transformers-cuda', '3.12.12', 'cu130', BASE + ['torch==2.14.1+cu130', 'peft==0.21.2', 'accelerate==1.15.0', 'bitsandbytes==0.50.2', 'comfy-kitchen==0.2.35']),
    ('diffusers-cpu', '3.12.12', 'cpu', BASE + MEDIA + ['torch==2.14.1+cpu', 'accelerate==1.15.0', 'gguf==0.19.0']),
    ('diffusers-cuda', '3.12.12', 'cu130', BASE + MEDIA + ['torch==2.14.1+cu130', 'accelerate==1.15.0', 'gguf==0.19.0', 'comfy-kitchen==0.2.35']),
    ('onnx-cpu', '3.12.12', None, ['numpy==2.5.4', 'onnx==1.23.2', 'onnxruntime==1.31.1']),
    ('onnx-genai', '3.12.12', None, ['numpy==2.5.4', 'onnx==1.23.2', 'onnxruntime==1.31.1', 'onnxruntime-genai==0.18.0']),
    ('video-export', '3.12.12', None, ['imageio==2.37.0', 'imageio-ffmpeg==0.6.0', 'numpy==2.5.4', 'Pillow==12.0.0']),
    ('upscale-cpu', '3.12.12', 'cpu', ['Pillow==12.0.0', 'numpy==2.5.4', 'torch==2.14.1+cpu']),
    ('upscale-cuda', '3.12.12', 'cu130', ['Pillow==12.0.0', 'numpy==2.5.4', 'torch==2.14.1+cu130']),
    ('exllama', '3.12.12', 'cu128', (ROOT / 'transformers-server/requirements-exllama.txt').read_text().splitlines()),
]

def main():
    OUT.mkdir(exist_ok=True)
    unknown=set(sys.argv[1:])-{p[0] for p in PROFILES}
    if unknown:raise SystemExit('Unknown profiles: '+', '.join(sorted(unknown)))
    env={k:v for k,v in os.environ.items() if not k.startswith(('UV_','PIP_','PYTHON'))}
    env.update(UV_PYTHON_INSTALL_DIR=str(ROOT/'.build/components/python'), UV_PYTHON_BIN_DIR=str(ROOT/'.build/components/bin'), UV_CONCURRENT_DOWNLOADS='2', PYTHONUTF8='1')
    failed=[]
    for name, python, backend, requirements in PROFILES:
        if len(sys.argv) > 1 and name not in sys.argv[1:]:
            continue
        source = OUT / f'{name}.in'
        source.write_text('\n'.join(requirements) + '\n', encoding='utf-8')
        temporary=OUT / f'{name}.txt.pending'
        cmd = [str(UV), '--no-config', '--cache-dir', str(ROOT / '.build/components/cache'),
               'pip', 'compile', str(source), '--python-version', python,
               '--python-platform', 'x86_64-pc-windows-msvc', '--only-binary', ':all:',
               '--generate-hashes', '--no-header', '--no-annotate', '--no-progress',
               '--default-index', 'https://pypi.org/simple', '--output-file', str(temporary)]
        if backend:
            # Explicit per-package index avoids resolving unrelated names from a CUDA index.
            cmd += ['--index', f'https://download.pytorch.org/whl/{backend}', '--index-strategy', 'unsafe-best-match']
        result = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, text=True, env=env)
        print(name, result.returncode, result.stderr[-1200:], flush=True)
        if result.returncode:
            failed.append(name)
            temporary.unlink(missing_ok=True)
        else:
            temporary.replace(OUT / f'{name}.txt')
    hashes = {p.name: hashlib.sha256(p.read_bytes()).hexdigest() for p in OUT.glob('*.txt')}
    (OUT / 'sha256.json').write_text(json.dumps(hashes, indent=2) + '\n')
    if failed:raise SystemExit('Unresolved profiles (previous locks preserved): '+', '.join(failed))

if __name__ == '__main__':
    main()
