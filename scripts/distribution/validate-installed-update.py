"""Run real package installation and native updater integration on disposable CI hosts.

The probe uses a synthetic earlier version and loopback feed. This deliberately
does not claim an end-to-end upgrade between two released Novera applications.
"""
from pathlib import Path
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import hashlib, json, os, re, shutil, signal, subprocess, sys, tarfile, tempfile, threading, time, urllib.request, urllib.error

REPO = Path(__file__).resolve().parents[2]

def digest(path):
    result = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024*1024), b''):
            result.update(block)
    return result.hexdigest()

def require_ci():
    if os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise RuntimeError('Real installation tests require disposable GitHub-hosted runners')
    return Path(os.environ['RUNNER_TEMP']).resolve(strict=True)

def download(record, destination):
    validate_asset(record)
    token = os.environ['GH_TOKEN']
    class NoRedirect(urllib.request.HTTPRedirectHandler):
        def redirect_request(self, *args): return None
    request = urllib.request.Request(
        f"https://api.github.com/repos/TRON-ABS/Novera/releases/assets/{record['id']}",
        headers={'Authorization': 'Bearer '+token, 'Accept': 'application/octet-stream', 'User-Agent': 'Novera-validation'})
    try:
        response = urllib.request.build_opener(NoRedirect).open(request, timeout=90)
    except urllib.error.HTTPError as error:
        if error.code not in [301, 302, 303, 307, 308]: raise
        redirect = error.headers['Location']
        from urllib.parse import urlsplit
        url = urlsplit(redirect)
        if url.scheme != 'https' or not url.hostname.endswith('.githubusercontent.com'):
            raise RuntimeError('Unexpected GitHub asset download host')
        # The signed storage request must not receive the GitHub credential.
        response = urllib.request.urlopen(redirect, timeout=180)
    with response, destination.open('xb') as target:
        shutil.copyfileobj(response, target, 1024*1024)
    if destination.stat().st_size != record['bytes'] or digest(destination) != record['sha256']:
        raise RuntimeError('Downloaded candidate differs from the reviewed asset')

def validate_asset(record):
    if not re.fullmatch(r'[A-Za-z0-9_.-]+',record['name']) or record['name'] in {'.','..'}:
        raise ValueError('Asset names must be plain reviewed filenames')
    if not re.fullmatch(r'[a-f0-9]{64}',record['sha256']):
        raise ValueError('Asset must have an exact SHA-256 digest')
    if not isinstance(record['id'],int) or record['id']<=0 or not isinstance(record['bytes'],int) or not 0<record['bytes']<2*1024**3:
        raise ValueError('Invalid asset identity or size')

def wait_for(predicate, seconds, description):
    until = time.monotonic()+seconds
    while time.monotonic() < until:
        if predicate(): return
        time.sleep(1)
    raise RuntimeError('Timed out: '+description)

def stop_owned_app(executable):
    if sys.platform == 'win32':
        # Exact executable path inside the dedicated runner directory only.
        env = dict(os.environ, NOVERA_TEST_EXE=str(executable))
        subprocess.run(['powershell', '-NoProfile', '-Command',
            'Get-Process -ErrorAction SilentlyContinue | Where-Object { $_.Path -eq $env:NOVERA_TEST_EXE } | Stop-Process -Force'], env=env, check=True)

def windows_updater_finished(root):
    env=dict(os.environ,NOVERA_TEST_SCRATCH=str(root/'scratch'))
    result=subprocess.run(['powershell','-NoProfile','-Command',
        "$items=@(Get-CimInstance Win32_Process | Where-Object { $_.ExecutablePath -and $_.ExecutablePath.StartsWith($env:NOVERA_TEST_SCRATCH, [StringComparison]::OrdinalIgnoreCase) -and $_.ExecutablePath -like '*installer*.exe' }); Write-Output $items.Count"],env=env,capture_output=True,text=True,check=True)
    return result.stdout.strip()=='0'

def runtime_hashes(executable):
    if sys.platform=='darwin': base=executable.parent.parent.parent
    elif sys.platform=='win32': base=executable.parent
    else: return {executable.name:digest(executable)}
    return {p.relative_to(base).as_posix():digest(p) for p in base.rglob('*') if p.is_file() and p.name.lower()!='uninstall.exe'}

def smoke(executable, env, receipt_dir, label):
    output = receipt_dir/(label+'-startup.log')
    kwargs = {'env': env, 'stdout': output.open('wb'), 'stderr': subprocess.STDOUT}
    if sys.platform == 'win32':
        info = subprocess.STARTUPINFO(); info.dwFlags |= subprocess.STARTF_USESHOWWINDOW; info.wShowWindow = 0
        kwargs['startupinfo'] = info
    else:
        kwargs['start_new_session'] = True
    process = subprocess.Popen([str(executable)], **kwargs)
    try:
        time.sleep(15)
        if process.poll() is not None:
            kwargs['stdout'].flush()
            diagnostic=output.read_bytes()[-12000:].decode('utf-8',errors='replace')
            raise RuntimeError(f'Packaged application exited during {label}: {process.returncode}\nStartup diagnostic from isolated profile:\n{diagnostic}')
        return {'processAliveAfterSeconds': 15, 'interfaceInteractionValidated': False}
    finally:
        if process.poll() is None:
            if sys.platform == 'win32':
                subprocess.run(['taskkill', '/PID', str(process.pid), '/T', '/F'], capture_output=True)
                stop_owned_app(executable)
            else:
                os.killpg(process.pid, signal.SIGTERM)
            try: process.wait(timeout=20)
            except subprocess.TimeoutExpired:
                if sys.platform != 'win32': os.killpg(process.pid, signal.SIGKILL)
                else: process.kill()
                process.wait()
        kwargs['stdout'].close()

def main():
    runner_temp = require_ci()
    platform = sys.argv[1]
    probe = Path(sys.argv[2]).resolve(strict=True)
    config = json.loads((REPO/'scripts/distribution/validation-assets.json').read_text())
    selected = config['platforms'][platform]
    root = Path(tempfile.mkdtemp(prefix='novera-install-validation-', dir=runner_temp))
    downloads = root/'downloads'; downloads.mkdir()
    receipts = root/'receipts'; receipts.mkdir()
    bundle = downloads/selected['bundle']['name']; signature = downloads/selected['signature']['name']
    download(selected['bundle'], bundle); download(selected['signature'], signature)
    # No credential is forwarded to the application, local server, or probe.
    env = {k:v for k,v in os.environ.items() if not any(marker in k.upper() for marker in ['TOKEN','PASSWORD','PRIVATE_KEY','SECRET'])}
    profile = root/'profile'; profile.mkdir()
    for name in ['HOME','USERPROFILE','APPDATA','LOCALAPPDATA','XDG_CONFIG_HOME','XDG_DATA_HOME','XDG_CACHE_HOME']:
        location = profile/name.lower(); location.mkdir(); env[name] = str(location)
    env['NOVERA_VALIDATION_ROOT'] = str(root)
    env['APPIMAGE_EXTRACT_AND_RUN'] = '1'
    scratch=root/'scratch';scratch.mkdir()
    for name in ['TEMP','TMP','TMPDIR']:env[name]=str(scratch)
    if platform.startswith('windows-'):
        executable = root/'installed'/'Novera-Desktop.exe'
        missing_resource = executable.parent/'resources/SIGNATURE.txt'
    elif platform.startswith('darwin-'):
        executable = root/'installed/Novera.app/Contents/MacOS/Novera-Desktop'
        missing_resource = executable.parent.parent/'Resources/resources/SIGNATURE.txt'
    else:
        executable = root/'installed/Novera.AppImage'
        missing_resource = None
    executable.parent.mkdir(parents=True)
    executable.touch()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *args): pass
        def do_GET(self):
            if self.path in ['/feed.json', '/tampered.json']:
                payload_route = '/tampered' if self.path == '/tampered.json' else '/package'
                manifest = {'version':config['applicationVersion'], 'notes':'Isolated native updater integration fixture',
                    'pub_date':'2026-11-01T00:00:00Z', 'platforms':{platform:{'signature':signature.read_text(), 'url':f'http://127.0.0.1:{self.server.server_port}'+payload_route}}}
                data = json.dumps(manifest).encode()
                self.send_response(200); self.send_header('Content-Type','application/json'); self.send_header('Content-Length',str(len(data))); self.end_headers(); self.wfile.write(data)
            elif self.path in ['/package','/tampered']:
                self.send_response(200); self.send_header('Content-Length',str(bundle.stat().st_size)); self.end_headers()
                with bundle.open('rb') as stream:
                    first = stream.read(1024*1024)
                    if self.path == '/tampered': first=bytes([first[0]^1])+first[1:]
                    self.wfile.write(first); shutil.copyfileobj(stream,self.wfile,1024*1024)
            else: self.send_error(404)
    server = ThreadingHTTPServer(('127.0.0.1',0),Handler)
    thread = threading.Thread(target=server.serve_forever,daemon=True);thread.start()
    def run_probe(mode, version, route='/feed.json'):
        request=root/(mode+'.json'); receipt=receipts/(mode+'.json')
        request.write_text(json.dumps({'endpoint':f'http://127.0.0.1:{server.server_port}'+route,'executable':str(executable),'mode':mode,'currentVersion':version}))
        probe_env=dict(env,NOVERA_UPDATE_REQUEST=str(request),NOVERA_UPDATE_RECEIPT=str(receipt))
        subprocess.run([str(probe)],env=probe_env,check=True,timeout=600)
        return json.loads(receipt.read_text())
    try:
        native_download=run_probe('download','0.9.9')
        if not native_download['nativeSignatureVerified']: raise RuntimeError('Native signature was not verified')
        same_version=run_probe('check-current',config['applicationVersion'])
        tampered=run_probe('reject-tampered','0.9.9','/tampered.json')
        if platform.startswith('windows-'):
            subprocess.run([str(bundle),'/S','/CURRENTUSER','/D='+str(executable.parent)],env=env,check=True,timeout=600)
            wait_for(lambda: executable.stat().st_size>1024 and missing_resource.is_file(),180,'initial NSIS installation')
        elif platform.startswith('darwin-'):
            # Python's data filter rejects escaping archive paths and symlinks.
            with tarfile.open(bundle,'r:gz') as archive:
                archive.extractall(root/'installed',filter='data')
        else:
            shutil.copyfile(bundle,executable); executable.chmod(0o755)
        initial_smoke=smoke(executable,env,receipts,'before-update')
        expected_executable=digest(executable)
        expected_runtime=runtime_hashes(executable)
        if sys.platform == 'win32': data_dir=Path(env['APPDATA'])/'Novera'
        elif sys.platform == 'darwin': data_dir=Path(env['HOME'])/'Library/Application Support/Novera'
        else: data_dir=Path(env['XDG_DATA_HOME'])/'Novera'
        data_dir.mkdir(parents=True,exist_ok=True)
        sentinel=data_dir/'update-preservation-sentinel.txt'; sentinel.write_text('Synthetic CI data: preserve across updates.\n')
        sentinel_digest=digest(sentinel)
        if missing_resource:
            expected_resource=digest(missing_resource)
            missing_resource.unlink()  # Owned test installation only; prove the installer actually restores it.
        else:
            with executable.open('ab') as stream: stream.write(b'\nNovera isolated replacement probe\n')
        stop_owned_app(executable)
        installation=run_probe('install','0.9.9')
        if missing_resource:
            wait_for(lambda: missing_resource.is_file() and digest(missing_resource)==expected_resource,180,'updater restoration of installed resource')
        if sys.platform=='win32':wait_for(lambda: windows_updater_finished(root),180,'native updater installer completion')
        wait_for(lambda: digest(executable)==expected_executable,180,'updated application payload')
        stop_owned_app(executable)
        if runtime_hashes(executable)!=expected_runtime:raise RuntimeError('Installed runtime differs after the native update')
        if digest(sentinel)!=sentinel_digest: raise RuntimeError('Update changed unrelated synthetic profile data')
        final_smoke=smoke(executable,env,receipts,'after-update')
        report={'platform':platform,'compilationCommit':selected['commit'],'sourceReleaseId':config['releaseId'],
            'bundleSha256':selected['bundle']['sha256'],'initialInstallationPerformed':True,
            'nativeUpdaterSignatureVerified':True,'tamperedPayloadRejected':tampered['tamperedPayloadRejectedByNativeVerifier'],
            'sameVersionNotOffered':same_version['sameVersionNotOffered'],
            'nativeUpdaterInstallationRestoredExpectedPayload':True,'syntheticProfileSentinelPreserved':True,
            'installedRuntimeFileHashesMatchBeforeAfter':True,'installedRuntimeFilesCompared':len(expected_runtime),
            'beforeUpdateSmoke':initial_smoke,'afterUpdateSmoke':final_smoke,
            'updaterProbeVersion':'0.9.9','candidateVersion':config['applicationVersion'],
            'productionUiEndToEndValidated':False,'upgradeBetweenTwoReleasedApplicationsValidated':False,
            'releasePublicationAuthorizedByThisTest':False}
        destination=REPO/'.build/validation';destination.mkdir(parents=True,exist_ok=True)
        (destination/(platform+'.json')).write_text(json.dumps(report,indent=2)+'\n')
        print(json.dumps(report,indent=2))
    finally:
        server.shutdown();server.server_close()

if __name__=='__main__':
    try:
        main()
    except Exception as error:
        # Only the dedicated test profile is used; app/probe environments contain
        # no credentials. Retain bounded startup output to diagnose real crashes.
        if os.environ.get('GITHUB_ACTIONS')=='true':
            destination=REPO/'.build/validation';destination.mkdir(parents=True,exist_ok=True)
            platform=sys.argv[1] if len(sys.argv)>1 else 'unknown'
            if re.fullmatch(r'[a-z0-9_-]+',platform):
                (destination/(platform+'-failure.json')).write_text(json.dumps({'platform':platform,'validationPassed':False,'error':str(error)[-16000:]},indent=2)+'\n')
        raise
