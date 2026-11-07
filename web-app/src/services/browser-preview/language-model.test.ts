import { expect, it, vi } from 'vitest'
import { localBrowserFetch } from './language-model'
import type { BrowserRuntime } from './runtime'
import { useWebSearchConfig } from '@/hooks/useWebSearchConfig'

const url = 'https://novera-browser.invalid/v1/chat/completions'
const request = (extra = {}) => ({ method: 'POST', body: JSON.stringify({ model: 'test', messages: [{ role: 'user', content: 'Bonjour' }], ...extra }) })
function fixture() {
  const generate = vi.fn(async function* () {
    yield { text: 'Bonjour' }
    yield { result: { message: { role: 'assistant', content: 'Bonjour' }, finish_reason: 'stop', usage: { prompt_tokens: 2, completion_tokens: 1 } } }
  })
  return { generate, fetch: localBrowserFetch({ generate } as unknown as BrowserRuntime) }
}

it('serves real runtime chunks through SSE and non-streaming completions', async () => {
  const f = fixture()
  const stream = await f.fetch(url, request({ stream: true }))
  expect(await stream.text()).toContain('"content":"Bonjour"')
  const response = await f.fetch(url, request())
  expect(await response.json()).toMatchObject({ choices: [{ message: { content: 'Bonjour' } }], usage: { total_tokens: 3 } })
})

it('rejects media and external destinations before calling the runtime', async () => {
  const f = fixture()
  await expect(f.fetch('https://example.com/v1/chat/completions', request())).rejects.toThrow()
  await expect(f.fetch(url, request({ messages: [{ role: 'user', content: [{ type: 'image_url', image_url: { url: 'x' } }] }] }))).rejects.toThrow('texte')
  expect(f.generate).not.toHaveBeenCalled()
})

it('surfaces a runtime failure instead of returning a successful empty response', async () => {
  const f = fixture()
  f.generate.mockImplementation(async function* () { throw new Error('GPU lost'); yield { text: '' } })
  const stream = await f.fetch(url, request({ stream: true }))
  await expect(stream.text()).rejects.toThrow('GPU lost')
  await expect(f.fetch(url, request())).rejects.toThrow('GPU lost')
})

const webTool = { type: 'function', function: { name: 'web_search', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } } }
it('routes a required first search through the normal tool flow without a GPU planning turn', async () => {
  useWebSearchConfig.setState({ webSearchEnabled: true })
  const f = fixture()
  const response = await f.fetch(url, request({ stream: true, tools: [webTool], tool_choice: 'required' }))
  const text = await response.text()
  expect(text).toContain('"name":"web_search"')
  expect(text).toContain('"finish_reason":"tool_calls"')
  expect(f.generate).not.toHaveBeenCalled()
})

it('passes tool results and native SDK tool calls through both completion modes', async () => {
  useWebSearchConfig.setState({ webSearchEnabled: true })
  const f = fixture()
  f.generate.mockImplementation(async function* () {
    yield { result: { message: { role: 'assistant', content: '', tool_calls: [{ id: 'next', type: 'function', function: { name: 'web_search', arguments: { query: 'More sources' } } }] }, finish_reason: 'tool_calls' } } as never
  })
  const messages = [{ role: 'user', content: 'Find sources' }, { role: 'assistant', content: null, tool_calls: [{ id: 'first', type: 'function', function: { name: 'web_search', arguments: '{"query":"Find sources"}' } }] },
    { role: 'tool', tool_call_id: 'first', content: '{"kind":"web","results":[]}' }]
  const response = await f.fetch(url, request({ messages, tools: [webTool] }))
  expect(await response.json()).toMatchObject({ choices: [{ finish_reason: 'tool_calls', message: { tool_calls: [{ function: { arguments: '{"query":"More sources"}' } }] } }] })
  expect(f.generate.mock.calls[0][1]).toMatchObject([{ role: 'user' }, { tool_calls: [{ function: { arguments: { query: 'Find sources' } } }] }, { role: 'tool', tool_call_id: 'first' }])
})

it('does not route a required search after Internet has been disabled', async () => {
  useWebSearchConfig.setState({ webSearchEnabled: false })
  const f = fixture()
  const response = await f.fetch(url, request({ tools: [webTool], tool_choice: 'required' }))
  expect(await response.text()).not.toContain('tool_calls')
  expect(f.generate).toHaveBeenCalled()
  useWebSearchConfig.setState({ webSearchEnabled: true })
})
