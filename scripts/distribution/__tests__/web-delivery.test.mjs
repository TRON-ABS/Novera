import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import http from 'node:http'
import { prepareWebDelivery, validateWebDelivery } from '../web-delivery.mjs'

function payload(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-web-delivery-'))
  t.after(() => fs.rmSync(root, { recursive: true, force: true }))
  fs.writeFileSync(path.join(root, 'index.html'), '<script src="app.js"></script>')
  fs.writeFileSync(path.join(root, 'app.js'), 'globalThis.revision="first"')
  return root
}
const identity = { version: '1.0.0', commit: 'a'.repeat(40) }

test('Web preparation rejects personal data, symbols, missing payloads and ambiguous revisions', t => {
  const root = payload(t)
  for (const file of ['.env', 'model.gguf', 'app.js.map']) {
    fs.writeFileSync(path.join(root, file), 'private')
    assert.throws(() => prepareWebDelivery(root, identity), /Unpublishable/)
    fs.unlinkSync(path.join(root, file))
  }
  assert.throws(() => prepareWebDelivery(root, { ...identity, commit: 'main' }), /exact stable/)
  fs.unlinkSync(path.join(root, 'index.html'))
  assert.throws(() => prepareWebDelivery(root, identity), /compiled HTML/)
})

test('HTTP revision checks detect stale deployments and verify replacement at the same origin', async t => {
  const root = payload(t)
  const first = prepareWebDelivery(root, identity)
  let validCache = true
  const server = http.createServer((request, response) => {
    const name = new URL(request.url, 'http://127.0.0.1').pathname.slice(1)
    if (!['index.html', 'app.js', 'novera-web-version.json'].includes(name)) { response.writeHead(404).end(); return }
    response.setHeader('Cache-Control', validCache ? (name.endsWith('.json') ? 'no-store' : 'no-cache') : 'public,max-age=3600')
    response.end(fs.readFileSync(path.join(root, name)))
  })
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  t.after(() => { server.closeAllConnections(); server.close() })
  const origin = `http://127.0.0.1:${server.address().port}/`
  assert.equal((await validateWebDelivery(origin, first)).filesVerified, 2)
  validCache = false
  await assert.rejects(validateWebDelivery(origin, first), /disable storage/)
  validCache = true
  fs.writeFileSync(path.join(root, 'index.html'), '<script src="app.js"></script><p>second revision</p>')
  fs.writeFileSync(path.join(root, 'app.js'), 'globalThis.revision="second"')
  const second = prepareWebDelivery(root, { ...identity, commit: 'b'.repeat(40) })
  await assert.rejects(validateWebDelivery(origin, first), /revision differs/)
  const result = await validateWebDelivery(origin, second)
  assert.equal(result.entrypointRevalidated, true)
  assert.equal(result.hostedChannelValidated, false)
  assert.equal(result.browserUpgradeValidated, false)
  fs.writeFileSync(path.join(root, 'app.js'), 'stale cached bytes')
  await assert.rejects(validateWebDelivery(origin, second), /differs|exceeds/)
})

test('HTTP validation refuses non-TLS remote origins and credentials before any request', async () => {
  for (const origin of ['http://example.com/', 'https://user:password@example.com/', 'https://example.com/?token=x']) {
    await assert.rejects(validateWebDelivery(origin, {}), /requires HTTPS/)
  }
})
