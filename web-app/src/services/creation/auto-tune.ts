import { invoke } from '@tauri-apps/api/core'
import { useCreation, videoSettingsFor } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { normalizeLocalPath } from '@/modules/platform/local-path'
import { musicCalibrationRequest, visualCalibrationRequest } from './calibration'
import { browserPreviewEnabled } from '@/services/browser-preview/config'
import { browserAutoTuneAvailable, browserAutoTuneEnabled, browserAutoTuneTextModels, browserAutoTuneTested, calibrateBrowserMedia, calibrateBrowserSampling } from '@/services/browser-preview/auto-tune'
import { browserAutoTuneWait, discoverBrowserAutoTuneProbes } from '@/services/browser-preview/auto-tune-registry'
import type { BrowserWorkProgress } from '@/services/browser-preview/auto-tune'
import { autoTuneCampaignKey, browserTextCalibrationRevision, browserTextProfiles, nativeTextChecks, type AutoTuneComponent } from './auto-tune-plan'

type Job = () => Promise<unknown>
export const autoTuneTasks = ['text', 'image', 'music', 'video'] as const
export type AutoTuneTask = typeof autoTuneTasks[number]
export type AutoTuneModel = { id: string; task: AutoTuneTask; model: string; provider: string; profiles: number; checks?: string[]; components?: AutoTuneComponent[] }
type PlannedJob = Omit<AutoTuneModel, 'profiles'> & { key: string; alreadyComplete?: boolean; run: Job }
const selectionKey = 'novera-auto-tune-excluded-models'

function readStoredIds(key: string): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(key) ?? '[]')
    return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function plannedJob(task: AutoTuneTask, model: string, provider: string, run: Job, profile?: unknown, checks?: string[], components?: AutoTuneComponent[]): PlannedJob {
  const identity = task === 'text' ? model : normalizeLocalPath(model).replace(/\\/g, '/')
  const id = JSON.stringify([task, provider, identity])
  return { id, key: JSON.stringify([id, profile ?? null]), task, model, provider, run, checks, components }
}

type TaskCounts = Record<AutoTuneTask, { completed: number; total: number }>
export type CalibrationTrial = {
  pending?: boolean
  startedAt?: number
  timeoutMs?: number
  work?: BrowserWorkProgress
  phase?: string
  round?: number
  profile?: { threads: number | null; load_mode: string | null }
  candidate?: boolean
  label?: string
  loadSeconds?: number
  rate?: number
  seconds?: number
  error?: string
}
export type ActiveTest = {
  task: AutoTuneTask
  model: string
  provider: string
  report?: {
    embedding?: boolean
    trials?: CalibrationTrial[]
    comparisons?: { identical: boolean; qualified: boolean }[]
    confirmation?: { identical: boolean; qualified: boolean }[]
    pairs?: { identical: boolean; qualified: boolean; phase?: string }[]
    reference?: { threads: number | null; load_mode: string | null }
    error?: string
  }
}

const emptyProgress = {
  active: null, remaining: null, total: 0, completed: 0, pass: 0, failed: 0,
  browserComplete: false, standby: false, startedAt: null, lastError: null, taskCounts: null, models: [], excluded: [],
} as const
let progress: {
  active: ActiveTest | null; remaining: number | null
  total: number; completed: number; pass: number; failed: number; browserComplete: boolean; standby: boolean
  startedAt: number | null; lastError: string | null; taskCounts: TaskCounts | null
  models: readonly AutoTuneModel[]; excluded: readonly string[]
  results?: readonly ActiveTest[]
} = { ...emptyProgress, excluded: readStoredIds(selectionKey) }
const listeners = new Set<() => void>()

export const getAutoTuneProgress = () => progress
export const getInitialAutoTuneProgress = () => emptyProgress
export function subscribeAutoTuneProgress(listener: () => void) {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function publishProgress(next: typeof progress) {
  progress = next
  listeners.forEach(listener => listener())
}

function setExcluded(excluded: string[]) {
  try {
    localStorage.setItem(selectionKey, JSON.stringify(excluded))
  } catch {
    // The current session can still use the selection when storage is unavailable.
  }
  publishProgress({ ...progress, excluded })
}

export function selectAutoTuneModel(id: string, selected: boolean) {
  const excluded = new Set(progress.excluded)
  if (selected) excluded.delete(id)
  else excluded.add(id)
  setExcluded([...excluded])
}

export function selectAllAutoTuneModels(selected: boolean) {
  setExcluded(selected ? [] : [...new Set([...progress.excluded, ...progress.models.map(model => model.id)])])
}

function publishModels(queues: PlannedJob[][]) {
  const models = new Map<string, AutoTuneModel>()
  for (const queue of queues) {
    for (const { id, task, model, provider, checks, components } of queue) {
      const existing = models.get(id)
      if (existing) {
        existing.profiles++
        existing.checks = [...new Set([...(existing.checks ?? []), ...(checks ?? [])])]
        existing.components = [...new Map([...(existing.components ?? []), ...(components ?? [])]
          .map(component => [JSON.stringify(component), component])).values()]
      } else models.set(id, { id, task, model, provider, profiles: 1, checks, components })
    }
  }
  const next = [...models.values()]
  if (JSON.stringify(next) !== JSON.stringify(progress.models)) publishProgress({ ...progress, models: next })
}

let discoveryRevision = 0
export async function refreshAutoTuneModels() {
  const revision = ++discoveryRevision
  const jobs = await discoverJobs()
  if (revision === discoveryRevision) publishModels(jobs)
}

export function setAutoTuneActivity(active: ActiveTest | null) {
  const previous = progress.active
  if (previous?.task === active?.task && previous?.model === active?.model &&
      previous?.provider === active?.provider &&
      JSON.stringify(previous?.report) === JSON.stringify(active?.report)) return
  const results = progress.results ?? []
  const finished = previous && (!active || previous.task !== active.task || previous.model !== active.model || previous.provider !== active.provider)
  publishProgress({ ...progress, active, results: finished
    ? [...results.filter(result => result.task !== previous.task || result.model !== previous.model || result.provider !== previous.provider), previous]
    : results })
}
type TextEngine = {
  calibrationCandidates(mediaTextPaths?: string[]): Promise<string[]>
  calibrateRegisteredModel(id: string): Promise<void>
}

let running: Promise<void> | undefined
const passPauseMs = 3_000
export async function readAutoTuneEnabled() {
  return browserPreviewEnabled() ? browserAutoTuneEnabled() : invoke<boolean | null>('desktop_calibration')
}

export function startAutoTune(): Promise<void> {
  if (running) return running
  const storageKey = autoTuneCampaignKey(browserPreviewEnabled(), typeof VERSION === 'string' ? VERSION : 'development')
  const completed = new Set(readStoredIds(storageKey))
  const handled = new Set(completed)
  running = runAutoTuneLoop(() => tuneImportedModels({
    handled,
    record(job, error) {
      handled.add(job.key)
      if (error) return
      completed.add(job.key)
      try { localStorage.setItem(storageKey, JSON.stringify([...completed])) }
      catch { /* The active session still remembers finished profiles. */ }
    },
  }), readAutoTuneEnabled, browserPreviewEnabled() ? browserAutoTuneWait() : undefined).finally(() => {
    running = undefined
    publishProgress({ ...emptyProgress, models: progress.models, excluded: progress.excluded, results: progress.results })
  })
  return running
}

export async function runAutoTuneLoop(
  pass: () => Promise<void>,
  enabled: () => Promise<boolean | null>,
  wait = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms)),
) {
  while (await enabled() === true) {
    try {
      await pass()
    } catch (error) {
      console.warn('Auto Tune:', error)
    }
    if (await enabled() !== true) return
    await wait(passPauseMs)
  }
}

async function extensionJobs(name: string, provider: string, mediaTextPaths?: string[]): Promise<PlannedJob[]> {
  const engine = window.core?.extensionManager.getByName(name) as unknown as TextEngine | undefined
  if (!engine?.calibrationCandidates) return []
  return [...new Set(await engine.calibrationCandidates(mediaTextPaths))].map(model =>
    plannedJob('text', model, provider, () => engine.calibrateRegisteredModel(model), undefined, nativeTextChecks(provider))
  )
}

async function nativeTextJobs(engine: 'onnx' | 'transformers'): Promise<PlannedJob[]> {
  const models = await invoke<{ id: string }[]>(engine + '_list')
  if (!models.length) return []
  const raw = await invoke<string | null>('settings_get', { key: '@novera/' + engine + '-extension' })
  const settings = raw ? JSON.parse(raw) as { key: string; controllerProps?: { value?: string } }[] : []
  const value = (key: string) => settings.find(setting => setting.key === key)?.controllerProps?.value
  const pythonPath = value('python_path') ?? 'python'
  const device = value('execution_device') ?? 'auto'
  return models.map(model => plannedJob('text', model.id, engine, () => invoke(engine + '_calibrate_registered', {
    modelId: model.id, pythonPath, device,
  }), { pythonPath, device }, nativeTextChecks(engine).map(check => `${device} · ${check}`)))
}

async function discoverJobs(): Promise<PlannedJob[][]> {
  if (browserPreviewEnabled()) {
    if (!browserAutoTuneAvailable()) return [[], [], [], []]
    const text: PlannedJob[] = []
    const image: PlannedJob[] = []
    const music: PlannedJob[] = []
    const video: PlannedJob[] = []
    for (const model of browserAutoTuneTextModels()) {
      const job = plannedJob('text', model.id, 'novera-browser', () => runBrowserJob(
        { task: 'text', model: model.id, provider: 'novera-browser' },
        update => calibrateBrowserSampling(update, model.id),
      ), [import.meta.env.VITE_NOVERA_BROWSER_TEXT_PATH, model.revision, model.file, browserTextCalibrationRevision],
      browserTextProfiles.map(profile => profile.sampling.toUpperCase() + ' · ' + profile.commandBatchSize))
      text.push({ ...job, alreadyComplete: browserAutoTuneTested(model.id) })
    }
    for (const probe of await discoverBrowserAutoTuneProbes()) {
      ;({ image, music, video })[probe.task].push(plannedJob(probe.task, probe.model, probe.provider, () => runBrowserJob(
        { task: probe.task, model: probe.model, provider: probe.provider },
        update => calibrateBrowserMedia(probe, update),
      ), probe.key, probe.candidates.map(candidate => candidate.label), probe.components))
    }
    return [text, image, music, video]
  }
  if (typeof IS_ANDROID !== 'undefined' && IS_ANDROID) {
    return [await extensionJobs('@janhq/llamacpp-extension', 'llamacpp'), [], [], []]
  }
  const library = useMediaLibrary.getState().profiles
  const creation = useCreation.getState()
  // Only files already chosen in Novera's media settings/registrations are
  // offered to the native importer. No directory scan and no Web-side import.
  const mediaTextPaths = [...new Set([
    ...library.map(profile => profile.settings), creation.settings, videoSettingsFor(creation),
  ].filter(settings => settings.ggufImageModel || settings.imageModel || settings.videoModel)
    .map(settings => settings.ggufTextEncoder)
    .filter((path): path is string => typeof path === 'string' && path.length > 0)
    .map(normalizeLocalPath))]
  const engines = await Promise.allSettled([
    extensionJobs('@janhq/llamacpp-extension', 'llamacpp', mediaTextPaths),
    extensionJobs('@janhq/mlx-extension', 'mlx'),
    nativeTextJobs('onnx'),
    nativeTextJobs('transformers'),
  ])
  const text = engines.flatMap(result => {
    if (result.status === 'fulfilled') return result.value
    console.warn('Auto Tune model discovery:', result.reason)
    return []
  })
  const music = useMusicCreation.getState()
  const upscale = useImageUpscale.getState()
  const upscalePath = (factor: 2 | 4) => normalizeLocalPath(upscale.models[factor] || upscale.installedModels[factor] || '')
  const mediaRequests = new Set<string>()
  const probe = <T extends { model: string; backend?: string; device?: string; width?: number; height?: number; steps?: number; duration_seconds?: number; cpp_llm?: string | null; cpp_vae?: string | null; music_lm?: string | null; upscale_model?: string }>(task: AutoTuneTask, request: T | undefined): PlannedJob[] => {
    if (!request) return []
    const key = JSON.stringify(request)
    if (mediaRequests.has(key)) return []
    mediaRequests.add(key)
    const configuration = [request.backend, request.device,
      task === 'music' ? `${request.duration_seconds ?? 10} s` : `${request.width} × ${request.height}`,
      request.steps === undefined ? undefined : `${request.steps} steps`,
    ].filter(Boolean).join(' · ')
    const checks = (task === 'music' ? [128, 512, 1024] : [2, 4, 8])
      .map(value => `${configuration} · ${task === 'music' ? 'VAE' : 'CPU'}: ${value}`)
    const components: AutoTuneComponent[] = []
    if (request.upscale_model) components.push({ model: request.model, role: 'generator' })
    if (request.cpp_llm) components.push({ model: request.cpp_llm, role: 'encoder' })
    if (request.cpp_vae) components.push({ model: request.cpp_vae, role: 'vae' })
    if (request.music_lm) components.push({ model: request.music_lm, role: 'planner' })
    return [plannedJob(task, request.upscale_model ?? request.model, task === 'music' ? 'novera-music' : request.backend ?? 'diffusers',
      () => invoke('creation_calibrate', { request, quick: false, previewUpscaleModel: upscalePath(2) || null }),
      { request, previewUpscaleModel: upscalePath(2) || null }, checks, components)]
  }
  const imageProfiles = library.filter(p => p.task === 'image')
  const videoProfiles = library.filter(p => p.task === 'video')
  const image = [...imageProfiles.map(p => p.settings), creation.settings].flatMap(settings => {
    const request = visualCalibrationRequest('image', settings)
    if (!request) return []
    // Registration makes a model eligible. The user's creation toggle and current
    // choice must not hide the other imported upscalers from the test campaign.
    const upscalers = ([2, 4] as const).flatMap(factor =>
      [...new Set([upscale.models[factor], upscale.installedModels[factor]]
        .filter(Boolean).map(normalizeLocalPath))]
        .flatMap(model => probe('image', { ...request, upscale_factor: factor, upscale_model: model })),
    )
    return [...probe('image', request), ...upscalers]
  })
  const audio = [...music.profiles.map(p => p.settings), music.settings]
    .flatMap(settings => probe('music', musicCalibrationRequest(settings)))
  const video = [...videoProfiles.map(p => p.settings), videoSettingsFor(creation)]
    .flatMap(settings => probe('video', visualCalibrationRequest('video', settings)))
  return [text, image, audio, video]
}

async function runBrowserJob(activity: ActiveTest, run: (update: (trial: CalibrationTrial) => void) => Promise<void>) {
  const trials: CalibrationTrial[] = []
  setAutoTuneActivity(activity)
  try {
    await run(trial => {
      if (trials.at(-1)?.pending) trials.pop()
      trials.push(trial)
      setAutoTuneActivity({ ...activity, report: { trials: [...trials] } })
    })
  } finally { setAutoTuneActivity(null) }
}

async function tuneImportedModels(batch: {
  handled: Set<string>
  record: (job: PlannedJob, error: unknown) => void
}) {
  const discovered = await discoverJobs()
  publishModels(discovered)
  const excluded = new Set(progress.excluded)
  const selected = discovered.map(queue => queue.filter(job => !excluded.has(job.id)))
  const queues = selected.map(queue => queue.filter(job => !job.alreadyComplete && !batch.handled.has(job.key)))
  const [text, image, audio, video] = queues
  let remaining = queues.reduce((sum, queue) => sum + queue.length, 0)
  if (remaining === 0) {
    if (!progress.standby) publishProgress({ ...progress, remaining: 0, standby: true })
    return
  }
  const taskCounts: TaskCounts = {
    text: { completed: 0, total: text.length }, image: { completed: 0, total: image.length },
    music: { completed: 0, total: audio.length }, video: { completed: 0, total: video.length },
  }
  publishProgress({
    ...progress, remaining, total: remaining, completed: 0, browserComplete: false, standby: false,
    pass: progress.pass + (remaining > 0 ? 1 : 0), failed: 0, startedAt: remaining > 0 ? Date.now() : null, lastError: null, taskCounts,
  })
  await runCalibrationQueue(queues.map(queue => queue.map(job => job.run)), readAutoTuneEnabled, (error, index, position) => {
    batch.record(queues[index][position], error)
    --remaining
    const task = autoTuneTasks[index]
    const counts = progress.taskCounts ?? taskCounts
    publishProgress({
      ...progress, remaining, completed: progress.total - remaining,
      standby: remaining === 0,
      taskCounts: { ...counts, [task]: { ...counts[task], completed: counts[task].completed + 1 } },
      failed: progress.failed + (error ? 1 : 0),
      lastError: error ? String(error) : progress.lastError,
    })
  })
}

export async function runCalibrationQueue(
  queues: Job[][],
  enabled: () => Promise<boolean | null>,
  onSettled?: (error: unknown, category: number, position: number) => void,
) {
  const longest = Math.max(0, ...queues.map(queue => queue.length))
  for (let index = 0; index < longest; index++) {
    for (const [category, queue] of queues.entries()) {
      const job = queue[index]
      if (!job) continue
      const deadline = Date.now() + 180000
      let failure: unknown
      while (await enabled() === true) {
        try {
          await job()
          break
        } catch (error) {
          if (!String(error).includes('CALIBRATION_BUSY') || Date.now() >= deadline) {
            console.warn('Auto Tune:', error)
            failure = error
            break
          }
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }
      if (await enabled() !== true) return
      onSettled?.(failure, category, index)
    }
  }
}
