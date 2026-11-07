import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { browserRuntime, type BrowserMessage, type BrowserRuntime } from './runtime'

function textMessages(value: unknown): BrowserMessage[] {
  if (!Array.isArray(value) || !value.length) throw new Error('Conversation vide.')
  return value.map(message => {
    if (!message || !['system', 'user', 'assistant'].includes(message.role)) throw new Error('Les outils externes ne sont pas disponibles avec ce moteur navigateur.')
    const content = typeof message.content === 'string' ? message.content :
      Array.isArray(message.content) && message.content.every((part: { type?: string; text?: unknown }) => part.type === 'text' && typeof part.text === 'string')
        ? message.content.map((part: { text: string }) => part.text).join('\n') : null
    if (content === null) throw new Error('Cette préparation du moteur Web accepte le texte. Les entrées audio et image restent à adapter.')
    return { role: message.role, content }
  })
}

export function localBrowserFetch(runtime: BrowserRuntime = browserRuntime): typeof fetch {
  return async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    if (url.href !== 'https://novera-browser.invalid/v1/chat/completions' || init?.method !== 'POST' || typeof init.body !== 'string') throw new Error('Requête navigateur non prise en charge.')
    const body = JSON.parse(init.body)
    const messages = textMessages(body.messages)
    const controller = new AbortController()
    const abort = () => controller.abort()
    init.signal?.addEventListener('abort', abort, { once: true })
    if (init.signal?.aborted) controller.abort()
    const encoder = new TextEncoder()
    const id = crypto.randomUUID()
    if (body.stream !== true) {
      try {
        let content = ''
        let result
        for await (const event of runtime.generate(body.model, messages, controller.signal, body.max_tokens ?? body.max_completion_tokens ?? 512)) {
          controller.signal.throwIfAborted()
          if (event.text) content += event.text
          if (event.result) result = event.result
        }
        return Response.json({ id, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: body.model,
          choices: [{ index: 0, message: { role: 'assistant', content: result?.message.content ?? content }, finish_reason: result?.finish_reason === 'length' ? 'length' : 'stop' }],
          usage: { prompt_tokens: result?.usage?.prompt_tokens ?? 0, completion_tokens: result?.usage?.completion_tokens ?? 0, total_tokens: (result?.usage?.prompt_tokens ?? 0) + (result?.usage?.completion_tokens ?? 0) } })
      } finally { init.signal?.removeEventListener('abort', abort) }
    }
    const stream = new ReadableStream<Uint8Array>({
      async start(output) {
        const push = (value: unknown) => output.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
        try {
          for await (const event of runtime.generate(body.model, messages, controller.signal, body.max_tokens ?? body.max_completion_tokens ?? 512)) {
            controller.signal.throwIfAborted()
            const base = { id, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model: body.model }
            if (event.text) push({ ...base, choices: [{ index: 0, delta: { content: event.text }, finish_reason: null }] })
            if (event.result) {
              push({ ...base, choices: [{ index: 0, delta: {}, finish_reason: event.result.finish_reason === 'length' ? 'length' : 'stop' }], usage: { prompt_tokens: event.result.usage?.prompt_tokens ?? 0, completion_tokens: event.result.usage?.completion_tokens ?? 0, total_tokens: (event.result.usage?.prompt_tokens ?? 0) + (event.result.usage?.completion_tokens ?? 0) } })
            }
          }
          output.enqueue(encoder.encode('data: [DONE]\n\n')); output.close()
        } catch (error) { output.error(error) }
        finally { init.signal?.removeEventListener('abort', abort) }
      },
      cancel() { controller.abort() },
    })
    return new Response(stream, { headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store' } })
  }
}

export async function createBrowserLanguageModel(id: string) {
  await browserRuntime.load(id)
  return createOpenAICompatible({ name: 'novera-browser', baseURL: 'https://novera-browser.invalid/v1', fetch: localBrowserFetch(), includeUsage: true }).languageModel(id)
}
