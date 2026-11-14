"""Owned iPhone simulators only: package, startup and reinstall, no visual QA."""
from pathlib import Path
import hashlib
import json
import os
import plistlib
import re
import struct
import subprocess
import sys
import time
import uuid

REPO = Path(__file__).resolve().parents[2]


def inspect_simulator_binary(data):
    if len(data) < 32 or struct.unpack_from('<II', data) != (0xfeedfacf, 0x100000c):
        raise ValueError('Expected an ARM64 Mach-O simulator binary')
    count, size = struct.unpack_from('<II', data, 16)
    end = 32 + size
    if end > len(data):
        raise ValueError('Truncated simulator load commands')
    offset = 32
    platforms = []
    for _ in range(count):
        if offset + 8 > end:
            raise ValueError('Truncated simulator command')
        command, length = struct.unpack_from('<II', data, offset)
        if length < 8 or offset + length > end:
            raise ValueError('Invalid simulator command')
        if command == 0x32:
            if length < 24:
                raise ValueError('Invalid simulator platform command')
            platforms.append(struct.unpack_from('<I', data, offset + 8)[0])
        offset += length
    if platforms != [7]:
        raise ValueError('A device or desktop binary cannot stand in for an iPhone simulator')


def owned_uuid(value):
    if str(uuid.UUID(value)).lower() != value.lower():
        raise ValueError('Exact owned simulator UUID required')
    return value


def run(*args, timeout=120):
    return subprocess.check_output(list(args), text=True, stderr=subprocess.STDOUT, timeout=timeout).strip()


def main():
    if sys.platform != 'darwin' or os.environ.get('GITHUB_ACTIONS') != 'true' or os.environ.get('RUNNER_ENVIRONMENT') != 'github-hosted':
        raise RuntimeError('Disposable macOS GitHub runner required')
    base = REPO / 'src-tauri/gen/apple/build'
    apps = [p for p in base.rglob('*.app') if re.search(r'arm64-sim|iphonesimulator', str(p), re.I)]
    if len(apps) != 1:
        raise RuntimeError('Expected exactly one generated iOS simulator app')
    app = apps[0]
    info = plistlib.loads((app / 'Info.plist').read_bytes())
    config = json.loads((REPO / 'src-tauri/tauri.ios.conf.json').read_text())
    version, build = info.get('CFBundleShortVersionString'), info.get('CFBundleVersion')
    if version != config['version'] or build != config['bundle']['iOS']['bundleVersion'] or not re.fullmatch(r'[0-9]{3}', build):
        raise RuntimeError(f'Unexpected simulator app version or build: {version}, {build}')
    if info.get('CFBundleSupportedPlatforms') != ['iPhoneSimulator']:
        raise RuntimeError('Device package cannot be advertised as simulator proof')
    executable = app / info['CFBundleExecutable']
    inspect_simulator_binary(executable.read_bytes()[:65536])
    bundle = info['CFBundleIdentifier']
    if not bundle.startswith('io.github.tronabs.novera'):
        raise ValueError('Unexpected app identity')
    listing = json.loads(run('xcrun', 'simctl', 'list', 'devices', 'available', '--json'))['devices']
    types = {item['name']: item['identifier'] for item in
             json.loads(run('xcrun', 'simctl', 'list', 'devicetypes', '--json'))['devicetypes']}
    phones = [(runtime, phone) for runtime, devices in listing.items() if '.iOS-' in runtime
              for phone in devices if phone.get('isAvailable') and phone['name'].startswith('iPhone')]
    if not phones:
        raise RuntimeError('No available iPhone simulator')
    large = next((item for item in reversed(phones) if 'Max' in item[1]['name'] or 'Plus' in item[1]['name']), None)
    compact = next((item for item in reversed(phones) if 'Max' not in item[1]['name'] and 'Plus' not in item[1]['name']), None)
    selected = [item for item in (compact, large) if item is not None]
    results = []
    for runtime, phone in selected:
        kind = phone.get('deviceTypeIdentifier') or types.get(phone['name'])
        if not kind:
            raise RuntimeError(f"Unknown simulator type: {phone['name']}")
        try:
            device = owned_uuid(run('xcrun', 'simctl', 'create', 'Novera-CI-' + uuid.uuid4().hex[:8], kind, runtime))
        except subprocess.CalledProcessError as exc:
            raise RuntimeError(f'Could not create {kind} on {runtime}: {exc.output}') from exc
        try:
            run('xcrun', 'simctl', 'boot', device)
            run('xcrun', 'simctl', 'bootstatus', device, '-b', timeout=240)
            run('xcrun', 'simctl', 'install', device, str(app))
            def launch():
                response = run('xcrun', 'simctl', 'launch', '--terminate-running-process', device, bundle)
                match = re.search(r': (\d+)$', response)
                if not match:
                    raise RuntimeError('No app PID from simulator launch')
                time.sleep(12)
                jobs = run('xcrun', 'simctl', 'spawn', device, 'launchctl', 'list')
                if not any(bundle in line and re.match(r'\s*' + match[1] + r'\s', line) for line in jobs.splitlines()):
                    raise RuntimeError('Application exited during simulator startup')
                return int(match[1])
            first = launch()
            container = Path(run('xcrun', 'simctl', 'get_app_container', device, bundle, 'data')).resolve()
            owner = Path.home() / 'Library/Developer/CoreSimulator/Devices' / device
            if not container.is_relative_to(owner.resolve()):
                raise ValueError('Container is outside the owned simulator')
            sentinel = container / 'Documents/novera-ci-preservation.txt'
            sentinel.parent.mkdir(exist_ok=True)
            sentinel.write_text('Synthetic iOS reinstall preservation fixture.\n')
            expected = sentinel.read_bytes()
            run('xcrun', 'simctl', 'terminate', device, bundle)
            run('xcrun', 'simctl', 'install', device, str(app))
            second = launch()
            after = Path(run('xcrun', 'simctl', 'get_app_container', device, bundle, 'data')) / 'Documents/novera-ci-preservation.txt'
            if after.read_bytes() != expected:
                raise RuntimeError('Reinstall did not preserve synthetic container data')
            results.append({'deviceName': phone['name'], 'runtime': runtime, 'launchBeforeReinstall': first > 0,
                            'launchAfterReinstall': second > 0, 'syntheticContainerPreserved': True,
                            'processAliveAfterSeconds': 12, 'interfaceInteractionValidated': False})
        finally:
            subprocess.run(['xcrun', 'simctl', 'shutdown', device], capture_output=True, timeout=60)
            subprocess.run(['xcrun', 'simctl', 'delete', device], check=True, capture_output=True, timeout=60)
    frontend = json.loads((REPO / '.build/ios-headless/frontend.json').read_text())
    if frontend.get('numFailedTests') != 0 or not frontend.get('numPassedTests', 0):
        raise RuntimeError('Frontend contracts failed')
    report = {'sourceCommit': os.environ['GITHUB_SHA'], 'runId': os.environ['GITHUB_RUN_ID'], 'bundleId': bundle,
        'appVersion': version, 'buildNumber': build, 'simulatorOnly': True,
        'simulatorBinarySha256': hashlib.sha256(executable.read_bytes()).hexdigest(),
        'frontendTestsPassed': frontend['numPassedTests'], 'devices': results,
        'sharedPaletteSha256': hashlib.sha256((REPO / 'web-app/src/index.css').read_bytes()).hexdigest(),
        'visualTestsPerformed': False, 'realDeviceValidated': False, 'deviceInstallableDistribution': False,
        'clipboardInteractionValidated': False, 'publicReleasePublished': False,
        'limitations': ['Simulator process/reinstall checks do not prove rendered UI, native clipboard or iPhone hardware behavior.',
                        'An iPhone distribution requires Apple signing/provisioning and its distribution channel.']}
    (REPO / '.build/candidates/IOS-HEADLESS.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))


if __name__ == '__main__':
    main()
