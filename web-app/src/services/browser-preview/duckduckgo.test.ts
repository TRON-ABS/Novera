import { describe, expect, it, vi } from 'vitest'
import { fetchPublicBrowserPage, searchDuckDuckGo } from './duckduckgo'

describe('autonomous DuckDuckGo direct answers', () => {
  it('returns real source URLs and labels the limited coverage', async () => {
    const http = vi.fn().mockResolvedValue(Response.json({ Heading: 'Eiffel Tower', AbstractURL: 'https://en.wikipedia.org/wiki/Eiffel_Tower', AbstractText: 'A tower in Paris.', RelatedTopics: [{ Topics: [{ Text: 'Related topic', FirstURL: 'https://example.org/topic' }] }] }))
    const result = await searchDuckDuckGo('Eiffel Tower', 2, 1000, undefined, http)
    expect(result).toMatchObject({ provider: 'DuckDuckGo', mode: 'instant-answers', results: [{ url: 'https://en.wikipedia.org/wiki/Eiffel_Tower' }, { url: 'https://example.org/topic' }] })
    expect(result.limitation).toContain('pas la recherche Web complète')
    expect(new URL(http.mock.calls[0][0]).searchParams.get('q')).toBe('Eiffel Tower')
    expect(http.mock.calls[0][1]).toMatchObject({ credentials: 'omit', redirect: 'error', referrerPolicy: 'no-referrer' })
  })
  it('does not fabricate Web results for an unanswered query', async () => {
    await expect(searchDuckDuckGo('Unanswered request', 5, 1000, undefined, vi.fn().mockResolvedValue(Response.json({})))).rejects.toThrow('pas de réponse directe')
  })
  it('filters private destinations, duplicate results and ignores markup execution', async () => {
    const result = await searchDuckDuckGo('test', 5, 1000, undefined, vi.fn().mockResolvedValue(Response.json({ RelatedTopics: [
      { Text: 'Private', FirstURL: 'https://127.0.0.1/' }, { Text: '<b>Source</b>', FirstURL: 'https://example.org/' }, { Text: 'duplicate', FirstURL: 'https://example.org/' },
    ] })))
    expect(result.results).toEqual([{ title: 'Source', url: 'https://example.org/', text: 'Source' }])
  })
  it('bounds remote data before parsing and never sends invalid queries', async () => {
    const http = vi.fn()
    await expect(searchDuckDuckGo('', 5, 1000, undefined, http)).rejects.toThrow()
    expect(http).not.toHaveBeenCalled()
    http.mockResolvedValue(new Response('x'.repeat(1024 * 1024 + 1)))
    await expect(searchDuckDuckGo('test', 5, 1000, undefined, http)).rejects.toThrow('volumineuse')
  })
  it('rejects local page destinations before making a request', async () => {
    const http = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('unexpected'))
    try {
      for (const url of ['https://localhost/', 'https://192.168.1.1/', 'https://[::1]/', 'https://user:secret@example.com/']) {
        await expect(fetchPublicBrowserPage(url, 1000)).rejects.toThrow()
      }
      expect(http).not.toHaveBeenCalled()
    } finally { http.mockRestore() }
  })
  it('reports CORS failure and preserves explicit caller cancellation', async () => {
    const http = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    try {
      await expect(fetchPublicBrowserPage('https://example.org/', 1000)).rejects.toThrow('CORS')
      const controller = new AbortController(); controller.abort()
      const cancelled = new DOMException('cancelled', 'AbortError'); http.mockRejectedValue(cancelled)
      await expect(fetchPublicBrowserPage('https://example.org/', 1000, controller.signal)).rejects.toBe(cancelled)
    } finally { http.mockRestore() }
  })
  it('returns bounded inert page text without scripts or hidden style content', async () => {
    const http = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('<html><body><h1>Source</h1><script>secret()</script><style>hidden</style><p>Useful text</p></body></html>', { headers: { 'Content-Type': 'text/html' } }))
    try {
      const text = await fetchPublicBrowserPage('https://example.org/', 1000)
      expect(text).toContain('Useful text'); expect(text).not.toContain('secret'); expect(text).not.toContain('hidden')
      expect(http.mock.calls[0][1]).toMatchObject({ credentials: 'omit', redirect: 'error' })
    } finally { http.mockRestore() }
  })
})
