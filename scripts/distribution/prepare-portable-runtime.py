"""Stage a freshly compiled portable app with pinned, previously released engines."""
import argparse
import hashlib
import json
import os
import shutil
import subprocess
import urllib.request
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
SOURCE_SHA256 = '41d2e4e839ff6ec094afe1944760222e50bf3278636f9a2618d4296546c7a4d8'
SOURCE_COMMIT = '428299c34d66170f543722ea98a11de6e3e50979'
SOURCE_URL = 'https://github.com/TRON-ABS/Novera/releases/download/v1.0.0/Novera_1.0.0_x64-setup.exe'


def digest(path):
    with path.open('rb') as stream:
        hash_value = hashlib.sha256()
        for block in iter(lambda: stream.read(1024*1024), b''):
            hash_value.update(block)
        return hash_value.hexdigest()


def source_runtime():
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or os.environ.get('RUNNER_ARCH') != 'X64':
        raise RuntimeError('Installing the source fixture is restricted to an ephemeral native x64 runner')
    base = Path(os.environ['RUNNER_TEMP'])/'novera-portable-source'
    base.mkdir()
    installer = base/'source.exe'
    print('Downloading the pinned immutable engine runtime', flush=True)
    with urllib.request.urlopen(SOURCE_URL, timeout=180) as response, installer.open('xb') as target:
        shutil.copyfileobj(response, target)
    if digest(installer) != SOURCE_SHA256:
        raise RuntimeError('Original immutable source installer hash mismatch')
    print('Source bytes verified; staging the source runtime', flush=True)
    runtime = base/'runtime'
    subprocess.run([str(installer), '/S', '/CURRENTUSER', '/D='+str(runtime)], check=True, timeout=600)
    if not (runtime/'Novera-Desktop.exe').is_file():
        raise RuntimeError('Original runtime was not installed')
    return runtime


def stage(source, binary, output, info_path, profile, local_engine=False):
    if output.exists() or info_path.exists():
        raise ValueError('Choose new staging outputs')
    output.mkdir(parents=True)
    for name in ['bun.exe', 'uv.exe', 'resources']:
        path = source/name
        if path.is_dir():
            shutil.copytree(path, output/name, symlinks=True)
        else:
            shutil.copy2(path, output/name)
    for path in source.glob('*.dll'):
        shutil.copy2(path, output/path.name)
    shutil.copy2(binary, output/'Novera-Desktop.exe')
    for name in ['LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md']:
        shutil.copy2(REPO/name, output/name)
    info = {'product': 'Novera', 'version': '1.0.0', 'platform': 'windows-x86_64', 'portableFeature': True, 'profile': profile,
            'applicationCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=REPO, text=True).strip(),
            'applicationRun': os.environ.get('GITHUB_RUN_ID'), 'executableSha256': digest(binary),
            'engineSourceCommit': SOURCE_COMMIT, 'engineSourceInstallerSha256': SOURCE_SHA256,
            'engineSourceUrl': SOURCE_URL, 'modelsIncluded': False, 'personalDataIncluded': False,
            'updaterEndpoint': 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest-portable.json'}
    if local_engine:
        info['engineSourceCommit'] = info['applicationCommit']
        info.pop('engineSourceInstallerSha256')
        info.pop('engineSourceUrl')
        info['engineOrigin'] = 'local-build; not the immutable release fixture'
    info_path.write_text(json.dumps(info, indent=2)+'\n', encoding='utf-8')
    # These sidecars are needed by tauri-build, even though the engine itself
    # is reused byte-for-byte and is not recompiled by this workflow.
    return info


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--source-runtime', type=Path)
    parser.add_argument('--download-source', action='store_true')
    parser.add_argument('--binary', type=Path)
    parser.add_argument('--output', type=Path)
    parser.add_argument('--build-info', type=Path)
    parser.add_argument('--local-engine', action='store_true')
    parser.add_argument('--profile', choices=['debug', 'release'], default='release')
    args = parser.parse_args()
    source = source_runtime() if args.download_source else args.source_runtime
    if not source:
        parser.error('Specify an immutable source runtime')
    if args.download_source and not args.binary:
        for name in ['resources', 'bun.exe', 'uv.exe']:
            src = source/name
            if name == 'resources':
                shutil.copytree(src, REPO/'src-tauri/resources', dirs_exist_ok=True)
            else:
                shutil.copy2(src, REPO/'src-tauri/resources/bin'/(src.stem+'-x86_64-pc-windows-msvc.exe'))
        (REPO/'.build').mkdir(exist_ok=True)
        (REPO/'.build/portable-source.json').write_text(json.dumps({'runtime': str(source)}))
        print('Pinned runtime prepared for native compilation')
    else:
        print(json.dumps(stage(source, args.binary, args.output, args.build_info, args.profile, args.local_engine)))
