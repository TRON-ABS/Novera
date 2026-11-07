"""Run the actual original public CLI updater on disposable native runners."""
from pathlib import Path
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
import zipfile


def download(url, limit):
    if not url.startswith('https://github.com/TRON-ABS/Novera/releases/'):
        raise ValueError('Only official release URLs are allowed')
    with urllib.request.urlopen(url, timeout=120) as response:
        data = response.read(limit + 1)
    if len(data) > limit:
        raise ValueError('Public CLI download exceeds limit')
    return data


def main():
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise RuntimeError('Disposable native runner required')
    platform = {'win32': 'windows-x86_64', 'linux': 'linux-x86_64'}[sys.platform]
    repo = Path(__file__).resolve().parents[2]
    old_records = json.loads((repo / 'scripts/distribution/public-release-1.0.0.json').read_text())
    current = json.loads((repo / 'scripts/distribution/public-release-1.0.1.json').read_text())
    feed = json.loads(download('https://github.com/TRON-ABS/Novera/releases/latest/download/latest-cli.json', 1024**2))
    name = f'Novera_CLI_1.0.1_{platform}.zip'
    entry = feed['platforms'][platform]
    if feed['version'] != '1.0.1' or entry['url'] != 'https://github.com/TRON-ABS/Novera/releases/download/v1.0.1/' + name:
        raise RuntimeError('Public compatibility channel does not match the original updater contract')
    out = repo / '.build/legacy-cli-upgrade'
    out.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix='native-', dir=out) as temporary:
        scratch = Path(temporary)
        binaries = {}
        for version in ['1.0.0', '1.0.1']:
            filename = f'Novera_CLI_{version}_{platform}.zip'
            base = f'https://github.com/TRON-ABS/Novera/releases/download/v{version}/'
            data = download(base + filename, 128 * 1024**2)
            signature = download(base + filename + '.sig', 16384)
            if version == '1.0.0':
                for key, payload in [(filename, data), (filename + '.sig', signature)]:
                    record = next(item for item in old_records if item['name'] == key)
                    if len(payload) != record['bytes'] or hashlib.sha256(payload).hexdigest() != record['sha256']:
                        raise RuntimeError('Original public CLI differs from its pinned bytes')
            elif hashlib.sha256(data).hexdigest() != entry['sha256'] or signature.decode().strip() != entry['signature']:
                raise RuntimeError('Public compatibility archive differs from its feed')
            archive = scratch / filename; archive.write_bytes(data)
            sig = scratch / (filename + '.sig'); sig.write_bytes(signature)
            code = "import fs from 'node:fs'; import {verifyUpdateBundle} from './scripts/distribution/ci-check-updater.mjs'; await verifyUpdateBundle(process.argv[1],fs.readFileSync(process.argv[2],'utf8'),JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey);"
            subprocess.run(['node', '--input-type=module', '-e', code, str(archive), str(sig)], cwd=repo, check=True, timeout=60)
            binary_name = 'jan.exe' if sys.platform == 'win32' else 'jan'
            with zipfile.ZipFile(archive) as package:
                if set(package.namelist()) != {binary_name, 'CLI-UPDATE.json'}:
                    raise RuntimeError('Invalid original-updater layout')
                identity = json.loads(package.read('CLI-UPDATE.json'))
                binary = package.read(binary_name)
            if identity['formatVersion'] != 1 or identity['product'] != 'Novera CLI' or identity['version'] != version or identity['platform'] != platform or identity['binary'] != binary_name or identity['binarySha256'] != hashlib.sha256(binary).hexdigest():
                raise RuntimeError('Invalid version-bound compatibility identity')
            if version == '1.0.1' and identity['commit'] != current['cliSourceCommit']:
                raise RuntimeError('Compatibility executable has a different source')
            binaries[version] = binary
        executable = scratch / binary_name
        executable.write_bytes(binaries['1.0.0']); executable.chmod(0o755)
        env = {k: v for k, v in os.environ.items() if not any(token in k.upper() for token in ['TOKEN', 'PASSWORD', 'SECRET', 'PRIVATE_KEY'])}
        profile = scratch / 'profile'
        for key, relative in {'HOME': 'User', 'USERPROFILE': 'User', 'APPDATA': 'User/AppData/Roaming', 'LOCALAPPDATA': 'User/AppData/Local', 'XDG_DATA_HOME': 'User/data', 'XDG_CONFIG_HOME': 'User/config', 'XDG_CACHE_HOME': 'User/cache'}.items():
            directory = profile / relative; directory.mkdir(parents=True, exist_ok=True); env[key] = str(directory)
        sentinel = profile / 'preserve.txt'; sentinel.write_text('Novera legacy upgrade sentinel')
        env.update(JAN_CLI_NO_UPDATE_CHECK='1', NOVERA_CLI_NO_UPDATE_CHECK='1')
        def run(*args):
            result = subprocess.run([str(executable), *args], cwd=scratch, env=env, capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=180)
            if result.returncode:
                raise RuntimeError(f'Native original CLI failed ({result.returncode}): {result.stdout}\n{result.stderr}')
            return result.stdout + result.stderr
        before = run('--version')
        if not re.search(r'\b1\.0\.0\b', before): raise RuntimeError('Original public CLI version differs')
        offered = run('update', '--check')
        if '1.0.1' not in offered: raise RuntimeError('The original production updater did not offer 1.0.1')
        installed = run('update')
        after = run('--version')
        if not re.search(r'\b1\.0\.1\b', after) or executable.read_bytes() != binaries['1.0.1']:
            raise RuntimeError('The original updater did not install the exact 1.0.1 executable')
        current_check = run('update', '--check')
        if 'Already on the latest ' not in current_check or '(1.0.1)' not in current_check:
            raise RuntimeError('Migrated CLI does not use the current canonical feed correctly')
        if sentinel.read_text() != 'Novera legacy upgrade sentinel': raise RuntimeError('Profile sentinel changed')
        receipt = dict(platform=platform, fromVersion='1.0.0', toVersion='1.0.1', originalPublicUpdaterExecuted=True,
            productionOfferVerified=True, exactSignedPayloadInstalled=True, profileSentinelPreserved=True,
            canonicalFeedAfterMigrationVerified=True, executableSha256=hashlib.sha256(binaries['1.0.1']).hexdigest(),
            before=before, installed=installed, after=after, currentCheck=current_check)
        (out / f'LEGACY-CLI-UPGRADE-{platform}.json').write_text(json.dumps(receipt, indent=2) + '\n')
        print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main()
