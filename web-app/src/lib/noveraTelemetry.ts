/** Optional aggregate statistics, separate from updater requests and local logs. */
export function telemetryDestination(host: string, key: string): string | undefined {
  if (!key.trim() || !host.trim()) return
  try {
    const url = new URL(host)
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) return
    if (url.pathname !== '/' || /(^|\.)jan\.ai$/i.test(url.hostname)) return
    return `${url.origin}/i/v0/e/`
  } catch { return }
}

export const analyticsAvailable = !!telemetryDestination(POSTHOG_HOST, POSTHOG_KEY)
export const analyticsHost = analyticsAvailable ? new URL(POSTHOG_HOST).hostname : ''
// Consent belongs to one destination/project. Changing either requires a new
// decision, rather than forwarding a previous permission to a new recipient.
export const analyticsConsentScope = analyticsAvailable
  ? encodeURIComponent(`${POSTHOG_HOST}|${POSTHOG_KEY}`)
  : 'unconfigured'

export async function sendStartupStatistic(
  signal: AbortSignal,
  config = { host: POSTHOG_HOST, key: POSTHOG_KEY, version: VERSION, os: PLATFORM }
): Promise<void> {
  const destination = telemetryDestination(config.host, config.key)
  if (!destination || signal.aborted) return
  // PostHog requires an event identity. It is never stored or reused between events.
  await fetch(destination, {
    method: 'POST', credentials: 'omit', referrerPolicy: 'no-referrer',
    redirect: 'error', cache: 'no-store',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      api_key: config.key,
      event: 'novera_app_started',
      distinct_id: crypto.randomUUID(),
      properties: {
        app_version: config.version, os: config.os,
        $process_person_profile: false, $geoip_disable: true,
      },
    }),
    signal,
  })
}
