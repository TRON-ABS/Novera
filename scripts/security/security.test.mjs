import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, mkdtempSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

const root = new URL('../../', import.meta.url)
const json = (path) => JSON.parse(readFileSync(new URL(path, root), 'utf8'))

test('production native capabilities do not grant HTTP origins native access', () => {
  for (const name of ['default', 'mobile']) {
    const capability = json(`src-tauri/capabilities/${name}.json`)
    assert.deepEqual(capability.remote?.urls ?? [], [])
  }
})

test('renderer scripts cannot execute asset files or JavaScript eval', () => {
  const policy = json('src-tauri/tauri.conf.json').app.security
  const scripts = policy.csp['script-src'].split(/\s+/)
  assert(!scripts.includes("'unsafe-eval'"))
  assert(!scripts.includes('asset:'))
  assert(!scripts.includes('http://asset.localhost'))
  assert(scripts.includes("'self'"))
  assert.deepEqual(policy.assetProtocol.scope.allow, [])
  assert(policy.assetProtocol.scope.deny.includes('**/provider_secrets.enc'))
  assert(policy.assetProtocol.scope.deny.includes('**/provider-secrets.*'))
})

test('updated copy CLI handles spaces and copies only requested files', () => {
  const fixture = mkdtempSync(join(tmpdir(), 'novera-copy-security-'))
  try {
    const source = join(fixture, 'entrée source')
    const output = join(fixture, 'output')
    mkdirSync(source)
    writeFileSync(join(source, 'literal[1].txt'), 'synthetic fixture')
    writeFileSync(join(source, 'excluded.bin'), 'not selected')
    const cli = fileURLToPath(new URL('node_modules/cpx/bin/index.js', root))
    // Build commands copy from their working directory, including Unicode paths.
    const result = spawnSync(process.execPath, [cli, 'entrée source/*.txt', 'output'], {
      cwd: fixture, encoding: 'utf8', windowsHide: true,
    })
    assert.equal(result.status, 0, result.stderr)
    assert.equal(readFileSync(join(output, 'literal[1].txt'), 'utf8'), 'synthetic fixture')
    assert(!existsSync(join(output, 'excluded.bin')))
  } finally {
    rmSync(fixture, { recursive: true, force: true })
  }
})
