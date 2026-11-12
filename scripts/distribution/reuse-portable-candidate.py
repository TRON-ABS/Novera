"""Fetch only a successful, signed candidate whose native sources are unchanged."""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import urllib.error
import urllib.request
import zipfile
from pathlib import Path

REPO = 'TRON-ABS/Novera'
ROOT = Path(__file__).resolve().parents[2]


def main(run_id):
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or not run_id.isdigit():
        raise RuntimeError('Disposable runner and numeric candidate run required')
    token = os.environ['GITHUB_TOKEN']
    headers = {'Authorization': 'Bearer '+token, 'User-Agent': 'Novera-portable-validation', 'Accept': 'application/vnd.github+json'}
    def api(path):
        with urllib.request.urlopen(urllib.request.Request('https://api.github.com/repos/'+REPO+path, headers=headers), timeout=60) as response:
            return json.load(response)
    run = api('/actions/runs/'+run_id)
    if run['conclusion'] not in ['success', 'failure'] or ' - portable - ' not in run['display_title']:
        raise RuntimeError('A completed native portable build is required')
    jobs = api('/actions/runs/'+run_id+'/jobs?per_page=100')['jobs']
    required_steps = {'Build the actual portable application', 'Package an empty portable profile and Program-only update', 'Sign and independently verify both final payloads'}
    passed = {step['name'] for job in jobs for step in job.get('steps', []) if step['conclusion'] == 'success'}
    if not required_steps.issubset(passed):
        raise RuntimeError('Compilation, packaging and both signature checks must have passed; a failed later UI run is not a successful validation')
    artifacts = api('/actions/runs/'+run_id+'/artifacts')['artifacts']
    artifact = next(a for a in artifacts if a['name'] == 'windows-portable-'+run_id)
    target = ROOT/'.build/portable'
    target.mkdir(parents=True, exist_ok=False)
    archive_path = target/'candidate-artifact.zip'
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *_):
            return None
    request = urllib.request.Request('https://api.github.com/repos/'+REPO+'/actions/artifacts/'+str(artifact['id'])+'/zip', headers=headers)
    try:
        response = urllib.request.build_opener(NoRedirect).open(request, timeout=60)
    except urllib.error.HTTPError as error:
        if error.code not in [301, 302, 303, 307, 308] or not error.headers['Location'].startswith('https://'):
            raise
        # The signed storage redirect receives no GitHub credential.
        response = urllib.request.urlopen(error.headers['Location'], timeout=180)
    with response, archive_path.open('xb') as stream:
        shutil.copyfileobj(response, stream, 1024*1024)
    digest = hashlib.sha256()
    with archive_path.open('rb') as stream:
        for block in iter(lambda: stream.read(1024*1024), b''):
            digest.update(block)
    if artifact.get('digest') != 'sha256:'+digest.hexdigest() or archive_path.stat().st_size > 4*1024**3:
        raise RuntimeError('Candidate artifact digest mismatch')
    packages = target/'packages'
    packages.mkdir()
    seen = set()
    with zipfile.ZipFile(archive_path) as archive:
        for entry in archive.infolist():
            if entry.is_dir():
                continue
            name = Path(entry.filename).name
            if name in seen or not name.startswith(('Novera_1.0.3_x64-portable', 'PORTABLE-', 'latest-portable')) or not name.endswith(('.exe', '.zip', '.sig', '.json', '.sha256')) or entry.file_size > 2*1024**3:
                raise RuntimeError('Unexpected candidate artifact file')
            seen.add(name)
            with archive.open(entry) as source, (packages/name).open('xb') as stream:
                shutil.copyfileobj(source, stream, 1024*1024)
    provenance = json.loads((packages/'PORTABLE-PROVENANCE.json').read_text())
    if provenance['applicationCommit'] != run['head_sha'] or not provenance['portableFeature'] or provenance['profile'] != 'release':
        raise RuntimeError('Candidate source identity mismatch')
    subprocess.run(['git', 'fetch', '--depth=1', 'origin', run['head_sha']], cwd=ROOT, check=True)
    subprocess.run(['git', 'diff', '--quiet', run['head_sha'], 'HEAD', '--', 'src-tauri', 'web-app', 'core', 'extensions', 'media-server'], cwd=ROOT, check=True)
    # Actual signatures are checked again before any candidate code is run.
    script = "import fs from 'node:fs';import {verifyUpdateBundle} from './scripts/distribution/ci-check-updater.mjs';const key=JSON.parse(fs.readFileSync('src-tauri/tauri.portable.conf.json')).plugins.updater.pubkey;for(const name of ['Novera_1.0.3_x64-portable.zip','Novera_1.0.3_x64-portable-update.exe']) { const file='.build/portable/packages/'+name;await verifyUpdateBundle(file,fs.readFileSync(file+'.sig','utf8'),key) }"
    subprocess.run(['node', '--input-type=module', '-e', script], cwd=ROOT, check=True)
    receipt = {'candidateRun': run_id, 'candidateWorkflowConclusion': run['conclusion'], 'compilationAndSigningPassed': True, 'compilationCommit': run['head_sha'], 'sourceCommit': os.environ['GITHUB_SHA'], 'artifactId': artifact['id'], 'artifactSha256': digest.hexdigest(), 'nativeSourcesUnchanged': True, 'bothPayloadSignaturesVerified': True}
    (ROOT/'.build/validation').mkdir(parents=True, exist_ok=True)
    (ROOT/'.build/validation/PORTABLE-REUSE.json').write_text(json.dumps(receipt, indent=2)+'\n')
    print(json.dumps(receipt))


if __name__ == '__main__':
    main(sys.argv[1])
