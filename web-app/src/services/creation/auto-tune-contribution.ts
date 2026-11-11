import type { ConfirmedGain } from '@/containers/AutoTuneDashboard'

const consentPrefix = 'novera-auto-tune-contribution-consent'
const sentKey = 'novera-auto-tune-contributions-sent'
const retryAfter = new Map<string, number>()
const pending = new Set<string>()

export function contributionEndpoint() {
  try {
    const url = new URL(import.meta.env.VITE_NOVERA_AUTO_TUNE_CONTRIBUTION_URL ?? '')
    const localPreview = typeof location !== 'undefined' && url.protocol === 'http:' &&
      url.hostname === '127.0.0.1' && location.hostname === '127.0.0.1'
    if ((url.protocol === 'https:' || localPreview) && !url.username && !url.password && !url.search && !url.hash)
      return url.href
  } catch { /* An unconfigured build prepares local reports. */ }
}

export function contributionConsentKey() {
  return consentPrefix + ':' + (contributionEndpoint() ?? 'draft')
}

export function contributionReport(gain: ConfirmedGain, browser: boolean) {
  const model = gain.model.split(/[\\/]/).at(-1) ?? ''
  const { threads, load_mode, sampling, commandBatchSize, cacheMiB, vaeChunk, kernelFlags, ditWindows, encoderWindows, plannerWindows, wanKernelFlags } = gain.profile ?? {}
  const profile = {
    ...(typeof threads === 'number' && [0, 2, 4, 8].includes(threads) ? { threads } : {}),
    ...(load_mode === 'none' ? { load_mode } : {}),
    ...(browser && gain.task === 'text' && (sampling === 'cpu' || sampling === 'gpu') ? { sampling } : {}),
    ...(browser && gain.task === 'text' && (commandBatchSize === 32 || commandBatchSize === 64 || commandBatchSize === 128) ? { commandBatchSize } : {}),
    ...(!browser && gain.task === 'text' && typeof cacheMiB === 'number' && [0, 64, 128, 256].includes(cacheMiB) ? { cacheMiB } : {}),
    ...(!browser && gain.task === 'music' && typeof vaeChunk === 'number' && [128, 512, 1024].includes(vaeChunk) ? { vaeChunk } : {}),
    ...(browser && gain.task === 'image' && (kernelFlags === 0 || kernelFlags === 242 || kernelFlags === 12530) ? { kernelFlags } : {}),
    ...(browser && gain.task === 'music' && ditWindows === false ? { ditWindows } : {}),
    ...(browser && gain.task === 'music' && encoderWindows === false ? { encoderWindows } : {}),
    ...(browser && gain.task === 'music' && plannerWindows === false ? { plannerWindows } : {}),
    ...(browser && gain.task === 'video' && (wanKernelFlags === 143602 || wanKernelFlags === 159986 || wanKernelFlags === 4354290) ? { wanKernelFlags } : {}),
  }
  return {
    schemaVersion: 1,
    platform: browser ? 'web' : 'desktop',
    task: gain.task,
    model: model.slice(0, 120),
    metric: gain.metric,
    improvementPercent: Number(gain.percent.toFixed(2)),
    repeatedWithIdenticalOutputs: true,
    ...(Object.keys(profile).length ? { profile } : {}),
  }
}

function sentReports(storageKey: string): string[] {
  try {
    const values: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    return Array.isArray(values) ? values.filter(value => typeof value === 'string') : []
  } catch { return [] }
}

export async function submitConfirmedGains(gains: ConfirmedGain[], browser: boolean, signal: AbortSignal) {
  const endpoint = contributionEndpoint()
  if (!endpoint) return
  const storageKey = sentKey + ':' + endpoint
  for (const gain of gains) {
    if (signal.aborted || localStorage.getItem(contributionConsentKey()) !== 'true') return
    const body = JSON.stringify(contributionReport(gain, browser))
    const reportKey = endpoint + '\n' + body
    if (pending.has(reportKey) || sentReports(storageKey).includes(body) || (retryAfter.get(reportKey) ?? 0) > Date.now()) continue
    pending.add(reportKey)
    try {
      const response = await fetch(endpoint, {
        method: 'POST', credentials: 'omit', redirect: 'error',
        headers: { 'Content-Type': 'application/json' }, body,
        signal: AbortSignal.any([signal, AbortSignal.timeout(50_000)]),
      })
      if (!response.ok) throw new Error('Contribution service unavailable')
      const result: { pullRequestUrl?: string } = await response.json()
      if (!/^https:\/\/github\.com\/TRON-ABS\/Novera\/pull\/\d+$/.test(result.pullRequestUrl ?? ''))
        throw new Error('Invalid contribution receipt')
      localStorage.setItem(storageKey, JSON.stringify([...sentReports(storageKey), body]))
    } catch {
      retryAfter.set(reportKey, Date.now() + 60_000)
    } finally { pending.delete(reportKey) }
  }
}
