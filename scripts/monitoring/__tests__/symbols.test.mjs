import { test } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { resolve, join, sep } from 'node:path'
import { prepareSymbols, uploadSymbols, verifySymbols } from '../symbols.mjs'
import { runInNewContext } from 'node:vm'
import { pathToFileURL } from 'node:url'
const root = resolve('.build'); mkdirSync(root, { recursive: true })
function fixture() {
  const directory = mkdtempSync(join(root, 'monitoring-test-'))
  const dist = join(directory, 'dist'), output = join(directory, 'private')
  mkdirSync(join(dist, 'assets'), { recursive: true })
  const js = join(dist, 'assets/index-abc12345.js')
  writeFileSync(js, 'console.log("fixture");\n//# sourceMappingURL=index-abc12345.js.map\n')
  writeFileSync(js + '.map', JSON.stringify({ version: 3, file: 'index-abc12345.js', sources: ['fixture.ts'], sourcesContent: ['console.log("fixture");'], names: [], mappings: 'AAAA' }))
  const cleanup = () => { assert(directory.startsWith(root + sep) && directory.includes('monitoring-test-')); rmSync(directory, { recursive: true, force: true }) }
  return { directory, dist, output, js, cleanup }
}
test('offline injection registers resolvable chunk metadata and private maps never remain in the shipped directory', () => {
  const f = fixture()
  try {
    const record = prepareSymbols({ ...f, buildId: 'fixture-build', version: '1.0.0' })
    assert.equal(record.maps, 1)
    assert.match(readFileSync(f.js, 'utf8'), /chunkId=/)
    assert(!readFileSync(f.js, 'utf8').includes('sourceMappingURL='))
    assert(!existsSync(f.js + '.map'))
    assert(existsSync(join(f.output, 'assets/index-abc12345.js.map')))
    const context = { console: { log() {} } }
    runInNewContext(readFileSync(f.js, 'utf8'), context, { filename: 'https://tauri.localhost/assets/index-abc12345.js' })
    const map = JSON.parse(readFileSync(join(f.output, 'assets/index-abc12345.js.map'), 'utf8'))
    assert.equal(map.mappings, ';AAAA')
    assert(Object.values(context._posthogChunkIds).includes(map.chunk_id))
    assert.equal(record.upload, 'pending')
    assert.throws(() => verifySymbols(f.output, true), /pending/)
    let calls = 0
    uploadSymbols(f.output, {}, (args, env) => { calls++; assert.equal(env.POSTHOG_CLI_PROJECT_ID, '319433'); assert(args.includes('symbol-set')) })
    assert.equal(calls, 1)
    assert.equal(JSON.parse(readFileSync(join(f.output, 'symbols.json'), 'utf8')).upload, 'succeeded')
    verifySymbols(f.output, true)
    writeFileSync(join(f.output, 'injected.js'), 'unexpected source')
    assert.throws(() => verifySymbols(f.output), /Unlisted/)
  } finally { f.cleanup() }
})
test('refuses public symbol output and fails if injection did not occur', () => {
  const f = fixture()
  try {
    assert.throws(() => prepareSymbols({ ...f, output: join(f.dist, 'symbols'), buildId: 'test', version: '1' }), /outside/)
    assert.throws(() => prepareSymbols({ ...f, buildId: 'test', version: '1', inject: () => {} }), /Missing PostHog/)
    assert(existsSync(f.js + '.map'))
  } finally { f.cleanup() }
})
test('a real Vite fixture build produces private symbols with injected shipped code', async () => {
  const f = fixture()
  try {
    const { build } = await import(pathToFileURL(resolve('web-app/node_modules/vite/dist/node/index.js')).href)
    writeFileSync(join(f.directory, 'index.html'), '<script type="module" src="/main.ts"></script>')
    writeFileSync(join(f.directory, 'main.ts'), 'document.body.dataset.fixture = "monitoring-test"')
    await build({ configFile: false, root: f.directory, logLevel: 'silent', build: { outDir: f.dist, emptyOutDir: true, sourcemap: true } })
    const record = prepareSymbols({ ...f, buildId: 'vite-fixture', version: '1.0.0' })
    assert(record.maps > 0)
    const runtime = readFileSync(join(f.dist, 'build-info.json'), 'utf8')
    assert(runtime.includes('vite-fixture'))
    assert.equal(record.upload, 'pending')
  } finally { f.cleanup() }
})
test('CSS source maps are archived and removed as well', () => {
  const f = fixture()
  try {
    writeFileSync(join(f.dist, 'style.css'), 'body{color:red}/*# sourceMappingURL=style.css.map */')
    writeFileSync(join(f.dist, 'style.css.map'), JSON.stringify({ version: 3, sources: ['style.css'], names: [], mappings: 'AAAA' }))
    const record = prepareSymbols({ ...f, buildId: 'css-test', version: '1' })
    assert.equal(record.maps, 2)
    assert(!existsSync(join(f.dist, 'style.css.map')))
    assert(!readFileSync(join(f.dist, 'style.css'), 'utf8').includes('sourceMappingURL'))
    assert(existsSync(join(f.output, 'style.css.map')))
  } finally { f.cleanup() }
})
