import { invoke } from '@tauri-apps/api/core'
import type { UIMessageChunk } from 'ai'
import { useCreation } from '@/hooks/useCreation'
import type { MediaSelection } from '@/hooks/useCreation'
import { useModelProvider } from '@/hooks/useModelProvider'
import { musicSettingsFor, useMusicCreation } from '@/hooks/useMusicCreation'
import { getServiceHub } from '@/hooks/useServiceHub'
import { mediaPreset } from '@/constants/mediaProviders'
import { generateCloudMedia, CloudCreationError } from './cloud'
import { creationReference } from '@/modules/engines/creation'
import { imageSeedPlan } from '@/modules/engines/image-seed'
import { musicDurationFromPrompt, musicDurationLimits } from '@/modules/engines/music'
import { parseMusicPrompt } from '@/modules/engines/music-prompt'
import i18n from '@/i18n'

export function musicCloudStream(
  prompt: string,
  scope: string,
  signal: AbortSignal | undefined,
  onFinish: () => void,
  snapshot = musicSettingsFor(scope),
  selected: MediaSelection | undefined = useCreation.getState().selections[scope]?.music,
) {
  const abort = new AbortController()
  const id = crypto.randomUUID()
  let prepared = false
  let closed = false
  let finished = false
  let stopping: Promise<unknown> | undefined
  const stop = () => {
    abort.abort()
    if (prepared) stopping ??= invoke('creation_cancel', { id }).catch(() => {})
  }
  signal?.addEventListener('abort', stop, { once: true })
  if (signal?.aborted) stop()
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const started = performance.now()
      try {
        const selection = selected
        const provider = useModelProvider
          .getState()
          .providers.find((p) => p.provider === selection?.provider)
        const preset =
          selection && mediaPreset(selection.provider, selection.id)
        if (!provider?.active || !preset || preset.task !== 'music')
          throw new Error(i18n.t('chat:creation.configure'))
        const settings = { ...snapshot, seed: musicSettingsFor(scope).seed }
        const song = parseMusicPrompt(prompt)
        const duration =
          (settings.durationAuto !== false ? musicDurationFromPrompt(prompt) : undefined) ?? settings.durationSeconds
        const limits = musicDurationLimits(provider.provider)
        if (
          !Number.isSafeInteger(duration) || duration < limits.min || duration > limits.max
        )
          throw new Error(
            `${i18n.t('chat:creation.musicDuration')} · ${limits.min}–${limits.max} s`
          )
        const plan = imageSeedPlan(
          settings.seed,
          settings.seedMode,
          settings.seedMode === 'random'
            ? crypto.getRandomValues(new Uint32Array(1))[0]
            : 0
        )
        abort.signal.throwIfAborted()
        await invoke('creation_cloud_prepare', { id })
        prepared = true
        abort.signal.throwIfAborted()
        if (provider.provider !== 'elevenlabs')
          useMusicCreation
            .getState()
            .setSettings({ seed: plan.nextSeed, lastSeed: plan.seed }, scope)
        controller.enqueue({ type: 'start', messageId: crypto.randomUUID() })
        const result = await generateCloudMedia({
          provider,
          preset,
          prompt: song ? song.caption || i18n.t('chat:creation.music') : prompt.replace(/^\/(?:music|musique)\s*/i, ''),
          signal: abort.signal,
          fetch: getServiceHub().providers().fetch(),
          music: {
            duration,
            seed: plan.seed,
            instrumental: ['elevenlabs','fal'].includes(provider.provider) ? settings.instrumental : true,
            lyrics: ['elevenlabs','fal'].includes(provider.provider) ? song?.lyrics ?? settings.lyrics : '',
            quality: settings.quality,
          },
          progress: (progress) =>
            useCreation
              .getState()
              .setProgress(scope, {
                stage: 'generating',
                progress: Math.min(98, progress),
              }),
        })
        abort.signal.throwIfAborted()
        const saved = await invoke<{ name: string; mediaType: string }>(
          'creation_cloud_save',
          {
            request: {
              id,
              task: 'music',
              provider: provider.provider,
              model: preset.id,
              prompt,
              url: result.url ?? null,
              base64: result.base64 ?? null,
            },
          }
        )
        abort.signal.throwIfAborted()
        if (!closed) {
          controller.enqueue({
            type: 'file',
            mediaType: saved.mediaType,
            url: creationReference('music', saved.name),
            providerMetadata: {
              novera: {
                totalMs: performance.now() - started,
                ...(provider.provider === 'elevenlabs'
                  ? {}
                  : { seed: plan.seed }),
              },
            },
          })
          controller.enqueue({ type: 'finish', finishReason: 'stop' })
          controller.close()
          closed = true
          finished = true
        }
      } catch (error) {
        if (!closed) {
          closed = true
          controller.error(
            error instanceof CloudCreationError
              ? new Error(i18n.t(`chat:creation.${error.code}`))
              : error
          )
        }
      } finally {
        if (!finished) stop()
        await stopping
        if (prepared)
          await invoke('creation_cloud_release', { id }).catch(() => {})
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
