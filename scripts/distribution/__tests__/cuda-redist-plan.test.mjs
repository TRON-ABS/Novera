import test from 'node:test'
import assert from 'node:assert/strict'
import { cudaPlan } from '../cuda-redist-plan.mjs'

const names = ['cuda_nvcc', 'cuda_crt', 'libnvvm', 'libnvptxcompiler', 'libnvjitlink', 'libnvfatbin', 'cuda_cuobjdump', 'cuda_nvdisasm', 'cuda_nvprune', 'cuda_cuxxfilt', 'cuda_nvrtc', 'cuda_cudart', 'libcublas', 'cuda_cccl', 'cuda_nvtx', 'cuda_profiler_api']
function fixture(modern = true) {
  return Object.fromEntries(names.map(n => {
    const name = modern && n === 'cuda_cccl' ? 'cccl' : n
    return [name, { 'windows-x86_64': { relative_path: `${name}/windows-x86_64/${name}-archive.zip`, sha256: 'a'.repeat(64) } }]
  }))
}
test('CUDA component rename preserves both modern and legacy catalogs', () => {
  assert.equal(cudaPlan(fixture(), 'windows-x86_64', '13.4.3').find(p => p.component === 'cccl').sha256, 'a'.repeat(64))
  assert.ok(cudaPlan(fixture(false), 'windows-x86_64', '12.4.1').some(p => p.component === 'cuda_cccl'))
})
test('validate the complete toolkit before downloading: no silent missing component on new releases', () => {
  const manifest = fixture(); delete manifest.cuda_crt
  assert.throws(() => cudaPlan(manifest, 'windows-x86_64', '13.4.3'), /Missing CUDA component/)
  assert.equal(cudaPlan(manifest, 'windows-x86_64', '12.4.1').length, names.length - 1)
  delete manifest.libcublas
  assert.throws(() => cudaPlan(manifest, 'windows-x86_64', '12.4.1'), /libcublas/)
})
test('reject wrong architectures, absent hashes and unsafe download paths', () => {
  assert.throws(() => cudaPlan({ ...fixture(), release_label: '13.2.2' }, 'windows-x86_64', '13.4.3'), /release mismatch/)
  assert.throws(() => cudaPlan(fixture(), 'linux-x86_64', '13.4.3'), /Missing CUDA component/)
  const badHash = fixture(); badHash.cuda_nvcc['windows-x86_64'].sha256 = 'missing'
  assert.throws(() => cudaPlan(badHash, 'windows-x86_64', '13.4.3'), /SHA-256/)
  const badPath = fixture(); badPath.cuda_nvcc['windows-x86_64'].relative_path = 'cuda_nvcc/windows-x86_64/../../secret.zip'
  assert.throws(() => cudaPlan(badPath, 'windows-x86_64', '13.4.3'), /Unsafe CUDA archive path/)
})
