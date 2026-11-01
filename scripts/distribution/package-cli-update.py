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

def inspect_package(archive, version, platform, commit):
    if platform not in ['windows-x86_64','linux-x86_64','darwin-aarch64']:
        raise ValueError('Unsupported signed CLI platform')
    name='jan.exe' if platform.startswith('windows-') else 'jan'
    with zipfile.ZipFile(archive) as payload:
        if len(payload.infolist())!=2 or set(payload.namelist())!={name,'CLI-UPDATE.json'}:
            raise ValueError('Ambiguous signed CLI archive')
        binary_info=payload.getinfo(name); metadata_info=payload.getinfo('CLI-UPDATE.json')
        if not 0<binary_info.file_size<=256*1024**2 or not 0<metadata_info.file_size<=16384:
            raise ValueError('Signed CLI archive exceeds size limits')
        if any(((entry.external_attr>>16)&0o170000)==0o120000 for entry in payload.infolist()):
            raise ValueError('CLI archive cannot contain symbolic links')
        binary=payload.read(name);identity=json.loads(payload.read('CLI-UPDATE.json'))
    expected=dict(formatVersion=1,product='Novera CLI',version=version,platform=platform,binary=name,
                  binarySha256=hashlib.sha256(binary).hexdigest(),commit=commit)
    if identity!=expected or not re.fullmatch(r'[a-f0-9]{40}',commit):
        raise ValueError('Signed CLI identity differs from the reviewed version, platform or source')
    if platform=='linux-x86_64':valid=binary[:6]==b'\x7fELF\x02\x01' and binary[18:20]==b'\x3e\x00'
    elif platform=='darwin-aarch64':valid=binary[:8]==bytes.fromhex('cffaedfe0c000001')
    else:
        offset=int.from_bytes(binary[60:64],'little') if len(binary)>=64 else len(binary)
        valid=binary[:2]==b'MZ' and binary[offset:offset+6]==b'PE\0\0\x64\x86' and binary[offset+24:offset+26]==b'\x0b\x02'
    if not valid:raise ValueError('Signed CLI executable architecture differs from the selected platform')
    return identity

if __name__ == '__main__':
    if len(sys.argv)==6 and sys.argv[1]=='--inspect':
        print(json.dumps(inspect_package(Path(sys.argv[2]),*sys.argv[3:])))
    else:
        if os.environ.get('GITHUB_ACTIONS') != 'true':
            raise SystemExit('Signed candidate packaging requires GitHub Actions')
        print(package(Path(sys.argv[1]), Path(sys.argv[2]), *sys.argv[3:]))
