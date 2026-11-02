"""Upload reviewed signed payloads to an existing private draft, never publish."""
import hashlib
import http.client
import json
import os
from pathlib import Path
import sys
import time
import urllib.parse
import urllib.request

REPO = 'TRON-ABS/Novera'
TAG = 'v1.0.0-windows-portable'

def main(release_id):
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or os.environ.get('GITHUB_REPOSITORY') != REPO or not release_id.isdigit():
        raise RuntimeError('Owned disposable CI and numeric private draft required')
    token = os.environ['GITHUB_TOKEN']
    headers = {'Authorization': 'Bearer '+token, 'User-Agent': 'Novera-private-staging', 'Accept': 'application/vnd.github+json'}
    def api(path, method='GET'):
        if method == 'GET':
            path += ('&' if '?' in path else '?')+'novera_read='+str(time.time_ns())
        request = urllib.request.Request('https://api.github.com/repos/'+REPO+path, headers=headers, method=method)
        with urllib.request.urlopen(request, timeout=60) as response:
            return json.load(response) if response.status != 204 else None
    def draft():
        value = api('/releases/'+release_id)
        if not value['draft'] or value['tag_name'] != TAG:
            raise RuntimeError('Only the intended existing private draft may be staged')
        return value
    descriptor = json.loads(Path('scripts/distribution/public-release-1.0.0-portable.json').read_text())
    if descriptor['publicationTag'] != TAG or descriptor['version'] != '1.0.0':
        raise RuntimeError('Wrong reviewed descriptor')
    names = ['Novera_1.0.0_x64-portable.zip', 'Novera_1.0.0_x64-portable-update.exe']
    done = []
    for name in [item+suffix for item in names for suffix in ['', '.sig']]:
        expected = next(a for a in descriptor['assets'] if a['name'] == name)
        path = Path('.build/portable/packages')/name
        digest = hashlib.sha256()
        with path.open('rb') as stream:
            for block in iter(lambda: stream.read(1024*1024), b''):
                digest.update(block)
        actual = digest.hexdigest()
        if path.stat().st_size != expected['bytes'] or actual != expected['sha256']:
            raise RuntimeError('Candidate differs from reviewed bytes: '+name)
        current = draft()
        existing = next((a for a in current['assets'] if a['name'] == name), None)
        if existing and existing['state'] == 'starter' and existing['size'] == 0:
            # A cancelled upload owned by this private draft, never a public asset.
            api('/releases/assets/'+str(existing['id']), 'DELETE')
            current = draft()
            existing = None
        if existing:
            result = existing
        else:
            url = urllib.parse.urlsplit(current['upload_url'].split('{')[0])
            if url.netloc != 'uploads.github.com':
                raise RuntimeError('Unexpected upload host')
            connection = http.client.HTTPSConnection(url.netloc, timeout=180)
            connection.putrequest('POST', url.path+'?name='+urllib.parse.quote(name))
            for key, value in {**headers, 'Content-Type': 'application/octet-stream', 'Content-Length': str(expected['bytes'])}.items():
                connection.putheader(key, value)
            connection.endheaders()
            with path.open('rb') as stream:
                while block := stream.read(1024*1024):
                    connection.send(block)
            response = connection.getresponse()
            body = response.read()
            if response.status != 201:
                raise RuntimeError('Private upload returned HTTP '+str(response.status))
            result = json.loads(body)
            connection.close()
        if result['state'] != 'uploaded' or result['size'] != expected['bytes'] or result['digest'] != 'sha256:'+actual:
            raise RuntimeError('Private uploaded asset digest mismatch')
        done.append({'id': result['id'], 'name': name, 'bytes': expected['bytes'], 'sha256': actual})
        print('Verified private asset: '+name, flush=True)
    draft()
    out = Path('.build/validation/PORTABLE-STAGED.json')
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps({'releaseId': int(release_id), 'tag': TAG, 'draft': True, 'published': False, 'sourceCommit': os.environ['GITHUB_SHA'], 'assets': done}, indent=2)+'\n')

if __name__ == '__main__':
    main(sys.argv[1])
