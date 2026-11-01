"""Exercise the real signed AppImage's manual check via native WebKit WebDriver.

Uses Tauri's documented external driver, without e2e features or IPC mocks.
Only the manual error route is covered: this never installs an update.
"""
import base64
import datetime
import hashlib
import json
import os
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
    out = Path('.build/candidates').resolve(strict=True)
    packages = list((out/'packages').glob('Novera_*_amd64.AppImage'))
    if len(packages) != 1:
        raise RuntimeError('Expected one signed Linux updater AppImage')
    app = packages[0].resolve(strict=True)
    driver = shutil.which('tauri-driver')
    if not driver or not shutil.which('WebKitWebDriver'):
        raise RuntimeError('Native WebKit WebDriver prerequisites missing')
    request = urllib.request.Request(FEED, headers={'User-Agent': 'Novera-UI-validation'})
    try:
        with urllib.request.urlopen(request, timeout=30) as response:
            status = response.status
    except urllib.error.HTTPError as error:
        status = error.code
    if status != 404:
        raise RuntimeError(f'This unavailable-feed regression requires HTTP 404, observed {status}')

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
            call('POST', f'/session/{session}/url', {'url':origin+'/settings/general'})
            xpath = "//button[contains(translate(normalize-space(.), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'check for updates')]"
            button = wait_for(lambda: call('POST', f'/session/{session}/element', {'using':'xpath', 'value':xpath}))
            element = button['element-6066-11e4-a52e-4f735466cecf']
            call('POST',f'/session/{session}/element/{element}/click', {})
            message = 'Failed to check for updates'
            wait_for(lambda: execute('return document.body.innerText').find(message) >= 0)
            text = execute('return document.body.innerText')
            if "You're running the latest version" in text:
                raise RuntimeError('UI falsely claims the installation is up to date')
            screenshot = call('GET',f'/session/{session}/screenshot')
            (out/'LINUX-UPDATER-UI.png').write_bytes(base64.b64decode(screenshot))
            receipt.update(nativeUiCheckPassed=True, observedError=message, visibleText=text, settingsOrigin=origin)
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
            (out/'LINUX-UPDATER-UI.json').write_text(json.dumps(receipt,indent=2)+'\n')
    print('Real Linux AppImage manual check displays the production-feed error')


if __name__ == '__main__':
    main()
