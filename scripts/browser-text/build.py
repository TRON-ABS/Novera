"""Build the same pinned Desktop core as a standalone browser WebGPU module.

Does not publish, modify the vendored checkout, or replace the autonomous SDK.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess
import sys
import tarfile

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
PIN = 'cd959bae99ff4bed22bef2604f45241c09bbb8c8'
parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--emsdk', type=Path, required=True)
parser.add_argument('--cmake', required=True)
parser.add_argument('--ninja', required=True)
parser.add_argument('--cache', type=Path, default=ROOT / '.build/browser-text')
parser.add_argument('--jobs', type=int, default=2)
parser.add_argument('--parameter-batching', action='store_true', help='Build the checksummed browser parameter-upload optimization')
parser.add_argument('--bulk-encoding', action='store_true', help='Experimental batched Wasm/JS command encoding; no throughput gain is assumed')
parser.add_argument('--trace-synchronization', action='store_true', help='Diagnostic native WebGPU wall-clock spans; not a production timing build')
parser.add_argument('--queue-ordered-readback', action='store_true', help='Avoid the redundant pre-read queue fence; mapping still waits for the queued copy')
parser.add_argument('--completed-fence-cache', action='store_true', help='Reuse confirmed queue completion only until the next tracked submission/write')
parser.add_argument('--batched-host-inputs', action='store_true', help='Experimental WebGPU-only host-input group copy with one pre-copy fence')
parser.add_argument('--matvec-geometry', action='store_true', help='Experimental Q4_K/Q6_K matvec row grouping on top of retained input/readback corrections')
parser.add_argument('--matvec-small', action='store_true', help='Experimental one/two-row matvec grouping, retaining the previous geometry experiment separately')
parser.add_argument('--matvec-threads', action='store_true', help='Experimental matvec thread count with retained four-row geometry')
parser.add_argument('--reuse-q8', action='store_true', help='Experimental adjacent FFN matvecs sharing an unchanged Q8 activation')
parser.add_argument('--cpu-threads', action='store_true', help='Auto-detected logical CPU worker pool with retained WebGPU corrections')
parser.add_argument('--cpu-spin-barrier', action='store_true', help='Diagnostic CPU pool control with the original busy-wait barrier')
args = parser.parse_args()
if args.cpu_spin_barrier and not args.cpu_threads:
    parser.error('--cpu-spin-barrier requires --cpu-threads')
if args.cpu_threads and (args.bulk_encoding or args.trace_synchronization or args.matvec_geometry or args.matvec_small or args.matvec_threads or args.reuse_q8):
    parser.error('Build CPU threading separately from other experiments.')
if args.reuse_q8 and (args.bulk_encoding or args.trace_synchronization or args.matvec_geometry or args.matvec_small or args.matvec_threads):
    parser.error('Build shared-Q8 activation reuse separately from other experiments.')
if args.matvec_small and args.matvec_threads:
    parser.error('Compare row grouping and thread geometry separately.')
if (args.matvec_geometry or args.matvec_small or args.matvec_threads) and (args.bulk_encoding or args.trace_synchronization):
    parser.error('Build matvec geometry separately from bulk encoding and native tracing.')
if args.bulk_encoding and args.trace_synchronization:
    parser.error('Choose bulk encoding or synchronization tracing, not both.')
if args.queue_ordered_readback and (args.trace_synchronization or (args.bulk_encoding and not args.batched_host_inputs)):
    parser.error('Build queue-ordered readback separately from diagnostic patches.')
if args.completed_fence_cache and (args.trace_synchronization or (args.bulk_encoding and not args.batched_host_inputs)):
    parser.error('Build completed-fence caching separately from diagnostic patches.')
if args.batched_host_inputs and args.trace_synchronization:
    parser.error('Build batched host inputs separately from diagnostic patches.')
if not 1 <= args.jobs <= 4:
    parser.error('Use one to four compiler jobs.')
vendor = ROOT / 'src-tauri/plugins/tauri-plugin-llamacpp/vendor/llama.cpp'
if subprocess.check_output(['git', '-C', str(vendor), 'rev-parse', 'HEAD'], text=True).strip() != PIN:
    raise ValueError('Native source revision mismatch.')
if subprocess.check_output(['git', '-C', str(vendor), 'status', '--porcelain', '--untracked-files=no'], text=True).strip():
    raise ValueError('Native source has unreviewed modifications.')
cache = args.cache.resolve()
cache.mkdir(parents=True, exist_ok=True)
source = cache / 'source'
receipt = cache / 'source.json'
if not receipt.is_file():
    archive = cache / 'source.tar'
    subprocess.run(['git', '-C', str(vendor), 'archive', PIN, '-o', str(archive)], check=True)
    source.mkdir(exist_ok=True)
    with tarfile.open(archive) as bundle:
        bundle.extractall(source, filter='data')
    receipt.write_text(json.dumps({'commit': PIN, 'archiveSha256': hashlib.file_digest(archive.open('rb'), 'sha256').hexdigest()}, indent=2))
source_record = json.loads(receipt.read_text())
if source_record['commit'] != PIN:
    raise ValueError('Cached native source revision mismatch.')
archive = cache / 'source.tar'
if hashlib.file_digest(archive.open('rb'), 'sha256').hexdigest() != source_record['archiveSha256']:
    raise ValueError('Cached source archive checksum mismatch.')
with tarfile.open(archive) as bundle:
    for member in bundle:
        if member.isfile():
            expected = hashlib.file_digest(bundle.extractfile(member), 'sha256').digest()
            actual = hashlib.file_digest((source / member.name).open('rb'), 'sha256').digest()
            if actual != expected:
                raise ValueError('Cached source modified: ' + member.name)
sdk = args.emsdk.resolve()
environment = dict(os.environ, EM_CONFIG=str(sdk / '.emscripten'), EMSDK=str(sdk))
override = ''
scheduler_override = ''
cpu_source_override = ''
cpu_ops_override = ''
shader_include_override = ''
patch_record = None

def apply_override(record, override_directory='override'):
    for relative in (Path(record['patch']), Path(record['file'])):
        if relative.is_absolute() or relative.drive or '..' in relative.parts:
            raise ValueError('Browser patch paths must stay inside their source roots.')
    patch_file = HERE / record['patch']
    original = source / record['file']
    if hashlib.sha256(patch_file.read_bytes()).hexdigest() != record['patchSha256']:
        raise ValueError('Browser patch checksum mismatch.')
    # Git archive can use CRLF on Windows. Check the canonical patch input.
    patch_input = original.read_bytes().replace(b'\r\n', b'\n')
    if hashlib.sha256(patch_input).hexdigest() != record['beforeSha256']:
        raise ValueError('Browser patch input checksum mismatch.')
    # Apply only inside a disposable override tree, preserving the verified archive.
    override_root = cache / override_directory
    target = override_root / record['file']
    target.parent.mkdir(parents=True, exist_ok=True)
    if not target.is_file() or hashlib.sha256(target.read_bytes()).hexdigest() != record['afterSha256']:
        target.write_bytes(patch_input)
        patch_environment = dict(environment, GIT_CEILING_DIRECTORIES=str(cache))
        subprocess.run(['git', '-c', 'core.autocrlf=false', 'apply', '--check', str(patch_file)], cwd=override_root, env=patch_environment, check=True)
        subprocess.run(['git', '-c', 'core.autocrlf=false', 'apply', str(patch_file)], cwd=override_root, env=patch_environment, check=True)
    if hashlib.sha256(target.read_bytes()).hexdigest() != record['afterSha256']:
        raise ValueError('Browser patch output checksum mismatch.')
    return str(target)

if args.cpu_threads or args.parameter_batching or args.bulk_encoding or args.trace_synchronization or args.queue_ordered_readback or args.completed_fence_cache or args.batched_host_inputs or args.matvec_geometry or args.matvec_small or args.matvec_threads or args.reuse_q8:
    patch_record = json.loads((HERE / ('patches-pthreads-spin.json' if args.cpu_threads and args.cpu_spin_barrier else 'patches-pthreads.json' if args.cpu_threads else 'patches-reuse-q8.json' if args.reuse_q8 else 'patches-matvec-threads.json' if args.matvec_threads else 'patches-matvec-small.json' if args.matvec_small else 'patches-matvec.json' if args.matvec_geometry else 'patches-inputs-bulk.json' if args.batched_host_inputs and args.bulk_encoding else 'patches-inputs.json' if args.batched_host_inputs else 'patches-fences.json' if args.completed_fence_cache else 'patches-readback.json' if args.queue_ordered_readback else 'patches-trace.json' if args.trace_synchronization else 'patches-bulk.json' if args.bulk_encoding else 'patches.json')).read_text())
    override = apply_override(patch_record)
    for extra in patch_record.get('extraPatches', []):
        if extra['file'] == 'ggml/src/ggml-backend.cpp' and not scheduler_override:
            scheduler_override = apply_override(extra)
        elif extra['file'] == 'ggml/src/ggml-webgpu/ggml-webgpu-shader-lib.hpp' and not shader_include_override:
            shader_include_override = str(Path(apply_override(extra, 'override-includes')).parent)
        elif extra['file'] == 'ggml/src/ggml-cpu/ggml-cpu.c' and not cpu_source_override:
            cpu_source_override = apply_override(extra)
        elif extra['file'] == 'ggml/src/ggml-cpu/ops.cpp' and not cpu_ops_override:
            cpu_ops_override = apply_override(extra)
        else:
            raise ValueError('Unsupported or duplicate extra override.')
version = subprocess.check_output([sys.executable, str(sdk / 'upstream/emscripten/emcc.py'), '--version'], env=environment, text=True).splitlines()[0]
if '7.0.0' not in version:
    raise ValueError('Use the reviewed Emscripten 7.0.0 SDK.')
build = cache / 'build'
subprocess.run([sys.executable, str(sdk / 'upstream/emscripten/emcmake.py'), args.cmake,
               '-S', str(HERE), '-B', str(build), '-G', 'Ninja', '-DCMAKE_BUILD_TYPE=Release',
               '-DCMAKE_MAKE_PROGRAM=' + args.ninja, '-DNOVERA_LLAMA_SOURCE=' + str(source),
               '-DNOVERA_WEBGPU_SOURCE=' + override,
               '-DNOVERA_CPU_PTHREADS=' + ('ON' if args.cpu_threads else 'OFF'),
               '-DNOVERA_CPU_SOURCE=' + cpu_source_override,
               '-DNOVERA_CPU_OPS_SOURCE=' + cpu_ops_override,
               '-DNOVERA_GGML_BACKEND_SOURCE=' + scheduler_override,
               '-DNOVERA_WEBGPU_SHADER_INCLUDE=' + shader_include_override,
               '-DLLAMA_BUILD_NUMBER=12110', '-DLLAMA_BUILD_COMMIT=' + PIN,
               '-DGIT_EXECUTABLE:FILEPATH='], env=environment, check=True)
subprocess.run([args.cmake, '--build', str(build), '--target', 'novera-text', '--parallel', str(args.jobs)], env=environment, check=True)
artifacts = []
for extension in ['mjs', 'wasm']:
    file = build / ('novera-text.' + extension)
    artifacts.append({'name': file.name, 'bytes': file.stat().st_size, 'sha256': hashlib.file_digest(file.open('rb'), 'sha256').hexdigest()})
verification = {'version': '1.0.1', 'compiled': True, 'modelInferenceValidated': False, 'sourceCommit': PIN,
                'compiler': version, 'contextTokens': 32768, 'jspi': True, 'memory64': False,
                'threads': 'auto' if args.cpu_threads else 1, 'pthreads': args.cpu_threads, 'cpuThreadLimit': 64 if args.cpu_threads else 1, 'modelWeightsChanged': False, 'artifacts': artifacts}
verification['sourceArchiveSha256'] = source_record['archiveSha256']
verification['backendPatch'] = patch_record
verification['tokenOnlySampler'] = True
verification['cpuAutoTune'] = args.cpu_threads
verification['cpuAutoTuneDefault'] = False
verification['wrapperSha256'] = {name: hashlib.file_digest((HERE / name).open('rb'), 'sha256').hexdigest()
                               for name in ['CMakeLists.txt', 'novera-text.cpp', 'build.py', 'worker.mjs', 'diagnostic-trace.h']}
(build / 'BUILD-VERIFICATION.json').write_text(json.dumps(verification, indent=2))
print(json.dumps(verification, indent=2))
