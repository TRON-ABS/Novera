import { afterEach, describe, expect, it, vi } from 'vitest'
import { NativeConversationRuntime } from './native-conversation'
import { parseNativeConnection } from './native-connection'
import { BrowserRuntime } from './runtime'

const connection = { version: 1 as const, origin: 'http://localhost:5187', endpoint: 'http://127.0.0.1:49001', token: 'a'.repeat(64) }
const model = 'LFM3-Omni-2B-Q4_K_M'
afterEach(() => vi.unstubAllGlobals())
function setup(sse: string) {
  const fetcher = vi.fn(async (url: string) => {
    if (url.endsWith('/v1/load') || url.endsWith('/v1/unload') || url.includes('/v1/jobs/')) return Response.json({ success: true })
    return new Response(sse, { headers: { 'Content-Type': 'text/event-stream' } })
  })
  vi.stubGlobal('fetch', fetcher)
  return { runtime: new NativeConversationRuntime(connection), fetcher }
}
describe('paired native conversation', () => {
  it('requires the matching origin, loopback and a session token', () => {
    expect(parseNativeConnection(connection, connection.origin)).toEqual(connection)
    for (const changed of [{ origin: 'https://other.test' }, { endpoint: 'http://192.168.0.1:1234' }, { token: '' }]) expect(() => parseNativeConnection({ ...connection, ...changed }, connection.origin)).toThrow()
  })
  it('streams exact text and preserves native timing and token accounting', async () => {
    const { runtime, fetcher } = setup('data: {"choices":[{"delta":{"content":"42"},"finish_reason":null}]}\n\ndata: {"choices":[{"delta":{},"finish_reason":"stop"}],"usage":{"completion_tokens":2,"prompt_tokens":4},"timings":{"predicted_per_second":210}}\n\ndata: [DONE]\n\n')
    const events = []
    for await (const event of runtime.generate(model, [{ role: 'user', content: '17+25' }])) events.push(event)
    expect(events[0]).toEqual({ text: '42' })
    expect(events[1].result).toMatchObject({ message: { content: '42' }, usage: { completion_tokens: 2 }, timings: { tokens_per_second: 210 } })
    expect(runtime.snapshot()).toMatchObject({ phase: 'ready', lastGeneration: { tokensPerSecond: 210, completionTokens: 2 } })
    expect(fetcher.mock.calls[0][0]).toBe(connection.endpoint + '/v1/load')
  })
  it('rejects truncated streams instead of reporting successful text', async () => {
    const { runtime } = setup('data: {"choices":[{"delta":{"content":"partial"}}]}\n\n')
    await expect((async () => { for await (const event of runtime.generate(model, [{ role: 'user', content: 'x' }])) void event })()).rejects.toThrow('interrompue')
    expect(runtime.snapshot().phase).toBe('ready')
  })
  it('does not invent token rates or counts when native usage is missing', async () => {
    const { runtime } = setup('data: [DONE]\n\n')
    for await (const event of runtime.generate(model, [{ role: 'user', content: 'x' }])) void event
    expect(runtime.snapshot().lastGeneration?.tokensPerSecond).toBeUndefined()
    expect(runtime.snapshot().lastGeneration?.completionTokens).toBeUndefined()
  })
  it('rejects unknown tools before opening a native request', async () => {
    const { runtime, fetcher } = setup('')
    await expect((async () => { for await (const event of runtime.generate(model, [{ role: 'user', content: 'x' }], undefined, 512, [{ type: 'function', function: { name: 'run_shell', description: '', parameters: {} } }])) void event })()).rejects.toThrow('recherche')
    expect(fetcher).not.toHaveBeenCalled()
  })
  it('reassembles only offered Web tool calls from native stream fragments', async () => {
    const frames = [
      { choices: [{ delta: { tool_calls: [{ index: 0, id: 'call_1', function: { name: 'web_search', arguments: '{"query":' } }] } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"test"}' } }] }, finish_reason: 'tool_calls' }] },
    ]
    const { runtime } = setup(frames.map(frame => `data: ${JSON.stringify(frame)}\n\n`).join('') + 'data: [DONE]\n\n')
    let result
    for await (const event of runtime.generate(model, [{ role: 'user', content: 'test' }], undefined, 512, [{ type: 'function', function: { name: 'web_search', description: 'Search', parameters: { type: 'object' } } }])) if (event.result) result = event.result
    expect(result).toMatchObject({ finish_reason: 'tool_calls', message: { tool_calls: [{ id: 'call_1', function: { name: 'web_search', arguments: { query: 'test' } } }] } })
  })
  it('rejects invalid audio before submitting a transcription', async () => {
    const { runtime, fetcher } = setup('')
    await expect(runtime.speech(model, [{ role: 'user', content: [{ type: 'audio', audio: new Float32Array([NaN]) }] }], 'text', new AbortController().signal)).rejects.toThrow('invalide')
    expect(fetcher).toHaveBeenCalledTimes(1)
  })
  it('keeps the autonomous runtime as default and releases the optional delegate', async () => {
    const { runtime: native, fetcher } = setup('data: [DONE]\n\n')
    const loader = vi.fn()
    const runtime = new BrowserRuntime(loader)
    expect(runtime.snapshot().backend).not.toBe('native')
    await runtime.setNativeBackend(native)
    for await (const event of runtime.generate(model, [{ role: 'user', content: 'x' }])) void event
    expect(runtime.snapshot().backend).toBe('native')
    expect(loader).not.toHaveBeenCalled()
    await runtime.setNativeBackend(undefined)
    expect(runtime.loadedId()).toBe('')
    expect(runtime.snapshot().backend).not.toBe('native')
    expect(fetcher.mock.calls.some(([url]) => url.endsWith('/v1/unload'))).toBe(true)
  })
})
