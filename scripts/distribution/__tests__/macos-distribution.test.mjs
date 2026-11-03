import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { appleCredentials, preflight, bundleManifest, compareBundles } from '../macos-distribution.mjs'

function credentials() {
  return { ...Object.fromEntries(appleCredentials.map(name => [name, 'fixture-secret'])), APPLE_SIGNING_IDENTITY: 'Developer ID Application: Fixture (TESTTEAM)', NOVERA_MACOS_DISTRIBUTION: 'true', REQUESTED: 'macos', NOVERA_ENABLE_UPDATER: 'true', TAURI_SIGNING_PRIVATE_KEY: 'fixture-key', TAURI_SIGNING_PRIVATE_KEY_PASSWORD: 'fixture-password' }
}

test('ordinary candidates do not require Apple credentials', () => {
  assert.doesNotThrow(() => preflight({}))
})

test('direct Mac build omits empty Apple credentials while preserving updater signing', { skip: process.platform === 'win32' }, t => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-signing-env-'))
  t.after(() => fs.rmSync(cwd, { recursive: true, force: true }))
  const prologue = fs.readFileSync('scripts/distribution/ci-build.sh', 'utf8')
    .split('if [[ "$kind" == desktop && "${NOVERA_MACOS_DISTRIBUTION:-false}" == true ]]; then')[0]
  for (const enabled of ['false', 'true']) {
    const command = prologue + '\n[[ "$TAURI_SIGNING_PRIVATE_KEY" == fixture-updater ]] || exit 9\n' +
      (enabled === 'false' ? appleCredentials.map(key => `[[ ! -v ${key} ]] || exit 8`).join('\n') : '[[ -v APPLE_CERTIFICATE ]] || exit 7')
    const result = spawnSync('bash', ['-c', command, 'test', 'desktop'], {
      cwd, encoding: 'utf8', env: { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_WORKSPACE: cwd,
        RUNNER_OS: 'macOS', NOVERA_MACOS_DISTRIBUTION: enabled,
        TAURI_SIGNING_PRIVATE_KEY: 'fixture-updater', ...Object.fromEntries(appleCredentials.map(key => [key, ''])) },
    })
    assert.equal(result.status, 0, result.stderr)
  }
})

test('distribution rejects every missing credential before compilation without leaking values', () => {
  for (const name of [...appleCredentials, 'TAURI_SIGNING_PRIVATE_KEY', 'TAURI_SIGNING_PRIVATE_KEY_PASSWORD']) {
    const env = credentials()
    delete env[name]
    assert.throws(() => preflight(env), error => error.message.includes(name) && !error.message.includes('fixture-secret'))
  }
  assert.doesNotThrow(() => preflight(credentials()))
})

test('distribution requires the Mac-only signed updater scope and a Developer ID identity', () => {
  for (const change of [{ REQUESTED: 'all' }, { REQUESTED: 'checks' }, { NOVERA_ENABLE_UPDATER: 'false' }, { APPLE_SIGNING_IDENTITY: '-' }, { APPLE_SIGNING_IDENTITY: 'Apple Development: Fixture' }]) {
    assert.throws(() => preflight({ ...credentials(), ...change }))
  }
})

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-mac-test-'))
  t.after(() => {
    assert.equal(path.dirname(fs.realpathSync(root)), fs.realpathSync(os.tmpdir()))
    assert.ok(path.basename(root).startsWith('novera-mac-test-'))
    fs.rmSync(root, { recursive: true, force: true })
  })
  fs.mkdirSync(path.join(root, 'Contents/MacOS'), { recursive: true })
  fs.writeFileSync(path.join(root, 'Contents/MacOS/Novera'), 'signed executable')
  fs.writeFileSync(path.join(root, 'Contents/.ticket'), 'stapled ticket')
  return root
}

test('bundle comparison detects hidden ticket changes, extra files and executable mutations', async t => {
  const root = fixture(t)
  const expected = await bundleManifest(root)
  compareBundles(expected, await bundleManifest(root))
  for (const file of ['Contents/.ticket', 'Contents/MacOS/Novera', 'Contents/extra']) {
    const target = path.join(root, file), before = fs.existsSync(target) ? fs.readFileSync(target) : null
    fs.writeFileSync(target, 'changed')
    const actual = await bundleManifest(root)
    assert.throws(() => compareBundles(expected, actual), /differs/)
    if (before) fs.writeFileSync(target, before)
    else fs.unlinkSync(target)
  }
})

test('bundle comparison preserves executable modes and internal links, rejecting escaping links', { skip: process.platform === 'win32' }, async t => {
  const root = fixture(t), binary = path.join(root, 'Contents/MacOS/Novera')
  const expected = await bundleManifest(root)
  fs.chmodSync(binary, 0o755)
  const changed = await bundleManifest(root)
  assert.throws(() => compareBundles(expected, changed), /differs/)
  fs.symlinkSync('Novera', path.join(root, 'Contents/MacOS/internal'))
  assert.ok((await bundleManifest(root)).some(entry => entry.link === 'Novera'))
  fs.symlinkSync('../../../outside', path.join(root, 'Contents/MacOS/escape'))
  await assert.rejects(bundleManifest(root), /External bundle symlink/)
})
