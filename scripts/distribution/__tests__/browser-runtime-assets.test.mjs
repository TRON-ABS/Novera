import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { prepareBrowserRuntime } from '../browser-runtime-assets.mjs'

function fixture(t, kind = 'image') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-browser-runtime-'))
  t.after(() => {
    assert.ok(path.resolve(root).startsWith(path.resolve(os.tmpdir()) + path.sep + 'novera-browser-runtime-'))
    fs.rmSync(root, { recursive: true, force: true })
  })
  const build = path.join(root, 'build')
  fs.mkdirSync(build)
  const module = kind === 'music' ? 'novera-music' : 'novera-diffusion'
  for (const name of [kind === 'music' ? 'ace' : 'sdcpp', 'ggml']) { fs.mkdirSync(path.join(root, name)); fs.writeFileSync(path.join(root, name, 'LICENSE'), `Test license ${name}`) }
  fs.writeFileSync(path.join(build, `${module}.mjs`), 'export default function testOnly() {}')
  fs.writeFileSync(path.join(build, `${module}.wasm`), 'synthetic package bytes; not an inference engine')
  const record = () => fs.writeFileSync(path.join(build, 'BUILD-VERIFICATION.json'), JSON.stringify({ compiled: true, artifacts: [`${module}.mjs`, `${module}.wasm`].map(name => {
    const bytes = fs.readFileSync(path.join(build, name))
    return { name, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }
  }) }))
  record()
  return { build, record }
}

test('packages the verified runtime and licenses under one stable directory', t => {
  const { build } = fixture(t)
  const first = prepareBrowserRuntime(build)
  assert.match(first.directory, /^novera-runtime\/[a-f0-9]{64}$/)
  assert.equal(prepareBrowserRuntime(build).directory, first.directory)
  assert.deepEqual(first.assets.map(asset => asset.name), ['novera-diffusion.mjs', 'novera-diffusion.wasm', 'BUILD-VERIFICATION.json', 'LICENSE-sdcpp.txt', 'LICENSE-ggml.txt'])
})

test('changes both runtime URLs when only the verified WASM changes', t => {
  const { build, record } = fixture(t)
  const first = prepareBrowserRuntime(build)
  fs.appendFileSync(path.join(build, 'novera-diffusion.wasm'), '-next')
  assert.throws(() => prepareBrowserRuntime(build), /differs from its receipt/)
  record()
  const second = prepareBrowserRuntime(build)
  assert.notEqual(second.directory, first.directory)
  assert.deepEqual(second.assets[0].source, first.assets[0].source)
})

test('rejects an unsuccessful compilation receipt', t => {
  const { build } = fixture(t)
  fs.writeFileSync(path.join(build, 'BUILD-VERIFICATION.json'), JSON.stringify({ compiled: false, artifacts: [] }))
  assert.throws(() => prepareBrowserRuntime(build), /no successful build receipt/)
})

test('packages ACE independently with its own licenses and rejects tampered audio runtime bytes', t => {
  const { build } = fixture(t, 'music')
  const result = prepareBrowserRuntime(build, 'music')
  assert.deepEqual(result.assets.map(a => a.name), ['novera-music.mjs', 'novera-music.wasm', 'BUILD-VERIFICATION.json', 'LICENSE-ace.txt', 'LICENSE-ggml.txt'])
  fs.appendFileSync(path.join(build, 'novera-music.wasm'), '-tampered')
  assert.throws(() => prepareBrowserRuntime(build, 'music'), /differs from its receipt/)
})
