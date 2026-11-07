/** A public collection destination configures availability, never consent. */
export function resolvePublicTelemetry(env, defaults) {
  if (env.NOVERA_DISABLE_TELEMETRY === 'true' || env.NOVERA_BUILD_MONITORING === '0') {
    return { host: '', key: '' }
  }
  const hostOverride = (env.NOVERA_ANALYTICS_HOST || '').trim()
  const keyOverride = (env.NOVERA_ANALYTICS_PROJECT_KEY || '').trim()
  if (!!hostOverride !== !!keyOverride) throw new Error('Telemetry destination and public project key must be configured together')
  const host = hostOverride || defaults.host
  const key = keyOverride || defaults.projectKey
  const url = new URL(host)
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash
    || url.pathname !== '/' || /(^|\.)jan\.ai$/i.test(url.hostname)) {
    throw new Error('Telemetry requires an HTTPS origin without credentials or URL parameters')
  }
  if (!/^phc_[A-Za-z0-9]{20,}$/.test(key)) throw new Error('Only a public PostHog project key can be embedded')
  return { host: url.origin, key }
}
