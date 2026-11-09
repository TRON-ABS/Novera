"""Build the reviewed image core for another native platform/backend.

Requires a local checkout at the pinned revisions and that backend's normal
compiler/SDK. No model downloads and no automatic installation are performed.
"""
import argparse
from pathlib import Path
import subprocess
import native_runtime

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--source', required=True, type=Path)
parser.add_argument('--build', required=True, type=Path)
parser.add_argument('--backend', choices=['cpu', 'cuda', 'vulkan', 'metal'], default='cpu')
parser.add_argument('--cmake', default='cmake')
parser.add_argument('--jobs', type=int, default=2)
options = parser.parse_args()
if not 1 <= options.jobs <= 8:
    parser.error('Use between 1 and 8 compiler jobs.')
source, build = options.source.resolve(), options.build.resolve()
if source == build:
    parser.error('Use a separate build directory.')
native_runtime.guard.prepare_source(source)
subprocess.run([options.cmake, '-S', str(source), '-B', str(build), '-DCMAKE_BUILD_TYPE=Release',
                '-DGGML_NATIVE=OFF', '-DGGML_BACKEND_DL=ON', '-DSD_BUILD_SHARED_LIBS=ON',
                '-DSD_BUILD_SHARED_GGML_LIB=ON', '-DSD_WEBM=OFF',
                *['-DSD_'+name.upper()+'='+('ON' if options.backend == name else 'OFF') for name in ['cuda', 'vulkan', 'metal']]], check=True)
subprocess.run([options.cmake, '--build', str(build), '--config', 'Release', '--target', 'sd-cli', '--parallel', str(options.jobs)], check=True)
outputs = [directory for directory in [build/'bin', build/'bin/Release'] if (directory/'sd-cli').is_file() or (directory/'sd-cli.exe').is_file()]
if len(outputs) != 1:
    raise ValueError('Expected one native CLI output directory.')
native_runtime.receipt(source, outputs[0])
print('Novera 1.0.1 native core and capability receipt: '+str(outputs[0]))
