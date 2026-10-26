import { invoke } from '@tauri-apps/api/core'
import { useMemoryPolicy, type MemoryPolicy } from '@/hooks/useMemoryPolicy'
import { useAppState } from '@/hooks/useAppState'
import { getServiceHub } from '@/hooks/useServiceHub'
import { isPlatformTauri } from '@/lib/platform/utils'
import {
  MemoryGate,
  memoryAbort,
  type MemoryTarget,
} from '@/modules/engines/memory-gate'
import type { ModelsService } from '@/services/models/types'
import i18n from '@/i18n'

export function memoryManagementAvailable() {
  return (
    isPlatformTauri() &&
    !(typeof IS_ANDROID !== 'undefined' && IS_ANDROID) &&
    !(typeof IS_IOS !== 'undefined' && IS_IOS)
  )
}
export const LOCAL_TEXT_ENGINES = ['llamacpp', 'mlx', 'transformers'] as const
const gate = new MemoryGate()
const idle = () => {}
const preparation = new Map<
  symbol,
  { owners: number; controller: AbortController; ready?: Promise<void> }
>()
function check(signal?: AbortSignal) {
  if (signal?.aborted) throw memoryAbort()
}
async function pause(signal?: AbortSignal) {
  check(signal)
  await new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      reject(memoryAbort())
    }
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', abort)
      resolve()
    }, 100)
    signal?.addEventListener('abort', abort, { once: true })
  })
}
/** Waits for publication/exit, never kills an active or not-yet-delivered media job. */
export async function releaseFinishedMedia(signal?: AbortSignal) {
  for (;;) {
    check(signal)
    const result = await invoke<{ busy: boolean }>('creation_release_idle')
    if (!result.busy) return
    await pause(signal)
  }
}
async function unloadIdleText(
  models: ModelsService,
  target: MemoryTarget,
  signal?: AbortSignal
) {
  for (const provider of LOCAL_TEXT_ENGINES) {
    const loaded = await models.getActiveModels(provider)
    for (const model of loaded) {
      check(signal)
      if (
        (target.kind === 'text' &&
          target.provider === provider &&
          target.model === model) ||
        gate
          .targets()
          .some(
            (active) =>
              active.kind === 'text' &&
              active.provider === provider &&
              active.model === model
          )
      )
        continue
      await models.stopModel(model, provider)
    }
  }
  const loaded = await Promise.all(
    LOCAL_TEXT_ENGINES.map((provider) => models.getActiveModels(provider))
  )
  useAppState.getState().setActiveModels([...new Set(loaded.flat())])
}

export async function beginLocalMemory(
  target: MemoryTarget,
  options: {
    signal?: AbortSignal
    scope?: string
    models?: ModelsService
    load?: boolean
    auxiliary?: boolean
    policy?: MemoryPolicy
  } = {}
): Promise<() => void> {
  if (!memoryManagementAvailable()) return idle
  const policy = options.policy ?? useMemoryPolicy.getState().policy
  const { signal, scope } = options
  const group = options.load
    ? (gate.groupFor(target) ??
      (options.auxiliary ? gate.textGroup() : undefined))
    : options.auxiliary
      ? gate.textGroup()
      : undefined
  if (scope) useMemoryPolicy.getState().setWaiting(scope, true)
  let release = idle
  try {
    const lease = await gate.acquire(target, {
      manual: policy === 'manual',
      reentrant: options.load || options.auxiliary,
      group,
      signal,
    })
    const shared = preparation.get(lease.groupId) ?? {
      owners: 0,
      controller: new AbortController(),
    }
    shared.owners++
    preparation.set(lease.groupId, shared)
    let released = false
    release = () => {
      if (released) return
      released = true
      shared.owners--
      if (!shared.owners) {
        shared.controller.abort()
        const done = () => {
          preparation.delete(lease.groupId)
          lease.release()
        }
        if (shared.ready) void shared.ready.then(done, done)
        else done()
      } else lease.release()
    }
    check(signal)
    if (policy !== 'manual') {
      shared.ready ??= (async () => {
        await releaseFinishedMedia(shared.controller.signal)
        // Reentrant text loads may use RAG/helper models. Do not evict them.
        if (
          lease.first &&
          (!options.auxiliary ||
            LOCAL_TEXT_ENGINES.includes(
              target.provider as (typeof LOCAL_TEXT_ENGINES)[number]
            ))
        )
          await unloadIdleText(
            options.models ?? getServiceHub().models(),
            target,
            shared.controller.signal
          )
      })()
      await new Promise<void>((resolve, reject) => {
        const abort = () => reject(memoryAbort())
        signal?.addEventListener('abort', abort, { once: true })
        shared.ready!.then(
          () => {
            signal?.removeEventListener('abort', abort)
            resolve()
          },
          (error) => {
            signal?.removeEventListener('abort', abort)
            reject(error)
          }
        )
        if (signal?.aborted) abort()
      })
    }
    check(signal)
    return release
  } catch (error) {
    release()
    if (error instanceof Error && error.name === 'AbortError') throw error
    console.error('Novera memory transition failed', error)
    throw Object.assign(new Error(i18n.t('chat:memory.failed')), {
      name: 'NoveraMemoryError',
    })
  } finally {
    if (scope) useMemoryPolicy.getState().setWaiting(scope, false)
  }
}

/** Holds ownership for the entire consumed stream, including model tools/RAG. */
export function streamWithMemory<T>(
  stream: ReadableStream<T>,
  release: () => void,
  signal?: AbortSignal
) {
  const reader = stream.getReader()
  let closed = false
  const finish = () => {
    signal?.removeEventListener('abort', abort)
    release()
  }
  const abort = () => {
    void reader
      .cancel()
      .finally(finish)
      .catch(() => {})
    closed = true
  }
  signal?.addEventListener('abort', abort, { once: true })
  if (signal?.aborted) abort()
  return new ReadableStream<T>({
    async pull(controller) {
      if (closed) {
        controller.close()
        return
      }
      try {
        const value = await reader.read()
        if (value.done) {
          closed = true
          finish()
          controller.close()
        } else controller.enqueue(value.value)
      } catch (error) {
        closed = true
        finish()
        controller.error(error)
      }
    },
    async cancel(reason) {
      closed = true
      try {
        await reader.cancel(reason)
      } finally {
        finish()
      }
    },
  })
}
