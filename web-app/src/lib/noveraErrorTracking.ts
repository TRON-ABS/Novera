import { telemetryDestination } from './noveraTelemetry'

type Source = 'error' | 'unhandledrejection'
type Frame = { platform: 'custom'; lang: 'javascript'; function: string; filename: string; lineno: number; colno: number }

/** Do not serialize arbitrary errors: messages, causes and custom fields can
 * contain prompts, provider responses, tokens or local file paths. */
export function errorReport(error: unknown, source: Source) {
  let type = 'Error'
  const frames: Frame[] = []
  try {
    if (error instanceof Error) {
      if (['Error', 'TypeError', 'RangeError', 'ReferenceError', 'SyntaxError', 'URIError', 'EvalError'].includes(error.name)) type = error.name
      // Only packaged application assets; no source text, function names,
      // development paths, URL queries, third-party hosts or custom filenames.
      const stack = error.stack
      for (const line of (typeof stack === 'string' ? stack.slice(0, 8192) : '').split('\n').slice(1, 51)) {
        const match = line.match(/(?:https?:\/\/tauri\.localhost|tauri:\/\/localhost)\/assets\/(index-[A-Za-z0-9_-]{6,64}\.js):(\d{1,9}):(\d{1,9})(?:\)?\s*)$/)
        if (match) frames.push({ platform: 'custom', lang: 'javascript', function: '<redacted>', filename: 'novera-app.js', lineno: Number(match[2]), colno: Number(match[3]) })
        if (frames.length === 10) break
      }
    }
  } catch { /* hostile error getters must never break the application */ }
  return {
    $exception_list: [{ type, value: 'Unhandled application error',
      stacktrace: { frames: frames.reverse(), type: 'raw' },
      mechanism: { type: source, handled: false, synthetic: false } }],
    $exception_fingerprint: JSON.stringify([type, source, frames]),
  }
}

/** Installs listeners only while consent is active. No SDK, replay or queue. */
export function startErrorTracking(
  target: Window,
  config = { host: POSTHOG_HOST, key: POSTHOG_KEY, version: VERSION, os: PLATFORM }
): () => void {
  const destination = telemetryDestination(config.host, config.key)
  if (!destination) return () => {}
  const controller = new AbortController()
  const seen = new Set<string>()
  const capture = (error: unknown, source: Source) => {
    if (controller.signal.aborted || seen.size >= 10) return
    const report = errorReport(error, source)
    if (seen.has(report.$exception_fingerprint)) return
    seen.add(report.$exception_fingerprint)
    void fetch(destination, {
      method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
      redirect: 'error', cache: 'no-store', signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ api_key: config.key, event: '$exception',
        distinct_id: crypto.randomUUID(), properties: {
          ...report, app_version: config.version, os: config.os,
          $lib: 'novera', $lib_version: config.version,
          $process_person_profile: false, $geoip_disable: true,
        } }),
    }).catch(() => {})
  }
  const onError = (event: ErrorEvent) => capture(event.error, 'error')
  const onRejection = (event: PromiseRejectionEvent) => capture(event.reason, 'unhandledrejection')
  target.addEventListener('error', onError)
  target.addEventListener('unhandledrejection', onRejection)
  return () => {
    controller.abort()
    target.removeEventListener('error', onError)
    target.removeEventListener('unhandledrejection', onRejection)
  }
}
