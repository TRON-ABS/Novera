"""Inspect the actual signed APK; never infer release readiness from Gradle success."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import tempfile
import zipfile


def inspect_elf(data):
    if len(data) < 64 or data[:6] != b'\x7fELF\x02\x01' or struct.unpack_from('<H', data, 18)[0] != 183:
        raise ValueError('Expected little-endian ELF64 AArch64')
    offset = struct.unpack_from('<Q', data, 32)[0]
    size, count = struct.unpack_from('<HH', data, 54)
    if size < 56 or not count or offset + size * count > len(data):
        raise ValueError('Invalid ELF program headers')
    loads = []
    for i in range(count):
        entry = offset + size * i
        if struct.unpack_from('<I', data, entry)[0] == 1:
            file_offset, address = struct.unpack_from('<QQ', data, entry + 8)
            alignment = struct.unpack_from('<Q', data, entry + 48)[0]
            if alignment < 16384 or alignment & (alignment - 1) or file_offset % alignment != address % alignment:
                raise ValueError('ELF LOAD segment is not 16-KiB compatible')
            loads.append(alignment)
    if not loads:
        raise ValueError('No ELF LOAD segments')
    return min(loads)


def sha256(file):
    result = hashlib.sha256()
    with open(file, 'rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            result.update(block)
    return result.hexdigest()


def boolean_attributes(tree, name):
    values = re.findall(re.escape(name) + r'(?:\([^)]*\))?=(?:\(type 0x12\))?(true|false|0xffffffff|0x0)\b', tree)
    return [value in ('true', '0xffffffff') for value in values]


def resource_file(resources, resource_id, name):
    match = re.search(r'resource ' + re.escape(resource_id) + r' ' + re.escape(name) + r'\s+\(\) \(file\) (res/[^\s]+\.xml) type=XML', resources)
    if not match:
        raise ValueError('Missing compiled XML resource: ' + name)
    return match[1]


def signing_certificates(output):
    # Build-Tools 37 names the signer "V3.0 Signer"; older versions use #1.
    if re.search(r'^Number of signers: 1\s*$', output, re.M) is None:
        raise ValueError('Expected exactly one APK signer')
    values = re.findall(r'^(?:Signer #\d+|V\d+(?:\.\d+)* Signer):? certificate SHA-256 digest: ([0-9a-fA-F]{64})\s*$', output, re.M)
    if not values:
        raise ValueError('No APK signing certificate digest')
    return sorted({value.lower() for value in values})


def inspect_network_policy(tree):
    elements = re.findall(r'E: ([a-z-]+)', tree)
    if elements != ['network-security-config', 'base-config', 'domain-config', 'domain', 'domain']:
        raise ValueError('Unexpected network policy structure')
    base = tree.split('E: base-config', 1)[1].split('E:', 1)[0]
    loopback = tree.split('E: domain-config', 1)[1].split('E:', 1)[0]
    if boolean_attributes(base, 'cleartextTrafficPermitted') != [False] or boolean_attributes(loopback, 'cleartextTrafficPermitted') != [True]:
        raise ValueError('HTTP must be disabled by default and enabled only on loopback')
    texts = [left or right for left, right in re.findall(r'''(?:C: "([^"]+)"|T: '([^']+)')''', tree)]
    if sorted(texts) != ['127.0.0.1', 'localhost'] or boolean_attributes(tree, 'includeSubdomains') != [False, False]:
        raise ValueError('Unexpected cleartext HTTP domain')


def verify(apk, sdk, java, receipt, expected_code=None):
    if receipt.exists():
        raise ValueError('Receipt already exists; retain the original verification evidence')
    root = Path(__file__).resolve().parents[2]
    pin = json.loads((root / 'scripts/android/toolchain.json').read_text())
    release = json.loads((root / 'scripts/android/release.json').read_text())
    version = json.loads((root / 'src-tauri/tauri.conf.json').read_text())['version']
    tools = sdk / 'build-tools' / pin['buildTools']
    env = dict(os.environ, JAVA_HOME=str(java))
    env['PATH'] = str(java / 'bin') + os.pathsep + env['PATH']

    def run(program, *args):
        return subprocess.check_output([str(program), *map(str, args)], text=True, encoding='utf-8', errors='replace', stderr=subprocess.STDOUT, env=env)

    badging = run(tools / 'aapt2.exe', 'dump', 'badging', apk)
    package = re.search(r"package: name='([^']+)' versionCode='(\d+)' versionName='([^']+)'", badging)
    code = release['versionCode'] if expected_code is None else expected_code
    if not package or package.groups() != (release['packageId'], str(code), version):
        raise ValueError('Wrong application identity, version or versionCode')
    if 'application-debuggable' in badging or 'testOnly' in badging:
        raise ValueError('Debug/test-only APK cannot be distributed')
    if not re.search(r"(?:minSdkVersion|sdkVersion):'24'", badging) or "targetSdkVersion:'" + str(pin['targetSdk']) + "'" not in badging:
        raise ValueError('Unexpected Android SDK requirements')
    if "native-code: 'arm64-v8a'" not in badging:
        raise ValueError('Unexpected native ABI')
    permissions = re.findall(r"uses-permission(?:-sdk-\d+)?: name='([^']+)'", badging)
    permitted = {'android.permission.INTERNET', 'android.permission.ACCESS_NETWORK_STATE', release['packageId'] + '.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION'}
    if 'android.permission.INTERNET' not in permissions or set(permissions) - permitted:
        raise ValueError('Unexpected APK permissions: ' + ', '.join(permissions))
    manifest = run(tools / 'aapt2.exe', 'dump', 'xmltree', apk, '--file', 'AndroidManifest.xml')
    if any(boolean_attributes(manifest, 'debuggable') + boolean_attributes(manifest, 'testOnly')):
        raise ValueError('Debug/test-only manifest cannot be distributed')
    for name in ['allowBackup', 'fullBackupContent']:
        if boolean_attributes(manifest, name) != [False]:
            raise ValueError('Application backup must be disabled: ' + name)
    if boolean_attributes(manifest, 'extractNativeLibs') != [True]:
        raise ValueError('Worker must be extracted into the read-only native library directory')
    network_id = re.search(r'networkSecurityConfig(?:\([^)]*\))?=@(0x[a-f0-9]+)', manifest)
    if not network_id:
        raise ValueError('Missing network security configuration')
    resources = run(tools / 'aapt2.exe', 'dump', 'resources', apk)
    network = run(tools / 'aapt2.exe', 'dump', 'xmltree', apk, '--file', resource_file(resources, network_id[1], 'xml/network_security_config'))
    inspect_network_policy(network)
    signature = run(tools / 'apksigner.bat', 'verify', '--verbose', '--print-certs', apk)
    certificates = signing_certificates(signature)
    if certificates != [release['certificateSha256']]:
        raise ValueError('APK is not signed by the pinned Novera Android identity')
    if not re.search(r'Verified using v2 scheme.*true', signature):
        raise ValueError('APK v2 signature missing')
    run(tools / 'zipalign.exe', '-c', '-P', '16', '4', apk)
    native_receipts = []
    expected = {'libapp_lib.so', 'libnovera_llama_worker.so', 'libggml.so', 'libggml-base.so', 'libggml-cpu.so', 'libc++_shared.so'}
    readelf = sdk / 'ndk' / pin['ndk'] / 'toolchains/llvm/prebuilt/windows-x86_64/bin/llvm-readelf.exe'
    with zipfile.ZipFile(apk) as archive:
        if len(archive.namelist()) != len(set(archive.namelist())):
            raise ValueError('Duplicate ZIP entries')
        native = [n for n in archive.namelist() if n.startswith('lib/') and n.endswith('.so')]
        if set(native) != {'lib/arm64-v8a/' + name for name in expected}:
            raise ValueError('Missing, obsolete or unexpected native library')
        for notice in ['LICENSE', 'llama.cpp-LICENSE', 'NDK-toolchain-NOTICE', 'SIGNATURE.txt']:
            if not archive.read('assets/resources/' + notice):
                raise ValueError('Missing notice: ' + notice)
        forbidden = re.compile(r'(?:^|/)(?:models|chats|threads|profiles|user-data)(?:/|$)|\.(?:gguf|safetensors|sqlite|p12|jks|keystore)$|(?:^|/)\.env', re.I)
        if any(forbidden.search(n) for n in archive.namelist()):
            raise ValueError('Private material or user data in APK')
        with tempfile.TemporaryDirectory(prefix='novera-apk-inspect-') as temporary:
            for name in sorted(native):
                data = archive.read(name)
                alignment = inspect_elf(data)
                extracted = Path(temporary) / Path(name).name
                extracted.write_bytes(data)
                dynamic = run(readelf, '-d', extracted)
                needed = re.findall(r'\(NEEDED\).*\[([^]]+)\]', dynamic)
                system = {'libc.so', 'libm.so', 'libdl.so', 'liblog.so', 'libandroid.so', 'libjnigraphics.so', 'libz.so', 'libEGL.so', 'libGLESv2.so', 'libOpenSLES.so', 'libmediandk.so'}
                if set(needed) - expected - system:
                    raise ValueError('Unbundled native dependency: ' + name)
                native_receipts.append({'file': name, 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'minimumLoadAlignment': alignment, 'needed': needed})
    result = {'packageId': release['packageId'], 'version': version, 'versionCode': code, 'apk': apk.name, 'bytes': apk.stat().st_size, 'sha256': sha256(apk), 'certificateSha256': certificates[0], 'signatureVerified': True, 'zipalignVerified': True, 'debuggable': False, 'permissions': permissions, 'nativeFiles': native_receipts, 'deviceValidated': False, 'published': False}
    receipt.write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
    print(json.dumps({k: result[k] for k in ['apk', 'bytes', 'sha256', 'versionCode', 'signatureVerified', 'deviceValidated']}))


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('apk', type=Path)
    parser.add_argument('--sdk', type=Path, required=True)
    parser.add_argument('--java', type=Path, required=True)
    parser.add_argument('--receipt', type=Path, required=True)
    parser.add_argument('--expected-version-code', type=int)
    args = parser.parse_args()
    verify(args.apk.resolve(), args.sdk.resolve(), args.java.resolve(), args.receipt.resolve(), args.expected_version_code)
