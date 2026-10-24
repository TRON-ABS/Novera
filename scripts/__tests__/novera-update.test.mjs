import { test } from 'node:test'
import assert from 'node:assert/strict'
import { endpoint, releaseConfig, releaseManifest } from '../updates/novera-update.mjs'

// Synthetic packets exercise format validation; these are not release keys/signatures.
const publicKey = Buffer.from(`untrusted comment: test only\n${Buffer.concat([Buffer.from('Ed'), Buffer.alloc(40)]).toString('base64')}`).toString('base64')
const signature = Buffer.from(`untrusted comment: test only\n${Buffer.alloc(74).toString('base64')}\ntrusted comment: test only\n${Buffer.alloc(64).toString('base64')}`).toString('base64')
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
