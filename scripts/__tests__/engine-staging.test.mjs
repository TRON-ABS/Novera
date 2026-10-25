import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const repo = resolve(import.meta.dirname, '../..')
const bash = process.env.NOVERA_TEST_BASH ?? (process.platform === 'win32' ? 'C:/msys64/usr/bin/bash.exe' : '/bin/bash')
const script = join(repo, 'src-tauri/build-utils/stage-engine.sh').replaceAll('\\', '/')
const x64 = 0x8664
const arm64 = 0xaa64
function pe(file, machine, imports = '') {
  mkdirSync(resolve(file, '..'), { recursive: true })
  const bytes = Buffer.alloc(160 + imports.length)
  bytes.write('MZ')
  bytes.writeUInt32LE(80, 60)
  bytes.writeUInt32LE(0x4550, 80)
  bytes.writeUInt16LE(machine, 84)
  bytes.write(imports, 160)
  writeFileSync(file, bytes)
}
function fixture({ native = true, backendMachine = x64 } = {}) {
  mkdirSync(join(repo, '.build'), { recursive: true })
  const dir = mkdtempSync(join(repo, '.build/engine-staging-test-'))
  const prefix = join(dir, 'prebuilt')
  pe(join(dir, 'target/release/novera-llama-worker.exe'), x64)
  for (const name of ['ggml.dll', 'ggml-base.dll', 'ggml-cpu-x64.dll']) pe(join(prefix, 'bin', name), x64)
  pe(join(prefix, 'bin/ggml-cuda.dll'), backendMachine, 'cublas64_13.dll')
  // ARM64 is deliberately created first, reproducing the toolkit layout.
  for (const [arch, machine] of [['arm64', arm64], ...(native ? [['x64', x64]] : [])]) {
    pe(join(dir, 'cuda/bin', arch, 'cublas64_13.dll'), machine, 'cublasLt64_13.dll')
    pe(join(dir, 'cuda/bin', arch, 'cublasLt64_13.dll'), machine)
    pe(join(dir, 'cuda/bin', arch, 'cudart64_13.dll'), machine)
  }
  const tools = join(dir, 'toolkit/bin')
  mkdirSync(tools, { recursive: true })
  writeFileSync(join(tools, 'uname'), '#!/bin/sh\necho MINGW64_NT\n', { mode: 0o755 })
  // Keep the fallback toolkit search inside this fixture as well.
  writeFileSync(join(tools, 'nvcc'), '#!/bin/sh\necho "release 13.4"\n', { mode: 0o755 })
  return { dir, prefix, tools }
}
function stage(f) {
  const sep = process.platform === 'win32' ? ';' : ':'
  return spawnSync(bash, [script, 'release'], {
    cwd: f.dir,
    env: { ...process.env, PATH: f.tools + sep + dirname(bash) + sep + process.env.PATH,
      CARGO_TARGET_DIR: join(f.dir, 'target').replaceAll('\\', '/'),
      JAN_LLAMA_PREBUILT_DIR: f.prefix.replaceAll('\\', '/'), JAN_ENGINE_CUDA_ARCHS: '120',
      CUDA_PATH: join(f.dir, 'cuda').replaceAll('\\', '/'), CUDA_HOME: '' },
    encoding: 'utf8', timeout: 30000,
  })
}
test('staging chooses native CUDA DLLs and includes cudart from the same architecture', () => {
  const f = fixture()
  const result = stage(f)
  assert.equal(result.status, 0, result.stdout + result.stderr)
  for (const name of ['cublas64_13.dll', 'cublasLt64_13.dll', 'cudart64_13.dll']) {
    const bytes = readFileSync(join(f.dir, 'src-tauri/resources/bin', name))
    assert.equal(bytes.readUInt16LE(bytes.readUInt32LE(60) + 4), x64, name)
  }
})
test('staging refuses CUDA when only another architecture is installed', () => {
  const f = fixture({ native: false })
  const result = stage(f)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /found in no CUDA toolkit/)
  assert.equal(existsSync(join(f.dir, 'src-tauri/resources/bin/cublas64_13.dll')), false)
})
test('staging refuses a backend whose architecture differs from the worker', () => {
  const f = fixture({ backendMachine: arm64 })
  const result = stage(f)
  assert.notEqual(result.status, 0)
  assert.match(result.stderr, /does not match worker PE machine 8664/)
})
