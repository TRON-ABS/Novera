"""Check the real signed CLI against its public feed in a fresh profile, without installing."""
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import zipfile


def main():
    root = Path(__file__).resolve().parents[2]
    platform = {'win32':'windows-x86_64', 'linux':'linux-x86_64'}[sys.platform]
    archive = Path(sys.argv[1]).resolve(strict=True)
    descriptor_path = Path(sys.argv[2]) if len(sys.argv) > 2 else root/'scripts/distribution/public-release-1.0.0.json'
    descriptor = json.loads(descriptor_path.read_text(encoding='utf-8-sig'))
    expected = descriptor if isinstance(descriptor, list) else descriptor['assets']
    identity_format = 1 if isinstance(descriptor, list) else descriptor.get('cliIdentityFormatVersion', 1)
    if identity_format not in (1, 2):
        raise RuntimeError('Unknown reviewed CLI identity format')
    record = next(r for r in expected if r['name'] == f'Novera_CLI_1.0.0_{platform}.zip')
    with archive.open('rb') as stream:
        digest = hashlib.sha256()
        for block in iter(lambda: stream.read(1024*1024), b''):
            digest.update(block)
        if digest.hexdigest() != record['sha256']:
            raise RuntimeError('CLI differs from reviewed release bytes')
    out = root/'.build/public-release'
    out.mkdir(parents=True, exist_ok=True)
    stem = 'novera' if identity_format == 2 else 'jan'
    binary = stem + '.exe' if sys.platform == 'win32' else stem
    with tempfile.TemporaryDirectory(prefix='cli-production-', dir=out) as temporary:
        scratch = Path(temporary)
        with zipfile.ZipFile(archive) as package:
            if set(package.namelist()) != {binary, 'CLI-UPDATE.json'}:
                raise RuntimeError('Unexpected CLI archive layout')
            identity = json.loads(package.read('CLI-UPDATE.json'))
            payload = package.read(binary)
            if identity['formatVersion'] != identity_format or identity['product'] != 'Novera CLI' or identity['binary'] != binary or identity['version'] != '1.0.0' or identity['platform'] != platform or identity['binarySha256'] != hashlib.sha256(payload).hexdigest():
                raise RuntimeError('Signed CLI identity mismatch')
            if isinstance(descriptor, dict) and descriptor.get('cliSourceCommit') != identity['commit']:
                raise RuntimeError('CLI executable source differs from the reviewed descriptor')
            executable = scratch/binary
            executable.write_bytes(payload)
        executable.chmod(0o755)
        env = {k:v for k,v in os.environ.items() if not any(marker in k.upper() for marker in ['TOKEN','PASSWORD','SECRET','PRIVATE_KEY'])}
        for name in ['HOME','USERPROFILE','APPDATA','LOCALAPPDATA','XDG_DATA_HOME','XDG_CONFIG_HOME','XDG_CACHE_HOME']:
            profile = scratch/'profile'/name.lower()
            profile.mkdir(parents=True)
            env[name] = str(profile)
        result = subprocess.run([str(executable), 'update', '--check'], env=env, cwd=scratch, text=True, capture_output=True, timeout=90)
        if result.returncode or 'Already on the latest ' not in result.stdout or ' build (1.0.0)' not in result.stdout:
            raise RuntimeError(f'CLI production check failed: {result.returncode}: {result.stdout}\n{result.stderr}')
        receipt = {'platform':platform,'version':'1.0.0','binary':binary,'identityFormatVersion':identity_format,'archiveSha256':record['sha256'],'productionCheckPassed':True,'updateInstalled':False,'stdout':result.stdout}
        (out/f'CLI-PRODUCTION-CHECK-{platform}.json').write_text(json.dumps(receipt,indent=2)+'\n')
        print(json.dumps(receipt,indent=2))


if __name__ == '__main__':
    main()
