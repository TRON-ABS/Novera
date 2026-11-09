import type { Model, SdkResult, Turn } from './runtime'

const runtimePath: string = import.meta.env.VITE_NOVERA_BROWSER_TEXT_PATH ?? ''

export function wasmTextSupported() {
  const wasm = WebAssembly as typeof WebAssembly & { Suspending?: unknown; promising?: unknown }
  return Boolean(runtimePath) && typeof Worker !== 'undefined' &&
    typeof wasm.Suspending === 'function' && typeof wasm.promising === 'function'
}

type Reply = {
  type: string
  bytes?: ArrayBuffer
  error?: string
  progress?: number
  text?: string
  contextTokens?: number
  finishReason?: string
  promptTokens?: number
  completionTokens?: number
  tokensPerSecond?: number
}

export async function loadWasmTextModel(signal: AbortSignal, onProgress: (fraction: number) => void): Promise<Model> {
  signal.throwIfAborted()
  const base = new URL(import.meta.env.BASE_URL, window.location.href)
  const worker = new Worker(new URL(runtimePath + '/worker.mjs', base), { type: 'module' })

  function request(message: object, done: string, onEvent: (event: Reply) => void, abort?: AbortSignal) {
    return new Promise<Reply>((resolve, reject) => {
      const cleanup = () => {
        worker.removeEventListener('message', receive)
        worker.removeEventListener('error', failed)
        worker.removeEventListener('messageerror', failed)
        abort?.removeEventListener('abort', cancelled)
      }
      const failed = () => { cleanup(); reject(new Error('Le moteur texte WebAssembly s’est interrompu.')) }
      const cancelled = () => { cleanup(); reject(abort?.reason ?? new DOMException('Annulé', 'AbortError')) }
      const receive = ({ data }: MessageEvent<Reply>) => {
        try {
          if (data.type === done) { cleanup(); resolve(data) }
          else if (data.type === 'error') { cleanup(); reject(new Error(data.error ?? 'Échec du moteur texte.')) }
          else onEvent(data)
        } catch (error) { cleanup(); reject(error) }
      }
      worker.addEventListener('message', receive)
      worker.addEventListener('error', failed)
      worker.addEventListener('messageerror', failed)
      abort?.addEventListener('abort', cancelled, { once: true })
      if (abort?.aborted) { cancelled(); return }
      try { worker.postMessage(message) }
      catch (error) { cleanup(); reject(error) }
    })
  }

  let progress = 0
  let contextLength: number | undefined
  try {
    const loaded = await request({ type: 'load', catalogModel: true }, 'ready', event => {
      if (event.type === 'loading' && typeof event.progress === 'number' && event.progress > progress) {
        progress = event.progress
        onProgress(progress)
      }
    }, signal)
    contextLength = loaded.contextTokens
    if (!Number.isSafeInteger(contextLength)) throw new Error('Taille de contexte absente du moteur texte.')
  } catch (error) { worker.terminate(); throw error }

  return {
    contextLength,
    async dispose() { worker.terminate() },
    create_session() {
      return {
        reset() {},
        async dispose() {},
        generate(messages, options): Turn {
          const decoder = new TextDecoder()
          let output: ReadableStreamDefaultController<{ type: string; text: string }> | undefined
          const readable = new ReadableStream<{ type: string; text: string }>({
            start(controller) { output = controller },
            cancel() { output = undefined },
          })
          const push = (text: string) => { if (text) output?.enqueue({ type: 'text', text }) }
          const cancel = () => worker.postMessage({ type: 'cancel' })
          const result: Promise<SdkResult> = request({
            type: 'generate', messages,
            maxTokens: options.max_new_tokens, gpuSampling: true,
          }, 'result', event => {
            if (event.type === 'text-bytes' && event.bytes) push(decoder.decode(event.bytes, { stream: true }))
          }).then(event => {
            push(decoder.decode())
            output?.close()
            return {
              message: { role: 'assistant', content: event.text ?? '' },
              finish_reason: event.finishReason ?? 'stop',
              usage: { prompt_tokens: event.promptTokens, completion_tokens: event.completionTokens },
              timings: { tokens_per_second: event.tokensPerSecond },
            }
          }, error => {
            output?.error(error)
            throw error
          })
          void result.catch(() => {})
          return {
            result, cancel,
            async *[Symbol.asyncIterator]() {
              const reader = readable.getReader()
              try {
                for (;;) {
                  const next = await reader.read()
                  if (next.done) break
                  yield next.value
                }
              } finally {
                void reader.cancel().catch(() => {})
                reader.releaseLock()
              }
            },
          }
        },
      }
    },
  }
}
