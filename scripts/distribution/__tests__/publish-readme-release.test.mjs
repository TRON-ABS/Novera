import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { preparePublication, preparePublishedReadme } from '../publish-readme-release.mjs'

const root = fileURLToPath(new URL('../../../', import.meta.url))
test('historical publication preview preserves current downloads and dated notes', () => {
  const { androidCurrentRelease } = JSON.parse(fs.readFileSync(path.join(root, 'docs/release-preparation.json')))
  const androidTag = `v${androidCurrentRelease.version}-android-${androidCurrentRelease.versionCode}`
  const plan = preparePublication(root, true)
  assert.equal(plan.length, 104)
  for (const { before, after } of plan) {
    assert.equal(after, before)
    assert.match(after, /<summary>Novera 1\.0\.1 · 2026-11-07<\/summary>/)
    const currentDownloads = after.match(/<!-- novera-current-downloads:start -->([\s\S]+?)<!-- novera-current-downloads:end -->/)?.[1]
    assert.ok(currentDownloads?.includes(`/releases/download/${androidTag}/`))
  }
})
test('unpublished state refuses source publication before reading or writing READMEs', t => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-publish-guard-'))
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }))
  fs.mkdirSync(path.join(fixture, 'docs'))
  fs.writeFileSync(path.join(fixture, 'docs/release-preparation.json'), JSON.stringify({ published: false }))
  assert.throws(() => preparePublication(fixture), /unpublished release/)
  assert.deepEqual(fs.readdirSync(fixture), ['docs'])
})
test('published transformation preserves the prior version and is idempotent', () => {
  const facts = { ...JSON.parse(fs.readFileSync(path.join(root, 'docs/release-preparation.json'))), published: true, stable: '1.0.1', previous: '1.0.0', androidVersionCode: 1000013, currentLanguages: 120 }
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'scripts/readme-release-1.0.1-published.json'))).fr
  const source = fs.readFileSync(path.join(root, 'README.fr.md'), 'utf8')
  const first = preparePublishedReadme(source, 'fr', facts, copy)
  assert.match(first, /<p><strong>[^\n]+120 langues[^\n]+Apache 2\.0/)
  assert.match(first, /104, avec 2 435 clés/)
  assert.equal(first, source)
  assert.equal(preparePublishedReadme(first, 'fr', facts, copy), first)
  assert.throws(() => preparePublishedReadme(source, 'fr', { ...facts, stable: '1.0.0' }, copy), /published release facts/)
})
