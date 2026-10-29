import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { checkReleaseReadiness } from '../check-release-readiness.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..')
const manifestPath = 'scripts/distribution/release-targets.json'
const manifest = JSON.parse(fs.readFileSync(path.join(root, manifestPath), 'utf8'))

function fixture(t) {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-release-sources-'))
  t.after(() => {
    const resolved = fs.realpathSync(folder)
    assert.equal(path.dirname(resolved), fs.realpathSync(os.tmpdir()))
    assert.ok(path.basename(resolved).startsWith('novera-release-sources-'))
    fs.rmSync(resolved, { recursive: true, force: true })
  })
  const files = new Set([
    manifestPath, 'package.json', 'src-tauri/novera-cli/Cargo.toml',
    ...manifest.requiredSources,
    ...manifest.targets.flatMap(target => [...target.sources, ...(target.config ? [target.config] : [])]),
  ])
  for (const file of files) {
    fs.mkdirSync(path.dirname(path.join(folder, file)), { recursive: true })
    fs.copyFileSync(path.join(root, file), path.join(folder, file))
  }
  return folder
}

function changeJson(folder, file, change) {
  const absolute = path.join(folder, file)
  const data = JSON.parse(fs.readFileSync(absolute, 'utf8'))
  change(data)
  fs.writeFileSync(absolute, JSON.stringify(data))
}

test('audit does not require binaries, change sources or certify a build', t => {
  const folder = fixture(t)
  const before = fs.readFileSync(path.join(folder, 'package.json'))
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, true)
  assert.equal(report.targets.length, 11)
  assert.equal(report.compilationPerformed, false)
  assert.equal(report.publicationPerformed, false)
  assert.equal(report.actionsSettingsChanged, false)
  assert.equal(report.actionsSettingsChecked, false)
  assert.equal(report.buildReadiness, 'not-verified')
  assert.ok(report.targets.every(target => target.buildReadiness === 'not-verified' && target.pending.length > 0))
  assert.deepEqual(fs.readFileSync(path.join(folder, 'package.json')), before)
  assert.equal(fs.existsSync(path.join(folder, 'src-tauri/target')), false)
})

test('portable packaging is included in the same target set as the local launcher', () => {
  const launcher = fs.readFileSync(path.join(root, 'scripts/distribution/build-novera-local.ps1'), 'utf8')
  assert.deepEqual([...launcher.matchAll(/Id='([^']+)'/g)].map(match => match[1]), manifest.targets.map(target => target.id))
  const portable = checkReleaseReadiness(root).targets.find(target => target.id === 'portable')
  assert.deepEqual(portable.artifacts, ['Portable ZIP', 'SHA-256 checksum'])
})

test('a missing platform config fails the source audit', t => {
  const folder = fixture(t)
  fs.unlinkSync(path.join(folder, 'src-tauri/tauri.linux.conf.json'))
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, false)
  assert.ok(report.errors.some(error => error.includes('tauri.linux.conf.json')))
  assert.equal(report.targets.find(target => target.id === 'linux').sourceReferencesValid, false)
})

test('version drift is reported before any build is attempted', t => {
  const folder = fixture(t)
  changeJson(folder, 'web-app/package.json', data => { data.version = '99.0.0' })
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, false)
  assert.ok(report.errors.some(error => error.includes('Version mismatch')))
})

test('missing build entrypoints are detected without invoking them', t => {
  const folder = fixture(t)
  changeJson(folder, 'package.json', data => { delete data.scripts['build:tauri:linux'] })
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, false)
  assert.ok(report.errors.some(error => error.includes('Missing package script for linux')))
})

test('malformed JSON and an unexpected product identity are rejected', t => {
  const folder = fixture(t)
  changeJson(folder, 'src-tauri/tauri.conf.json', data => { data.productName = 'Other product' })
  fs.writeFileSync(path.join(folder, 'src-tauri/tauri.macos.conf.json'), '{ broken')
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, false)
  assert.ok(report.errors.some(error => error.includes('identity')))
  assert.ok(report.errors.some(error => error.includes('Invalid JSON')))
})

test('duplicate or missing targets cannot produce a valid audit', t => {
  const folder = fixture(t)
  changeJson(folder, manifestPath, data => { data.targets[3].id = 'desktop' })
  const report = checkReleaseReadiness(folder)
  assert.equal(report.sourceDefinitionsValid, false)
  assert.ok(report.errors.some(error => error.includes('duplicate')))
  assert.ok(report.errors.some(error => error.includes('Missing distribution target: portable')))
})

test('the audit rejects paths outside its repository and non-preparation modes', t => {
  const folder = fixture(t)
  changeJson(folder, manifestPath, data => { data.requiredSources.push('../private-file') })
  assert.ok(checkReleaseReadiness(folder).errors.some(error => error.includes('Invalid source path')))
  changeJson(folder, manifestPath, data => { data.mode = 'build' })
  assert.equal(checkReleaseReadiness(folder).sourceDefinitionsValid, false)
})

test('mobile audits and Apple provisioning remain explicit pending work', t => {
  const folder = fixture(t)
  const report = checkReleaseReadiness(folder)
  const android = report.targets.find(target => target.id === 'android')
  const ios = report.targets.find(target => target.id === 'ios')
  assert.equal(android.pending.filter(item => item.startsWith('Android review pending:')).length, 3)
  assert.ok(ios.pending.some(item => item.includes('Apple development team is not configured')))
})
