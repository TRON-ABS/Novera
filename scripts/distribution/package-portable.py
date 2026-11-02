"""Build a transportable ZIP and the signed-updater SFX from reviewed runtime bytes.

No user profile is read. The only reusable inputs are the supplied runtime and
the newly compiled native launcher/updater. Signing is a separate CI step.
"""
import argparse
import hashlib
import json
import shutil
import struct
import zipfile
from pathlib import Path

FORMAT = 'novera-windows-portable'
FOOTER = b'NOVERA-PORT-ZIP1'


def digest(path):
    with path.open('rb') as stream:
        hash_value = hashlib.sha256()
        for block in iter(lambda: stream.read(1024*1024), b''):
            hash_value.update(block)
        return hash_value.hexdigest()


def runtime_files(runtime):
    result = []
    for path in sorted(runtime.rglob('*')):
        if path.is_symlink() or bool(getattr(path.lstat(), 'st_file_attributes', 0) & 0x400):
            raise ValueError('Linked runtime entry')
        if not path.is_file():
            continue
        name = path.relative_to(runtime).as_posix()
        parts = name.lower().split('/')
        if any(p in ['data', 'models', 'threads', 'chats', 'profiles', 'logs', 'user-data'] or p.startswith('.env') for p in parts):
            raise ValueError('Private data is never a portable runtime input')
        if path.suffix.lower() in ['.gguf', '.safetensors', '.pth', '.pt', '.db', '.sqlite', '.pdb', '.log', '.map']:
            raise ValueError('Unexpected runtime data or debug file')
        if path.stat().st_size == 0:
            raise ValueError('Empty runtime file')
        result.append((path, {'path': 'Program/' + name, 'bytes': path.stat().st_size, 'sha256': digest(path)}))
    required = {'Program/Novera-Desktop.exe', 'Program/bun.exe', 'Program/uv.exe', 'Program/resources/bin/novera-llama-worker.exe', 'Program/resources/LICENSE'}
    if not required.issubset({item['path'] for _, item in result}):
        raise ValueError('Incomplete portable runtime')
    return result


def package(runtime, helper, build_info, output):
    if output.exists():
        raise ValueError('Choose a new output directory')
    info = json.loads(build_info.read_text(encoding='utf-8-sig'))
    if info.get('portableFeature') is not True or info.get('version') != '1.0.0':
        raise ValueError('An actual portable-feature build at version 1.0.0 is required')
    files = runtime_files(runtime)
    app = next(item for _, item in files if item['path'] == 'Program/Novera-Desktop.exe')
    if info.get('executableSha256') != app['sha256']:
        raise ValueError('Runtime executable differs from the portable compilation record')
    for exe in [runtime/'Novera-Desktop.exe', helper, runtime/'resources/bin/novera-llama-worker.exe']:
        with exe.open('rb') as stream:
            assert stream.read(2) == b'MZ'
            stream.seek(0x3c); offset = struct.unpack('<I', stream.read(4))[0]
            stream.seek(offset); assert stream.read(4) == b'PE\0\0'
            assert struct.unpack('<H', stream.read(2))[0] == 0x8664
    output.mkdir(parents=True)
    manifest = {'format': FORMAT, 'schema': 1, 'version': info['version'], 'files': [item for _, item in files]}
    prefix = f"Novera_{info['version']}_x64-portable"
    zip_path = output/(prefix + '.zip')
    payload = output/'portable-payload.zip'
    with zipfile.ZipFile(payload, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
        archive.writestr('portable-update.json', json.dumps(manifest))
        for path, item in files:
            archive.write(path, item['path'])
    update = output/(prefix + '-update.exe')
    with update.open('xb') as target, helper.open('rb') as source:
        shutil.copyfileobj(source, target)
        with payload.open('rb') as source:
            shutil.copyfileobj(source, target)
        target.write(payload.stat().st_size.to_bytes(8, 'little'))
        target.write(FOOTER)
    with zipfile.ZipFile(zip_path, 'w', compression=zipfile.ZIP_DEFLATED, compresslevel=6, allowZip64=True) as archive:
        for path, item in files:
            archive.write(path, item['path'])
        archive.write(helper, 'Novera.exe')
        archive.writestr('novera-portable.json', json.dumps({'format': FORMAT, 'schema': 1}))
        archive.writestr('Data/', '')
        archive.writestr('PORTABLE-PROVENANCE.json', json.dumps(info, indent=2)+'\n')
        archive.writestr('LISEZ-MOI.txt', '''Novera 1.0.0 — Windows x64 portable

Extrayez TOUT le ZIP dans un dossier accessible en écriture, puis ouvrez Novera.exe.
Program contient l’application ; Data conserve discussions, réglages, modèles et caches.
Fermez Novera avant de déplacer le dossier complet ou d’éjecter la clé USB.
Gardez une sauvegarde de Data. Les mises à jour signées remplacent seulement Program.
Ne copiez pas une nouvelle archive par-dessus Data ; utilisez la mise à jour intégrée.
Après une interruption de mise à jour, rouvrez Novera.exe pour récupérer le programme.

Les modèles ne sont pas inclus. Le moteur et les pilotes doivent convenir au PC.
WebView2 doit déjà être installé. Cette version ne l’installe pas sur le PC.
Les secrets cloud restent protégés par Windows ; reconnectez vos fournisseurs
sur un autre PC/compte Windows. Ils ne sont pas exportés en clair.
Les environnements Python facultatifs peuvent nécessiter une réparation après
déplacement ; vos modèles et discussions restent dans Data.

Extract the complete archive and start Novera.exe. Keep Program and Data together.
Close Novera before moving the folder or ejecting USB storage. Back up Data.
Signed in-app updates replace Program only. Windows-protected cloud credentials
may require reconnecting on another PC/account. Optional Python environments
may need repair after moving. WebView2 and suitable hardware/drivers are required.

TRON-ABS — The art of Human with AI
''')
    payload.unlink()  # Only the exact temporary ZIP created above.
    receipt = {**info, 'format': FORMAT, 'schema': 1, 'files': manifest['files'], 'launcherSha256': digest(helper), 'dataBundled': False}
    (output/'PORTABLE-PROVENANCE.json').write_text(json.dumps(receipt, indent=2)+'\n', encoding='utf-8')
    for path in [zip_path, update]:
        (output/(path.name+'.sha256')).write_text(f'{digest(path)}  {path.name}\n')
    return [zip_path, update]


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    for name in ['runtime', 'helper', 'build-info', 'output']:
        parser.add_argument('--'+name, type=Path, required=True)
    args = parser.parse_args()
    print(json.dumps([str(p) for p in package(args.runtime, args.helper, args.build_info, args.output)]))
