import type { UIMessageChunk } from 'ai'
import { useCreation } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { withNoveraInstructions } from '@/hooks/useNoveraInstructions'
import { imageSeedPlan } from '@/modules/engines/image-seed'
import { creationReference } from '@/modules/engines/creation'
import { browserImageOptions } from './image-options'
import { browserRuntime } from './runtime'
import { saveBrowserLocalMedia } from './media'
import { generateNativeImage, NATIVE_IMAGE_MODEL, NATIVE_IMAGE_PROVIDER } from './native-image-bridge'

export function nativeImageStream(prompt: string, scope: string, signal: AbortSignal | undefined, onFinish: () => void): ReadableStream<UIMessageChunk> {
  const aborter = new AbortController()
  const abort = () => aborter.abort(new DOMException('Création annulée.', 'AbortError'))
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  let claimed = false, finished = false
  const cleanup = () => {
    signal?.removeEventListener('abort', abort)
    if (claimed) { useCreation.getState().setProgress(scope); claimed = false }
    if (!finished) { finished = true; onFinish() }
  }
  return new ReadableStream<UIMessageChunk>({
    async start(output) {
      try {
        aborter.signal.throwIfAborted()
        const state = useCreation.getState()
        if (Object.values(state.progress).some(Boolean)) throw new Error('Une création est déjà en cours.')
        if (browserRuntime.snapshot().phase === 'generating') throw new Error('Attendez la fin de la réponse texte.')
        const settings = { ...state.settings }
        const { width, height, steps } = browserImageOptions({ width: settings.width, height: settings.height, steps: settings.steps })
        if ((settings.generationCount ?? 1) !== 1) throw new Error('La passerelle crée une image à la fois.')
        const upscale = useImageUpscale.getState()
        if (upscale.enabled && upscale.factor !== 2) throw new Error('Cette passerelle prend en charge RealESRGAN ×2.')
        state.setProgress(scope, { stage: 'loading', progress: 0 }); claimed = true
        const started = performance.now()
        await browserRuntime.unload()
        aborter.signal.throwIfAborted()
        const plan = imageSeedPlan(settings.seed, settings.seedMode ?? 'random', settings.seedMode === 'fixed' ? 0 : crypto.getRandomValues(new Uint32Array(1))[0])
        state.setSettings({ seed: plan.nextSeed, lastImageSeed: plan.seed })
        const generationPrompt = withNoveraInstructions('image', prompt.replace(/^\/image\s*/i, ''))
        const result = await generateNativeImage({ prompt: generationPrompt, width, height, steps, seed: plan.seed, upscale: upscale.enabled }, aborter.signal, (stage, progress) => {
          state.setProgress(scope, { stage: stage === 'loading' ? 'loading' : 'generating', progress, ...(stage === 'upscaling' ? { detail: 'Agrandissement Real-ESRGAN ×2…' } : stage === 'decoding' ? { detail: 'Décodage final de l’image…' } : {}) })
        })
        aborter.signal.throwIfAborted()
        state.setProgress(scope, { stage: 'saving', progress: 98 })
        const saved = await saveBrowserLocalMedia(result.image, { task: 'image', provider: NATIVE_IMAGE_PROVIDER, model: NATIVE_IMAGE_MODEL, prompt: generationPrompt }, aborter.signal)
        output.enqueue({ type: 'start', messageId: crypto.randomUUID() })
        output.enqueue({ type: 'file', url: creationReference('image', saved.name), mediaType: saved.mediaType, providerMetadata: { novera: { totalMs: performance.now() - started, seed: plan.seed, width, height, steps, upscaleFactor: upscale.enabled ? 2 : 1, engineSha256: result.engineSha256, ...result.timings } } })
        output.enqueue({ type: 'finish', finishReason: 'stop' }); output.close()
      } catch (error) { output.error(error) }
      finally { cleanup() }
    },
    cancel() { abort(); cleanup() },
  })
}
