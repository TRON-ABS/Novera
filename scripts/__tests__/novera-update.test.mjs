import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { endpoint, releaseConfig, releaseManifest } from '../updates/novera-update.mjs'

// Synthetic packets exercise format validation; these are not release keys/signatures.
const publicKey = Buffer.from(`untrusted comment: test only\n${Buffer.concat([Buffer.from('Ed'), Buffer.alloc(40)]).toString('base64')}`).toString('base64')
const signature = Buffer.from(`untrusted comment: test only\n${Buffer.concat([Buffer.from('ED'), Buffer.alloc(72)]).toString('base64')}\ntrusted comment: test only\n${Buffer.alloc(64).toString('base64')}`).toString('base64')
test('release config pins Novera and requires a public key', () => {
  assert.equal(releaseConfig(publicKey).plugins.updater.endpoints[0], endpoint)
  assert.equal(releaseConfig(publicKey).bundle.createUpdaterArtifacts, true)
  for (const invalid of ['', 'YOUR_PUBLIC_KEY', 'private key']) assert.throws(() => releaseConfig(invalid))
})
test('the stable feed accepts a version-matched installer and complete signature', () => {
  const feed = releaseManifest({ version: '1.0.1', artifact: 'Novera_1.0.1_x64-setup.exe', signature })
  assert.equal(feed.platforms['windows-x86_64'].url, 'https://github.com/TRON-ABS/Novera/releases/download/v1.0.1/Novera_1.0.1_x64-setup.exe')
  assert.equal(feed.platforms['windows-x86_64'].signature, signature)
})
test('portable executables, version mismatches, prereleases and unsigned assets are rejected', () => {
  const valid = { version: '1.0.1', artifact: 'Novera_1.0.1_x64-setup.exe', signature }
  for (const change of [
    { artifact: 'Novera-Desktop.exe' }, { version: '1.0.2' },
    { version: '1.0.1-beta.1' }, { signature: '' }, { publishedAt: 'invalid' },
  ]) assert.throws(() => releaseManifest({ ...valid, ...change }))
})

test('a single Novera stable manifest covers all five desktop architecture targets', () => {
  const files = {
    'windows-x86_64': 'Novera_1.0.1_x64-setup.exe',
    'windows-aarch64': 'Novera_1.0.1_arm64-setup.exe',
    'linux-x86_64': 'Novera_1.0.1_amd64.AppImage',
    'darwin-aarch64': 'Novera_1.0.1_aarch64.app.tar.gz',
    'darwin-x86_64': 'Novera_1.0.1_x64.app.tar.gz',
  }
  const feed = releaseManifest({ version: '1.0.1', artifacts: Object.entries(files).map(([platform, artifact]) => ({ platform, artifact, signature })) })
  assert.deepEqual(Object.keys(feed.platforms), Object.keys(files))
  for (const [platform, file] of Object.entries(files)) assert.equal(feed.platforms[platform].url, `https://github.com/TRON-ABS/Novera/releases/download/v1.0.1/${file}`)
})

test('duplicate platforms, wrong CPU bundles and non-updater formats cannot enter the feed', () => {
  const entry = { platform: 'darwin-aarch64', artifact: 'Novera_1.0.1_aarch64.app.tar.gz', signature }
  for (const artifacts of [[], [entry, entry], [{ ...entry, platform: 'android' }], [{ ...entry, artifact: 'Novera_1.0.1_x64.app.tar.gz' }], [{ ...entry, artifact: 'Novera_1.0.1_aarch64.dmg' }], [{ platform: 'linux-x86_64', artifact: 'Novera_1.0.1_amd64.deb', signature }]]) assert.throws(() => releaseManifest({ version: '1.0.1', artifacts }))
  assert.throws(() => releaseManifest({ version: '1.0.1', artifact: entry.artifact, artifacts: [entry] }))
})

test('malformed algorithm packets and corrupted signature encoding are rejected', () => {
  const valid = { version: '1.0.1', artifact: 'Novera_1.0.1_x64-setup.exe' }
  const bad = Buffer.from(`untrusted comment: test\n${Buffer.alloc(74).toString('base64')}\ntrusted comment: test\n${Buffer.alloc(64).toString('base64')}`).toString('base64')
  assert.throws(() => releaseManifest({ ...valid, signature: bad }))
  assert.throws(() => releaseManifest({ ...valid, signature: signature + '!' }))
})

test('CLI preparation resolves descriptor-relative files and produces matching checksums without publishing', t => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-update-feed-'))
  t.after(() => {
    const resolved = fs.realpathSync(root)
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('novera-update-feed-'))
    fs.rmSync(resolved, { recursive: true, force: true })
  })
  const name = 'Novera_1.0.1_amd64.AppImage', bytes = Buffer.from('format-only fixture; not an executable')
  fs.writeFileSync(path.join(root, name), bytes)
  fs.writeFileSync(path.join(root, name + '.sig'), signature)
  const descriptor = path.join(root, 'assets.json')
  fs.writeFileSync(descriptor, JSON.stringify([{ platform: 'linux-x86_64', artifact: name, signature: name + '.sig' }]))
  const output = path.join(root, 'latest.json'), entry = path.resolve('scripts/updates/novera-update.mjs')
  execFileSync(process.execPath, [entry, 'manifest', '--version', '1.0.1', '--artifacts-file', descriptor, '--out', output])
  assert.equal(JSON.parse(fs.readFileSync(output)).platforms['linux-x86_64'].signature, signature)
  assert.equal(fs.readFileSync(output + '.sha256', 'utf8'), `${createHash('sha256').update(bytes).digest('hex')}  ${name}\n`)
  const second = spawnSync(process.execPath, [entry, 'manifest', '--version', '1.0.1', '--artifacts-file', descriptor, '--out', output])
  assert.notEqual(second.status, 0)
  assert.equal(fs.readFileSync(output + '.sha256', 'utf8'), `${createHash('sha256').update(bytes).digest('hex')}  ${name}\n`)
})
