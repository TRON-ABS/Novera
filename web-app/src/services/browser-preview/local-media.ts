import type { UIMessageChunk } from 'ai'
import { useCreation } from '@/hooks/useCreation'
import { browserRuntime } from './runtime'
import { browserMediaProfile, browserMediaProfileKey, browserMediaWorkerTrial, type BrowserMediaProbe } from './auto-tune'
import { saveBrowserLocalMedia } from './media'
import { creationReference } from '@/modules/engines/creation'
import { withNoveraInstructions } from '@/hooks/useNoveraInstructions'
import { browserImageOptions, browserUpscaleTile } from './image-options'
import { imageSeedPlan } from '@/modules/engines/image-seed'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { registerBrowserAutoTuneSource, removeBrowserAutoTuneSource } from './auto-tune-registry'

export const BROWSER_IMAGE_PROVIDER = 'novera-browser'
export const BROWSER_IMAGE_MODEL = 'flux-2-klein-4b-Q4_K_M'
export const imageComponentNames = ['flux-2-klein-4b-Q4_K_M.gguf', 'Qwen3-4B-Q4_K_M.gguf', 'diffusion_pytorch_model.safetensors'] as const
export function browserLocalImagesEnabled() { return import.meta.env.VITE_NOVERA_WEB_LOCAL_MEDIA === 'true' }
let modelFiles: File[] | undefined
export function browserImageFiles() { return modelFiles?.slice() ?? [] }
let upscaleFile: File | undefined
let active = false
export function browserImageUpscaleReady() { return Boolean(upscaleFile) }
export function setBrowserImageUpscaleFile(file?: File) {
  if (active) throw new Error('Attendez la fin de la création avant de changer de modèle.')
  if (file && (file.name !== 'RealESRGAN_x2plus.pth' || file.size !== 67061725)) throw new Error('Choisissez le modèle officiel RealESRGAN_x2plus.pth de Desktop.')
  upscaleFile = file
  if (file) registerBrowserAutoTuneSource('image-upscale', () => browserUpscaleAutoTuneProbe())
  else removeBrowserAutoTuneSource('image-upscale')
}
export function setBrowserImageFiles(files: File[]) {
  if (active) throw new Error('Attendez la fin de la création avant de changer de modèle.')
  if (files.length !== 3 || files.some((file, index) => file.name !== imageComponentNames[index] || file.size === 0)) throw new Error('Sélectionnez les trois composants FLUX.2 Klein Q4 indiqués.')
  modelFiles = files.slice()
  const imported = modelFiles.slice()
  registerBrowserAutoTuneSource('image:' + browserMediaProfileKey(imageRuntime, imported), () => browserImageAutoTuneProbe(imported))
}

const imageRuntime = import.meta.env.VITE_NOVERA_BROWSER_MEDIA_PATH ?? ''

export function browserImageAutoTuneProbe(imported = modelFiles): BrowserMediaProbe | undefined {
  if (!browserLocalImagesEnabled() || !imageRuntime || !imported) return
  const files = imported.slice()
  const options = browserImageOptions(useCreation.getState().settings)
  const key = browserMediaProfileKey(imageRuntime + ':' + JSON.stringify(options), files)
  const runtimeUrl = new URL(`${import.meta.env.BASE_URL}${imageRuntime}/novera-diffusion.mjs`, document.baseURI)
  return { task: 'image', model: files[0].name, provider: BROWSER_IMAGE_PROVIDER, key,
    components: [{ model: files[1].name, role: 'encoder' }, { model: files[2].name, role: 'vae' }], candidates: [
      { label: 'WebGPU · Auto', settings: {} },
      { label: 'WebGPU · 0', settings: { kernelFlags: 0 } },
      { label: 'WebGPU · 12530', settings: { kernelFlags: 12530 } },
      { label: 'WebGPU · 242', settings: { kernelFlags: 242 } },
    ],
    async run(candidate, signal, confirmation) {
      if (active || Object.values(useCreation.getState().progress).some(Boolean)) throw new Error('CALIBRATION_BUSY')
      const receipt = await fetch(new URL('BUILD-VERIFICATION.json', runtimeUrl), { signal }).then(res => res.json())
      if (!receipt.kernelTuningCompiled || receipt.kernelDefaultFlags === 0) throw new Error('No alternate image kernel profile')
      return browserMediaWorkerTrial(new Worker(new URL('./local-media.worker.ts', import.meta.url), { type: 'module' }), {
        runtimeUrl: runtimeUrl.href, files, ...options, ...(confirmation ? {} : { width: 512, height: 512, steps: 2 }),
        prompt: 'A blue cup on a wooden table in daylight', seed: 42, kernelFlags: candidate.kernelFlags,
      }, 'image', signal)
    },
  }
}

function upscaleProfileKey(file: File, options: ReturnType<typeof browserImageOptions>) {
  const { width, height, gpuBudgetGiB } = options
  return browserMediaProfileKey(imageRuntime + ':upscale:' + JSON.stringify({ width, height, gpuBudgetGiB }), [file])
}

// Gradients, fine edges and tile seams, without requiring a diffusion model.
async function upscaleFixture(width: number, height: number, confirmation: boolean) {
  const canvas = new OffscreenCanvas(width, height)
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Encodage PNG indisponible sur cet appareil.')
  const pixels = context.createImageData(width, height)
  const stride = confirmation ? 11 : 7
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const offset = (y * width + x) * 4
    pixels.data[offset] = Math.round(255 * x / Math.max(1, width - 1))
    pixels.data[offset + 1] = Math.round(255 * y / Math.max(1, height - 1))
    pixels.data[offset + 2] = ((x ^ y) % stride === 0) ? 255 : 0
    pixels.data[offset + 3] = 255
  }
  context.putImageData(pixels, 0, 0)
  return canvas.convertToBlob({ type: 'image/png' })
}

export async function browserUpscaleAutoTuneProbe(): Promise<BrowserMediaProbe | undefined> {
  if (!browserLocalImagesEnabled() || !imageRuntime || !upscaleFile) return
  const file = upscaleFile
  const options = browserImageOptions(useCreation.getState().settings)
  const adapter = await navigator.gpu?.requestAdapter()
  if (!adapter?.features.has('shader-f16')) return
  const candidates = [128, 256, 512].flatMap(tile => {
    try {
      browserUpscaleTile(options.gpuBudgetGiB, adapter.limits.maxStorageBufferBindingSize, tile)
      return [{ label: `WebGPU · ${tile} × ${tile}`, settings: { upscaleTilePixels: tile } }]
    } catch { return [] }
  })
  if (!candidates.length) return
  const runtimeUrl = new URL(`${import.meta.env.BASE_URL}${imageRuntime}/novera-diffusion.mjs`, document.baseURI)
  return { task: 'image', model: file.name, provider: BROWSER_IMAGE_PROVIDER,
    key: upscaleProfileKey(file, options), candidates, defaults: { upscaleTilePixels: 128 },
    async run(candidate, signal, confirmation) {
      if (active || Object.values(useCreation.getState().progress).some(Boolean)) throw new Error('CALIBRATION_BUSY')
      const width = confirmation ? options.width : 256
      const height = confirmation ? options.height : 256
      const inputImage = await upscaleFixture(width, height, confirmation)
      signal.throwIfAborted()
      return browserMediaWorkerTrial(new Worker(new URL('./local-media.worker.ts', import.meta.url), { type: 'module' }), {
        runtimeUrl: runtimeUrl.href, files: [file], upscaleFile: file, upscaleOnly: true, inputImage,
        width, height, steps: 1, gpuBudgetGiB: options.gpuBudgetGiB, upscaleTilePixels: candidate.upscaleTilePixels,
      }, 'image', signal)
    },
  }
}

export function browserLocalImageStream(prompt: string, scope: string, signal: AbortSignal | undefined, onFinish: () => void): ReadableStream<UIMessageChunk> {
  const controller = new AbortController()
  let worker: Worker | undefined
  let claimed = false
  let finished = false
  const abort = () => { controller.abort(); worker?.terminate() }
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  const cleanup = () => {
    worker?.terminate()
    signal?.removeEventListener('abort', abort)
    if (claimed) { claimed = false; active = false; useCreation.getState().setProgress(scope) }
    if (!finished) { finished = true; onFinish() }
  }
  return new ReadableStream<UIMessageChunk>({
    async start(output) {
      try {
        controller.signal.throwIfAborted()
        if (!browserLocalImagesEnabled() || !modelFiles) throw new Error('Choisissez les trois fichiers du modèle image dans les réglages de création.')
        if (active || Object.values(useCreation.getState().progress).some(Boolean)) throw new Error('Une création est déjà en cours.')
        if (browserRuntime.snapshot().phase === 'generating') throw new Error('Attendez la fin de la réponse texte avant de créer une image.')
        const settings = { ...useCreation.getState().settings }
        const options = browserImageOptions(settings)
        const upscale = useImageUpscale.getState()
        const imageUpscaleFile = upscale.enabled ? upscaleFile : undefined
        if (upscale.enabled && (upscale.factor !== 2 || !imageUpscaleFile)) throw new Error('Pour Real-ESRGAN Web, choisissez le fichier officiel ×2 dans les réglages image. ×4 reste indisponible.')
        if ((settings.generationCount ?? 1) !== 1) throw new Error('Cet essai Web crée une image à la fois.')
        active = true; claimed = true
        const files = modelFiles.slice()
        const started = performance.now()
        useCreation.getState().setProgress(scope, { stage: 'loading', progress: 0 })
        await browserRuntime.unload()
        controller.signal.throwIfAborted()
        const seedPlan = imageSeedPlan(settings.seed, settings.seedMode ?? 'random', settings.seedMode === 'fixed' ? 0 : crypto.getRandomValues(new Uint32Array(1))[0])
        const seed = seedPlan.seed
        useCreation.getState().setSettings({ seed: seedPlan.nextSeed, lastImageSeed: seed })
        const generationPrompt = withNoveraInstructions('image', prompt.replace(/^\/image\s*/i, ''))
        let timings: Record<string, number> = {}
        const timingLogs: string[] = []
        const engineErrors: string[] = []
        const engineStderr: string[] = []
        const recentEngineLogs: string[] = []
        let imagePhase: 'diffusion' | 'decoding' | 'upscaling' = 'diffusion'
        const runWorker = (payload: Record<string, unknown>) => {
          worker = new Worker(new URL('./local-media.worker.ts', import.meta.url), { type: 'module' })
          return new Promise<Blob>((resolve, reject) => {
          const fail = (error: Error) => { controller.signal.removeEventListener('abort', cancel); reject(error) }
          const cancel = () => fail(new DOMException('Création annulée.', 'AbortError'))
          controller.signal.addEventListener('abort', cancel, { once: true })
          worker!.onerror = () => fail(new Error('Le moteur image a été interrompu. Vérifiez la mémoire disponible et la compatibilité du navigateur.'))
          worker!.onmessage = event => {
            const data = event.data
            if (data.type === 'complete' && data.image instanceof Blob) { timings = { ...timings, ...data.timings }; controller.signal.removeEventListener('abort', cancel); resolve(data.image) }
            else if (data.type === 'error') fail(new Error([String(data.message), ...engineErrors, ...engineStderr.slice(-8), ...(data.diagnostic ? [...recentEngineLogs.slice(-6), String(data.diagnostic)] : [])].join('\n').slice(0, 16000)))
            else if (data.type === 'stage') {
              if (data.progress === 90) imagePhase = 'upscaling'
              useCreation.getState().setProgress(scope, { stage: data.stage, progress: data.progress, ...(imagePhase === 'upscaling' ? { detail: 'Agrandissement Real-ESRGAN ×2…' } : {}) })
            }
            else if (data.type === 'engine-log') {
              recentEngineLogs.push(String(data.message).slice(0, 500)); if (recentEngineLogs.length > 10) recentEngineLogs.shift()
              if (data.level >= 3 && engineErrors.length < 20) engineErrors.push(String(data.message).slice(0, 1000))
              if (imagePhase !== 'upscaling' && /decoding .* latents/.test(data.message)) { imagePhase = 'decoding'; useCreation.getState().setProgress(scope, { stage: 'generating', progress: 85, detail: 'Décodage final de l’image…' }) }
              if (/(?:took|taking|completed in|finished in)/i.test(data.message) && timingLogs.length < 30) timingLogs.push(String(data.message).slice(0, 500))
              for (const [phase, marker] of [['textEncodingMs', 'get_learned_condition'], ['diffusionMs', 'sampling'], ['decodingMs', 'decode_first_stage']] as const) {
                const measured = new RegExp(`${marker} completed, taking ([0-9.]+)s`).exec(String(data.message))
                if (measured && Number.isFinite(Number(measured[1]))) timings[phase] = Number(measured[1]) * 1000
              }
            } else if (data.type === 'engine-stderr') { engineStderr.push(String(data.message).slice(0, 1500)); if (engineStderr.length > 20) engineStderr.shift() }
            else if (data.type === 'engine-progress' && imagePhase === 'diffusion' && Number.isFinite(data.step) && data.total === options.steps) useCreation.getState().setProgress(scope, { stage: 'generating', progress: 15 + Math.round(65 * data.step / data.total) })
          }
          const directory = import.meta.env.VITE_NOVERA_BROWSER_MEDIA_PATH
          if (!/^novera-runtime\/[a-f0-9]{64}$/.test(directory ?? '')) { fail(new Error('Le moteur local vérifié manque dans cette construction Web.')); return }
          worker!.postMessage({ runtimeUrl: new URL(`${import.meta.env.BASE_URL}${directory}/novera-diffusion.mjs`, document.baseURI).href, prompt: generationPrompt, seed, ...options, ...payload })
        })
        }
        const profile = browserMediaProfile(browserMediaProfileKey(imageRuntime + ':' + JSON.stringify(options), files))
        let image = await runWorker({ files, kernelFlags: profile?.kernelFlags })
        controller.signal.throwIfAborted()
        if (imageUpscaleFile) {
          worker!.terminate()
          // A fresh heap/GPU context bounds memory and separates model lifetimes.
          imagePhase = 'upscaling'
          const upscaleProfile = browserMediaProfile(upscaleProfileKey(imageUpscaleFile, options))
          image = await runWorker({ files: [imageUpscaleFile], upscaleFile: imageUpscaleFile, upscaleOnly: true, inputImage: image,
            upscaleTilePixels: upscaleProfile?.upscaleTilePixels })
        }
        controller.signal.throwIfAborted()
        useCreation.getState().setProgress(scope, { stage: 'saving', progress: 98 })
        const saved = await saveBrowserLocalMedia(image, { task: 'image', provider: BROWSER_IMAGE_PROVIDER, model: BROWSER_IMAGE_MODEL, prompt: generationPrompt }, controller.signal)
        output.enqueue({ type: 'start', messageId: crypto.randomUUID() })
        output.enqueue({ type: 'file', url: creationReference('image', saved.name), mediaType: saved.mediaType, providerMetadata: { novera: { totalMs: performance.now() - started, seed, ...options, upscaleFactor: imageUpscaleFile ? 2 : 1, ...timings, timingLogs } } })
        output.enqueue({ type: 'finish', finishReason: 'stop' })
        output.close()
      } catch (error) { output.error(error) }
      finally { cleanup() }
    },
    cancel() { abort(); cleanup() },
  })
}
