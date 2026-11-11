import { browserCatalog, browserModel, browserPreviewEnabled } from './config'
import { browserRuntime, type SdkResult } from './runtime'
import { browserTextProfileKey, defaultBrowserTextModel, wasmTextSupported, type BrowserTextProfile } from './wasm-text'
import { browserTextBatchSizes, browserTextCalibrationRevision, browserTextProfiles, type AutoTuneComponent } from '../creation/auto-tune-plan'

export const browserAutoTuneModel = defaultBrowserTextModel
const enabledKey = 'novera-web-auto-tune-enabled'
export const browserCalibrationRevision = browserTextCalibrationRevision
const minimumGain = 0.033
export type BrowserTrialProfile = { label: string; settings: Record<string, unknown> }
export type BrowserWorkProgress = { stage: 'initializing' | 'loading' | 'generating' | 'decoding' | 'encoding'; completed?: number; total?: number }
type BrowserTrial = { phase: Phase; candidate: boolean; label?: string; rate?: number; seconds?: number; error?: string; pending?: boolean; startedAt?: number; timeoutMs?: number; work?: BrowserWorkProgress }
type Sample = { rate: number; output: string }
type Gain = { task: 'text' | 'image' | 'music' | 'video'; model: string; metric: 'rate' | 'duration'; percent: number; recordedAt: number; profile: Record<string, unknown> }
const mediaGainsKey = 'novera-web-auto-tune-media-gains'
export type BrowserMediaProbe = {
  task: 'image' | 'music' | 'video'
  model: string
  provider: string
  key: string
  run: (settings: Record<string, unknown>, signal: AbortSignal, confirmation: boolean, progress?: (value: BrowserWorkProgress) => void) => Promise<Blob>
  candidates: BrowserTrialProfile[]
  defaults?: Record<string, unknown>
  components?: AutoTuneComponent[]
  confirmation?: 'all' | 'best-two'
}

// A measured full Wan run exceeds ten minutes on the reference laptop. Keep a
// bounded wait with enough room for slower candidate kernels and show it in UI.
export function browserMediaTrialTimeout(task: BrowserMediaProbe['task'], confirmation: boolean) {
  return task === 'video' ? (confirmation ? 30 : 15) * 60_000 : 240_000
}

let controller: AbortController | undefined
let enabled: boolean | undefined

export function browserAutoTuneAvailable() {
  return browserPreviewEnabled() && typeof navigator !== 'undefined' && 'gpu' in navigator &&
    (wasmTextSupported() || Boolean(import.meta.env.VITE_NOVERA_BROWSER_MEDIA_PATH || import.meta.env.VITE_NOVERA_BROWSER_MUSIC_PATH) ||
      import.meta.env.VITE_NOVERA_WEB_LOCAL_WAN === 'true')
}

export function browserAutoTuneEnabled() {
  if (!browserAutoTuneAvailable()) return null
  if (enabled !== undefined) return enabled
  try { return localStorage.getItem(enabledKey) === 'true' }
  catch { return false }
}

export function setBrowserAutoTune(enabledValue: boolean) {
  if (!browserAutoTuneAvailable()) return null
  enabled = enabledValue
  if (!enabled) controller?.abort()
  try { localStorage.setItem(enabledKey, String(enabled)) }
  catch { /* The toggle still works for the current session. */ }
  return enabled
}

function browserTextGains(model: typeof browserCatalog[number]): Gain[] {
  try {
    const result: unknown = JSON.parse(localStorage.getItem(browserTextProfileKey(model)) ?? 'null')
    if (typeof result !== 'object' || !result || !('percent' in result) || !('recordedAt' in result) ||
        typeof result.percent !== 'number' || !Number.isFinite(result.percent) || result.percent < 3.3 ||
        typeof result.recordedAt !== 'number' || !Number.isFinite(result.recordedAt)) return []
    return [{ task: 'text', model: model.id, metric: 'rate', percent: result.percent, recordedAt: result.recordedAt, profile: { ...('sampling' in result ? { sampling: result.sampling } : {}), ...('commandBatchSize' in result ? { commandBatchSize: result.commandBatchSize } : {}) } }]
  } catch { return [] }
}

function mediaGains(): Record<string, Gain> {
  try { return JSON.parse(localStorage.getItem(mediaGainsKey) ?? '{}') ?? {} }
  catch { return {} }
}

export function browserAutoTuneGains(): Gain[] {
  return [...browserCatalog.flatMap(browserTextGains), ...Object.values(mediaGains())].sort((a, b) => b.recordedAt - a.recordedAt)
}

export function browserMediaProfile(key: string) {
  return mediaGains()[key]?.profile
}

export function browserMediaProfileKey(runtime: string, files: readonly File[]) {
  return JSON.stringify([runtime, ...files.map(file => [file.name, file.size, file.lastModified])])
}

export function browserAutoTuneTextAvailable() {
  return browserAutoTuneAvailable() && wasmTextSupported()
}

export function browserAutoTuneTextModels() {
  return browserAutoTuneTextAvailable() ? browserCatalog : []
}

export function browserAutoTuneTested(id = browserAutoTuneModel) {
  try { return JSON.parse(localStorage.getItem(browserTextProfileKey(browserModel(id))) ?? 'null')?.revision === browserCalibrationRevision }
  catch { return false }
}

function sampleResult(result: SdkResult): Sample {
  const rate = result.timings?.tokens_per_second
  if (typeof rate !== 'number' || !Number.isFinite(rate) || rate <= 0 || !result.tokenIds?.length)
    throw new Error('No comparable browser timing or token sequence')
  return { rate, output: JSON.stringify([result.tokenIds, result.message.content, result.finish_reason]) }
}

const throughputGain = (reference: Sample, candidate: Sample) => candidate.rate / reference.rate - 1

export function confirmedBrowserGain(pairs: ReadonlyArray<readonly [Sample, Sample]>, improvement = throughputGain) {
  if (pairs.length !== 2 || pairs.some(([reference, candidate]) => reference.output !== candidate.output)) return
  const gains = pairs.map(([reference, candidate]) => improvement(reference, candidate))
  if (gains.every(gain => Number.isFinite(gain) && gain >= minimumGain - Number.EPSILON))
    return Math.min(...gains)
}

export async function calibrateBrowserSampling(
  update: (sample: BrowserTrial) => void,
  id = browserAutoTuneModel,
) {
  if (browserAutoTuneTested(id)) return
  const model = browserModel(id)
  const resultKey = browserTextProfileKey(model)
  await runBrowserCalibration(async signal => {
    let previous: Record<string, unknown> = {}
    try { previous = JSON.parse(localStorage.getItem(resultKey) ?? '{}') ?? {} }
    catch { /* A malformed old receipt must not prevent a fresh calibration. */ }
    const reference: BrowserTextProfile = { sampling: previous.sampling === 'cpu' ? 'cpu' : 'gpu',
      commandBatchSize: typeof previous.commandBatchSize === 'number' && browserTextBatchSizes.includes(previous.commandBatchSize)
        ? previous.commandBatchSize : 64 }
    const candidates = browserTextProfiles
      .filter(profile => profile.sampling !== reference.sampling || profile.commandBatchSize !== reference.commandBatchSize)
    const gain = await browserRuntime.compareWasmSampling(signal, async run =>
      compareBrowserProfiles(candidates, async (phase, candidate) => {
        const profile = candidate ?? reference
        const trial = { phase, candidate: Boolean(candidate), label: profile.sampling.toUpperCase() + ' · ' + profile.commandBatchSize }
        try {
          const sample = sampleResult(await run(profile, phase === 'confirmation'))
          update({ ...trial, rate: sample.rate })
          return sample
        } catch (error) {
          signal.throwIfAborted()
          update({ ...trial, error: String(error) })
          throw error
        }
      }, signal),
      model,
    )
    signal.throwIfAborted()
    const result = gain === undefined ? previous : { ...gain.profile, percent: gain.gain * 100, recordedAt: Date.now() }
    localStorage.setItem(resultKey, JSON.stringify({ ...result, revision: browserCalibrationRevision }))
  })
}

async function runBrowserCalibration(run: (signal: AbortSignal) => Promise<void>) {
  if (controller) throw new Error('CALIBRATION_BUSY')
  controller = new AbortController()
  try { await run(controller.signal) }
  finally { controller = undefined }
}

type Phase = 'screening' | 'confirmation'

export async function compareBrowserProfiles<T>(
  profiles: readonly T[], measure: (phase: Phase, candidate?: T) => Promise<Sample>,
  signal: AbortSignal, improvement = throughputGain,
  confirmation: 'all' | 'best-two' = 'all',
) {
  const reference = await measure('screening')
  let successful = 0
  let failure: unknown
  const measured: { profile: T; sample: Sample }[] = []
  for (const profile of profiles) {
    signal.throwIfAborted()
    try {
      const sample = await measure('screening', profile)
      successful++
      measured.push({ profile, sample })
    } catch (error) {
      signal.throwIfAborted()
      if (String(error).includes('CALIBRATION_BUSY')) throw error
      failure = error
    }
  }
  if (!successful && failure) throw failure
  // Restore the original video policy: screen every configuration, then spend
  // full-length runs only on the two best identical-output improvements.
  const finalists = confirmation === 'best-two' ? measured.filter(({ sample }) => {
    const gain = improvement(reference, sample)
    return sample.output === reference.output && Number.isFinite(gain) && gain >= minimumGain - Number.EPSILON
  }).sort((a, b) => improvement(reference, b.sample) - improvement(reference, a.sample)).slice(0, 2) : measured
  if (confirmation === 'best-two' && !finalists.length) return
  const reruns: { finalist: typeof measured[number]; sample: Sample }[] = []
  for (const finalist of finalists.slice().reverse()) {
    signal.throwIfAborted()
    try {
      reruns.push({ finalist, sample: await measure('confirmation', finalist.profile) })
    } catch (error) {
      signal.throwIfAborted()
      if (String(error).includes('CALIBRATION_BUSY')) throw error
    }
  }
  if (!reruns.length && finalists.length) throw new Error('No browser profile completed confirmation')
  const secondReference = await measure('confirmation')
  if (!reruns.length) return
  return reruns.flatMap(({ finalist, sample }) => {
    const gain = confirmedBrowserGain([[reference, finalist.sample], [secondReference, sample]], improvement)
    return gain === undefined ? [] : [{ profile: finalist.profile, gain }]
  }).sort((a, b) => b.gain - a.gain)[0]
}

export async function calibrateBrowserMedia(
  probe: BrowserMediaProbe,
  update: (sample: BrowserTrial) => void,
) {
  await runBrowserCalibration(async signal => {
    if (['loading', 'generating'].includes(browserRuntime.snapshot().phase)) throw new Error('CALIBRATION_BUSY')
    await browserRuntime.unload()
    const reference = { ...probe.defaults, ...browserMediaProfile(probe.key) }
    const candidates = probe.candidates.map(profile => ({ ...profile, settings: { ...probe.defaults, ...profile.settings } }))
      .filter(profile => [...new Set([...Object.keys(reference), ...Object.keys(profile.settings)])]
        .some(key => reference[key] !== profile.settings[key]))
    const gain = await compareBrowserProfiles(candidates, async (phase, candidate) => {
      signal.throwIfAborted()
      const started = performance.now()
      const confirmation = phase === 'confirmation'
      const trial = { phase, candidate: Boolean(candidate), label: candidate?.label }
      const timeoutMs = browserMediaTrialTimeout(probe.task, confirmation)
      const pending = { ...trial, pending: true, startedAt: Date.now(), timeoutMs }
      update(pending)
      try {
        const blob = await probe.run(candidate?.settings ?? reference,
          AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)]), confirmation,
          work => update({ ...pending, work }))
        const seconds = (performance.now() - started) / 1000
        const digest = await crypto.subtle.digest('SHA-256', await blob.arrayBuffer())
        update({ ...trial, seconds })
        return { rate: 1 / seconds, output: JSON.stringify([...new Uint8Array(digest)]) }
      } catch (error) {
        signal.throwIfAborted()
        update({ ...trial, error: String(error) })
        throw error
      }
    }, signal, (reference, candidate) => 1 - reference.rate / candidate.rate, probe.confirmation)
    signal.throwIfAborted()
    if (gain !== undefined) {
      const entry: Gain = { task: probe.task, model: probe.model, metric: 'duration', percent: gain.gain * 100,
        recordedAt: Date.now(), profile: gain.profile.settings }
      localStorage.setItem(mediaGainsKey, JSON.stringify({ ...mediaGains(), [probe.key]: entry }))
    }
  })
}

export async function browserMediaWorkerTrial(
  worker: Worker, payload: object, output: 'image' | 'audio' | 'frames', signal: AbortSignal,
  progress?: (value: BrowserWorkProgress) => void,
): Promise<Blob> {
  try {
    return await new Promise<Blob>((resolve, reject) => {
      const abort = () => settle(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      signal.addEventListener('abort', abort, { once: true })
      const settle = (error: Error | null, result?: Blob) => {
        signal.removeEventListener('abort', abort)
        if (error) reject(error)
        else resolve(result!)
      }
      worker.onerror = () => settle(new Error('Browser calibration worker failed'))
      worker.onmessageerror = () => settle(new Error('Invalid browser calibration worker message'))
      let stage: BrowserWorkProgress['stage'] = 'initializing'
      worker.onmessage = ({ data }) => {
        if (data.type === 'complete' || data.phase === 'complete') {
          if (output !== 'frames' && data[output] instanceof Blob) settle(null, data[output])
          else if (output === 'frames' && Array.isArray(data.frameRgbaSha256) &&
            data.count === ((payload as { frames?: number }).frames === 25 ? 24 : (payload as { frames?: number }).frames === 81 ? 80 : -1) &&
            data.frameRgbaSha256.length === data.count && data.frameRgbaSha256.every((digest: unknown) => typeof digest === 'string' && /^[a-f0-9]{64}$/.test(digest)))
            settle(null, new Blob([JSON.stringify(data.frameRgbaSha256)]))
          else settle(new Error('Incomplete browser calibration output'))
          return
        }
        if (data.type === 'error' || data.phase === 'error') { settle(new Error(String(data.message))); return }
        if (['initializing', 'loading', 'generating', 'encoding'].includes(data.phase)) {
          stage = data.phase
          progress?.({ stage })
        } else if (data.type === 'engine-log' && /generating latent video completed/i.test(String(data.message))) {
          stage = 'decoding'
          progress?.({ stage })
        } else if (data.type === 'engine-progress' && Number.isSafeInteger(data.step) && Number.isSafeInteger(data.total) &&
          data.total > 0 && data.step >= 0 && data.step <= data.total &&
          (stage === 'decoding' || stage === 'generating' && data.total === (payload as { steps?: number }).steps)) {
          progress?.({ stage, completed: data.step, total: data.total })
        }
      }
      if (signal.aborted) abort()
      else worker.postMessage(payload)
    })
  } finally { worker.onmessage = null; worker.onerror = null; worker.onmessageerror = null; worker.terminate() }
}
