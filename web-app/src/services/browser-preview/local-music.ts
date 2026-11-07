import type { UIMessageChunk } from 'ai'
import { useCreation } from '@/hooks/useCreation'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { imageSeedPlan } from '@/modules/engines/image-seed'
import { musicDurationFromPrompt, type MusicSettings } from '@/modules/engines/music'
import { parseMusicPrompt } from '@/modules/engines/music-prompt'
import { creationReference } from '@/modules/engines/creation'
import { browserRuntime } from './runtime'
import { saveBrowserLocalMedia } from './media'
import { browserMusicTiming } from './music-performance'

export const BROWSER_MUSIC_PROVIDER = 'novera-browser-music'
export const BROWSER_MUSIC_MODEL = 'acestep-v15-turbo-Q4_K_M'
// Binding order: planner, generator, text encoder, VAE.
export const musicComponentNames = ['acestep-5Hz-lm-1.7B-Q8_0.gguf', 'acestep-v15-turbo-Q4_K_M.gguf', 'Qwen3-Embedding-0.6B-Q8_0.gguf', 'vae-BF16.gguf'] as const
export function browserLocalMusicEnabled() { return import.meta.env.VITE_NOVERA_WEB_LOCAL_MUSIC === 'true' }
let modelFiles: File[] | undefined
let active = false
export function setBrowserMusicFiles(files: File[]) {
  if (active) throw new Error('Attendez la fin de la création avant de changer de modèle.')
  if (files.length !== 4 || files.some((file, index) => file.name !== musicComponentNames[index] || !file.size)) throw new Error('Sélectionnez les quatre composants ACE-Step indiqués.')
  modelFiles = files.slice()
}

export function browserLocalMusicStream(prompt: string, scope: string, settings: MusicSettings, signal: AbortSignal | undefined, onFinish: () => void): ReadableStream<UIMessageChunk> {
  const controller = new AbortController()
  let worker: Worker | undefined
  let claimed = false, finished = false
  const abort = () => { controller.abort(); worker?.terminate() }
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  const cleanup = () => {
    if (worker) { worker.onmessage = null; worker.onerror = null; worker.terminate() }
    signal?.removeEventListener('abort', abort)
    if (claimed) { claimed = false; active = false; useCreation.getState().setProgress(scope) }
    if (!finished) { finished = true; onFinish() }
  }
  return new ReadableStream<UIMessageChunk>({
    async start(output) {
      try {
        controller.signal.throwIfAborted()
        if (!browserLocalMusicEnabled() || !modelFiles) throw new Error('Choisissez les quatre fichiers ACE-Step dans les réglages de création pour cette session.')
        const song = parseMusicPrompt(prompt)
        const caption = song ? song.caption : prompt.replace(/^\/(?:music|musique)\s*/i, '')
        const lyrics = settings.instrumental ? '[Instrumental]' : song?.lyrics ?? settings.lyrics
        const language = settings.instrumental ? 'unknown' : settings.language || navigator.language.split('-')[0]
        const seconds = (settings.durationAuto !== false ? musicDurationFromPrompt(prompt) : undefined) ?? settings.durationSeconds
        if (!Number.isSafeInteger(seconds) || seconds < 10 || seconds > 30) throw new Error('Cet essai musical accepte une durée de 10 à 30 secondes.')
        if (settings.steps !== 8 || settings.bpm !== 0 || settings.quality !== 'wav32' || settings.device !== 'auto') throw new Error('Cet essai utilise 8 étapes, un tempo décrit dans le texte, WebGPU Auto et WAV 32 bits.')
        if (!caption.trim() || !lyrics.trim() || new TextEncoder().encode(caption).length > 512 || new TextEncoder().encode(lyrics).length > 512 || !/^[a-zA-Z-]{1,32}$/.test(language)) throw new Error('Description et paroles requises, chacune limitée à 512 octets UTF-8 ; choisissez une langue valide.')
        if (active || Object.values(useCreation.getState().progress).some(Boolean) || browserRuntime.snapshot().phase === 'generating') throw new Error('Attendez la fin de la génération en cours.')
        const directory = import.meta.env.VITE_NOVERA_BROWSER_MUSIC_PATH
        if (!/^novera-runtime\/[a-f0-9]{64}$/.test(directory ?? '')) throw new Error('Le moteur musical vérifié manque dans cette construction Web.')
        const files = modelFiles.slice()
        active = true; claimed = true
        useCreation.getState().setProgress(scope, { stage: 'loading', progress: 0 })
        const started = performance.now()
        await browserRuntime.unload()
        controller.signal.throwIfAborted()
        const plan = imageSeedPlan(settings.seed, settings.seedMode, settings.seedMode === 'random' ? crypto.getRandomValues(new Uint32Array(1))[0] : 0)
        useMusicCreation.getState().setSettings({ seed: plan.nextSeed, lastSeed: plan.seed }, scope)
        worker = new Worker(new URL('./local-music.worker.ts', import.meta.url), { type: 'module' })
        const timings: Record<string, number> = {}
        const result = await new Promise<{ wav: Blob; seconds: number }>((resolve, reject) => {
          let settled = false
          const complete = (error?: Error, value?: { wav: Blob; seconds: number }) => {
            if (settled) return
            settled = true; controller.signal.removeEventListener('abort', cancel)
            if (error) reject(error); else resolve(value!)
          }
          const cancel = () => complete(new DOMException('Création annulée.', 'AbortError'))
          controller.signal.addEventListener('abort', cancel, { once: true })
          worker!.onerror = () => complete(new Error('Le moteur musical a été interrompu. Vérifiez la mémoire disponible.'))
          worker!.onmessage = event => {
            if (settled) return
            const data = event.data
            if (data.type === 'complete' && data.wav instanceof Blob) {
              if (!Number.isFinite(data.seconds) || data.seconds <= 0 || data.seconds > seconds) complete(new Error('Durée audio invalide.'))
              else complete(undefined, data)
            } else if (data.type === 'music-timing') Object.assign(timings, browserMusicTiming(data.phase, data.milliseconds))
            else if (data.type === 'error') complete(new Error(String(data.message).slice(0, 1000)))
            else if (['planning', 'synthesizing', 'decoding'].includes(data.phase)) useCreation.getState().setProgress(scope, { stage: 'generating', progress: data.phase === 'decoding' ? 85 : 20 })
          }
          worker!.postMessage({ runtimeUrl: new URL(`${import.meta.env.BASE_URL}${directory}/novera-music.mjs`, document.baseURI).href, files, prompt: caption, lyrics, language, seconds, seed: plan.seed })
        })
        controller.signal.throwIfAborted()
        useCreation.getState().setProgress(scope, { stage: 'saving', progress: 98 })
        const saved = await saveBrowserLocalMedia(result.wav, { task: 'music', provider: BROWSER_MUSIC_PROVIDER, model: BROWSER_MUSIC_MODEL, prompt: caption }, controller.signal)
        output.enqueue({ type: 'start', messageId: crypto.randomUUID() })
        output.enqueue({ type: 'file', url: creationReference('music', saved.name), mediaType: saved.mediaType, providerMetadata: { novera: { totalMs: performance.now() - started, seed: plan.seed, durationSeconds: result.seconds, ...timings } } })
        output.enqueue({ type: 'finish', finishReason: 'stop' }); output.close()
      } catch (error) { output.error(error) }
      finally { cleanup() }
    },
    cancel() { abort(); cleanup() },
  })
}
