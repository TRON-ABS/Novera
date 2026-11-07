import { createOpenAICompatible } from '@ai-sdk/openai-compatible'
import { browserRuntime, type BrowserMessage, type BrowserRuntime, type BrowserTool, type BrowserToolCall, type SdkResult } from './runtime'
import { useWebSearchConfig } from '@/hooks/useWebSearchConfig'

const WEB_TOOLS = new Set(['web_search', 'web_fetch'])
function toolCalls(value: unknown): BrowserToolCall[] | undefined {
  if (value === undefined) return
  if (!Array.isArray(value)) throw new Error('Appels d’outils invalides.')
  return value.map(call => {
    if (typeof call?.id !== 'string' || call.type !== 'function' || !WEB_TOOLS.has(call.function?.name)) throw new Error('Ce moteur navigateur accepte uniquement les outils de recherche Internet.')
    const args = typeof call.function.arguments === 'string' ? JSON.parse(call.function.arguments) : call.function.arguments
    if (!args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Arguments de recherche invalides.')
    return { id: call.id, type: 'function', function: { name: call.function.name, arguments: args } }
  })
}

function textMessages(value: unknown): BrowserMessage[] {
  if (!Array.isArray(value) || !value.length) throw new Error('Conversation vide.')
  return value.map(message => {
    if (!message || !['system', 'user', 'assistant', 'tool'].includes(message.role)) throw new Error('Type de message non pris en charge dans le navigateur.')
    const calls = toolCalls(message.tool_calls)
    const content = message.content === null && calls?.length ? '' : typeof message.content === 'string' ? message.content :
      Array.isArray(message.content) && message.content.every((part: { type?: string; text?: unknown }) => part.type === 'text' && typeof part.text === 'string')
        ? message.content.map((part: { text: string }) => part.text).join('\n') : null
    if (content === null) throw new Error('Cette préparation du moteur Web accepte le texte. Les entrées audio et image restent à adapter.')
    if (message.role === 'tool' && typeof message.tool_call_id !== 'string') throw new Error('Résultat de recherche sans identifiant d’appel.')
    return { role: message.role, content, ...(calls ? { tool_calls: calls } : {}), ...(message.role === 'tool' ? { tool_call_id: message.tool_call_id } : {}) }
  })
}

export function localBrowserFetch(runtime: BrowserRuntime = browserRuntime): typeof fetch {
  return async (input, init) => {
    const url = new URL(typeof input === 'string' ? input : input instanceof URL ? input.href : input.url)
    if (url.href !== 'https://novera-browser.invalid/v1/chat/completions' || init?.method !== 'POST' || typeof init.body !== 'string') throw new Error('Requête navigateur non prise en charge.')
    const body = JSON.parse(init.body)
    const messages = textMessages(body.messages)
    const tools: BrowserTool[] = useWebSearchConfig.getState().webSearchEnabled && Array.isArray(body.tools)
      ? body.tools.filter((tool: BrowserTool) => tool?.type === 'function' && WEB_TOOLS.has(tool.function?.name)) : []
    const controller = new AbortController()
    const abort = () => controller.abort()
    init.signal?.addEventListener('abort', abort, { once: true })
    if (init.signal?.aborted) controller.abort()
    const encoder = new TextEncoder()
    const id = crypto.randomUUID()
    const events = async function* (): AsyncGenerator<{ text?: string; result?: SdkResult }> {
      // The existing Desktop policy requires a first search for explicit/current
      // requests. Route it directly rather than spend GPU time planning it.
      const query = messages.slice().reverse().find(message => message.role === 'user')?.content.split('\n---\nReferenced file contents:')[0].trim().slice(0, 2000)
      if (body.tool_choice === 'required' && tools.some(tool => tool.function.name === 'web_search') && query) {
        controller.signal.throwIfAborted()
        yield { result: { message: { role: 'assistant', content: '', tool_calls: [{ id: `call_${crypto.randomUUID()}`, type: 'function' as const, function: { name: 'web_search', arguments: { query, count: 5 } } }] }, finish_reason: 'tool_calls' } }
        return
      }
      yield* runtime.generate(body.model, messages, controller.signal, body.max_tokens ?? body.max_completion_tokens ?? 512, tools)
    }
    const callsForWire = (calls?: BrowserToolCall[]) => calls?.map(call => {
      if (!tools.some(tool => tool.function.name === call.function.name) || call.errors?.length) throw new Error('Le modèle a produit un appel de recherche invalide.')
      return { id: call.id, type: 'function', function: { name: call.function.name, arguments: JSON.stringify(call.function.arguments) } }
    })
    if (body.stream !== true) {
      try {
        let content = ''
        let result
        for await (const event of events()) {
          controller.signal.throwIfAborted()
          if (event.text) content += event.text
          if (event.result) result = event.result
        }
        return Response.json({ id, object: 'chat.completion', created: Math.floor(Date.now() / 1000), model: body.model,
          choices: [{ index: 0, message: { role: 'assistant', content: result?.message.content ?? content, ...(result?.message.tool_calls ? { tool_calls: callsForWire(result.message.tool_calls) } : {}) }, finish_reason: result?.finish_reason === 'tool_calls' ? 'tool_calls' : result?.finish_reason === 'length' ? 'length' : 'stop' }],
          usage: { prompt_tokens: result?.usage?.prompt_tokens ?? 0, completion_tokens: result?.usage?.completion_tokens ?? 0, total_tokens: (result?.usage?.prompt_tokens ?? 0) + (result?.usage?.completion_tokens ?? 0) } })
      } finally { init.signal?.removeEventListener('abort', abort) }
    }
    const stream = new ReadableStream<Uint8Array>({
      async start(output) {
        const push = (value: unknown) => output.enqueue(encoder.encode(`data: ${JSON.stringify(value)}\n\n`))
        try {
          for await (const event of events()) {
            controller.signal.throwIfAborted()
            const base = { id, object: 'chat.completion.chunk', created: Math.floor(Date.now() / 1000), model: body.model }
            if (event.text) push({ ...base, choices: [{ index: 0, delta: { content: event.text }, finish_reason: null }] })
            if (event.result) {
              const calls = callsForWire(event.result.message.tool_calls)
              if (calls?.length) push({ ...base, choices: [{ index: 0, delta: { tool_calls: calls.map((call, index) => ({ index, ...call })) }, finish_reason: null }] })
              push({ ...base, choices: [{ index: 0, delta: {}, finish_reason: event.result.finish_reason === 'tool_calls' ? 'tool_calls' : event.result.finish_reason === 'length' ? 'length' : 'stop' }], usage: { prompt_tokens: event.result.usage?.prompt_tokens ?? 0, completion_tokens: event.result.usage?.completion_tokens ?? 0, total_tokens: (event.result.usage?.prompt_tokens ?? 0) + (event.result.usage?.completion_tokens ?? 0) } })
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
