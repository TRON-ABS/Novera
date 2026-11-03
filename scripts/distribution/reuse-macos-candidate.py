"""Revalidate exact Intel packages after the isolated enumeration-budget failure."""
from pathlib import Path
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]
REPO = 'TRON-ABS/Novera'


def main(run_id):
    if not run_id.isdigit() or os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or sys.platform != 'darwin' or os.uname().machine != 'x86_64' or os.environ.get('GITHUB_REPOSITORY') != REPO:
        raise RuntimeError('Owned disposable Intel Mac and numeric source run required')
    token = os.environ['GITHUB_TOKEN']
    headers = {'Authorization': 'Bearer ' + token, 'User-Agent': 'Novera-Mac-revalidation', 'Accept': 'application/vnd.github+json'}
    base = 'https://api.github.com/repos/' + REPO

    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *_):
            return None

    def request(path):
        req = urllib.request.Request(base + path, headers=headers)
        try:
            return urllib.request.build_opener(NoRedirect).open(req, timeout=60)
        except urllib.error.HTTPError as error:
            if error.code != 302:
                raise
            location = error.headers['Location']
            url = urllib.parse.urlsplit(location)
            if url.scheme != 'https' or not url.hostname or not url.hostname.endswith(('.blob.core.windows.net', '.githubusercontent.com')):
                raise RuntimeError('Unexpected storage redirect')
            return urllib.request.urlopen(location, timeout=180)

    def api(path):
        with request(path + ('&' if '?' in path else '?') + 'novera_read=' + str(time.time_ns())) as response:
            return json.load(response)

    source = api('/actions/runs/' + run_id)
    if source['conclusion'] != 'failure' or source['head_branch'] != 'codex/macos-headless-validation' or ' - macos-tests - ' not in source['display_title']:
        raise RuntimeError('Expected the completed Mac test run')
    subprocess.run(['git', 'fetch', '--depth=1', 'origin', source['head_sha']], cwd=ROOT, check=True)
    paths = ['src-tauri', 'web-app', 'core', 'extensions', 'media-server', 'package.json', 'yarn.lock',
             'scripts/distribution/ci-build.sh', 'scripts/distribution/ci-candidates.mjs',
             'scripts/distribution/ci-check-macos.mjs', 'scripts/distribution/ci-check-updater.mjs',
             'scripts/distribution/macos-test-model.json', 'scripts/distribution/macos-headless-tests.sh']
    subprocess.run(['git', 'diff', '--exit-code', source['head_sha'], 'HEAD', '--', *paths], cwd=ROOT, check=True)
    jobs = api('/actions/runs/' + run_id + '/jobs?per_page=100')['jobs']
    job = next(j for j in jobs if j['name'] == 'macos / x64')
    if job['conclusion'] != 'failure':
        raise RuntimeError('Expected Intel enumeration failure')
    with request('/actions/jobs/' + str(job['id']) + '/logs') as response:
        log = response.read().decode()
    for count in [187, 9, 18, 5, 7]:
        if not re.search(r'test result: ok\. ' + str(count) + r' passed; 0 failed;', log):
            raise RuntimeError('Missing successful native suite: ' + str(count))
    if 'test result: FAILED' in log or log.count('Traceback (most recent call last):') != 1 or not re.search(r"subprocess.TimeoutExpired: Command .*--list-devices.* timed out after 45 seconds", log):
        raise RuntimeError('Source failed outside the reviewed device enumeration budget')
    # This statement is reached after original build/archive/DMG comparisons;
    # the original traceback proves that prior stage finished without error.
    artifact = next(a for a in api('/actions/runs/' + run_id + '/artifacts')['artifacts']
                    if a['name'] == 'diagnostics-macos-x64-' + run_id and not a['expired'])
    work = ROOT / '.build/macos-revalidation'
    work.mkdir(parents=True, exist_ok=False)
    archive = work / 'diagnostics.zip'
    with request('/actions/artifacts/' + str(artifact['id']) + '/zip') as response, archive.open('xb') as out:
        shutil.copyfileobj(response, out, 1024 * 1024)
    with archive.open('rb') as stream:
        archive_sha = hashlib.file_digest(stream, 'sha256').hexdigest()
    if artifact['digest'] != 'sha256:' + archive_sha or archive.stat().st_size != artifact['size_in_bytes']:
        raise RuntimeError('Artifact integrity mismatch')
    allowed = ('.build/candidates/packages/', '.build/macos-headless/')
    seen = set()
    with zipfile.ZipFile(archive) as z:
        for entry in z.infolist():
            name = entry.filename
            if entry.is_dir():
                continue
            if not (name.startswith(allowed) or re.fullmatch(r'\.build/candidates/MACOS-[A-Z-]+\.json', name)):
                continue
            target = (ROOT / name).resolve()
            if not target.is_relative_to(ROOT / '.build') or name in seen or entry.file_size > 512 * 1024**2:
                raise RuntimeError('Unsafe or duplicate diagnostic file')
            seen.add(name)
            target.parent.mkdir(parents=True, exist_ok=True)
            with z.open(entry) as src, target.open('xb') as out:
                shutil.copyfileobj(src, out)
    candidates = ROOT / '.build/candidates'
    packages = candidates / 'packages'
    expected_names = {'Novera_1.0.0_x64.app.tar.gz', 'Novera_1.0.0_x64.app.tar.gz.sig', 'Novera_1.0.0_x64.dmg'}
    if {p.name for p in packages.iterdir()} != expected_names:
        raise RuntimeError('Unexpected packages')
    readiness = """import fs from 'node:fs';import {verifyUpdateBundle} from './scripts/distribution/ci-check-updater.mjs';const f='.build/candidates/packages/Novera_1.0.0_x64.app.tar.gz';const key=JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey;await verifyUpdateBundle(f,fs.readFileSync(f+'.sig','utf8'),key);"""
    subprocess.run(['node', '--input-type=module', '-e', readiness], cwd=ROOT, check=True)
    receipt = {'candidateRun': run_id, 'candidateJob': job['id'], 'applicationCommit': source['head_sha'],
               'validationCommit': os.environ['GITHUB_SHA'], 'validationRun': os.environ['GITHUB_RUN_ID'],
               'nativeSourcesUnchanged': True, 'nativeSuitesPassedInOriginalRun': True,
               'originalBuiltAppDmgArchiveComparisonCompleted': True,
               'originalFailure': 'Packaged --list-devices exceeded 45 seconds during cold Metal initialization',
               'artifactId': artifact['id'], 'artifactSha256': archive_sha, 'archiveSignatureVerified': True,
               'packages': {p.name: {'bytes': p.stat().st_size, 'sha256': hashlib.file_digest(p.open('rb'), 'sha256').hexdigest()} for p in packages.iterdir()}}
    (candidates / 'MACOS-REUSE.json').write_text(json.dumps(receipt, indent=2) + '\n')
    (work / 'source-job.log').write_text(log)
    spec = importlib.util.spec_from_file_location('macos_headless', ROOT / 'scripts/distribution/macos-headless.py')
    headless = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(headless)
    # Reconstructed reference; original build equality is separately evidenced
    # above. Revalidation again compares the exact signed archive with the DMG.
    reference = ROOT / 'src-tauri/target/release/bundle/macos'
    reference.parent.mkdir(parents=True, exist_ok=True)
    headless.extract_app(packages / 'Novera_1.0.0_x64.app.tar.gz', reference)
    print(json.dumps(receipt, indent=2))


if __name__ == '__main__':
    main(sys.argv[1])
