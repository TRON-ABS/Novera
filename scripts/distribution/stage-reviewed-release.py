"""Transfer exact reviewed signed Actions payloads to an existing private draft.

No signing key, application execution, public release mutation or publication.
"""
import hashlib
import http.client
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REPOSITORY = 'TRON-ABS/Novera'


def validate_descriptor(value):
    version = value.get('version', '')
    if value.get('schema') != 1 or not re.fullmatch(r'\d+\.\d+\.\d+', version):
        raise ValueError('A reviewed stable-version descriptor is required')
    if not re.fullmatch('v'+re.escape(version)+r'(?:-[a-z0-9.-]+)?', value.get('publicationTag', '')):
        raise ValueError('Publication tag differs from the reviewed version')
    for key in ['runId', 'artifactId']:
        if type(value.get(key)) is not int or value[key] <= 0:
            raise ValueError('Exact positive run/artifact IDs are required')
    for key, length in [('compilationCommit', 40), ('artifactSha256', 64)]:
        if not re.fullmatch('[a-f0-9]{'+str(length)+'}', value.get(key, '')):
            raise ValueError('Exact commit and archive digest are required')
    kind, platform = value.get('kind'), value.get('platform')
    if kind == 'desktop':
        core = {'windows-x86_64': f'Novera_{version}_x64-setup.exe', 'windows-aarch64': f'Novera_{version}_arm64-setup.exe',
                'linux-x86_64': f'Novera_{version}_amd64.AppImage', 'darwin-aarch64': f'Novera_{version}_aarch64.app.tar.gz',
                'darwin-x86_64': f'Novera_{version}_x64.app.tar.gz'}.get(platform)
        required = {core, str(core)+'.sig'} if core else set()
        allowed = set(required)
        if platform in ['darwin-aarch64', 'darwin-x86_64']:
            allowed.add(f"Novera_{version}_{'aarch64' if platform.endswith('aarch64') else 'x64'}.dmg")
    elif kind == 'cli' and platform in ['windows-x86_64', 'linux-x86_64', 'darwin-aarch64']:
        core = f'Novera_CLI_{version}_{platform}.zip'
        required = allowed = {core, core+'.sig'}
    elif kind == 'portable' and platform == 'windows-x86_64':
        required = allowed = {f'Novera_{version}_x64-portable'+suffix for suffix in ['.zip', '.zip.sig', '-update.exe', '-update.exe.sig']}
    else:
        raise ValueError('Unsupported signed distribution')
    if not required:
        raise ValueError('Unsupported desktop platform')
    names = set()
    for asset in value.get('assets', []):
        name = asset.get('name', '')
        if name not in allowed or name in names or not re.fullmatch(r'[A-Za-z0-9_.-]+', name):
            raise ValueError('Unexpected, duplicate or escaping payload filename')
        if type(asset.get('bytes')) is not int or not 0 < asset['bytes'] < 2*1024**3 or not re.fullmatch(r'[a-f0-9]{64}', asset.get('sha256', '')):
            raise ValueError('Exact bounded payload size and digest are required')
        names.add(name)
    if not required.issubset(names):
        raise ValueError('Every reviewed update payload needs its signature')
    return value


def require_private_draft(release, descriptor):
    if release.get('draft') is not True or release.get('tag_name') != descriptor['publicationTag']:
        raise ValueError('Only the intended existing private draft may receive assets')


def digest(file):
    value = hashlib.sha256()
    with file.open('rb') as stream:
        for block in iter(lambda: stream.read(4*1024*1024), b''):
            value.update(block)
    return value.hexdigest()


def verify_file(file, record):
    if file.is_symlink() or not file.is_file() or file.stat().st_size != record['bytes'] or digest(file) != record['sha256']:
        raise ValueError('Payload differs from reviewed bytes: '+record['name'])


def main(descriptor_name, release_id):
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or os.environ.get('GITHUB_REPOSITORY') != REPOSITORY:
        raise RuntimeError('Owned disposable GitHub-hosted CI is required')
    if not release_id.isdigit():
        raise ValueError('An existing numeric draft release ID is required')
    relative = PurePosixPath(descriptor_name)
    if relative.is_absolute() or '..' in relative.parts or '\\' in descriptor_name or ':' in descriptor_name or not descriptor_name.startswith('scripts/distribution/staging/') or relative.suffix != '.json':
        raise ValueError('Use a reviewed staging descriptor inside the repository')
    descriptor_path = ROOT.joinpath(*relative.parts)
    if descriptor_path.is_symlink() or not descriptor_path.resolve(strict=True).is_relative_to((ROOT/'scripts/distribution/staging').resolve()):
        raise ValueError('Staging descriptor escapes its reviewed directory')
    descriptor = validate_descriptor(json.loads(descriptor_path.read_text()))
    if descriptor['version'] != json.loads((ROOT/'src-tauri/tauri.conf.json').read_text())['version']:
        raise ValueError('Staging version differs from the checked-out application')
    token = os.environ['GITHUB_TOKEN']
    headers = {'Authorization': 'Bearer '+token, 'User-Agent': 'Novera-reviewed-private-staging', 'Accept': 'application/vnd.github+json'}

    def api(path):
        path += ('&' if '?' in path else '?')+'novera_read='+str(time.time_ns())
        request = urllib.request.Request('https://api.github.com/repos/'+REPOSITORY+path, headers=headers)
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.load(response)

    run = api('/actions/runs/'+str(descriptor['runId']))
    if run['conclusion'] != 'success' or run['head_sha'] != descriptor['compilationCommit'] or run['head_repository']['full_name'] != REPOSITORY:
        raise RuntimeError('Successful reviewed source run required')
    artifact = next((a for a in api('/actions/runs/'+str(descriptor['runId'])+'/artifacts?per_page=100')['artifacts'] if a['id'] == descriptor['artifactId']), None)
    if not artifact or artifact['expired'] or artifact.get('digest') != 'sha256:'+descriptor['artifactSha256']:
        raise RuntimeError('Artifact identity or archive digest changed')
    release = api('/releases/'+release_id)
    require_private_draft(release, descriptor)
    scratch_base = Path(os.environ['RUNNER_TEMP']).resolve(strict=True)
    with tempfile.TemporaryDirectory(prefix='novera-reviewed-stage-', dir=scratch_base) as temporary:
        scratch = Path(temporary)
        archive = scratch/'github-original.zip'
        class NoRedirect(urllib.request.HTTPRedirectHandler):
            def redirect_request(self, *args):
                return None
        request = urllib.request.Request('https://api.github.com/repos/'+REPOSITORY+'/actions/artifacts/'+str(artifact['id'])+'/zip', headers=headers)
        try:
            response = urllib.request.build_opener(NoRedirect).open(request, timeout=90)
        except urllib.error.HTTPError as error:
            if error.code not in [301, 302, 303, 307, 308] or not error.headers.get('Location', '').startswith('https://'):
                raise
            # Signed storage receives no GitHub credential.
            response = urllib.request.urlopen(error.headers['Location'], timeout=180)
        with response, archive.open('xb') as stream:
            shutil.copyfileobj(response, stream, 4*1024*1024)
        if digest(archive) != descriptor['artifactSha256']:
            raise RuntimeError('Downloaded archive differs from the reviewed artifact')
        print('Original artifact digest verified', flush=True)
        output = scratch/'reviewed'
        output.mkdir()
        prefix = '' if descriptor['kind'] == 'portable' else 'packages/'
        wanted = {prefix+a['name'] for a in descriptor['assets']}
        if descriptor['kind'] != 'portable':
            wanted.update(['candidate.json', 'UPDATER-READINESS.json', 'CLI-UPDATER-READINESS.json'])
        if descriptor['kind'] == 'desktop' and descriptor['platform'].startswith('windows-'):
            wanted.add('desktop/Novera-Desktop.exe')
        if descriptor['kind'] == 'portable':
            wanted.add('PORTABLE-PROVENANCE.json')
        seen = set()
        with zipfile.ZipFile(archive) as package:
            for entry in package.infolist():
                if entry.filename not in wanted:
                    continue
                path = PurePosixPath(entry.filename)
                if path.is_absolute() or '..' in path.parts or ':' in entry.filename or '\\' in entry.filename or entry.filename in seen or entry.is_dir() or (entry.external_attr >> 16) & 0o170000 == 0o120000 or entry.file_size >= 2*1024**3:
                    raise RuntimeError('Unsafe or duplicate selected archive entry')
                seen.add(entry.filename)
                target = output.joinpath(*path.parts)
                target.parent.mkdir(parents=True, exist_ok=True)
                with package.open(entry) as source, target.open('xb') as stream:
                    shutil.copyfileobj(source, stream, 4*1024*1024)
        for asset in descriptor['assets']:
            verify_file(output/prefix/asset['name'], asset)
        if descriptor['kind'] == 'portable':
            identity = json.loads((output/'PORTABLE-PROVENANCE.json').read_text())
            if identity['version'] != descriptor['version'] or identity['applicationCommit'] != descriptor['compilationCommit']:
                raise RuntimeError('Portable build provenance changed')
        else:
            identity = json.loads((output/'candidate.json').read_text())
            if identity['kind'] != descriptor['kind'] or identity['version'] != descriptor['version'] or identity['commit'] != descriptor['compilationCommit']:
                raise RuntimeError('Candidate build provenance changed')
        if descriptor['kind'] == 'desktop':
            receipt = json.loads((output/'UPDATER-READINESS.json').read_text())
            if receipt['platform'] != descriptor['platform']:
                raise RuntimeError('Desktop updater platform changed')
            subprocess.run(['node', 'scripts/distribution/ci-check-updater.mjs', '--publication-check', str(output)], cwd=ROOT, check=True)
        else:
            key = 'tauri.portable.conf.json' if descriptor['kind'] == 'portable' else 'tauri.updater.conf.json'
            code = '''import fs from 'node:fs'; import path from 'node:path'; import {verifyUpdateBundle} from './scripts/distribution/ci-check-updater.mjs';
const [directory,keyFile,names]=process.argv.slice(1);const key=JSON.parse(fs.readFileSync(keyFile)).plugins.updater.pubkey;
for(const name of JSON.parse(names).filter(n=>!n.endsWith('.sig'))){await verifyUpdateBundle(path.join(directory,name),fs.readFileSync(path.join(directory,name+'.sig'),'utf8'),key)}
console.log('Final payload signatures verified against the pinned Novera key');'''
            subprocess.run(['node', '--input-type=module', '-e', code, str(output/prefix), str(ROOT/'src-tauri'/key), json.dumps([a['name'] for a in descriptor['assets']])], cwd=ROOT, check=True)
        done = []
        for expected in descriptor['assets']:
            release = api('/releases/'+release_id)
            require_private_draft(release, descriptor)
            existing = next((a for a in release['assets'] if a['name'] == expected['name']), None)
            if existing:
                asset = existing
            else:
                url = urllib.parse.urlsplit(release['upload_url'].split('{')[0])
                if url.netloc != 'uploads.github.com':
                    raise RuntimeError('Unexpected private upload host')
                connection = http.client.HTTPSConnection(url.netloc, timeout=180)
                connection.putrequest('POST', url.path+'?name='+urllib.parse.quote(expected['name']))
                for key, value in {**headers, 'Content-Type': 'application/octet-stream', 'Content-Length': str(expected['bytes'])}.items():
                    connection.putheader(key, value)
                connection.endheaders()
                with (output/prefix/expected['name']).open('rb') as stream:
                    for block in iter(lambda: stream.read(4*1024*1024), b''):
                        connection.send(block)
                response = connection.getresponse()
                body = response.read()
                if response.status != 201:
                    raise RuntimeError('Private upload returned HTTP '+str(response.status))
                asset = json.loads(body)
                connection.close()
            if asset['state'] != 'uploaded' or asset['size'] != expected['bytes'] or asset['digest'] != 'sha256:'+expected['sha256']:
                raise RuntimeError('Private server asset differs from reviewed bytes')
            done.append({'id': asset['id'], **expected})
            print('Verified private asset: '+expected['name'], flush=True)
        require_private_draft(api('/releases/'+release_id), descriptor)
        receipt = {'releaseId': int(release_id), 'tag': descriptor['publicationTag'], 'draft': True, 'published': False,
                   'compilationCommit': descriptor['compilationCommit'], 'preparationCommit': os.environ['GITHUB_SHA'], 'artifactId': artifact['id'], 'archiveSha256': descriptor['artifactSha256'], 'assets': done}
        destination = ROOT/'.build/release-staging'
        destination.mkdir(parents=True, exist_ok=True)
        (destination/'STAGED.json').write_text(json.dumps(receipt, indent=2)+'\n')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        raise SystemExit('Usage: stage-reviewed-release.py REVIEWED_DESCRIPTOR EXISTING_DRAFT_ID')
    main(sys.argv[1], sys.argv[2])
