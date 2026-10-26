import { invoke } from '@tauri-apps/api/core'
import type { UIMessage, UIMessageChunk } from 'ai'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { beginLocalMemory, releaseFinishedMedia } from './memory'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import { useCreation } from '@/hooks/useCreation'
import {
  creationReference,
  parseCreationReference,
  referencesPreviousImage,
  type CreationTask,
} from '@/modules/engines/creation'
import i18n from '@/i18n'
import { isPlatformTauri } from '@/lib/platform/utils'
import { useModelProvider } from '@/hooks/useModelProvider'
import { getServiceHub } from '@/hooks/useServiceHub'
import { mediaPreset } from '@/constants/mediaProviders'
import { generateCloudMedia, CloudCreationError } from './cloud'
import { getProviderTitle } from '@/lib/utils'
import { reserveImageSeed } from './seed'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { normalizeLocalPath } from '@/modules/platform/local-path'

export function creationStream(
  task: CreationTask,
  prompt: string,
  messages: UIMessage[],
  scope: string,
  signal: AbortSignal | undefined,
  onFinish: () => void
) {
  const state = useCreation.getState()
  const selection = state.selections?.[scope]?.[task]
  const profile =
    selection?.provider === 'diffusers'
      ? useMediaLibrary.getState().profiles.find((p) => p.id === selection.id)
      : undefined
  const settings = { ...state.settings, ...profile?.settings }
  const upscale = useImageUpscale.getState()
  const cloudController = new AbortController()
  let cloudPrepared = false
  let id: string | undefined
  let cancelled = signal?.aborted ?? false
  let closed = false
  let finished = false
  let releaseMemory: (() => void) | undefined
  let stopping: Promise<unknown> | undefined
  let imageSeed: number | undefined
  const memoryPolicy = useMemoryPolicy.getState().policy
  const localizedErrors = new Set<Error>()
  const fail = (key: string): never => {
    const error = new Error(i18n.t(key))
    localizedErrors.add(error)
    throw error
  }
  const failUpscale = (reason: unknown): never => {
    const detail = String(reason).slice(0, 1600)
    const hint = /out of memory|memoryerror/i.test(detail)
      ? 'hub:catalog.tipLimited'
      : detail.includes('CREATION_UPSCALE_MISSING')
        ? 'chat:creation.upscaleMissing'
        : 'chat:creation.upscaleTitle'
    const error = new Error(
      `${i18n.t('chat:creation.failed')} ${i18n.t(hint)}\n${i18n.t('common:details')}: ${detail}`
    )
    localizedErrors.add(error)
    throw error
  }
  const stop = () => {
    cancelled = true
    cloudController.abort()
    if (id) stopping ??= invoke('creation_cancel', { id }).catch(() => {})
  }
  signal?.addEventListener('abort', stop, { once: true })
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const enqueue = (chunk: UIMessageChunk) => {
        if (!closed) controller.enqueue(chunk)
      }
      const started = performance.now()
      const timing = (generationSeconds?: number) => ({
        novera: {
          ...(imageSeed !== undefined ? { seed: imageSeed } : {}),
          totalMs: Math.max(0, performance.now() - started),
          ...(typeof generationSeconds === 'number' &&
          Number.isFinite(generationSeconds) &&
          generationSeconds >= 0
            ? { generationMs: generationSeconds * 1000 }
            : {}),
        },
      })
      try {
        if (!isPlatformTauri()) fail('chat:creation.desktopOnly')
        const cpp = task === 'image' && settings.imageEngine === 'sdcpp'
        const nativeFp4 =
          task === 'image' && settings.imageEngine === 'nvfp4-cuda'
        const model =
          cpp || nativeFp4
            ? (settings.ggufImageModel ?? '')
            : task === 'image'
              ? settings.imageModel
              : settings.videoModel
        if (!selection && !model) fail('chat:creation.configure')
        if (
          nativeFp4 &&
          (!selection || selection.provider === 'diffusers') &&
          /\.gguf$/i.test(model)
        )
          fail('chat:creation.nativeNote')
        if (
          (cpp || nativeFp4) &&
          (!selection || selection.provider === 'diffusers') &&
          (!settings.ggufTextEncoder || !settings.ggufVae)
        )
          fail(
            nativeFp4 ? 'chat:creation.nativeNote' : 'chat:creation.ggufNote'
          )
        const lastUser = messages
          .filter((message) => message.role === 'user')
          .at(-1)
        const files =
          lastUser?.parts.filter((part) => part.type === 'file') ?? []
        if (
          files.some((file) => !file.mediaType?.startsWith('image/')) ||
          files.filter((file) => file.mediaType?.startsWith('image/')).length >
            1
        ) {
          fail('chat:creation.inputUnsupported')
        }
        let inputImage = files.find((file) =>
          file.mediaType?.startsWith('image/')
        )?.url
        const previousImage = referencesPreviousImage(prompt)
          ? messages
              .filter((message) => message.role === 'assistant')
              .flatMap((message) => message.parts)
              .filter(
                (part) =>
                  part.type === 'file' &&
                  parseCreationReference(part.url)?.task === 'image'
              )
              .at(-1)
          : undefined
        const source = parseCreationReference(
          state.sources[scope] ||
            (previousImage?.type === 'file' ? previousImage.url : '')
        )
        if (!inputImage && source?.task === 'image')
          inputImage = await invoke<string>('creation_image_input', {
            name: source.name,
          })
        if (cancelled) throw new DOMException('Aborted', 'AbortError')
        if (selection && selection.provider !== 'diffusers') {
          const provider = useModelProvider
            .getState()
            .providers.find(
              (item) => item.provider === selection.provider && item.active
            )
          const preset = mediaPreset(selection.provider, selection.id)
          if (!provider || !preset || preset.task !== task)
            fail('chat:creation.configure')
          id = crypto.randomUUID()
          await invoke('creation_cloud_prepare', { id })
          cloudPrepared = true
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          enqueue({ type: 'start', messageId: crypto.randomUUID() })
          const result = await generateCloudMedia({
            provider: provider!,
            preset: preset!,
            prompt,
            inputImage,
            signal: cloudController.signal,
            fetch: getServiceHub().providers().fetch(),
            progress: (progress) =>
              useCreation
                .getState()
                .setProgress(scope, { stage: 'generating', progress }),
          })
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          const saved = await invoke<{ name: string; mediaType: string }>(
            'creation_cloud_save',
            {
              request: {
                id,
                task,
                provider: selection.provider,
                model: selection.id,
                prompt,
                url: result.url ?? null,
                base64: result.base64 ?? null,
              },
            }
          )
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          enqueue({
            type: 'file',
            mediaType: saved.mediaType,
            providerMetadata: timing(),
            url: creationReference(task, saved.name),
          })
          enqueue({ type: 'text-start', id: 'creation-model' })
          enqueue({
            type: 'text-delta',
            id: 'creation-model',
            delta: `${i18n.t('chat:creation.model')}: ${getProviderTitle(selection.provider)} · ${preset!.name}`,
          })
          enqueue({ type: 'text-end', id: 'creation-model' })
          enqueue({ type: 'finish', finishReason: 'stop' })
          finished = true
          useCreation.getState().setSource(scope)
          if (!closed) {
            controller.close()
            closed = true
          }
          return
        }
        if (nativeFp4 && (inputImage || settings.device === 'cpu'))
          fail('chat:creation.nativeNote')
        releaseMemory = await beginLocalMemory(
          {
            kind: task,
            provider: cpp ? 'sdcpp' : nativeFp4 ? 'nvfp4-cuda' : 'diffusers',
            model,
          },
          { signal: cloudController.signal, scope, policy: memoryPolicy }
        )
        if (cancelled) throw new DOMException('Aborted', 'AbortError')
        if (task === 'image') imageSeed = reserveImageSeed(profile?.id)
        for (;;) {
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          try {
            id = await invoke<string>('creation_start', {
              request: {
                task,
                memory_policy: memoryPolicy,
                backend: cpp ? 'sdcpp' : nativeFp4 ? 'nvfp4-cuda' : 'diffusers',
                encoder_device: settings.encoderDevice ?? 'auto',
                cpp_executable: IS_WINDOWS
                  ? null
                  : (settings.cppExecutable ?? null),
                cpp_llm: settings.ggufTextEncoder ?? null,
                cpp_vae: settings.ggufVae ?? null,
                cpp_cfg: settings.ggufGuidance ?? 1,
                prompt: prompt.replace(/^\/(?:image|video)\s*/i, ''),
                model,
                python: settings.python,
                device: settings.device,
                width: settings.width,
                height: settings.height,
                steps: settings.steps,
                frames: settings.frames,
                fps: settings.fps,
                seed: imageSeed ?? settings.seed,
                ...(task === 'image' && upscale.enabled
                  ? {
                      upscale_factor: upscale.factor,
                      upscale_model:
                        normalizeLocalPath(
                          upscale.models[upscale.factor] ||
                            upscale.installedModels[upscale.factor] ||
                            ''
                        ) || null,
                    }
                  : {}),
                input_image: inputImage ?? null,
              },
            })
            break
          } catch (error) {
            if (String(error).includes('CREATION_UPSCALE')) failUpscale(error)
            if (
              memoryPolicy !== 'auto' ||
              !String(error).includes('CREATION_BUSY')
            )
              throw error
            useMemoryPolicy.getState().setWaiting(scope, true)
            try {
              await releaseFinishedMedia(cloudController.signal)
            } finally {
              useMemoryPolicy.getState().setWaiting(scope, false)
            }
          }
        }
        if (cancelled) {
          stop()
          throw new DOMException('Aborted', 'AbortError')
        }
        enqueue({ type: 'start', messageId: crypto.randomUUID() })
        for (;;) {
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          const report = await invoke<{
            stage: string
            progress?: number
            name?: string
            error?: string
            generation_seconds?: number
          }>('creation_status', { id })
          useCreation.getState().setProgress(scope, {
            stage: report.stage,
            progress: report.progress ?? 0,
          })
          if (report.stage === 'error') {
            console.error('Novera creation engine:', report.error)
            if (/CREATION_UPSCALE/i.test(report.error ?? ''))
              failUpscale(report.error)
            const hint = /out of memory|memoryerror/i.test(report.error ?? '')
              ? 'hub:catalog.tipLimited'
              : nativeFp4
                ? 'chat:creation.nativeNote'
                : 'chat:creation.configure'
            const error = new Error(
              `${i18n.t('chat:creation.failed')} ${i18n.t(hint)}`
            )
            localizedErrors.add(error)
            throw error
          }
          if (report.stage === 'cancelled')
            throw new DOMException('Aborted', 'AbortError')
          if (report.stage === 'done' && report.name) {
            enqueue({
              type: 'file',
              mediaType: task === 'image' ? 'image/png' : 'video/mp4',
              providerMetadata: timing(report.generation_seconds),
              url: creationReference(task, report.name),
            })
            enqueue({ type: 'text-start', id: 'creation-model' })
            enqueue({
              type: 'text-delta',
              id: 'creation-model',
              delta: `${i18n.t('chat:creation.model')}: ${cpp ? 'stable-diffusion.cpp' : nativeFp4 ? 'NVFP4 CUDA' : 'Diffusers'} · ${model.split(/[\\/]/).pop()}`,
            })
            enqueue({ type: 'text-end', id: 'creation-model' })
            enqueue({ type: 'finish', finishReason: 'stop' })
            finished = true
            useCreation.getState().setSource(scope)
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        if (!closed) {
          controller.close()
          closed = true
        }
      } catch (error) {
        const aborted =
          cancelled ||
          (typeof error === 'object' &&
            error !== null &&
            'name' in error &&
            error.name === 'AbortError')
        const visible = aborted
          ? new DOMException('Aborted', 'AbortError')
          : error instanceof Error && localizedErrors.has(error)
            ? error
            : error instanceof CloudCreationError
              ? new Error(
                  `${i18n.t(`chat:creation.${error.code}`)}${error.status ? ` (HTTP ${error.status})` : ''}`
                )
              : String(error).includes('NVFP4_NATIVE_UNAVAILABLE')
                ? new Error(i18n.t('chat:creation.nativeNote'))
                : String(error).includes('CREATION_TEXT_ENCODER_AS_DIFFUSION')
                  ? new Error(i18n.t('chat:creation.ggufWrongModel'))
                  : String(error).includes('CREATION_BUSY')
                    ? new Error(i18n.t('hub:discovery.busy'))
                    : new Error(
                        `${i18n.t('chat:creation.failed')} ${i18n.t('chat:creation.configure')}`
                      )
        if (visible !== error)
          console.error('Novera creation diagnostics:', error)
        if (!closed) {
          controller.error(visible)
          closed = true
        }
      } finally {
        if (!finished) stop()
        if (cloudPrepared && id) {
          if (!finished) await invoke('creation_cancel', { id }).catch(() => {})
          await invoke('creation_cloud_release', { id }).catch(() => {})
        }
        await stopping
        releaseMemory?.()
        signal?.removeEventListener('abort', stop)
        useCreation.getState().setProgress(scope)
        onFinish()
      }
    },
    cancel() {
      closed = true
      stop()
    },
  })
}
