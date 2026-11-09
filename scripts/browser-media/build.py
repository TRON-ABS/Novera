"""Build the experimental browser port; never publish or claim model validation."""
import argparse
import hashlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import urllib.request
import zipfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parent.parent


def apply_reviewed_patches(lock, sources, environment, patch_root=HERE):
    """Accept only a known state in a contiguous, hash-verified patch chain."""
    chains = {}
    reviewed = []
    for patch in lock.get('patches', []):
        relative = Path(patch['file'])
        patch_relative = Path(patch['patch'])
        if any(p.is_absolute() or p.drive or '..' in p.parts for p in (relative, patch_relative)):
            raise RuntimeError('Browser patch paths must stay inside their source roots')
        patch_file = patch_root / patch_relative
        if hashlib.sha256(patch_file.read_bytes()).hexdigest() != patch['patchSha256']:
            raise RuntimeError('Reviewed browser patch digest mismatch')
        key = (patch['source'], patch['file'])
        chain = chains.setdefault(key, [])
        if chain and patch['beforeSha256'] != chain[-1]['afterSha256']:
            raise RuntimeError('Browser patches for the same file must form a contiguous reviewed chain')
        chain.append(patch)
        reviewed.append((patch, patch_file, sources[patch['source']] / relative))
    for patch, patch_file, target in reviewed:
        digest = hashlib.sha256(target.read_bytes()).hexdigest() if target.exists() else None
        chain = chains[(patch['source'], patch['file'])]
        index = chain.index(patch)
        # A cached file can already contain this patch and subsequent reviewed
        # patches. Its whole-file digest certifies that exact later state.
        if any(digest == later['afterSha256'] for later in chain[index:]):
            continue
        if digest != patch['beforeSha256']:
            raise RuntimeError('The browser patch target differs from its reviewed source')
        command = ['git', '-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'apply']
        subprocess.run(command + ['--check', str(patch_file)], cwd=sources[patch['source']], env=environment, check=True)
        subprocess.run(command + ['--whitespace=nowarn', str(patch_file)], cwd=sources[patch['source']], env=environment, check=True)
        if hashlib.sha256(target.read_bytes()).hexdigest() != patch['afterSha256']:
            raise RuntimeError('Patched browser source digest mismatch')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--emsdk', type=Path, required=True)
    parser.add_argument('--cmake', default='cmake')
    parser.add_argument('--ninja', default='ninja')
    parser.add_argument('--cache', type=Path, default=ROOT / '.build/browser-media')
    parser.add_argument('--jobs', type=int, default=2)
    parser.add_argument('--gpu-vae-probe', action='store_true', help='Experimental direct GPU VAE; does not establish compatibility')
    parser.add_argument('--cpu-vae-fallback', action='store_true', help='Slower CPU VAE fallback for compatibility investigation')
    parser.add_argument('--image-vae-matmul-probe', action='store_true', help='Benchmark 512-pixel tiled image VAE matrix multiplication')
    parser.add_argument('--heap-probe', action='store_true', help='Validate allocator consistency and stack bounds (diagnostic only)')
    parser.add_argument('--numerical-checks', action='store_true', help='Compile the separate CPU-reference validation module; does not run browser tests')
    parser.add_argument('--gpu-profile', action='store_true', help='Diagnostic GPU timestamps; never use this build for performance comparisons')
    parser.add_argument('--kernel-tuning', action='store_true', help='Opt-in optimized image kernel profile with explicit runtime controls')
    options = parser.parse_args()
    if not 1 <= options.jobs <= 16:
        parser.error('--jobs must be between 1 and 16')
    lock = json.loads((HERE / 'sources.json').read_text())
    if options.kernel_tuning:
        lock['patches'].extend(json.loads((HERE / 'kernel-tuning.json').read_text())['patches'])
    sdk = options.emsdk.resolve()
    emcc = sdk / 'upstream/emscripten/emcc.py'
    emcmake = sdk / 'upstream/emscripten/emcmake.py'
    environment = dict(os.environ, EM_CONFIG=str(sdk / '.emscripten'), EMSDK=str(sdk))
    # Archive snapshots must not inherit the parent Novera checkout's Git SHA.
    cache = options.cache.resolve()
    cache.mkdir(parents=True, exist_ok=True)
    environment['GIT_CEILING_DIRECTORIES'] = str(cache)
    environment['PATH'] = str(sdk / 'upstream/emscripten') + os.pathsep + environment['PATH']
    version = subprocess.check_output([sys.executable, str(emcc), '--version'], env=environment, text=True)
    if lock['emscripten'] not in version.splitlines()[0]:
        raise RuntimeError('Activate the pinned Emscripten version before building.')
    sources = {}
    for source in lock['sources']:
        short = 'sdcpp' if source['repo'].endswith('stable-diffusion.cpp') else 'ggml'
        destination = cache / short
        receipt = destination / '.novera-source.json'
        if not receipt.exists() or json.loads(receipt.read_text()) != source:
            if destination.exists() and any(destination.iterdir()):
                raise RuntimeError(f'Use an empty cache for {short}; existing unreviewed files are preserved.')
            url = f"https://codeload.github.com/{source['repo']}/zip/{source['commit']}"
            with urllib.request.urlopen(url, timeout=120) as response:
                data = response.read()
            if hashlib.sha256(data).hexdigest() != source['archiveSha256']:
                raise RuntimeError(f'Source archive digest mismatch: {short}')
            with zipfile.ZipFile(io.BytesIO(data)) as archive:
                for entry in archive.infolist():
                    if entry.is_dir():
                        continue
                    relative = Path(*entry.filename.split('/')[1:])
                    if relative.is_absolute() or relative.drive or '..' in relative.parts or not relative.parts:
                        raise RuntimeError('Invalid source archive member')
                    target = destination / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_bytes(archive.read(entry))
            receipt.write_text(json.dumps(source, indent=2))
        sources[short] = destination
    apply_reviewed_patches(lock, sources, environment)
    build = cache / 'build'
    subprocess.run([sys.executable, str(emcmake), options.cmake, '-S', str(HERE), '-B', str(build), '-G', 'Ninja',
                    '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_MAKE_PROGRAM=' + options.ninja,
                    '-DNOVERA_WEBGPU_VAE_PROBE=' + ('ON' if options.gpu_vae_probe else 'OFF'),
                    '-DNOVERA_IMAGE_KERNEL_TUNING=' + ('ON' if options.kernel_tuning else 'OFF'),
                    '-DNOVERA_NUMERICAL_CHECKS=' + ('ON' if options.numerical_checks else 'OFF'),
                    '-DGGML_WEBGPU_GPU_PROFILE=' + ('ON' if options.gpu_profile else 'OFF'),
                    '-DNOVERA_CPU_VAE_FALLBACK=' + ('ON' if options.cpu_vae_fallback else 'OFF'),
                    '-DNOVERA_IMAGE_VAE_MATMUL_PROBE=' + ('ON' if options.image_vae_matmul_probe else 'OFF'),
                    '-DNOVERA_HEAP_PROBE=' + ('ON' if options.heap_probe else 'OFF'),
                    '-DGIT_EXE:FILEPATH=', '-DSDCPP_BUILD_VERSION=novera-web-experiment',
                    '-DSDCPP_BUILD_COMMIT=' + lock['sources'][0]['commit'], '-DGGML_BUILD_COMMIT=' + lock['sources'][1]['commit'],
                    '-DNOVERA_SD_SOURCE=' + str(sources['sdcpp']), '-DSD_GGML_SOURCE_DIR=' + str(sources['ggml'])], env=environment, check=True)
    subprocess.run([options.cmake, '--build', str(build), '--target', 'novera-diffusion', '-j', str(options.jobs)], env=environment, check=True)
    if options.numerical_checks:
        subprocess.run([options.cmake, '--build', str(build), '--target', 'novera-im2col-check', '-j', str(options.jobs)], env=environment, check=True)
    artifacts = []
    for suffix in ['mjs', 'wasm']:
        path = build / f'novera-diffusion.{suffix}'
        artifacts.append({'name': path.name, 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    result = {'compiled': True, 'modelInferenceValidated': False, 'vaeBackend': 'cpu' if options.cpu_vae_fallback else ('webgpu-tiled-matmul-probe' if options.image_vae_matmul_probe else 'webgpu-direct'), 'stackBytes': 8388608, 'heapValidation': options.heap_probe, 'diagnosticNodeTracing': options.gpu_vae_probe, 'gpuProfiling': options.gpu_profile, 'kernelTuningCompiled': options.kernel_tuning, 'kernelDefaultFlags': 143602 if options.kernel_tuning else 0, 'numericalCheckModuleCompiled': options.numerical_checks, 'sources': lock, 'artifacts': artifacts}
    (build / 'BUILD-VERIFICATION.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
