import { afterEach, expect, it, vi } from 'vitest'
import { errorReport, startErrorTracking } from '../noveraErrorTracking'
import { reportDiagnostic, safeDiagnosticContext } from '../noveraDiagnostics'
const config = { host: 'https://eu.i.posthog.com', key: 'public-test-token', version: '1.0.0', os: 'windows', buildId: 'test-20261101', arch: 'x86_64', commit: 'a'.repeat(40), sourceState: 'dirty', environment: 'production' }
const stops: (() => void)[] = []
afterEach(() => { stops.splice(0).forEach(stop => stop()); vi.unstubAllGlobals(); vi.useRealTimers(); vi.restoreAllMocks() })
function fixture() {
  const fetch = vi.fn().mockResolvedValue({ ok: true }); vi.stubGlobal('fetch', fetch)
  const target = new EventTarget() as unknown as Window
  const stop = startErrorTracking(target, config); stops.push(stop)
  const emit = (line = 1) => {
    const error = new TypeError('SECRET')
    error.stack = `TypeError: SECRET\n at secretFunction (https://tauri.localhost/assets/index-abc12345.js:${line}:2)`
    target.dispatchEvent(new ErrorEvent('error', { error }))
  }
  return { fetch, stop, emit }
}
it('excludes raw messages, custom fields, causes, paths, URLs and function names', () => {
  const error = new TypeError('SECRET prompt and sk-private')
  error.stack = 'TypeError: SECRET\n at secretFunction (https://tauri.localhost/assets/index-abc12345.js:10:20)\n at x (C:/Users/SECRET/source.ts:2:3)\n at x (https://private.example/api?key=SECRET:4:5)'
  Object.assign(error, { cause: 'SECRET', token: 'SECRET' })
  const report = errorReport(error, 'error')
  expect(JSON.stringify(report)).not.toMatch(/SECRET|private|Users|secretFunction|localhost/)
  expect(report.$exception_list[0].stacktrace.frames).toEqual([{ platform: 'custom', lang: 'javascript', function: '<redacted>', filename: 'assets/index-abc12345.js', lineno: 10, colno: 20 }])
})
it('associates only valid injected chunk IDs with packaged assets for private source maps', () => {
  const error = new Error('SECRET'); error.stack = 'Error\n at x (tauri://localhost/assets/index-abc12345.js:1:2)'
  vi.stubGlobal('_posthogChunkIds', { [error.stack]: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'SECRET private': 'SECRET' })
  expect(errorReport(error, 'error').$exception_list[0].stacktrace.frames[0].chunk_id).toBe('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee')
})
it('tolerates custom names and hostile getters without leaking them', () => {
  const error = new Error('SECRET'); error.name = 'SECRET'
  Object.defineProperty(error, 'stack', { get: () => { throw new Error('SECRET') } })
  expect(JSON.stringify(errorReport(error, 'error'))).not.toContain('SECRET')
})
it('rejects an unconfigured destination without installing listeners', () => {
  const listen = vi.spyOn(window, 'addEventListener')
  startErrorTracking(window, { ...config, key: '' })()
  expect(listen).not.toHaveBeenCalled()
})
it('counts repeats and uses a memory-only identity shared within one consent session', () => {
  const { fetch, emit, stop } = fixture()
  emit(); emit()
  expect(fetch).toHaveBeenCalledTimes(2)
  const first = JSON.parse(fetch.mock.calls[0][1].body), second = JSON.parse(fetch.mock.calls[1][1].body)
  expect(first.distinct_id).toBe(second.distinct_id)
  expect(first.properties).toMatchObject({ build_id: config.buildId, git_commit: config.commit, architecture: 'x86_64', occurrence_count: 1, $process_person_profile: false })
  expect(first.properties).toMatchObject({ source_state: 'dirty', build_environment: 'production' })
  expect(fetch.mock.calls[0][1].body).not.toContain('SECRET')
  stop(); emit(); expect(fetch).toHaveBeenCalledTimes(2)
  expect(fetch.mock.calls[0][1].signal.aborted).toBe(true)
  const next = new EventTarget() as unknown as Window
  stops.push(startErrorTracking(next, config))
  next.dispatchEvent(new ErrorEvent('error', { error: new Error('SECRET') }))
  expect(JSON.parse(fetch.mock.calls[2][1].body).distinct_id).not.toBe(first.distinct_id)
})
it('limits bursts, reports dropped occurrences and resumes after the window instead of silencing later errors', () => {
  vi.useFakeTimers(); vi.setSystemTime(100000)
  const { fetch, emit } = fixture()
  for (let i = 0; i < 65; i++) emit(i)
  expect(fetch).toHaveBeenCalledTimes(60)
  vi.setSystemTime(160001); emit()
  expect(JSON.parse(fetch.mock.calls[60][1].body).properties.suppressed_since_last_report).toBe(5)
})
it('reports handled failures only with consent, strips context and ignores normal cancellation', () => {
  const before = vi.fn(); vi.stubGlobal('fetch', before)
  reportDiagnostic(new Error('SECRET'), { operation: 'generation' }); expect(before).not.toHaveBeenCalled()
  const { fetch, stop } = fixture()
  reportDiagnostic(new Error('CUDA out of memory SECRET'), { operation: 'generation', task: 'image', engine: 'sdcpp' })
  const payload = JSON.parse(fetch.mock.calls[0][1].body)
  expect(payload.properties).toMatchObject({ operation: 'generation', task: 'image', engine: 'sdcpp', error_code: 'memory' })
  expect(payload.properties.$exception_list[0].mechanism.handled).toBe(true)
  expect(fetch.mock.calls[0][1].body).not.toContain('SECRET')
  reportDiagnostic(new DOMException('SECRET', 'AbortError'), { operation: 'generation' })
  stop(); reportDiagnostic('SECRET', { operation: 'download' }); expect(fetch).toHaveBeenCalledOnce()
  expect(safeDiagnosticContext('SECRET', { operation: 'SECRET', engine: 'SECRET', task: 'SECRET', code: 'SECRET' } as never))
    .toEqual({ operation: 'unhandled', task: 'unknown', engine: 'unknown', error_code: 'unknown' })
})
it('classifies provider status codes without provider response bodies', () => {
  expect(safeDiagnosticContext('SECRET', { operation: 'generation', status: 429 }).error_code).toBe('rate_limit')
  expect(safeDiagnosticContext('SECRET', { operation: 'generation', status: 401 }).error_code).toBe('authentication')
  expect(safeDiagnosticContext('NVFP4_NATIVE_UNAVAILABLE: SECRET', { operation: 'generation' }).reason_code).toBe('NVFP4_NATIVE_UNAVAILABLE')
  expect(JSON.stringify(safeDiagnosticContext('CREATION_SECRET_USER_FILE', { operation: 'generation' }))).not.toContain('SECRET')
})
it('tracks delivery failures without recursive reports and handles unhandled rejections', async () => {
  const fetch = vi.fn().mockRejectedValue(new Error('network SECRET')); vi.stubGlobal('fetch', fetch)
  stops.push(startErrorTracking(window, config))
  const event = new Event('unhandledrejection'); Object.defineProperty(event, 'reason', { value: 'SECRET prompt' })
  window.dispatchEvent(event); await Promise.resolve(); await Promise.resolve()
  fetch.mockResolvedValue({ ok: true }); window.dispatchEvent(event)
  expect(fetch).toHaveBeenCalledTimes(2)
  expect(JSON.parse(fetch.mock.calls[1][1].body).properties.delivery_failures_since_last_report).toBe(1)
  expect(fetch.mock.calls[0][1].body).not.toContain('SECRET')
})
it('ignores unhandled cancellation and aborts a hung report after ten seconds', async () => {
  vi.useFakeTimers()
  const fetch = vi.fn().mockReturnValue(new Promise(() => {})); vi.stubGlobal('fetch', fetch)
  const target = new EventTarget() as unknown as Window
  stops.push(startErrorTracking(target, config))
  const cancelled = new Event('unhandledrejection')
  Object.defineProperty(cancelled, 'reason', { value: new DOMException('SECRET', 'AbortError') })
  target.dispatchEvent(cancelled); expect(fetch).not.toHaveBeenCalled()
  reportDiagnostic(new Error('fixture'), { operation: 'download' })
  const signal = fetch.mock.calls[0][1].signal as AbortSignal
  expect(signal.aborted).toBe(false)
  await vi.advanceTimersByTimeAsync(10000)
  expect(signal.aborted).toBe(true)
})
