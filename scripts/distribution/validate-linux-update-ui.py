"""Exercise the real signed AppImage's manual check via native WebKit WebDriver.

Uses Tauri's documented external driver, without e2e features or IPC mocks.
Checks an unavailable feed or an already-current release: never installs an update.
"""
import base64
import datetime
import hashlib
import json
import os
import re
from pathlib import Path
import shutil
import signal
import subprocess
import sys
import tempfile
import time
import urllib.error
import urllib.request

FEED = 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json'


def expected_message(status, feed, version):
    if status == 404:
        return 'Failed to check for updates'
    if status != 200 or not isinstance(feed, dict):
        raise RuntimeError('Unexpected production feed response')
    remote = feed.get('version', '')
    if not re.fullmatch(r'\d+\.\d+\.\d+', remote) or not re.fullmatch(r'\d+\.\d+\.\d+', version):
        raise RuntimeError('Canonical release versions required')
    entry = feed.get('platforms', {}).get('linux-x86_64', {})
    if not entry.get('url', '').startswith('https://github.com/TRON-ABS/Novera/releases/download/v'+remote+'/') or not entry.get('signature'):
        raise RuntimeError('Missing official signed Linux feed entry')
    if tuple(map(int, remote.split('.'))) > tuple(map(int, version.split('.'))):
        raise RuntimeError('Offered updates require a separate installation scenario')
    return "You're running the latest version"


def wait_for(operation, timeout=60):
    deadline = time.monotonic() + timeout
    last = None
    while time.monotonic() < deadline:
        try:
            result = operation()
            if result:
                return result
        except (OSError, ValueError, RuntimeError) as error:
            last = error
        time.sleep(0.2)
    raise RuntimeError(f'UI condition timed out: {last}')


def main():
    if sys.platform != 'linux' or os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise RuntimeError('Requires an isolated Linux GitHub Actions runner')
    runner_temp = Path(os.environ['RUNNER_TEMP']).resolve(strict=True)
    auto_tune = len(sys.argv) == 3 and sys.argv[1] == '--auto-tune'
    if auto_tune:
        out = Path('.build/validation').resolve()
        out.mkdir(parents=True, exist_ok=True)
        candidate = Path(sys.argv[2]).resolve(strict=True)
        if not candidate.is_relative_to(runner_temp) or candidate.suffix != '.AppImage':
            raise RuntimeError('Use the isolated signed AppImage')
        packages = [candidate]
    else:
        out = Path('.build/candidates').resolve(strict=True)
        packages = list((out/'packages').glob('Novera_*_amd64.AppImage'))
    if len(packages) != 1:
        raise RuntimeError('Expected one signed Linux updater AppImage')
    app = packages[0].resolve(strict=True)
    driver = shutil.which('tauri-driver')
    if not driver or not shutil.which('WebKitWebDriver'):
        raise RuntimeError('Native WebKit WebDriver prerequisites missing')
    request = urllib.request.Request(FEED, headers={'User-Agent': 'Novera-UI-validation'})
    feed = None
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
            if status == 200:
                feed = json.loads(response.read(1024*1024))
    except urllib.error.HTTPError as error:
        status = error.code
    version = json.loads(Path('src-tauri/tauri.conf.json').read_text())['version']
    message = expected_message(status, feed, version)

    root = Path(tempfile.mkdtemp(prefix='novera-linux-ui-', dir=runner_temp))
    profile = root/'profile'
    env = {k:v for k,v in os.environ.items() if not any(s in k.upper() for s in ['TOKEN','PASSWORD','SECRET','PRIVATE_KEY'])}
    mapping = {'HOME':profile, 'XDG_DATA_HOME':profile/'.local/share', 'XDG_CONFIG_HOME':profile/'.config', 'XDG_CACHE_HOME':profile/'.cache', 'TMPDIR':root/'tmp'}
    for key, location in mapping.items():
        location.mkdir(parents=True, exist_ok=True)
        env[key] = str(location)
    data = mapping['XDG_DATA_HOME']/'Novera/data'
    data.mkdir(parents=True)
    # Test setup only: avoid the unrelated background embedding download.
    (data/'settings.json').write_text(json.dumps({'llamacpp-embedder-bootstrapped':'true'}))
    env.update(APPIMAGE_EXTRACT_AND_RUN='1', TAURI_WEBVIEW_AUTOMATION='true', LANG='en_US.UTF-8', LANGUAGE='en')
    env.pop('CI', None)
    app.chmod(app.stat().st_mode | 0o111)
    session = None
    process = None
    receipt = {'sourceCommit':os.environ['GITHUB_SHA'], 'platform':'linux-x86_64', 'checkedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(), 'feed':FEED, 'feedStatus':status, 'appImageSha256':hashlib.sha256(app.read_bytes()).hexdigest(), 'nativeUiCheckPassed':False, 'updateInstalled':False, 'productionChannelValidated':False, 'limitations':['Direct native Settings route in a fresh profile; onboarding and model setup are not covered', 'Only the unavailable production feed error route; no offered update or installation']}
    base = 'http://127.0.0.1:4444'

    def call(method, route, body=None):
        request = urllib.request.Request(base+route, method=method, data=json.dumps(body).encode() if body is not None else None, headers={'Content-Type':'application/json'})
        try:
            with urllib.request.urlopen(request, timeout=120) as response:
                result = json.load(response)
        except urllib.error.HTTPError as error:
            raise RuntimeError(error.read(2000).decode(errors='replace')) from error
        value = result.get('value')
        if isinstance(value, dict) and value.get('error'):
            raise RuntimeError(str(value))
        return value

    def execute(script):
        return call('POST', f'/session/{session}/execute/sync', {'script':script, 'args':[]})

    with (out/'LINUX-UPDATER-UI.log').open('w') as log:
        try:
            process = subprocess.Popen([driver, '--port', '4444'], env=env, stdout=log, stderr=subprocess.STDOUT, start_new_session=True)
            wait_for(lambda: call('GET','/status'))
            result = call('POST','/session', {'capabilities':{'alwaysMatch':{'browserName':'wry', 'tauri:options':{'application':str(app)}}}})
            session = result['sessionId']
            wait_for(lambda: execute('return document.readyState === "complete"'))
            def app_origin():
                origin = execute('return location.origin')
                return origin if origin in ['tauri://localhost', 'http://tauri.localhost'] else None
            origin = wait_for(app_origin)
            if auto_tune:
                call('POST', f'/session/{session}/url', {'url':origin+'/'})
                source = (Path(__file__).parent/'auto-tune-smoke.js').read_text(encoding='utf8').removeprefix('export ')
                script = source + "\nconst done = arguments[arguments.length - 1]; checkAutoTune().then(done, e => done({error: String(e)}));"
                result = call('POST', f'/session/{session}/execute/async', {'script':script,'args':[]})
                if not result.get('nativeToggleVerified') or not result.get('initialStateRestored'):
                    raise RuntimeError(f'Auto Tune native smoke failed: {result}')
                receipt['autoTune'] = result
                return
            call('POST', f'/session/{session}/url', {'url':origin+'/settings/general'})
            xpath = "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check for updates')]"
            button = wait_for(lambda: call('POST', f'/session/{session}/element', {'using':'xpath', 'value':xpath}))
            element = button['element-6066-11e4-a52e-4f735466cecf']
            call('POST',f'/session/{session}/element/{element}/click', {})
            wait_for(lambda: execute('return document.body.innerText').find(message) >= 0)
            text = execute('return document.body.innerText')
            opposite = "You're running the latest version" if status == 404 else 'Failed to check for updates'
            if opposite in text:
                raise RuntimeError('UI result disagrees with the actual production feed')
            # WebKit can reset the screenshot connection while the live session
            # remains usable. Require a real screenshot after a bounded retry.
            screenshot = wait_for(lambda: call('GET',f'/session/{session}/screenshot'), timeout=15)
            (out/'LINUX-UPDATER-UI.png').write_bytes(base64.b64decode(screenshot))
            receipt.update(nativeUiCheckPassed=True, observedMessage=message, visibleText=text, settingsOrigin=origin, productionFeedReachable=status==200)
            if status == 404:
                receipt['observedError'] = message
            receipt['limitations'] = ['Direct native Settings route; onboarding and model setup are not covered', 'Manual check only; no offered update or installation']
        except Exception as error:
            receipt['error'] = str(error)
            if session:
                try:
                    receipt['visibleTextAtFailure'] = execute('return document.body.innerText')
                    screenshot = call('GET',f'/session/{session}/screenshot')
                    (out/'LINUX-UPDATER-UI.png').write_bytes(base64.b64decode(screenshot))
                except Exception:
                    pass
            raise
        finally:
            if session:
                try:
                    call('DELETE',f'/session/{session}')
                except Exception:
                    pass
            if process:
                try:
                    os.killpg(process.pid, signal.SIGTERM)
                    process.wait(timeout=10)
                except (ProcessLookupError, subprocess.TimeoutExpired):
                    pass
            (out/('LINUX-AUTO-TUNE.json' if auto_tune else 'LINUX-UPDATER-UI.json')).write_text(json.dumps(receipt,indent=2)+'\n')
    print('Real Linux AppImage manual check matches the production feed')


if __name__ == '__main__':
    main()
