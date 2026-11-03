import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ fetch: vi.fn(), mobile: true, mcp: vi.fn() }))
vi.mock('@tauri-apps/plugin-http', () => ({ fetch: h.fetch }))
vi.mock('@/lib/platform/utils', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/platform/utils')>(),
  isPlatformAndroid: () => h.mobile, isPlatformIOS: () => false,
}))
vi.mock('@/hooks/useServiceHub', () => ({ getServiceHub: () => ({ mcp: h.mcp }) }))

import { executeWebTool } from '../webSearchTool'
import { executeMobileDuckDuckGoTool, parseMobileSearch } from '../mobileDuckduckgoSearch'
import { useWebSearchConfig } from '@/hooks/useWebSearchConfig'

const html = `<div class="result"><a class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs">Documentation</a><div class="result__snippet">Public documentation</div></div>`
const response = (body = html, status = 200, headers = {}) => new Response(body, { status, headers: { 'content-type': 'text/html', ...headers } })

beforeEach(() => {
  h.fetch.mockReset().mockResolvedValue(response())
  h.mcp.mockReset().mockImplementation(() => { throw new Error('Desktop MCP must not run on mobile') })
  h.mobile = true
  useWebSearchConfig.setState({ searchProvider: 'duckduckgo', webSearchEnabled: true, apiKeys: {}, endpoints: {} })
})

describe('mobile DuckDuckGo without a desktop process', () => {
  it('routes Android search through native HTTPS and returns source URLs without activating MCP', async () => {
    const result = await executeWebTool('web_search', { query: 'documentation' })
    expect(result).toMatchObject({ content: { kind: 'web', results: [{ title: 'Documentation', url: 'https://example.com/docs', text: 'Public documentation' }] } })
    expect(h.fetch).toHaveBeenCalledWith('https://lite.duckduckgo.com/lite/?q=documentation', expect.objectContaining({
      method: 'GET', body: undefined, maxRedirections: 0,
      headers: expect.objectContaining({
        'User-Agent': 'Novera/1.0.0 (+https://github.com/TRON-ABS/Novera)',
      }),
    }))
    expect(h.mcp).not.toHaveBeenCalled()
  })

  it('preserves desktop MCP routing', async () => {
    h.mobile = false
    expect(await executeWebTool('web_search', { query: 'a' })).toEqual({ error: 'Desktop MCP must not run on mobile' })
    expect(h.mcp).toHaveBeenCalled()
    expect(h.fetch).not.toHaveBeenCalled()
  })

  it('does not start any request when search is disabled or the query is missing', async () => {
    useWebSearchConfig.setState({ webSearchEnabled: false })
    expect(await executeWebTool('web_search', { query: 'a' })).toHaveProperty('error')
    useWebSearchConfig.setState({ webSearchEnabled: true })
    expect(await executeWebTool('web_search', { query: '' })).toHaveProperty('error')
    expect(h.fetch).not.toHaveBeenCalled()
    expect(h.mcp).not.toHaveBeenCalled()
  })

  it('reports server errors and verification challenges without pretending to have sources', async () => {
    h.fetch.mockResolvedValueOnce(response('unavailable', 503))
    expect(await executeWebTool('web_search', { query: 'a' })).toEqual({ error: expect.stringContaining('HTTP 503') })
    h.fetch.mockResolvedValueOnce(response('<form id="challenge-form"></form>'))
    expect(await executeWebTool('web_search', { query: 'a' })).toEqual({ error: expect.stringContaining('verification challenge') })
    h.fetch.mockResolvedValueOnce(response('<p>unknown response</p>'))
    expect(await executeWebTool('web_search', { query: 'a' })).toHaveProperty('error')
    expect(h.mcp).not.toHaveBeenCalled()
  })

  it('handles explicit no-results pages and excludes unsafe result URLs', async () => {
    expect(parseMobileSearch('<div class="no-results">No results</div>', 5)).toEqual([])
    const unsafe = html.replace('https%3A%2F%2Fexample.com%2Fdocs', 'javascript%3Aalert(1)')
    expect(parseMobileSearch(unsafe + html, 1)).toHaveLength(1)
  })

  it('encodes the official Lite query and follows redirects without forwarding queries to other providers', async () => {
    h.fetch.mockResolvedValueOnce(response('', 303, { location: '/html/?q=a' }))
    await executeWebTool('web_search', { query: 'a & b=é' })
    expect(h.fetch.mock.calls[0][0]).toBe('https://lite.duckduckgo.com/lite/?q=a+%26+b%3D%C3%A9')
    expect(h.fetch.mock.calls[1][1]).toMatchObject({ method: 'GET', body: undefined })
    expect(h.fetch.mock.calls[1][1].headers).not.toHaveProperty('Content-Type')
    h.fetch.mockReset().mockResolvedValueOnce(response('', 307, { location: 'https://example.com/' }))
    expect(await executeWebTool('web_search', { query: 'private query' })).toHaveProperty('error')
    expect(h.fetch).toHaveBeenCalledTimes(1)
  })

  it('reports a refused page host accurately and does not retry HTTP 403', async () => {
    h.fetch.mockResolvedValueOnce(response('forbidden', 403))
    expect(await executeWebTool('web_fetch', { url: 'https://example.com/article' })).toEqual({
      error: expect.stringContaining('Web request to example.com failed (HTTP 403)'),
    })
    expect(h.fetch).toHaveBeenCalledTimes(1)
  })

  it('parses Lite rows, decodes result links and keeps their corresponding snippets', () => {
    const lite = `<table><tr><td><a class="result-link" href="https://example.com/a">First</a></td></tr><tr><td class="result-snippet">First summary</td></tr><tr><td><a class="result-link" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fb">Second</a></td></tr><tr><td class="result-snippet">Second summary</td></tr></table>`
    expect(parseMobileSearch(lite, 5)).toEqual([
      { title: 'First', url: 'https://example.com/a', text: 'First summary' },
      { title: 'Second', url: 'https://example.com/b', text: 'Second summary' },
    ])
  })

  it('does not retry a refused DuckDuckGo search through another endpoint or provider', async () => {
    h.fetch.mockResolvedValueOnce(response('forbidden', 403))
    expect(await executeWebTool('web_search', { query: 'a' })).toEqual({ error: expect.stringContaining('lite.duckduckgo.com failed (HTTP 403)') })
    expect(h.fetch).toHaveBeenCalledTimes(1)
    expect(h.mcp).not.toHaveBeenCalled()
  })

  it('rejects local URLs and unsafe redirects before contacting their destination', async () => {
    for (const url of ['file:///secret', 'http://example.com', 'https://127.0.0.1/', 'https://localhost/', 'https://192.168.0.1/', 'https://user:password@example.com/']) {
      expect(await executeWebTool('web_fetch', { url })).toHaveProperty('error')
    }
    expect(h.fetch).not.toHaveBeenCalled()
    h.fetch.mockResolvedValueOnce(response('', 302, { location: 'https://127.0.0.1/secret' }))
    expect(await executeWebTool('web_fetch', { url: 'https://example.com/' })).toHaveProperty('error')
    expect(h.fetch).toHaveBeenCalledTimes(1)
  })

  it('extracts readable page text without scripts and respects the model output budget', async () => {
    h.fetch.mockResolvedValueOnce(response('<title>Example</title><body><script>SECRET_SCRIPT</script><article>' + 'word '.repeat(1000) + '</article></body>'))
    const result = await executeMobileDuckDuckGoTool('web_fetch', { url: 'https://example.com/' }, 300)
    expect(String(result.content).length).toBeLessThanOrEqual(300)
    expect(result.content).not.toContain('SECRET_SCRIPT')
    expect(result.content).toContain('[content truncated]')
  })

  it('rejects oversized and non-text bodies', async () => {
    h.fetch.mockResolvedValueOnce(response('x'.repeat(1024 * 1024 + 1)))
    expect(await executeWebTool('web_search', { query: 'a' })).toHaveProperty('error')
    h.fetch.mockResolvedValueOnce(response('binary', 200, { 'content-type': 'application/octet-stream' }))
    expect(await executeWebTool('web_fetch', { url: 'https://example.com/' })).toHaveProperty('error')
  })
})
