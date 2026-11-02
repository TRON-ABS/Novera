"""Real native portable extraction/move/signed replacement on disposable Windows."""
import hashlib
import json
import os
import shutil
import subprocess
import sys
import tempfile
import threading
import time
import zipfile
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]


def digest(path):
    with path.open('rb') as stream:
        hash_value = hashlib.sha256()
        for block in iter(lambda: stream.read(1024*1024), b''):
            hash_value.update(block)
        return hash_value.hexdigest()


def wait(test, message, seconds=120):
    end = time.monotonic()+seconds
    while time.monotonic() < end:
        if test():
            return
        time.sleep(.5)
    raise RuntimeError('Timed out: '+message)


def stop_owned(executable):
    # Exact executable path inside this test's temp root; never match process names.
    script = "$targetExe=$env:NOVERA_OWNED_EXE; Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -eq $targetExe } | ForEach-Object { & taskkill.exe /PID $_.ProcessId /T /F }"
    subprocess.run(['powershell.exe', '-NoProfile', '-Command', script], env=dict(os.environ, NOVERA_OWNED_EXE=str(executable)), check=True, capture_output=True)


def unlocked(root):
    path = root/'Data/.portable.lock'
    try:
        # A running app opens this file with share_mode(0).
        with path.open('r+b'):
            return True
    except OSError:
        return False


def main():
    if sys.platform != 'win32' or os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted' or os.environ.get('RUNNER_ARCH') != 'X64':
        raise RuntimeError('Disposable native Windows x64 runner required')
    packages = REPO/'.build/portable/packages'
    archive = packages/'Novera_1.0.0_x64-portable.zip'
    payload = packages/'Novera_1.0.0_x64-portable-update.exe'
    signature = Path(str(payload)+'.sig').read_text().strip()
    base = Path(tempfile.mkdtemp(prefix='novera-portable-validation-', dir=os.environ['RUNNER_TEMP']))
    initial = base/'clé USB initiale'
    initial.mkdir()
    with zipfile.ZipFile(archive) as package:
        for entry in package.infolist():
            parts = Path(entry.filename).parts
            if Path(entry.filename).is_absolute() or '..' in parts or ':' in entry.filename or '\\' in entry.filename:
                raise RuntimeError('Escaping portable ZIP entry')
        package.extractall(initial)
    provenance = json.loads((packages/'PORTABLE-PROVENANCE.json').read_text())
    for item in provenance['files']:
        if digest(initial/item['path']) != item['sha256']:
            raise RuntimeError('Extracted runtime hash mismatch')
    if list((initial/'Data').iterdir()):
        raise RuntimeError('Public ZIP includes user data')
    out = REPO/'.build/validation'
    out.mkdir(parents=True, exist_ok=True)
    env = {k: v for k, v in os.environ.items() if not any(s in k.upper() for s in ['TOKEN', 'PASSWORD', 'SECRET', 'PRIVATE_KEY', 'API_KEY', 'ACCESS_KEY', 'CREDENTIAL', 'AUTHORIZATION'])}
    for k in ['CI', 'NOVERA_ENABLE_UPDATER']:
        env.pop(k, None)
    subprocess.run(['node', 'scripts/distribution/validate-portable-ui.mjs', str(initial/'Program/Novera-Desktop.exe'), 'initial'], env=env, cwd=REPO, check=True, timeout=240)
    wait(lambda: unlocked(initial), 'first portable app exit')
    # The public entry point is the native root launcher, not the inner EXE.
    subprocess.run([str(initial/'Novera.exe')], env=env, cwd=initial, check=True, timeout=60)
    wait(lambda: not unlocked(initial), 'root launcher started the real app')
    time.sleep(5)
    if unlocked(initial):
        raise RuntimeError('The root-launched application exited unexpectedly')
    stop_owned(initial/'Program/Novera-Desktop.exe')
    wait(lambda: unlocked(initial), 'root-launched app exit')
    moved = base/'autre disque espace é'
    initial.rename(moved)
    executable = moved/'Program/Novera-Desktop.exe'
    subprocess.run(['node', 'scripts/distribution/validate-portable-ui.mjs', str(executable), 'moved'], env=env, cwd=REPO, check=True, timeout=240)
    wait(lambda: unlocked(moved), 'moved portable app exit')
    witness = json.loads((moved/'Data/portable-ui-witness.json').read_text())
    model = moved/witness['modelRelative']
    before_model = digest(model)
    thread = moved/'Data/Novera/data/threads'/witness['threadId']/'messages.jsonl'
    before_thread = digest(thread)
    before_exe = digest(executable)
    root_for_probe = base/'probe'
    root_for_probe.mkdir()
    probe = REPO/'.build/native-update-probe/debug/novera-update-validation.exe'
    profile = root_for_probe/'profile'
    profile.mkdir()
    probe_env = dict(env, NOVERA_VALIDATION_ROOT=str(base), JAN_DATA_ROOT=str(profile), JAN_DATA_FOLDER=str(profile/'data'))

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass
        def do_GET(self):
            if self.path in ['/feed.json', '/tampered.json']:
                route = '/tampered' if self.path == '/tampered.json' else '/payload'
                data = json.dumps({'version': '1.0.0', 'notes': 'Isolated portable updater fixture', 'pub_date': '2026-11-02T00:00:00Z',
                                   'platforms': {'windows-x86_64': {'signature': signature, 'url': f'http://127.0.0.1:{self.server.server_port}'+route}}}).encode()
                self.send_response(200)
                self.send_header('Content-Length', str(len(data)))
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(data)
            elif self.path in ['/payload', '/tampered']:
                self.send_response(200)
                self.send_header('Content-Length', str(payload.stat().st_size))
                self.end_headers()
                with payload.open('rb') as source:
                    first = source.read(1024*1024)
                    if self.path == '/tampered':
                        first = bytes([first[0] ^ 1])+first[1:]
                    self.wfile.write(first)
                    shutil.copyfileobj(source, self.wfile, 1024*1024)
            else:
                self.send_error(404)

    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    def run_probe(mode, version, route='/feed.json'):
        request = root_for_probe/(mode+'.json')
        receipt = root_for_probe/(mode+'-receipt.json')
        request.write_text(json.dumps({'endpoint': f'http://127.0.0.1:{server.server_port}'+route, 'executable': str(executable),
                                      'mode': mode, 'currentVersion': version, 'portableRoot': str(moved)}))
        subprocess.run([str(probe)], env=dict(probe_env, NOVERA_UPDATE_REQUEST=str(request), NOVERA_UPDATE_RECEIPT=str(receipt)), check=True, timeout=600)
        return json.loads(receipt.read_text())
    try:
        downloaded = run_probe('download', '0.9.9')
        current = run_probe('check-current', '1.0.0')
        rejected = run_probe('reject-tampered', '0.9.9', '/tampered.json')
        missing = moved/'Program/resources/SIGNATURE.txt'
        expected_missing = digest(missing)
        missing.unlink()  # Owned runtime only; prove actual restoration by the helper.
        installed = run_probe('install', '0.9.9')
        wait(lambda: (moved/'Data/last-portable-update.json').is_file() and missing.is_file(), 'signed portable replacement', 180)
        stop_owned(executable)
        wait(lambda: unlocked(moved), 'updated app exit')
        if digest(missing) != expected_missing or digest(executable) != before_exe:
            raise RuntimeError('Updated portable runtime differs')
        if digest(thread) != before_thread or digest(model) != before_model:
            raise RuntimeError('Portable update changed synthetic discussion/model bytes')
        for item in provenance['files']:
            if digest(moved/item['path']) != item['sha256']:
                raise RuntimeError('Portable update did not restore the complete runtime')
        subprocess.run(['node', 'scripts/distribution/validate-portable-ui.mjs', str(executable), 'updated'], env=env, cwd=REPO, check=True, timeout=240)
        ui = json.loads((out/'PORTABLE-UI-updated.json').read_text())
        report = {'applicationVersion': '1.0.0', 'sourceCommit': os.environ['GITHUB_SHA'], 'compilationCommit': provenance['applicationCommit'], 'zipSha256': digest(archive), 'updaterSha256': digest(payload),
                  'nativeSignatureVerified': downloaded['nativeSignatureVerified'], 'sameVersionNotOffered': current['sameVersionNotOffered'],
                  'tamperedPayloadRejected': rejected['tamperedPayloadRejectedByNativeVerifier'], 'nativeInstallationRequested': installed['installerRequested'],
                  'programRestored': True, 'runtimeFilesCompared': len(provenance['files']), 'discussionBytesPreserved': True, 'modelBytesPreserved': True,
                  'folderMoved': True, 'nativeRootLauncherVerified': True, 'nativeUiInitialMovedUpdatedPassed': True, 'realPublicVersionsUpgradeValidated': False,
                  'publicCurrentVersionUiValidated': ui['productionManualCheckValidated'],
                  'limitations': ['Synthetic data only; no model inference or cross-PC DPAPI key migration is certified.', 'An upgrade between two public versions is not certified by these fixtures.']}
        (out/'PORTABLE-VERIFIED.json').write_text(json.dumps(report, indent=2)+'\n')
        print(json.dumps(report))
    finally:
        server.shutdown()
        server.server_close()
        stop_owned(executable)


if __name__ == '__main__':
    main()
