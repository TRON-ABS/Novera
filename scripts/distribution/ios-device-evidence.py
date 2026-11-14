"""Verify an unsigned iPhone archive and record its build metadata."""
import json
import plistlib
from pathlib import Path
import subprocess


def main():
    base = Path('src-tauri/gen/apple')
    archives = list(base.rglob('*.xcarchive'))
    if len(archives) != 1:
        raise RuntimeError(f'Expected one iPhone archive, found {len(archives)}')
    apps = list((archives[0] / 'Products/Applications').glob('*.app'))
    if len(apps) != 1:
        raise RuntimeError(f'Expected one archived app, found {len(apps)}')
    app = apps[0]
    info = plistlib.loads((app / 'Info.plist').read_bytes())
    config = json.loads(Path('src-tauri/tauri.ios.conf.json').read_text())
    expected = {
        'CFBundleIdentifier': config['identifier'],
        'CFBundleShortVersionString': config['version'],
        'CFBundleVersion': config['bundle']['iOS']['bundleVersion'],
        'CFBundleSupportedPlatforms': ['iPhoneOS'],
    }
    for key, value in expected.items():
        if info.get(key) != value:
            raise RuntimeError(f'{key}: expected {value!r}, found {info.get(key)!r}')
    executable = app / info['CFBundleExecutable']
    architectures = subprocess.check_output(['lipo', '-archs', executable], text=True).split()
    if architectures != ['arm64']:
        raise RuntimeError(f'Expected only arm64, found {architectures}')
    report = {
        **expected,
        'minimumOSVersion': info['MinimumOSVersion'],
        'architecture': 'arm64',
        'archive': str(archives[0]),
        'deviceInstallTested': False,
        'testFlightUploaded': False,
    }
    output = Path('.build/candidates/IOS-DEVICE.json')
    output.write_text(json.dumps(report, indent=2) + '\n')
    print(output.read_text(), end='')


if __name__ == '__main__':
    main()
