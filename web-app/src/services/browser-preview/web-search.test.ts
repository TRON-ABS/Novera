import { afterEach, expect, it, vi } from 'vitest'
const preferences = vi.hoisted(() => ({ webSearchEnabled: true, searchProvider: 'exa', apiKeys: { exa: 'never-send-this-key' } }))
vi.mock('@/hooks/useWebSearchConfig', () => ({ useWebSearchConfig: { getState: () => preferences } }))
import { BrowserSearch, BROWSER_SEARCH_ENDPOINT, browserSearch, executeBrowserWebTool } from './web-search'

function fixture(text = 'Title: Exa\nURL: https://exa.ai/\nHighlights:\nSearch documentation') {
  const http = vi.fn(async (_url: unknown, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body))
    if (body.method === 'notifications/initialized') return new Response(null, { status: 202 })
    const result = body.method === 'initialize' ? { protocolVersion: '2025-03-26' } : body.method === 'tools/list' ?
      { tools: [{ name: 'web_search_exa' }, { name: 'web_fetch_exa' }] } : { content: [{ type: 'text', text }] }
    return new Response(`event: message\ndata: ${JSON.stringify({ jsonrpc: '2.0', id: body.id, result })}\n\n`, { headers: { 'Content-Type': 'text/event-stream' } })
  })
  return { http, client: new BrowserSearch(http as typeof fetch) }
}
afterEach(() => { browserSearch.reset(); preferences.webSearchEnabled = true; preferences.searchProvider = 'exa'; vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('routes an explicit DuckDuckGo choice directly without preparing Exa or sending API keys', async () => {
  preferences.searchProvider = 'duckduckgo'
  const http = vi.fn().mockResolvedValue(Response.json({ Heading: 'Source', AbstractText: 'A direct answer.', AbstractURL: 'https://example.org/' }))
  vi.stubGlobal('fetch', http)
  await expect(executeBrowserWebTool('web_search', { query: 'Public test', count: 1 })).resolves.toMatchObject({ content: { provider: 'DuckDuckGo', results: [{ url: 'https://example.org/' }] } })
  expect(http).toHaveBeenCalledOnce()
  expect(String(http.mock.calls[0][0])).toContain('api.duckduckgo.com')
  expect(JSON.stringify(http.mock.calls)).not.toContain('never-send-this-key')
  expect(browserSearch.snapshot().phase).toBe('idle')
})

it('shares preparation with the first search, without issuing any warm-up query', async () => {
  const f = fixture()
  await Promise.all([f.client.prepare(BROWSER_SEARCH_ENDPOINT), f.client.prepare(BROWSER_SEARCH_ENDPOINT),
    f.client.textTool(BROWSER_SEARCH_ENDPOINT, 'web_search_exa', { query: 'Exa', objective: 'Find official docs' })])
  const bodies = f.http.mock.calls.map(call => JSON.parse(String(call[1]?.body)))
  expect(bodies.map(body => body.method)).toEqual(['initialize', 'notifications/initialized', 'tools/list', 'tools/call'])
  expect(f.client.snapshot()).toMatchObject({ phase: 'ready', preparationMs: expect.any(Number) })
  for (const [, init] of f.http.mock.calls) expect(init).toMatchObject({ credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer' })
  expect(JSON.stringify(f.http.mock.calls)).not.toContain('never-send-this-key')
})

it('rejects other destinations and tools before making a request', async () => {
  const f = fixture()
  await expect(f.client.prepare('https://elsewhere.example/mcp')).rejects.toThrow('non autorisée')
  await expect(f.client.textTool(BROWSER_SEARCH_ENDPOINT, 'agent_run', {})).rejects.toThrow('non autorisé')
  expect(f.http).not.toHaveBeenCalled()
})

it('does not publish ready or send a query after reset during preparation', async () => {
  const f = fixture()
  let finish!: (response: Response) => void
  f.http.mockImplementationOnce(() => new Promise(resolve => { finish = resolve }))
  const job = f.client.prepare(BROWSER_SEARCH_ENDPOINT)
  f.client.reset()
  finish(Response.json({ id: 1, result: { protocolVersion: '2025-03-26' } }))
  await expect(job).rejects.toThrow()
  expect(f.client.snapshot().phase).toBe('idle')
  expect(f.http).toHaveBeenCalledOnce()
})

it('reports provider failures and retries preparation on a later request', async () => {
  const f = fixture()
  f.http.mockResolvedValueOnce(new Response('', { status: 503 }))
  await expect(f.client.prepare(BROWSER_SEARCH_ENDPOINT)).rejects.toThrow('503')
  expect(f.client.snapshot().phase).toBe('error')
  await f.client.prepare(BROWSER_SEARCH_ENDPOINT)
  expect(f.client.snapshot().phase).toBe('ready')
})

it('rejects rate-limit metadata even when HTTP and the tool response claim success', async () => {
  const f = fixture()
  await f.client.prepare(BROWSER_SEARCH_ENDPOINT)
  f.http.mockImplementationOnce(async (_url, init) => Response.json({ id: JSON.parse(String(init?.body)).id,
    result: { _meta: { 'ai.exa/rateLimited': true }, content: [{ type: 'text', text: 'limit' }] } }))
  await expect(f.client.textTool(BROWSER_SEARCH_ENDPOINT, 'web_search_exa', {})).rejects.toThrow('Quota')
})

it('normalizes actual Exa source blocks and never sends a key or a conversation', async () => {
  const f = fixture('Title: Official docs\nURL: https://exa.ai/docs\nHighlights:\n- Relevant result\n\n---\nTitle: Local\nURL: http://127.0.0.1/\nHighlights:\nprivate')
  vi.stubGlobal('fetch', f.http)
  const result = await executeBrowserWebTool('web_search', { query: 'Find docs', count: 5 })
  expect(result).toMatchObject({ content: { results: [{ title: 'Official docs', url: 'https://exa.ai/docs' }] } })
  expect(JSON.stringify(f.http.mock.calls)).not.toContain('never-send-this-key')
  expect(JSON.parse(String(f.http.mock.calls.at(-1)?.[1]?.body)).params.arguments.query).toBe('Find docs')
})

it('blocks disabled search, invalid/private URLs and unknown operations before contacting Exa', async () => {
  const f = fixture(); vi.stubGlobal('fetch', f.http)
  preferences.webSearchEnabled = false
  await expect(executeBrowserWebTool('web_search', { query: 'secret' })).rejects.toThrow('désactivée')
  preferences.webSearchEnabled = true
  for (const url of ['http://127.0.0.1/', 'https://192.168.0.1/', 'https://user:pass@example.com/', 'file:///private']) {
    await expect(executeBrowserWebTool('web_fetch', { url })).rejects.toThrow()
  }
  await expect(executeBrowserWebTool('shell', {})).rejects.toThrow()
  expect(f.http).not.toHaveBeenCalled()
})
