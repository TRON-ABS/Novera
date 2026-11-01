import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { generateKeyPairSync, randomBytes, sign, createHash } from 'node:crypto'
import { verifyUpdateBundle, requireUpdatePublication } from '../ci-check-updater.mjs'
import { endpoint } from '../../updates/novera-update.mjs'
import { spawnSync } from 'node:child_process'
import { prepareNsisRuntime, verifyNsisRuntime } from '../windows-runtime.mjs'

function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-updater-crypto-'))
  t.after(() => {
    assert.equal(path.dirname(path.resolve(dir)), path.resolve(os.tmpdir()))
    assert.ok(path.basename(dir).startsWith('novera-updater-crypto-'))
    fs.rmSync(dir, { recursive: true, force: true })
  })
  const { publicKey, privateKey } = generateKeyPairSync('ed25519')
  const id = randomBytes(8), data = Buffer.from('Novera updater verification fixture\n')
  const publicPacket = Buffer.concat([Buffer.from('Ed'), id, publicKey.export({ format: 'der', type: 'spki' }).subarray(-32)])
  const key = Buffer.from('untrusted comment: test public key\n' + publicPacket.toString('base64') + '\n').toString('base64')
  const payloadSignature = sign(null, createHash('blake2b512').update(data).digest(), privateKey)
  const packet = Buffer.concat([Buffer.from('ED'), id, payloadSignature])
  const comment = 'timestamp:1\tfile:fixture.bin'
  const global = sign(null, Buffer.concat([payloadSignature, Buffer.from(comment)]), privateKey)
  const lines = ['untrusted comment: test signature', packet.toString('base64'), 'trusted comment: ' + comment, global.toString('base64')]
  const signature = Buffer.from(lines.join('\n') + '\n').toString('base64')
  const file = path.join(dir, 'fixture.bin'); fs.writeFileSync(file, data)
  return { file, key, signature, data, lines }
}

test('verifies the payload and trusted comment with real Ed25519 signatures', async t => {
  const f = fixture(t), result = await verifyUpdateBundle(f.file, f.signature, f.key)
  assert.equal(result.sha256, createHash('sha256').update(f.data).digest('hex'))
  assert.match(result.publicKeyFingerprintSha256, /^[a-f0-9]{64}$/)
})
test('rejects a modified payload under its original valid signature', async t => {
  const f = fixture(t); fs.appendFileSync(f.file, 'tampered')
  await assert.rejects(verifyUpdateBundle(f.file, f.signature, f.key), /Invalid update payload signature/)
})
test('rejects tampered trusted comments and signatures from another key', async t => {
  const f = fixture(t), another = fixture(t)
  f.lines[2] += ' tampered'
  await assert.rejects(verifyUpdateBundle(f.file, Buffer.from(f.lines.join('\n')).toString('base64'), f.key), /Invalid trusted-comment signature/)
  await assert.rejects(verifyUpdateBundle(f.file, another.signature, f.key), /does not match/)
})
test('rejects malformed signature packets before certifying any bundle', async t => {
  const f = fixture(t)
  await assert.rejects(verifyUpdateBundle(f.file, '%invalid', f.key), /Invalid signature encoding/)
  await assert.rejects(verifyUpdateBundle(f.file, Buffer.from('untrusted comment: incomplete').toString('base64'), f.key), /does not match/)
})
test('publication requires a verified channel and matching source receipt', () => {
  const candidate = { kind: 'desktop', platform: 'win32', architecture: 'x64', commit: 'source', updaterChannelConfigured: true, updaterSignaturesVerified: true }
  const receipt = { commit: 'source', endpoint, platform: 'windows-x86_64', updaterEnabled: true, signaturesVerified: true, windowsRuntime: { bundleType: 'nsis' }, artifacts: [{ file: 'setup.exe' }] }
  assert.equal(requireUpdatePublication(candidate, receipt), true)
  for (const patch of [{ kind: 'android' }, { kind: 'ios' }, { kind: 'cli' }, { updaterChannelConfigured: false }, { updaterSignaturesVerified: false }]) assert.throws(() => requireUpdatePublication({ ...candidate, ...patch }, receipt), /Publication blocked/)
  for (const patch of [{ commit: 'different' }, { endpoint: 'https://other.invalid' }, { platform: 'android-arm64' }, { platform: 'darwin-x86_64' }, { updaterEnabled: false }, { signaturesVerified: false }, { artifacts: [] }]) assert.throws(() => requireUpdatePublication(candidate, { ...receipt, ...patch }), /Publication blocked/)
  assert.throws(() => requireUpdatePublication(candidate, null), /Publication blocked/)
  assert.throws(() => requireUpdatePublication(candidate, { ...receipt, windowsRuntime: undefined }), /Publication blocked/)
})

test('the copied Windows runtime matches the reserved installer marker without touching other bytes', () => {
  const binary = Buffer.alloc(256)
  binary.write('MZ'); binary.writeUInt32LE(64, 60); binary.write('PE\0\0', 64)
  binary.write('__TAURI_BUNDLE_TYPE_VAR_UNK', 128)
  const original = Buffer.from(binary), prepared = prepareNsisRuntime(binary)
  assert.deepEqual(binary, original)
  const expected = Buffer.from(original); expected.write('__TAURI_BUNDLE_TYPE_VAR_NSS', 128)
  assert.deepEqual(prepared.binary, expected)
  assert.equal(verifyNsisRuntime(prepared.binary, prepared.proof), true)
  prepared.binary[200] ^= 1
  assert.throws(() => verifyNsisRuntime(prepared.binary, prepared.proof), /differs/)
})
test('Windows runtime preparation rejects missing, duplicate and invalid bundle slots', () => {
  const binary = Buffer.alloc(256)
  binary.write('MZ'); binary.writeUInt32LE(64, 60); binary.write('PE\0\0', 64)
  assert.throws(() => prepareNsisRuntime(binary), /Expected one reserved/)
  binary.write('__TAURI_BUNDLE_TYPE_VAR_UNK', 128);binary.write('__TAURI_BUNDLE_TYPE_VAR_UNK', 180)
  assert.throws(() => prepareNsisRuntime(binary), /Expected one reserved/)
  assert.throws(() => prepareNsisRuntime(Buffer.from('not a Windows binary')), /Expected a Windows/)
})

test('only the explicit signed desktop mode embeds the pinned update configuration', t => {
  const f = fixture(t), root = path.dirname(f.file)
  fs.mkdirSync(path.join(root, 'src-tauri/resources'), { recursive: true })
  const platform = { win32: 'windows', darwin: 'macos', linux: 'linux' }[process.platform]
  fs.writeFileSync(path.join(root, `src-tauri/tauri.${platform}.conf.json`), JSON.stringify({ bundle: { resources: [] } }))
  const pinned = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json'))
  fs.writeFileSync(path.join(root, 'src-tauri/tauri.updater.conf.json'), JSON.stringify(pinned))
  const run = enabled => spawnSync(process.execPath, [path.resolve('scripts/distribution/ci-candidates.mjs'), 'config'], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: 'true', NOVERA_ENABLE_UPDATER: enabled }, encoding: 'utf8' })
  assert.equal(run('false').status, 0)
  let config = JSON.parse(fs.readFileSync(path.join(root, '.build/candidate-config.json')))
  assert.equal(config.bundle.createUpdaterArtifacts, false)
  assert.equal(config.plugins, undefined)
  assert.equal(run('true').status, 0)
  config = JSON.parse(fs.readFileSync(path.join(root, '.build/candidate-config.json')))
  assert.equal(config.bundle.createUpdaterArtifacts, true)
  assert.deepEqual(config.plugins.updater, pinned.plugins.updater)
  pinned.plugins.updater.endpoints = ['https://other.invalid/updates']
  fs.writeFileSync(path.join(root, 'src-tauri/tauri.updater.conf.json'), JSON.stringify(pinned))
  assert.notEqual(run('true').status, 0)
})
