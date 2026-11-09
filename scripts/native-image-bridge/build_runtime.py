"""Rebuild the x2-capable image library from a pinned Windows native build cache.

Run inside the MSVC x64 tools environment (build-runtime.ps1 configures it).
CUDA kernels and DLLs are reused, never rebuilt or changed by this helper.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import subprocess

ROOT = Path(__file__).resolve().parents[2]
REVISION = 'e41fbcf455e0fbb45e08bd535b00d6cba865e921'
GGML_REVISION = 'a5915eb0e47adef21c3f25b889a008925ea838c2'
BEFORE = '86109e144af2e9b2e28107a625aed58bba3da22f4fdd31e3654aba53dbafe021'
AFTER = '3acf673f80617b6e4af130662dd30ddadd6361f993c43216a4fb646a945c0cbc'
PATCH_SHA256 = '0304b10fbf4eb5bc0db51248bca82b1b68e66c27fefe0d2aade1c9ef45d3bfe0'


def sha(path):
    with Path(path).open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


def git(source, *arguments):
    return subprocess.check_output(['git', '-C', str(source), *arguments], text=True).strip()


def prepare_source(source):
    if git(source, 'rev-parse', 'HEAD') != REVISION or git(source/'ggml', 'rev-parse', 'HEAD') != GGML_REVISION:
        raise ValueError('Use the pinned native image/GGML revisions from toolchain.json.')
    relative = 'src/model/upscaler/esrgan.hpp'
    if set(git(source, 'diff', 'HEAD', '--name-only').splitlines()) - {relative} or git(source/'ggml', 'status', '--porcelain', '--untracked-files=no'):
        raise ValueError('The native source cache contains unrelated changes.')
    patch = ROOT/'scripts/browser-media/patches/esrgan-x2-pixel-unshuffle.patch'
    if sha(patch) != PATCH_SHA256:
        raise ValueError('Reviewed x2 patch checksum mismatch.')
    header = source/relative
    if sha(header) == BEFORE:
        subprocess.run(['git', '-C', str(source), 'apply', '--check', str(patch)], check=True)
        subprocess.run(['git', '-C', str(source), 'apply', str(patch)], check=True)
    if sha(header) != AFTER:
        raise ValueError('Unknown ESRGAN source: expected the reviewed before/after checksum.')


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', required=True, type=Path)
    parser.add_argument('--build', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    parser.add_argument('--ninja', required=True, type=Path)
    options = parser.parse_args()
    source, build, output = [path.resolve() for path in (options.source, options.build, options.output)]
    if os.name != 'nt':
        parser.error('This reviewed incremental build helper targets Windows x64.')
    if source == output or build == output or output in (source.parents[0], build.parents[0]):
        parser.error('Use a separate output directory.')
    marker = output/'.novera-native-bridge-runtime'
    if output.exists() and any(output.iterdir()) and not marker.is_file():
        raise ValueError('Refusing to overwrite an unmarked output directory.')
    prepare_source(source)
    cache = (build/'CMakeCache.txt').read_text()
    if 'CMAKE_BUILD_TYPE:STRING=Release' not in cache or str(source).replace('\\', '/') not in cache:
        raise ValueError('Use the Release CMake cache for this exact native source.')
    output.mkdir(parents=True, exist_ok=True)
    marker.write_text('1.0.1\n')
    database = json.loads(subprocess.check_output([str(options.ninja), '-t', 'compdb', 'CXX_COMPILER__stable-diffusion_unscanned_Release'], cwd=build))
    entries = [entry for entry in database if Path(entry['file']).resolve() == source/'src/upscaler.cpp']
    if len(entries) != 1 or 'cl.exe' not in entries[0]['command']:
        raise ValueError('Expected one reviewed MSVC upscaler compile command.')
    command, count = re.subn(r'/Fo(?:"[^"]*"|\S+)', lambda _m: '/Fo"'+str(output/'upscaler.cpp.obj')+'"', entries[0]['command'])
    if count != 1:
        raise ValueError('Ambiguous object output in the compiler command.')
    command, count = re.subn(r'/Fd(?:"[^"]*"|\S+)', lambda _m: '/Fd"'+str(output/'upscaler.pdb')+'"', command)
    if count != 1:
        raise ValueError('Ambiguous PDB output in the compiler command.')
    with (output/'build.log').open('w') as log:
        subprocess.run(command, cwd=build, stdout=log, stderr=subprocess.STDOUT, check=True)
        line = next(line for line in (build/'build.ninja').read_text().splitlines() if line.startswith('build bin\\stable-diffusion.dll stable-diffusion.lib:'))
        names = line.split(': CXX_SHARED_LIBRARY_LINKER__stable-diffusion_Release ', 1)[1].split(' | ', 1)[0].split()
        if not names or not all(name.endswith('.obj') and (build/name).resolve().is_relative_to(build) for name in names):
            raise ValueError('Unexpected native linker inputs.')
        objects = [output/'upscaler.cpp.obj' if name == 'CMakeFiles\\stable-diffusion.dir\\src\\upscaler.cpp.obj' else build/name for name in names]
        # The native library calls three CUDA driver functions. Recreate their
        # import library from the installed driver's verified export names;
        # this imports the existing driver and adds no implementation/stub.
        exports = subprocess.check_output(['dumpbin.exe', '/exports', str(Path(os.environ['SystemRoot'])/'System32/nvcuda.dll')], text=True)
        symbols = ['cuInit', 'cuDeviceGetAttribute', 'cuDeviceGetByPCIBusId']
        if not all(any(line.split()[-1:] == [symbol] for line in exports.splitlines()) for symbol in symbols):
            raise ValueError('Expected NVIDIA CUDA driver exports are unavailable.')
        definition = output/'nvcuda.def'
        definition.write_text('LIBRARY nvcuda.dll\nEXPORTS\n'+'\n'.join(symbols)+'\n')
        driver = output/'nvcuda.lib'
        subprocess.run(['lib.exe', '/nologo', '/machine:x64', '/def:'+str(definition), '/out:'+str(driver)], stdout=log, stderr=subprocess.STDOUT, check=True)
        arguments = ['/NOLOGO', '/DLL', '/MACHINE:X64', '/INCREMENTAL:NO', '/OUT:'+str(output/'stable-diffusion.dll'), '/IMPLIB:'+str(output/'stable-diffusion.lib'), *map(str, objects), str(build/'ggml/src/ggml.lib'), str(build/'ggml/src/ggml-base.lib'), str(driver), 'kernel32.lib', 'user32.lib', 'gdi32.lib', 'winspool.lib', 'shell32.lib', 'ole32.lib', 'oleaut32.lib', 'uuid.lib', 'comdlg32.lib', 'advapi32.lib']
        response = output/'link.rsp'
        response.write_text('\n'.join('"'+argument+'"' for argument in arguments))
        subprocess.run(['link.exe', '@'+str(response)], cwd=build, stdout=log, stderr=subprocess.STDOUT, check=True)
    shutil.copyfile(build/'bin/sd-cli.exe', output/'sd-cli.exe')
    for path, name in [(source/'LICENSE', 'LICENSE-sdcpp.txt'), (source/'ggml/LICENSE', 'LICENSE-ggml.txt')]:
        shutil.copyfile(path, output/name)
    receipt = {'version': '1.0.1', 'sourceRevision': REVISION, 'ggmlRevision': GGML_REVISION,
               'patchSha256': PATCH_SHA256, 'esrganSha256': AFTER, 'compiled': True,
               'method': 'Recompile the x2 upscaler and relink same-revision cached native objects; reuse existing CUDA plugins.',
               'artifacts': [{'name': name, 'bytes': (output/name).stat().st_size, 'sha256': sha(output/name)} for name in ('sd-cli.exe', 'stable-diffusion.dll')],
               'linkObjects': [{'name': str(path.relative_to(build)) if path.is_relative_to(build) else path.name, 'sha256': sha(path)} for path in objects]}
    (output/'BUILD-VERIFICATION.json').write_text(json.dumps(receipt, indent=2)+'\n')
    print('Built Novera 1.0.1 native image bridge runtime: '+str(output))


if __name__ == '__main__':
    main()
