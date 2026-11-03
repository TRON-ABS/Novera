"""Exercise frozen Mac packages on disposable runners; never assert visual QA."""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import argparse
import hashlib
import importlib.util
import json
import os
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import threading
import time
import urllib.request

REPO = Path(__file__).resolve().parents[2]


def digest(path):
    h = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            h.update(block)
    return h.hexdigest()


def require_host():
    if sys.platform != 'darwin' or os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise RuntimeError('Disposable macOS GitHub-hosted runner required')
    return Path(os.environ['RUNNER_TEMP']).resolve(strict=True)


def child_environment(profile, scratch):
    # Tests do not need the runner's credentials or any inherited provider key.
    allowed = {'PATH', 'LANG', 'LC_ALL', 'DEVELOPER_DIR', 'SDKROOT', 'MACOSX_DEPLOYMENT_TARGET', 'SYSTEMROOT'}
    env = {k: v for k, v in os.environ.items() if k in allowed}
    env.update(HOME=str(profile), CFFIXED_USER_HOME=str(profile), TMPDIR=str(scratch),
               TMP=str(scratch), TEMP=str(scratch), GITHUB_ACTIONS='true', RUNNER_ENVIRONMENT='github-hosted',
               RUNNER_TEMP=os.environ['RUNNER_TEMP'])
    for name in ['XDG_DATA_HOME', 'XDG_CONFIG_HOME', 'XDG_CACHE_HOME']:
        directory = profile / name.lower()
        directory.mkdir(parents=True, exist_ok=True)
        env[name] = str(directory)
    return env


def manifest(root):
    root = Path(root).resolve(strict=True)
    entries = []
    def visit(directory):
        for path in sorted(directory.iterdir()):
            relative = path.relative_to(root).as_posix()
            if path.is_symlink():
                target = os.readlink(path)
                if Path(target).is_absolute() or not path.resolve().is_relative_to(root):
                    raise ValueError('External application symlink: ' + relative)
                entries.append([relative, 'link', target])
            elif path.is_dir():
                entries.append([relative, 'directory', path.stat().st_mode & 0o777])
                visit(path)
            elif path.is_file():
                entries.append([relative, 'file', path.stat().st_mode & 0o777, path.stat().st_size, digest(path)])
            else:
                raise ValueError('Unsupported application entry: ' + relative)
    visit(root)
    if not entries:
        raise ValueError('Empty application')
    return entries


def extract_app(archive_path, destination):
    destination = Path(destination)
    destination.mkdir()
    with tarfile.open(archive_path, 'r:gz') as archive:
        for member in archive.getmembers():
            parts = Path(member.name).parts
            if not parts or parts[0] != 'Novera.app' or '..' in parts or Path(member.name).is_absolute():
                raise ValueError('Archive entry escapes the application')
        archive.extractall(destination, filter='data')
    return destination / 'Novera.app'


def fixture():
    temp = require_host()
    config = json.loads((REPO / 'scripts/distribution/macos-test-model.json').read_text())
    if not re.fullmatch(r'[a-f0-9]{40}', config['revision']) or not re.fullmatch(r'[a-f0-9]{64}', config['sha256']):
        raise ValueError('Pinned model identity required')
    directory = Path(tempfile.mkdtemp(prefix='novera-model-fixture-', dir=temp))
    target = directory / 'fixture.gguf'
    url = f"https://huggingface.co/{config['repository']}/resolve/{config['revision']}/{config['file']}"
    request = urllib.request.Request(url, headers={'User-Agent': 'Novera-CI-model-fixture'})
    total = 0
    with urllib.request.urlopen(request, timeout=90) as response, target.open('xb') as out:
        while block := response.read(1024 * 1024):
            total += len(block)
            if total > config['bytes']:
                raise ValueError('Oversized model fixture')
            out.write(block)
    if total != config['bytes'] or digest(target) != config['sha256']:
        raise ValueError('Model fixture checksum mismatch')
    reports = REPO / '.build/macos-headless'
    reports.mkdir(parents=True, exist_ok=True)
    (reports / 'model-path.txt').write_text(str(target))
    (reports / 'model-fixture.json').write_text(json.dumps({**config, 'downloadVerified': True, 'packaged': False}, indent=2))


def package(probe):
    temp = require_host()
    probe = Path(probe).resolve(strict=True)
    if not probe.is_relative_to(REPO / '.build/native-update-probe'):
        raise ValueError('Owned native updater probe required')
    candidates = REPO / '.build/candidates'
    packages = candidates / 'packages'
    def one(suffix):
        files = list(packages.glob('*' + suffix))
        if len(files) != 1:
            raise ValueError('Expected one ' + suffix)
        return files[0]
    archive, dmg = one('.app.tar.gz'), one('.dmg')
    signature = Path(str(archive) + '.sig').read_text()
    app = REPO / 'src-tauri/target/release/bundle/macos/Novera.app'
    expected = manifest(app)
    for name, *_ in expected:
        if re.search(r'(?:^|/)(?:chats|threads|profiles|user-data)(?:/|$)|\.(?:gguf|safetensors|sqlite|p12|jks|keystore|map)$|(?:^|/)\.env', name, re.I):
            raise ValueError('Private/model/debug material packaged: ' + name)
    root = Path(tempfile.mkdtemp(prefix='novera-macos-headless-', dir=temp))
    installed = extract_app(archive, root / 'installed')
    if manifest(installed) != expected:
        raise RuntimeError('Updater archive differs from the built application')
    mount = root / 'mount'
    mount.mkdir()
    mounted = False
    try:
        subprocess.run(['hdiutil', 'attach', '-readonly', '-nobrowse', '-mountpoint', str(mount), str(dmg)], check=True, timeout=90)
        mounted = True
        if manifest(mount / 'Novera.app') != expected:
            raise RuntimeError('DMG and updater contain different applications')
    finally:
        if mounted:
            subprocess.run(['hdiutil', 'detach', str(mount)], check=True, timeout=90)
    profile, scratch, receipts = [root / name for name in ['profile', 'scratch', 'receipts']]
    for path in [profile, scratch, receipts]:
        path.mkdir()
    env = child_environment(profile, scratch)
    env['NOVERA_VALIDATION_ROOT'] = str(root)
    module_spec = importlib.util.spec_from_file_location('installed_validation', REPO / 'scripts/distribution/validate-installed-update.py')
    validation = importlib.util.module_from_spec(module_spec)
    module_spec.loader.exec_module(validation)
    executable = installed / 'Contents/MacOS/Novera-Desktop'
    # These checks launch no browser, capture no screenshots and inspect no pixels.
    for helper in ['bun', 'uv']:
        binary = installed / 'Contents/MacOS' / helper
        subprocess.run([str(binary), '--version'], env=env, check=True, timeout=30, capture_output=True)
    worker = installed / 'Contents/Resources/resources/bin/novera-llama-worker'
    worker_version = json.loads(subprocess.check_output([str(worker), '--version-json'], env=env, timeout=30))
    device_started = time.monotonic()
    # Cold Metal shader initialization on hosted Intel can exceed 45 seconds.
    # This is a device-enumeration budget, not the worker handshake deadline.
    device_info = json.loads(subprocess.check_output([str(worker), '--list-devices'], env=env, timeout=180))
    device_seconds = time.monotonic() - device_started
    before_smoke = validation.smoke(executable, env, receipts, 'before-update')
    platform = 'darwin-aarch64' if os.uname().machine == 'arm64' else 'darwin-x86_64'
    version = json.loads((REPO / 'src-tauri/tauri.conf.json').read_text())['version']
    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass
        def do_GET(self):
            if self.path in ['/feed.json', '/tampered.json']:
                route = '/tampered' if self.path == '/tampered.json' else '/package'
                payload = json.dumps({'version': version, 'notes': 'Disposable Mac updater fixture', 'pub_date': '2026-11-03T00:00:00Z',
                    'platforms': {platform: {'signature': signature, 'url': f'http://127.0.0.1:{self.server.server_port}' + route}}}).encode()
                self.send_response(200); self.send_header('Content-Length', str(len(payload))); self.end_headers(); self.wfile.write(payload)
            elif self.path in ['/package', '/tampered']:
                self.send_response(200); self.send_header('Content-Length', str(archive.stat().st_size)); self.end_headers()
                with archive.open('rb') as stream:
                    first = stream.read(1024 * 1024)
                    if self.path == '/tampered':
                        first = bytes([first[0] ^ 1]) + first[1:]
                    self.wfile.write(first); shutil.copyfileobj(stream, self.wfile)
            else:
                self.send_error(404)
    server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    def run_probe(mode, current, route='/feed.json'):
        request, receipt = root / (mode + '.json'), receipts / (mode + '.json')
        request.write_text(json.dumps({'endpoint': f'http://127.0.0.1:{server.server_port}' + route, 'executable': str(executable), 'mode': mode, 'currentVersion': current}))
        subprocess.run([str(probe)], env={**env, 'NOVERA_UPDATE_REQUEST': str(request), 'NOVERA_UPDATE_RECEIPT': str(receipt)}, check=True, timeout=600)
        return json.loads(receipt.read_text())
    try:
        downloaded = run_probe('download', '0.9.9')
        current = run_probe('check-current', version)
        tampered = run_probe('reject-tampered', '0.9.9', '/tampered.json')
        sentinel = profile / 'Library/Application Support/Novera/preservation-fixture.txt'
        sentinel.parent.mkdir(parents=True, exist_ok=True)
        sentinel.write_text('Synthetic profile; preserve across update.\n')
        sentinel_sha = digest(sentinel)
        marker = installed / 'Contents/Resources/resources/SIGNATURE.txt'
        marker_sha = digest(marker)
        marker.unlink()
        run_probe('install', '0.9.9')
        if not marker.is_file() or digest(marker) != marker_sha or manifest(installed) != expected:
            raise RuntimeError('Native update did not restore the exact application')
        if digest(sentinel) != sentinel_sha:
            raise RuntimeError('Native update changed synthetic user data')
        after_smoke = validation.smoke(executable, env, receipts, 'after-update')
        if not downloaded['nativeSignatureVerified'] or not current['sameVersionNotOffered'] or not tampered['tamperedPayloadRejectedByNativeVerifier']:
            raise RuntimeError('Native updater contract not satisfied')
    finally:
        server.shutdown(); server.server_close()
    frontend = json.loads((REPO / '.build/macos-headless/frontend.json').read_text())
    if frontend.get('numFailedTests') != 0 or not frontend.get('numPassedTests', 0):
        raise RuntimeError('Frontend contracts did not pass')
    for file in ['engine-tests.txt', 'updater-unit-tests.txt']:
        text = (REPO / '.build/macos-headless' / file).read_text()
        if not re.search(r'test result: ok\. [1-9][0-9]* passed;', text) or 'skipping: set JAN_TEST_GGUF' in text:
            raise RuntimeError('Missing executed tests or missing real-model fixture: ' + file)
    report = {'sourceCommit': os.environ['GITHUB_SHA'], 'runId': os.environ['GITHUB_RUN_ID'], 'architecture': os.uname().machine,
        'headlessChecksPassed': True, 'frontendTestsPassed': frontend['numPassedTests'],
        'applicationFilesCompared': len(expected), 'dmgMatchesUpdaterAndBuiltApp': True,
        'archiveSha256': digest(archive), 'dmgSha256': digest(dmg), 'workerVersion': worker_version,
        'engineDevices': device_info, 'realGgufFixtureTestsExecuted': True,
        'deviceEnumerationSeconds': device_seconds,
        'nativeUpdaterSignatureVerified': True, 'sameVersionNotOffered': True, 'tamperedPayloadRejected': True,
        'nativeUpdaterRestoresExactPayload': True, 'syntheticProfilePreserved': True,
        'beforeUpdateSmoke': before_smoke, 'afterUpdateSmoke': after_smoke,
        'visualTestsPerformed': False, 'realDeviceUIValidated': False, 'mlxInferenceValidated': False,
        'appleDistributionVerified': (candidates / 'MACOS-DISTRIBUTION.json').is_file(),
        'publicReleasePublished': False, 'upgradeBetweenTwoPublicVersionsValidated': False,
        'limitations': ['No visual/UI assertions.', 'Small CPU fixture is not a performance or model-quality benchmark.',
                        'MLX inference requires a suitable Apple Silicon GPU test host.',
                        'Developer ID and notarization require separately configured Apple credentials.']}
    (candidates / 'MACOS-HEADLESS.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('mode', choices=['fixture', 'package'])
    parser.add_argument('--probe', type=Path)
    args = parser.parse_args()
    if args.mode == 'fixture':
        fixture()
    else:
        if not args.probe:
            parser.error('--probe is required for package validation')
        package(args.probe)
