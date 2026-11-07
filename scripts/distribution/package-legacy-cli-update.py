"""Wrap the unchanged, verified current CLI for the original format-1 updater."""
from pathlib import Path
import hashlib
import importlib.util
import json
import sys
import zipfile

spec = importlib.util.spec_from_file_location('canonical_cli_package', Path(__file__).with_name('package-cli-update.py'))
canonical = importlib.util.module_from_spec(spec)
spec.loader.exec_module(canonical)


def package(source, output, version, platform, commit):
    identity = canonical.inspect_package(source, version, platform, commit)
    with zipfile.ZipFile(source) as archive:
        binary = archive.read(identity['binary'])
    name = 'jan.exe' if platform.startswith('windows-') else 'jan'
    legacy = {**identity, 'formatVersion': 1, 'binary': name}
    output.mkdir(parents=True, exist_ok=True)
    target = output / f'Novera_CLI_{version}_{platform}.zip'
    with zipfile.ZipFile(target, 'x', compression=zipfile.ZIP_DEFLATED) as archive:
        info = zipfile.ZipInfo(name)
        info.external_attr = 0o100755 << 16
        archive.writestr(info, binary, compress_type=zipfile.ZIP_DEFLATED)
        archive.writestr('CLI-UPDATE.json', json.dumps(legacy, indent=2) + '\n')
    executable = output / name
    with executable.open('xb') as stream:
        stream.write(binary)
    executable.chmod(0o755)
    return dict(version=version, platform=platform, compilationCommit=commit,
                canonicalArchiveSha256=hashlib.sha256(source.read_bytes()).hexdigest(),
                binarySha256=identity['binarySha256'], binaryBytesUnchanged=True,
                legacyIdentity=legacy, archive=str(target), executable=str(executable))


if __name__ == '__main__':
    print(json.dumps(package(Path(sys.argv[1]), Path(sys.argv[2]), *sys.argv[3:])))
