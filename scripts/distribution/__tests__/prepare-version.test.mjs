import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { versionPlan, applyVersion, compareVersions } from '../prepare-version.mjs'

const sources = ['src-tauri/tauri.conf.json', 'web-app/package.json', 'src-tauri/Cargo.toml', 'src-tauri/novera-cli/Cargo.toml', 'src-tauri/Cargo.lock', 'src-tauri/novera-cli/Cargo.lock']
function fixture(t) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-version-'))
  t.after(() => {
    const resolved = fs.realpathSync(dir)
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('novera-version-'))
    fs.rmSync(resolved, { recursive: true, force: true })
  })
  // Fixed sample versions keep these regressions valid after future releases.
  const main = '[package]\nname = "Novera"\nversion = "1.0.0"\n\n[dependencies]\nother = "1.0.0"\n'
  const cli = main.replace('name = "Novera"', 'name = "novera-cli"')
  const lock = 'version = 4\n\n[[package]]\nname = "Novera"\nversion = "1.0.0"\n\n[[package]]\nname = "other"\nversion = "1.0.0"\n'
  const texts = [JSON.stringify({ version: '1.0.0' }), JSON.stringify({ version: '1.0.0' }), main, cli, lock, lock + '\n[[package]]\nname = "novera-cli"\nversion = "1.0.0"\n']
  for (const [i, file] of sources.entries()) {
    fs.mkdirSync(path.dirname(path.join(dir, file)), { recursive: true })
    fs.writeFileSync(path.join(dir, file), texts[i])
  }
  return dir
}
test('preview leaves all six source files unchanged', t => {
  const root = fixture(t), before = sources.map(f => fs.readFileSync(path.join(root, f), 'utf8'))
  const plan = versionPlan(root, '1.0.1')
  assert.equal(plan.files.length, 6)
  assert.deepEqual(sources.map(f => fs.readFileSync(path.join(root, f), 'utf8')), before)
})
test('applying a version updates both manifests and lock entries while preserving unrelated data', t => {
  const root = fixture(t)
  const sentinel = path.join(root, 'personal-conversations.json')
  fs.writeFileSync(sentinel, 'untouched')
  const plan = versionPlan(root, '1.0.1')
  applyVersion(plan)
  assert.equal(versionPlan(root).current, '1.0.1')
  assert.equal(versionPlan(root).files.length, 0)
  for (const f of plan.files) {
    if (f.file.endsWith('Cargo.lock')) {
      const afterLines = f.after.split(/\r?\n/)
      const changes = f.before.split(/\r?\n/).filter((line, i) => line !== afterLines[i])
      assert.equal(changes.length, f.file.includes('novera-cli/') ? 2 : 1)
      assert.ok(changes.every(line => line === 'version = "1.0.0"'))
    }
  }
  assert.equal(fs.readFileSync(sentinel, 'utf8'), 'untouched')
})
test('refuses lock drift and concurrent source edits before changing any version', t => {
  const root = fixture(t), plan = versionPlan(root, '1.0.1')
  const web = path.join(root, 'web-app/package.json')
  fs.appendFileSync(web, '\n')
  assert.throws(() => applyVersion(plan), /Source changed/)
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, sources[0]))).version, '1.0.0')
  const lock = path.join(root, 'src-tauri/Cargo.lock')
  fs.writeFileSync(lock, fs.readFileSync(lock, 'utf8').replace('name = "Novera"\nversion = "1.0.0"', 'name = "Novera"\nversion = "0.9.0"'))
  assert.throws(() => versionPlan(root, '1.0.1'), /Version mismatch/)
})
test('semantic ordering handles numeric prereleases and refuses downgrades or metadata-only upgrades', t => {
  assert.equal(compareVersions('1.0.10', '1.0.9'), 1)
  assert.equal(compareVersions('1.1.0-beta.10', '1.1.0-beta.9'), 1)
  assert.equal(compareVersions('1.1.0', '1.1.0-beta.10'), 1)
  assert.equal(compareVersions('1.1.0-alpha', '1.1.0-beta'), -1)
  const root = fixture(t)
  for (const next of ['0.9.9', '1.0.0-beta.1', '1.0.0+new', '01.0.1', '1.1.0-beta.01']) assert.throws(() => versionPlan(root, next))
})
