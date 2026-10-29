import type { UIMessageChunk } from 'ai'
import { normalizeGenerationCount } from '@/modules/engines/generation-count'

/** Run one job at a time and expose a single assistant message for the series. */
export function generationSequence(
  value: unknown,
  create: (signal: AbortSignal | undefined, finished: () => void) => ReadableStream<UIMessageChunk>,
  signal: AbortSignal | undefined,
  onFinish: () => void,
) {
  const count = normalizeGenerationCount(value)
  if (count === 1) return create(signal, onFinish)
  const abort = new AbortController()
  let closed = false
  let reader: ReadableStreamDefaultReader<UIMessageChunk> | undefined
  const stop = () => abort.abort()
  signal?.addEventListener('abort', stop, { once: true })
  if (signal?.aborted) stop()
  return new ReadableStream<UIMessageChunk>({
    async start(controller) {
      let started = false
      let finish: Extract<UIMessageChunk, { type: 'finish' }> | undefined
      try {
        for (let index = 0; index < count; index++) {
          abort.signal.throwIfAborted()
          let release!: () => void
          const cleanedUp = new Promise<void>(resolve => { release = resolve })
          reader = create(abort.signal, release).getReader()
          try {
            for (;;) {
              const next = await reader.read()
              if (next.done) break
              if (closed) break
              if (next.value.type === 'start') {
                if (!started) { controller.enqueue(next.value); started = true }
              } else if (next.value.type === 'finish') {
                finish = next.value
              } else {
                controller.enqueue(next.value)
              }
            }
          } finally {
            reader.releaseLock()
            reader = undefined
            // A closed stream can still be releasing its native/cloud job.
            await cleanedUp
          }
        }
        abort.signal.throwIfAborted()
        if (!closed) {
          controller.enqueue(finish ?? { type: 'finish', finishReason: 'stop' })
          controller.close()
          closed = true
        }
      } catch (error) {
        abort.abort()
        if (!closed) { controller.error(error); closed = true }
      } finally {
        signal?.removeEventListener('abort', stop)
        onFinish()
      }
    },
    async cancel() {
      closed = true
      stop()
      await reader?.cancel()
    },
  })
}
