"""Create a version-bound CLI archive from the freshly compiled CI executable."""
from pathlib import Path
import hashlib, json, os, re, sys, zipfile

def package(binary, folder, version, platform, commit):
    if not re.fullmatch(r'[0-9]+\.[0-9]+\.[0-9]+', version):
        raise ValueError('Stable CLI version required')
    if platform not in ['windows-x86_64', 'linux-x86_64', 'darwin-aarch64'] or not re.fullmatch(r'[a-f0-9]{40}', commit):
        raise ValueError('Reviewed CLI platform and source commit required')
    name = 'jan.exe' if platform.startswith('windows-') else 'jan'
    data = binary.read_bytes()
    identity = dict(formatVersion=1, product='Novera CLI', version=version, platform=platform,
                    binary=name, binarySha256=hashlib.sha256(data).hexdigest(), commit=commit)
    folder.mkdir(parents=True, exist_ok=True)
    archive = folder/f'Novera_CLI_{version}_{platform}.zip'
    with zipfile.ZipFile(archive, 'x', compression=zipfile.ZIP_DEFLATED) as target:
        target.writestr(name, data)
        target.writestr('CLI-UPDATE.json', json.dumps(identity, indent=2)+'\n')
    return archive

if __name__ == '__main__':
    if os.environ.get('GITHUB_ACTIONS') != 'true':
        raise SystemExit('Signed candidate packaging requires GitHub Actions')
    print(package(Path(sys.argv[1]), Path(sys.argv[2]), *sys.argv[3:]))
