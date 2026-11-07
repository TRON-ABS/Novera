import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolvePublicTelemetry } from './telemetry.mjs'

const defaults = JSON.parse(readFileSync(new URL('./novera-telemetry.public.json', import.meta.url), 'utf8'))
test('all frontend build targets share the same public collection configuration', () => {
  for (const platform of ['windows', 'linux', 'darwin', 'android', 'ios']) {
    for (const arch of ['x64', 'arm64']) {
      const config = resolvePublicTelemetry({ TAURI_ENV_PLATFORM: platform, TAURI_ENV_ARCH: arch,
        NOVERA_ANALYTICS_HOST: '', NOVERA_ANALYTICS_PROJECT_KEY: '' }, defaults)
      assert.equal(config.host, defaults.host)
      assert.match(config.key, /^phc_[A-Za-z0-9]{20,}$/)
      assert.deepEqual(Object.keys(config).sort(), ['host', 'key'])
    }
  }
})
test('explicit build opt-out takes precedence over default or inherited configuration', () => {
  for (const env of [{NOVERA_DISABLE_TELEMETRY:'true'}, {NOVERA_BUILD_MONITORING:'0'}]) {
    assert.deepEqual(resolvePublicTelemetry(env, defaults), {host:'',key:''})
  }
})
test('rejects partial overrides, private credentials and unsafe destinations', () => {
  assert.throws(() => resolvePublicTelemetry({NOVERA_ANALYTICS_HOST:'https://example.com'}, defaults))
  for (const host of ['http://example.com', 'https://user:password@example.com', 'https://example.com/path',
    'https://example.com?key=x', 'https://example.com#fragment', 'https://api.jan.ai']) {
    assert.throws(() => resolvePublicTelemetry({NOVERA_ANALYTICS_HOST:host,
      NOVERA_ANALYTICS_PROJECT_KEY:defaults.projectKey}, defaults))
  }
  assert.throws(() => resolvePublicTelemetry({NOVERA_ANALYTICS_HOST:defaults.host,
    NOVERA_ANALYTICS_PROJECT_KEY:'phx_private'}, defaults))
})
