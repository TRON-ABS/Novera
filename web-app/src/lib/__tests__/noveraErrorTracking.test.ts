import { afterEach, expect, it, vi } from 'vitest'
import { errorReport, startErrorTracking } from '../noveraErrorTracking'

const config = { host: 'https://eu.i.posthog.com', key: 'public-test-token', version: '1.0.0', os: 'windows' }
afterEach(() => vi.unstubAllGlobals())

it('excludes messages, custom fields, causes, paths, URLs and function names', () => {
  const error = new TypeError('SECRET prompt and sk-private')
  error.stack = 'TypeError: SECRET\n at secretFunction (https://tauri.localhost/assets/index-SECRET999.js:10:20)\n at secret (C:/Users/SECRET/source.ts:2:3)\n at x (https://private.example/api?key=SECRET:4:5)\n at x (http://localhost:5173/src/SECRET.ts:6:7)'
  Object.assign(error, { cause: 'SECRET', token: 'SECRET' })
  const report = errorReport(error, 'error')
  expect(JSON.stringify(report)).not.toMatch(/SECRET|private|Users|secretFunction|localhost/)
  expect(report.$exception_list[0].type).toBe('TypeError')
  expect(report.$exception_list[0].stacktrace.frames).toEqual([{ platform: 'custom', lang: 'javascript', function: '<redacted>', filename: 'novera-app.js', lineno: 10, colno: 20 }])
  expect(errorReport('SECRET', 'unhandledrejection').$exception_list[0].value).toBe('Unhandled application error')
})

it('tolerates custom error names and hostile getters without serializing them', () => {
  const error = new Error('SECRET'); error.name = 'SECRET'
  expect(JSON.stringify(errorReport(error, 'error'))).not.toContain('SECRET')
  Object.defineProperty(error, 'stack', { get: () => { throw new Error('SECRET') } })
  expect(() => errorReport(error, 'error')).not.toThrow()
})

it('rejects missing destinations without adding listeners', () => {
  const listen = vi.spyOn(window, 'addEventListener')
  const stop = startErrorTracking(window, { ...config, key: '' })
  expect(listen).not.toHaveBeenCalled(); stop(); listen.mockRestore()
})

it('deduplicates reports, bounds volume and aborts/removes listeners on withdrawal', () => {
  const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch)
  const target = new EventTarget() as unknown as Window
  const stop = startErrorTracking(target, config)
  const emit = (line: number) => {
    const error = new Error('SECRET')
    error.stack = `Error: SECRET\n at x (https://tauri.localhost/assets/index-abc123.js:${line}:2)`
    target.dispatchEvent(new ErrorEvent('error', { error }))
  }
  emit(1); emit(1)
  expect(fetch).toHaveBeenCalledOnce()
  for (let n = 2; n <= 20; n++) emit(n)
  expect(fetch).toHaveBeenCalledTimes(10)
  const [url, options] = fetch.mock.calls[0]
  expect(url).toBe('https://eu.i.posthog.com/i/v0/e/')
  expect(options).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error', cache: 'no-store' })
  const event = JSON.parse(options.body)
  expect(event.event).toBe('$exception')
  expect(event.properties).toMatchObject({ app_version: '1.0.0', os: 'windows', $geoip_disable: true, $process_person_profile: false })
  expect(Object.keys(event.properties).sort()).toEqual(['$exception_fingerprint', '$exception_list', '$geoip_disable', '$lib', '$lib_version', '$process_person_profile', 'app_version', 'os'])
  expect(options.body).not.toContain('SECRET')
  expect(event.distinct_id).not.toBe(JSON.parse(fetch.mock.calls[1][1].body).distinct_id)
  stop(); expect(options.signal.aborted).toBe(true)
  emit(21); expect(fetch).toHaveBeenCalledTimes(10)
})

it('handles rejected promises and swallows network failures without recursion', async () => {
  const fetch = vi.fn().mockRejectedValue(new Error('network')); vi.stubGlobal('fetch', fetch)
  const stop = startErrorTracking(window, config)
  const event = new Event('unhandledrejection')
  Object.defineProperty(event, 'reason', { value: 'SECRET prompt' })
  window.dispatchEvent(event)
  await Promise.resolve()
  expect(fetch).toHaveBeenCalledOnce()
  expect(fetch.mock.calls[0][1].body).not.toContain('SECRET')
  stop()
})
