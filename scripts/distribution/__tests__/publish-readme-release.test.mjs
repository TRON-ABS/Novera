import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { fileURLToPath } from 'node:url'
import { preparePublication, preparePublishedReadme } from '../publish-readme-release.mjs'

const root = fileURLToPath(new URL('../../../', import.meta.url))
test('publication preview covers all locales without changing source or overstating Android testing', () => {
  const plan = preparePublication(root, true)
  assert.equal(plan.length, 104)
  for (const file of plan) {
    assert.equal(fs.readFileSync(path.join(root, file.name), 'utf8'), file.before)
    assert.match(file.after, /## Novera 1\.0\.1/)
    assert.match(file.after, /v1\.0\.1-android-1000013/)
    assert.doesNotMatch(file.after, /android-1000012|\{\{\w+\}\}/)
    assert.match(file.after, /docs\/RELEASE_1\.0\.1_2026-11-07\.md/)
  }
  const english = plan.find(file => file.name === 'README.md').after
  assert.doesNotMatch(english, /Before release:|Preparing version 1\.0\.1/)
  assert.match(english, /Installation and updating on a phone remain to be tested/)
  assert.match(english, /public 1\.0\.0 to 1\.0\.1 upgrade/)
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
  const facts = { ...JSON.parse(fs.readFileSync(path.join(root, 'docs/release-preparation.json'))), published: true, stable: '1.0.1', previous: '1.0.0', androidVersionCode: 1000013 }
  const copy = JSON.parse(fs.readFileSync(path.join(root, 'scripts/readme-release-1.0.1-published.json'))).fr
  const source = fs.readFileSync(path.join(root, 'README.fr.md'), 'utf8')
  const first = preparePublishedReadme(source, 'fr', facts, copy)
  assert.equal(preparePublishedReadme(first, 'fr', facts, copy), first)
  assert.throws(() => preparePublishedReadme(source, 'fr', { ...facts, stable: '1.0.0' }, copy), /published release facts/)
})
