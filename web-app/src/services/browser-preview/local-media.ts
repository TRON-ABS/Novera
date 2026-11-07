import type { UIMessageChunk } from 'ai'
import { useCreation } from '@/hooks/useCreation'
import { browserRuntime } from './runtime'
import { saveBrowserLocalMedia } from './media'
import { creationReference } from '@/modules/engines/creation'
import { withNoveraInstructions } from '@/hooks/useNoveraInstructions'

export const BROWSER_IMAGE_PROVIDER = 'novera-browser'
export const BROWSER_IMAGE_MODEL = 'flux-2-klein-4b-Q4_K_M'
export const imageComponentNames = ['flux-2-klein-4b-Q4_K_M.gguf', 'Qwen3-4B-Q4_K_M.gguf', 'diffusion_pytorch_model.safetensors'] as const
export function browserLocalImagesEnabled() { return import.meta.env.VITE_NOVERA_WEB_LOCAL_MEDIA === 'true' }
let modelFiles: File[] | undefined
let active = false
export function setBrowserImageFiles(files: File[]) {
  if (active) throw new Error('Attendez la fin de la création avant de changer de modèle.')
  if (files.length !== 3 || files.some((file, index) => file.name !== imageComponentNames[index] || file.size === 0)) throw new Error('Sélectionnez les trois composants FLUX.2 Klein Q4 indiqués.')
  modelFiles = files.slice()
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
        if (!browserLocalImagesEnabled() || !modelFiles) throw new Error('Choisissez les trois fichiers du modèle image dans les réglages de création pour cette session.')
        if (active || Object.values(useCreation.getState().progress).some(Boolean)) throw new Error('Une création est déjà en cours.')
        if (browserRuntime.snapshot().phase === 'generating') throw new Error('Attendez la fin de la réponse texte avant de créer une image.')
        active = true; claimed = true
        const files = modelFiles.slice()
        const started = performance.now()
        useCreation.getState().setProgress(scope, { stage: 'loading', progress: 0 })
        await browserRuntime.unload()
        controller.signal.throwIfAborted()
        const seed = crypto.getRandomValues(new Uint32Array(1))[0]
        const generationPrompt = withNoveraInstructions('image', prompt.replace(/^\/image\s*/i, ''))
        worker = new Worker(new URL('./local-media.worker.ts', import.meta.url), { type: 'module' })
        const image = await new Promise<Blob>((resolve, reject) => {
          const fail = (error: Error) => { controller.signal.removeEventListener('abort', cancel); reject(error) }
          const cancel = () => fail(new DOMException('Création annulée.', 'AbortError'))
          controller.signal.addEventListener('abort', cancel, { once: true })
          worker!.onerror = () => fail(new Error('Le moteur image a été interrompu. Vérifiez la mémoire disponible et la compatibilité du navigateur.'))
          worker!.onmessage = event => {
            const data = event.data
            if (data.type === 'complete' && data.image instanceof Blob) { controller.signal.removeEventListener('abort', cancel); resolve(data.image) }
            else if (data.type === 'error') fail(new Error(String(data.message).slice(0, 1000)))
            else if (data.type === 'stage') useCreation.getState().setProgress(scope, { stage: data.stage, progress: data.progress })
            else if (data.type === 'engine-log' && /decoding .* latents/.test(data.message)) useCreation.getState().setProgress(scope, { stage: 'generating', progress: 85, detail: 'Décodage final de l’image…' })
          }
          const directory = import.meta.env.VITE_NOVERA_BROWSER_MEDIA_PATH
          if (!/^novera-runtime\/[a-f0-9]{64}$/.test(directory ?? '')) { fail(new Error('Le moteur local vérifié manque dans cette construction Web.')); return }
          worker!.postMessage({ runtimeUrl: new URL(`${import.meta.env.BASE_URL}${directory}/novera-diffusion.mjs`, document.baseURI).href, files, prompt: generationPrompt, seed })
        })
        controller.signal.throwIfAborted()
        useCreation.getState().setProgress(scope, { stage: 'saving', progress: 98 })
        const saved = await saveBrowserLocalMedia(image, { task: 'image', provider: BROWSER_IMAGE_PROVIDER, model: BROWSER_IMAGE_MODEL, prompt: generationPrompt }, controller.signal)
        output.enqueue({ type: 'start', messageId: crypto.randomUUID() })
        output.enqueue({ type: 'file', url: creationReference('image', saved.name), mediaType: saved.mediaType, providerMetadata: { novera: { totalMs: performance.now() - started, seed } } })
        output.enqueue({ type: 'finish', finishReason: 'stop' })
        output.close()
      } catch (error) { output.error(error) }
      finally { cleanup() }
    },
    cancel() { abort(); cleanup() },
  })
}
