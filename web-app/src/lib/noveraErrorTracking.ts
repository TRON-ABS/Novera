import { telemetryDestination } from './noveraTelemetry'
import { installDiagnosticSink, safeDiagnosticContext, type DiagnosticContext } from './noveraDiagnostics'

type Source = 'error' | 'unhandledrejection' | 'handled'
type Frame = { platform: 'custom'; lang: 'javascript'; function: string; filename: string; lineno: number; colno: number; chunk_id?: string }
const assetFrame = /(?:https?:\/\/tauri\.localhost|tauri:\/\/localhost)\/assets\/([A-Za-z0-9_-]{1,100}-[A-Za-z0-9_-]{8,16}\.js):(\d{1,9}):(\d{1,9})(?:\)?\s*)$/
const uuid = /^[a-f0-9]{8}-(?:[a-f0-9]{4}-){3}[a-f0-9]{12}$/i

/** Retain only packaged asset names and code coordinates; never error text. */
export function errorReport(error: unknown, source: Source, context: DiagnosticContext = { operation: 'unhandled' }) {
  let type = 'Error'
  const frames: Frame[] = []
  try {
    if (error instanceof Error) {
      if (['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError'].includes(error.name)) type = error.name
      const chunks = (globalThis as typeof globalThis & { _posthogChunkIds?: Record<string, string> })._posthogChunkIds
      const ids = new Map<string, string>()
      for (const [stack, id] of Object.entries(chunks ?? {}).slice(0, 500)) {
        if (!uuid.test(id)) continue
        for (const line of stack.slice(0, 8192).split('\n').slice(1, 51)) {
          const match = line.match(assetFrame)
          if (match) ids.set(match[1], id)
        }
      }
      for (const line of (typeof error.stack === 'string' ? error.stack.slice(0, 8192) : '').split('\n').slice(1, 51)) {
        const match = line.match(assetFrame)
        if (match) frames.push({ platform: 'custom', lang: 'javascript', function: '<redacted>', filename: `assets/${match[1]}`,
          lineno: Number(match[2]), colno: Number(match[3]), ...(ids.has(match[1]) ? { chunk_id: ids.get(match[1]) } : {}) })
        if (frames.length === 10) break
      }
    }
  } catch { /* Hostile error getters must not break the application. */ }
  const diagnostic = safeDiagnosticContext(error, context)
  const value = source === 'handled' ? `${diagnostic.operation}: ${diagnostic.reason_code ?? diagnostic.error_code}` : 'Unhandled application error'
  return {
    ...diagnostic,
    $exception_list: [{ type, value, stacktrace: { frames: frames.reverse(), type: 'raw' },
      mechanism: { type: source, handled: source === 'handled', synthetic: diagnostic.operation === 'smoke_test' } }],
    $exception_fingerprint: JSON.stringify(['novera-v2', type, source, diagnostic.operation, diagnostic.task, diagnostic.engine, diagnostic.reason_code ?? diagnostic.error_code,
      source === 'handled' ? [] : frames.map(f => [f.filename, f.lineno, f.colno])]),
    $issue_name: source === 'handled' ? `Novera ${diagnostic.operation}: ${diagnostic.reason_code ?? diagnostic.error_code}` : `Novera ${type}`,
  }
}

type TrackingConfig = { host: string; key: string; version: string; os: string; buildId?: string; commit?: string; arch?: string; sourceState?: string; environment?: string }
const safeBuild = (value: unknown) => typeof value === 'string' && /^[A-Za-z0-9._-]{1,96}$/.test(value) ? value : 'unknown'
/** Consent-scoped and memory-only. Counts occurrences; limits bursts to 60/minute.
 * No persistent user ID, replay, message text, arbitrary properties or retry queue. */
export function startErrorTracking(target: Window,
  config: TrackingConfig = { host: POSTHOG_HOST, key: POSTHOG_KEY, version: VERSION, os: PLATFORM,
    buildId: typeof NOVERA_BUILD_ID === 'string' ? NOVERA_BUILD_ID : undefined,
    commit: typeof NOVERA_BUILD_COMMIT === 'string' ? NOVERA_BUILD_COMMIT : undefined,
    arch: typeof NOVERA_BUILD_ARCH === 'string' ? NOVERA_BUILD_ARCH : undefined,
    sourceState: typeof NOVERA_BUILD_SOURCE_STATE === 'string' ? NOVERA_BUILD_SOURCE_STATE : undefined,
    environment: typeof NOVERA_BUILD_ENVIRONMENT === 'string' ? NOVERA_BUILD_ENVIRONMENT : undefined },
): () => void {
  const destination = telemetryDestination(config.host, config.key)
  if (!destination) return () => {}
  const controller = new AbortController()
  const pending = new Map<AbortController, ReturnType<typeof setTimeout>>()
  const session = crypto.randomUUID()
  let windowStart = Date.now(), sent = 0, suppressed = 0, failed = 0
  const capture = (error: unknown, source: Source, context: DiagnosticContext = { operation: 'unhandled' }) => {
    if (controller.signal.aborted) return
    try { if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return } catch { return }
    const now = Date.now()
    if (now - windowStart >= 60000) { windowStart = now; sent = 0 }
    if (sent >= 60) { suppressed++; return }
    sent++
    const report = errorReport(error, source, context)
    const dropped = suppressed, deliveryFailures = failed
    suppressed = 0; failed = 0
    const request = new AbortController()
    pending.set(request, setTimeout(() => request.abort(), 10000))
    void fetch(destination, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer', redirect: 'error', cache: 'no-store', signal: request.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.key, event: '$exception', distinct_id: session, properties: {
        ...report, app_version: safeBuild(config.version), os: safeBuild(config.os),
        build_id: safeBuild(config.buildId), git_commit: typeof config.commit === 'string' && /^[a-f0-9]{7,40}$/.test(config.commit) ? config.commit : 'unknown',
        architecture: ['x86_64', 'aarch64', 'arm64', 'x64', 'wasm32'].includes(config.arch ?? '') ? config.arch : 'unknown',
        source_state: ['clean', 'dirty'].includes(config.sourceState ?? '') ? config.sourceState : 'unknown',
        build_environment: ['production', 'development', 'test'].includes(config.environment ?? '') ? config.environment : 'unknown',
        occurrence_count: 1, suppressed_since_last_report: dropped, delivery_failures_since_last_report: deliveryFailures,
        $exception_level: report.error_code === 'runtime_exit' ? 'fatal' : 'error',
        $session_id: session, $lib: 'novera', $lib_version: safeBuild(config.version), $process_person_profile: false, $geoip_disable: true,
      } }),
    }).then(response => { if (!response.ok) failed++ }).catch(() => { failed++ }).finally(() => {
      clearTimeout(pending.get(request)); pending.delete(request)
    })
  }
  const removeSink = installDiagnosticSink((error, context) => capture(error, 'handled', context))
  const onError = (event: ErrorEvent) => capture(event.error, 'error')
  const onRejection = (event: PromiseRejectionEvent) => capture(event.reason, 'unhandledrejection')
  target.addEventListener('error', onError)
  target.addEventListener('unhandledrejection', onRejection)
  return () => {
    controller.abort(); removeSink()
    for (const [request, timer] of pending) { clearTimeout(timer); request.abort() }
    pending.clear()
    target.removeEventListener('error', onError)
    target.removeEventListener('unhandledrejection', onRejection)
  }
}
