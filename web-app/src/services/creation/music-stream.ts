import { invoke } from '@tauri-apps/api/core'
import type { UIMessage, UIMessageChunk } from 'ai'
import { useMusicCreation, musicSettingsFor } from '@/hooks/useMusicCreation'
import { musicDurationFromPrompt } from '@/modules/engines/music'
import { parseMusicPrompt } from '@/modules/engines/music-prompt'
import { useCreation } from '@/hooks/useCreation'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import { imageSeedPlan } from '@/modules/engines/image-seed'
import { creationReference } from '@/modules/engines/creation'
import { joinLocalPath } from '@/modules/platform/local-path'
import { beginLocalMemory, releaseFinishedMedia } from './memory'
import i18n from '@/i18n'
import { isPlatformTauri } from '@/lib/platform/utils'
import { musicCloudStream } from './music-cloud-stream'
import { generationSequence } from './sequence'
import type { MusicSettings } from '@/modules/engines/music'
import type { MediaSelection } from '@/hooks/useCreation'

export function musicStream(
  prompt: string,
  messages: UIMessage[],
  scope: string,
  signal: AbortSignal | undefined,
  onFinish: () => void
) {
  const settings = musicSettingsFor(scope)
  const cloudSelection = useCreation.getState().selections[scope]?.music
  return generationSequence(settings.generationCount,
    (signal, finished) => singleMusicStream(prompt, messages, scope, signal, finished, settings, cloudSelection),
    signal, onFinish)
}

function singleMusicStream(
  prompt: string, messages: UIMessage[], scope: string, signal: AbortSignal | undefined,
  onFinish: () => void, snapshot: MusicSettings, cloudSelection: MediaSelection | undefined,
) {
  if (isPlatformTauri() && cloudSelection) {
    if(messages.filter((m)=>m.role==='user').at(-1)?.parts.some((p)=>p.type==='file'))return new ReadableStream<UIMessageChunk>({start(controller){controller.error(new Error(i18n.t('chat:creation.inputUnsupported')));onFinish()}})
    return musicCloudStream(prompt,scope,signal,onFinish,snapshot,cloudSelection)
  }
  let id: string | undefined
  let cancelled = signal?.aborted ?? false
  let closed = false
  let finished = false
  const abort = new AbortController()
  const stop = () => {
    cancelled = true
    abort.abort()
    if (id) void invoke('creation_cancel', { id }).catch(() => {})
  }
  signal?.addEventListener('abort', stop, { once: true })
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      const started = performance.now()
      let release: (() => void) | undefined
      const enqueue = (chunk: UIMessageChunk) => {
        if (!closed) controller.enqueue(chunk)
      }
      try {
        if (!isPlatformTauri())
          throw new Error(i18n.t('chat:creation.desktopOnly'))
        const settings = { ...snapshot, seed: musicSettingsFor(scope).seed }
        const song = parseMusicPrompt(prompt)
        const requestedDuration = settings.durationAuto !== false ? musicDurationFromPrompt(prompt) : undefined
        const duration = requestedDuration ?? settings.durationSeconds
        if (!Number.isSafeInteger(duration) || duration < 10 || duration > 600)
          throw new Error(`${i18n.t('chat:creation.musicDuration')} · 10–600 s`)
        if (
          !settings.directory ||
          !settings.generator ||
          !settings.planner ||
          !settings.encoder ||
          !settings.vae
        )
          throw new Error(i18n.t('chat:creation.configure'))
        if (
          messages
            .filter((m) => m.role === 'user')
            .at(-1)
            ?.parts.some((p) => p.type === 'file')
        )
          throw new Error(i18n.t('chat:creation.inputUnsupported'))
        const policy = useMemoryPolicy.getState().policy
        release = await beginLocalMemory(
          {
            kind: 'music',
            provider: 'acestep',
            model: joinLocalPath(settings.directory, settings.generator),
          },
          { signal: abort.signal, scope, policy }
        )
        const plan = imageSeedPlan(
          settings.seed,
          settings.seedMode,
          settings.seedMode === 'random'
            ? crypto.getRandomValues(new Uint32Array(1))[0]
            : 0
        )
        useMusicCreation
          .getState()
          .setSettings({ seed: plan.nextSeed, lastSeed: plan.seed }, scope)
        for (;;) {
          if (cancelled) throw new DOMException('Aborted', 'AbortError')
          try {
            id = await invoke<string>('creation_start', {
              request: {
                task: 'music',
                backend: 'acestep',
                memory_policy: policy,
                prompt: song ? song.caption || i18n.t('chat:creation.music') : prompt.replace(/^\/(?:music|musique)\s*/i, ''),
                model: joinLocalPath(settings.directory, settings.generator),
                cpp_llm: joinLocalPath(settings.directory, settings.encoder),
                cpp_vae: joinLocalPath(settings.directory, settings.vae),
                music_lm: joinLocalPath(settings.directory, settings.planner),
                music_engine: settings.engineDirectory || settings.directory,
                music_lyrics: settings.instrumental
                  ? '[Instrumental]'
                  : song?.lyrics ?? settings.lyrics,
                music_language: settings.instrumental
                  ? 'unknown'
                  : settings.language,
                music_bpm: settings.bpm || song?.bpm || 0,
                music_format: settings.quality.startsWith('mp3')
                  ? 'mp3'
                  : settings.quality,
                music_bitrate: settings.quality === 'mp3-128' ? 128 : 320,
                duration_seconds: requestedDuration ?? settings.durationSeconds,
                steps: settings.steps,
                seed: plan.seed,
                device: settings.device,
                python: 'python',
                width: 1024,
                height: 432,
                frames: 81,
                fps: 16,
              },
            })
            break
          } catch (error) {
            if (policy !== 'auto' || !String(error).includes('CREATION_BUSY'))
              throw error
            await releaseFinishedMedia(abort.signal)
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
            recovery?: boolean
          }>('creation_status', { id })
          useCreation
            .getState()
            .setProgress(scope, {
              stage: report.stage,
              progress: report.progress ?? -1,
              detail: report.recovery ? 'CPU' : undefined,
            })
          if (report.stage === 'error')
            throw new Error(
              `${i18n.t('chat:creation.failed')}\n${report.error ?? ''}`
            )
          if (report.stage === 'cancelled')
            throw new DOMException('Aborted', 'AbortError')
          if (report.stage === 'done' && report.name) {
            enqueue({
              type: 'file',
              mediaType: report.name.endsWith('.mp3')
                ? 'audio/mpeg'
                : 'audio/wav',
              url: creationReference('music', report.name),
              providerMetadata: {
                novera: {
                  seed: plan.seed,
                  totalMs: performance.now() - started,
                },
              },
            })
            enqueue({ type: 'finish', finishReason: 'stop' })
            finished = true
            break
          }
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        if (!closed) {
          closed = true
          controller.close()
        }
      } catch (error) {
        if (!closed) {
          closed = true
          controller.error(
            cancelled ? new DOMException('Aborted', 'AbortError') : error
          )
        }
      } finally {
        if (!finished && id)
          await invoke('creation_cancel', { id }).catch(() => {})
        release?.()
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
