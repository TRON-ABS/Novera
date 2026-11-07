import { expect, it, vi } from 'vitest'
import { localBrowserFetch } from './language-model'
import type { BrowserRuntime } from './runtime'

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
