import { fetch as nativeFetch } from '@tauri-apps/plugin-http'

const SEARCH_ORIGIN = 'https://lite.duckduckgo.com'
const MAX_RESPONSE_BYTES = 1024 * 1024
const APPLICATION_USER_AGENT = 'Novera/1.0.0 (+https://github.com/TRON-ABS/Novera)'

function publicHttps(value: string): URL {
  const url = new URL(value)
  const host = url.hostname.toLowerCase()
  const privateAddress = /^(?:127\.|10\.|192\.168\.|169\.254\.|0\.)/.test(host) ||
    /^172\.(?:1[6-9]|2\d|3[01])\./.test(host) || host.includes(':')
  if (url.protocol !== 'https:' || url.username || url.password ||
      host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') ||
      !host.includes('.') || privateAddress) {
    throw new Error('Mobile web tools require a public HTTPS URL')
  }
  return url
}

async function requestText(address: string, operation: 'web_search' | 'web_fetch'): Promise<{ text: string; url: string }> {
  let url = publicHttps(address)
  const initialHost = url.host
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 30_000)
  try {
    for (let redirects = 0; redirects <= 5; redirects++) {
      const response = await nativeFetch(url.href, {
        method: 'GET', maxRedirections: 0, connectTimeout: 30_000,
        headers: {
          // Native HTTP requests have no browser origin. The HTTP plugin adds
          // the WebView origin by default; its supported empty-Origin sentinel
          // removes that header with the already-enabled unsafe-headers feature.
          // DuckDuckGo rejects the injected https://tauri.localhost origin (403).
          Origin: '',
          'User-Agent': APPLICATION_USER_AGENT,
          Accept: 'text/html, text/plain;q=0.9, application/xhtml+xml;q=0.8',
        },
        signal: controller.signal,
      })
      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location')
        await response.body?.cancel()
        if (!location) throw new Error('Web response has no redirect destination')
        url = publicHttps(new URL(location, url).href)
        if (['duckduckgo.com', 'html.duckduckgo.com', 'lite.duckduckgo.com'].includes(new URL(address).hostname) && !['duckduckgo.com', 'html.duckduckgo.com', 'lite.duckduckgo.com'].includes(url.hostname)) {
          throw new Error('DuckDuckGo search redirected outside its search service')
        }
        continue
      }
      if (!response.ok) {
        await response.body?.cancel()
        throw new Error(`[${operation}] Web request to ${url.host} failed (HTTP ${response.status})${initialHost !== url.host ? `; redirected from ${initialHost}` : ''}${response.status === 403 ? ' — access refused by this site. Do not repeat this request or claim its content was read.' : ''}`)
      }
      const type = response.headers.get('content-type') || ''
      if (type && !/^(?:text\/|application\/(?:xhtml\+xml|json))/i.test(type)) {
        await response.body?.cancel()
        throw new Error('Mobile web tools cannot read this document type')
      }
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Empty web response')
      const decoder = new TextDecoder()
      let text = '', bytes = 0
      try {
        while (true) {
          const next = await reader.read()
          if (next.done) break
          bytes += next.value.byteLength
          if (bytes > MAX_RESPONSE_BYTES) throw new Error('Web response exceeds the mobile size limit')
          text += decoder.decode(next.value, { stream: true })
        }
        text += decoder.decode()
      } finally { await reader.cancel() }
      return { text, url: url.href }
    }
    throw new Error('Too many web redirects')
  } finally { clearTimeout(timer) }
}

export function parseMobileSearch(html: string, count: number) {
  // DOMParser creates an inert document; never insert untrusted page HTML into the UI.
  const document = new DOMParser().parseFromString(html, 'text/html')
  if (document.querySelector('#challenge-form, .anomaly-modal, form[action*="anomaly.js"]')) {
    throw new Error('DuckDuckGo requires a verification challenge; mobile search is unavailable for this request')
  }
  const results: { title: string; url: string; text: string }[] = []
  for (const link of document.querySelectorAll<HTMLAnchorElement>('a.result__a, a.result-link')) {
    const item = link.closest('.result')
    // The official Lite layout uses separate table rows for links and snippets.
    const snippet = item?.querySelector('.result__snippet') ??
      link.closest('tr')?.nextElementSibling?.querySelector('.result-snippet')
    try {
      let url = new URL(link.getAttribute('href') || '', SEARCH_ORIGIN)
      if (['duckduckgo.com', 'html.duckduckgo.com', 'lite.duckduckgo.com'].includes(url.hostname) && url.pathname === '/l/') {
        url = new URL(url.searchParams.get('uddg') || '')
      }
      url = publicHttps(url.href)
      results.push({ title: (link.textContent || '').trim().slice(0, 300), url: url.href,
        text: (snippet?.textContent || '').trim().slice(0, 500) })
    } catch { continue }
    if (results.length >= count) break
  }
  if (!results.length && !document.querySelector('.no-results, .result--no-result')) {
    throw new Error('DuckDuckGo returned no readable mobile search results')
  }
  return results
}

function clip(text: string, limit: number) {
  let part = text.slice(0, limit)
  if (/[\uD800-\uDBFF]$/.test(part)) part = part.slice(0, -1)
  return part
}

export async function executeMobileDuckDuckGoTool(
  name: string, input: { query?: unknown; count?: unknown; url?: unknown }, maxChars = 40_000
): Promise<{ content?: unknown; error?: string }> {
  const budget = Number.isFinite(maxChars) ? Math.max(1, Math.floor(maxChars)) : 40_000
  if (name === 'web_search') {
    const query = typeof input.query === 'string' ? input.query.trim() : ''
    if (!query) throw new Error('A search query is required')
    const count = typeof input.count === 'number' && Number.isFinite(input.count)
      ? Math.max(1, Math.min(20, Math.floor(input.count))) : 5
    const address = new URL('/lite/', SEARCH_ORIGIN)
    address.searchParams.set('q', query)
    // Use DuckDuckGo's official non-JavaScript Lite page and identify Novera honestly.
    // Do not impersonate a browser or retry through a challenge/proxy.
    const response = await requestText(address.href, 'web_search')
    const results = parseMobileSearch(response.text, count)
    const output = { kind: 'web', query, results }
    while (output.results.length && JSON.stringify(output).length > budget) output.results.pop()
    if (JSON.stringify(output).length > budget) throw new Error('Web search output budget is too small')
    return { content: output }
  }
  if (name === 'web_fetch') {
    const address = publicHttps(typeof input.url === 'string' ? input.url : '')
    // A model may send a normal DuckDuckGo search URL to web_fetch instead of
    // using web_search. Route that query to the same official mobile search;
    // never try the JavaScript homepage first or retry after a refusal.
    if (['duckduckgo.com', 'www.duckduckgo.com', 'html.duckduckgo.com', 'lite.duckduckgo.com'].includes(address.hostname) &&
        ['/', '/html', '/html/', '/lite', '/lite/'].includes(address.pathname)) {
      const query = address.searchParams.get('q')?.trim()
      if (!query) throw new Error('[web_fetch] DuckDuckGo search needs a query. Use web_search with the requested search terms.')
      return executeMobileDuckDuckGoTool('web_search', { query }, budget)
    }
    const response = await requestText(address.href, 'web_fetch')
    const document = new DOMParser().parseFromString(response.text, 'text/html')
    const title = document.title.trim()
    document.querySelectorAll('script, style, noscript, template, iframe').forEach(node => node.remove())
    const body = (document.body?.textContent || '').replace(/\s+/g, ' ').trim()
    const header = `Title: ${title}\nURL: ${response.url}\n\n`
    if (header.length + body.length <= budget) return { content: header + body }
    const marker = '\n\n[content truncated]'
    if (header.length + marker.length >= budget) return { content: clip(marker.trimStart(), budget) }
    return { content: header + clip(body, budget - header.length - marker.length) + marker }
  }
  return { error: `Unknown web tool '${name}'` }
}
