"""Build the experimental ACE browser port; never publish or claim model validation."""
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


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--emsdk', type=Path, required=True)
    parser.add_argument('--cmake', default='cmake')
    parser.add_argument('--ninja', default='ninja')
    parser.add_argument('--cache', type=Path, default=ROOT / '.build/browser-music')
    parser.add_argument('--jobs', type=int, default=2)
    options = parser.parse_args()
    if not 1 <= options.jobs <= 16:
        parser.error('--jobs must be between 1 and 16')
    lock = json.loads((HERE / 'sources.json').read_text())
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
        short = 'ace' if source['repo'].endswith('acestep.cpp') else 'ggml'
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
    for patch in lock.get('patches', []):
        patch_file = HERE / patch['patch']
        if hashlib.sha256(patch_file.read_bytes()).hexdigest() != patch['patchSha256']:
            raise RuntimeError('Reviewed browser patch digest mismatch')
        target = sources[patch['source']] / patch['file']
        digest = hashlib.sha256(target.read_bytes()).hexdigest()
        if digest == patch['afterSha256']:
            continue
        if digest != patch['beforeSha256']:
            raise RuntimeError('The browser patch target differs from its reviewed source')
        patch_command = ['git', '-c', 'core.autocrlf=false', '-c', 'core.eol=lf', 'apply']
        subprocess.run(patch_command + ['--check', str(patch_file)], cwd=sources[patch['source']], env=environment, check=True)
        subprocess.run(patch_command + ['--whitespace=nowarn', str(patch_file)], cwd=sources[patch['source']], env=environment, check=True)
        if hashlib.sha256(target.read_bytes()).hexdigest() != patch['afterSha256']:
            raise RuntimeError('Patched browser source digest mismatch')
    build = cache / 'build'
    subprocess.run([sys.executable, str(emcmake), options.cmake, '-S', str(HERE), '-B', str(build), '-G', 'Ninja',
                    '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_MAKE_PROGRAM=' + options.ninja,
                    '-DGIT_EXE:FILEPATH=', '-DGGML_BUILD_COMMIT=' + lock['sources'][1]['commit'],
                    '-DNOVERA_ACE_SOURCE=' + str(sources['ace']), '-DNOVERA_GGML_SOURCE=' + str(sources['ggml'])], env=environment, check=True)
    subprocess.run([options.cmake, '--build', str(build), '--target', 'novera-music', '-j', str(options.jobs)], env=environment, check=True)
    artifacts = []
    for suffix in ['mjs', 'wasm']:
        path = build / f'novera-music.{suffix}'
        artifacts.append({'name': path.name, 'bytes': path.stat().st_size, 'sha256': hashlib.sha256(path.read_bytes()).hexdigest()})
    result = {'compiled': True, 'modelInferenceValidated': False, 'captionRewriting': False, 'explicitDurationCodeBudget': True, 'maxInputBytesPerField': 512, 'sources': lock, 'artifacts': artifacts}
    (build / 'BUILD-VERIFICATION.json').write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()
