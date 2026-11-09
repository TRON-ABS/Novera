import { publicWebUrl } from './public-web-url'

const LIMIT = 1024 * 1024
export const DUCKDUCKGO_API = 'https://api.duckduckgo.com/'
export async function boundedPublicText(response: Response) {
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Service indisponible (HTTP ${response.status}).`) }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Réponse vide.')
  const decoder = new TextDecoder(); let text = ''; let bytes = 0
  try {
    while (true) {
      const chunk = await reader.read()
      if (chunk.done) break
      bytes += chunk.value.byteLength
      if (bytes > LIMIT) throw new Error('Réponse trop volumineuse.')
      text += decoder.decode(chunk.value, { stream: true })
    }
    return text + decoder.decode()
  } finally { await reader.cancel() }
}
const plain = (value: unknown) => typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : ''
export async function searchDuckDuckGo(query: string, count: number, budget: number, signal?: AbortSignal, http: typeof fetch = fetch) {
  if (!query.trim() || query.length > 2000) throw new Error('Requête DuckDuckGo invalide.')
  count = Number.isFinite(count) ? Math.max(1, Math.min(10, Math.floor(count))) : 5
  budget = Number.isFinite(budget) ? Math.max(1, Math.min(40000, Math.floor(budget))) : 16000
  const url = new URL(DUCKDUCKGO_API)
  url.search = new URLSearchParams({ q: query.trim(), format: 'json', no_html: '1', skip_disambig: '1', no_redirect: '1' }).toString()
  const response = await http(url.href, { credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.any([AbortSignal.timeout(30000), ...(signal ? [signal] : [])]) })
  const data = JSON.parse(await boundedPublicText(response))
  const results: Array<{ title: string; url: string; text: string }> = []
  const seen = new Set<string>()
  const add = (title: unknown, address: unknown, text: unknown) => {
    if (results.length >= count || typeof address !== 'string' || !plain(text)) return
    let valid: string
    try { valid = publicWebUrl(address) } catch { return }
    if (seen.has(valid)) return
    seen.add(valid)
    results.push({ title: (plain(title) || plain(text)).slice(0, 300), url: valid, text: plain(text).slice(0, Math.min(1500, Math.floor(budget / count))) })
  }
  add(data.Heading, data.AbstractURL, data.AbstractText)
  if (plain(data.Answer)) add(data.Heading || query, 'https://duckduckgo.com/?q=' + encodeURIComponent(query), data.Answer)
  const walk = (items: unknown, depth = 0) => {
    if (!Array.isArray(items) || depth > 4) return
    for (const item of items.slice(0, 100)) {
      if (!item || typeof item !== 'object') continue
      add(item.Text, item.FirstURL, item.Text)
      walk(item.Topics, depth + 1)
      if (results.length >= count) break
    }
  }
  walk(data.Results); walk(data.RelatedTopics)
  if (!results.length) throw new Error('DuckDuckGo n’a pas de réponse directe pour cette demande. Pour une recherche Web complète, choisissez Exa dans les paramètres Internet.')
  return { kind: 'web' as const, provider: 'DuckDuckGo', mode: 'instant-answers', query: query.trim(), results,
    limitation: 'Réponses directes et sujets associés uniquement ; ce service ne fournit pas la recherche Web complète ni une couverture fiable de l’actualité.' }
}

export async function fetchPublicBrowserPage(address: string, budget: number, signal?: AbortSignal) {
  const url = publicWebUrl(address)
  let response: Response
  try { response = await fetch(url, { credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.any([AbortSignal.timeout(30000), ...(signal ? [signal] : [])]) }) }
  catch (error) { if (signal?.aborted) throw error; throw new Error('Cette page ne permet pas sa lecture directe depuis le navigateur (CORS ou réseau).', { cause: error }) }
  const contentType = response.headers.get('Content-Type') ?? ''
  if (!/text\/(html|plain)|application\/xhtml\+xml/i.test(contentType)) { await response.body?.cancel(); throw new Error('Page HTML ou texte attendue.') }
  const body = await boundedPublicText(response)
  let text = body
  if (!/text\/plain/i.test(contentType)) {
    const document = new DOMParser().parseFromString(body, 'text/html')
    document.querySelectorAll('script,style,iframe,object,embed,noscript').forEach(node => node.remove())
    text = document.body.textContent ?? ''
  }
  return `URL: ${url}\n\n${text.replace(/\s+/g, ' ').trim()}`.slice(0, budget)
}
