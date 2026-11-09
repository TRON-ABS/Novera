import { useWebSearchConfig } from '@/hooks/useWebSearchConfig'
import { fetchPublicBrowserPage, searchDuckDuckGo } from './duckduckgo'

type SearchStatus = { phase: 'idle' | 'preparing' | 'ready' | 'error'; error?: string; preparationMs?: number }
const LIMIT = 1024 * 1024
export const BROWSER_SEARCH_ENDPOINT = 'https://mcp.exa.ai/mcp'

function envelope(body: string, id: number) {
  const frames = body.trim().startsWith('{') ? [JSON.parse(body)] : body.split(/\r?\n/)
    .filter(line => line.startsWith('data:')).map(line => {
      try { return JSON.parse(line.slice(5).trim()) } catch { return null }
    })
  const message = frames.find(frame => frame?.id === id && (frame.result || frame.error))
  if (!message || message.error) throw new Error('Le service Exa a refusé la requête ou renvoyé une réponse incompatible.')
  return message.result
}

export class BrowserSearch {
  private status: SearchStatus = { phase: 'idle' }
  private listeners = new Set<() => void>()
  private job?: Promise<void>
  private address = ''
  private session = ''
  private sequence = 0
  private controller = new AbortController()
  private tools = new Set<string>()
  constructor(private http: typeof fetch = (...args) => fetch(...args)) {}
  snapshot = () => this.status
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(status: SearchStatus) { this.status = status; this.listeners.forEach(listener => listener()) }
  reset() {
    this.controller.abort(); this.controller = new AbortController()
    this.job = undefined; this.session = ''; this.address = ''; this.tools.clear()
    this.publish({ phase: 'idle' })
  }
  private async rpc(method: string, params?: object, notification = false, signal?: AbortSignal) {
    const id = ++this.sequence
    const response = await this.http(this.address, {
      method: 'POST', credentials: 'omit', cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer',
      signal: AbortSignal.any([this.controller.signal, AbortSignal.timeout(60_000), ...(signal ? [signal] : [])]),
      headers: { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream',
        ...(this.session ? { 'Mcp-Session-Id': this.session } : {}) },
      body: JSON.stringify({ jsonrpc: '2.0', ...(notification ? {} : { id }), method, ...(params ? { params } : {}) }),
    })
    if (!response.ok) { await response.body?.cancel(); throw new Error(`Service Exa indisponible (HTTP ${response.status}).`) }
    if (notification) { await response.body?.cancel(); return }
    if (!/application\/json|text\/event-stream/i.test(response.headers.get('content-type') || '')) {
      await response.body?.cancel(); throw new Error('Le service Exa n’est pas configuré sur cette adresse.')
    }
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Réponse Exa vide.')
    let bytes = 0, body = ''
    const decoder = new TextDecoder()
    try {
      while (true) {
        const next = await reader.read()
        if (next.done) break
        bytes += next.value.byteLength
        if (bytes > LIMIT) throw new Error('Réponse Exa trop volumineuse.')
        body += decoder.decode(next.value, { stream: true })
        // Streamable HTTP may keep SSE open after the matching RPC result.
        if (body.includes('\n\n')) {
          try { const result = envelope(body, id); this.session = response.headers.get('Mcp-Session-Id') || this.session; return result } catch { /* Read the complete bounded response before reporting failure. */ }
        }
      }
      body += decoder.decode()
      const result = envelope(body, id)
      this.session = response.headers.get('Mcp-Session-Id') || this.session
      return result
    } finally { await reader.cancel() }
  }
  async prepare(endpoint: string) {
    const address = endpoint
    if (address !== BROWSER_SEARCH_ENDPOINT) throw new Error('Adresse du service Exa non autorisée.')
    if (this.address !== address) this.reset()
    if (this.status.phase === 'ready') return
    if (this.job) return this.job
    this.address = address
    const controller = this.controller, started = performance.now()
    this.publish({ phase: 'preparing' })
    const job = (async () => {
      await this.rpc('initialize', { protocolVersion: '2025-03-26', capabilities: {}, clientInfo: { name: 'novera-web', version: '1.0.1' } })
      controller.signal.throwIfAborted()
      await this.rpc('notifications/initialized', undefined, true)
      controller.signal.throwIfAborted()
      const list = await this.rpc('tools/list')
      controller.signal.throwIfAborted()
      const tools = new Set<string>((list.tools ?? []).map((tool: { name: string }) => tool.name))
      if (!tools.has('web_search_exa') || !tools.has('web_fetch_exa')) throw new Error('Ce service ne fournit pas les outils Exa attendus.')
      this.tools = tools
      this.publish({ phase: 'ready', preparationMs: performance.now() - started })
    })()
    this.job = job
    try { await job } catch (error) {
      if (!controller.signal.aborted) { this.session = ''; this.publish({ phase: 'error', error: error instanceof Error ? error.message : 'Exa indisponible.' }) }
      throw error
    } finally { if (this.job === job) this.job = undefined }
  }
  async textTool(endpoint: string, name: string, args: object, signal?: AbortSignal): Promise<string> {
    if (!['web_search_exa', 'web_fetch_exa'].includes(name)) throw new Error('Outil Exa non autorisé.')
    await this.prepare(endpoint)
    signal?.throwIfAborted()
    if (this.status.phase !== 'ready') throw new Error('La préparation Internet a été interrompue.')
    if (!this.tools.has(name)) throw new Error('Outil Exa indisponible.')
    try {
      const result = await this.rpc('tools/call', { name, arguments: args }, false, signal)
      const text = (result.content ?? []).filter((part: { type: string }) => part.type === 'text').map((part: { text: string }) => part.text).join('\n')
      const rateLimited = Object.entries(result._meta ?? {}).some(([key, value]) => (key === 'rateLimited' || key.endsWith('/rateLimited')) && value === true)
      if (rateLimited) throw new Error('Quota gratuit Exa atteint. Réessayez plus tard.')
      if (result.isError || !text.trim() || /^\s*(error\b|an error\b)/i.test(text)) throw new Error('La recherche Exa a échoué. Réessayez plus tard.')
      return text
    } catch (error) {
      // A later explicit request may re-establish an expired session. Never replay a search automatically.
      this.session = ''; this.publish({ phase: 'error', error: error instanceof Error ? error.message : 'Exa indisponible.' })
      throw error
    }
  }
}

export const browserSearch = new BrowserSearch()

function publicUrl(value: string): string {
  const url = new URL(value)
  const host = url.hostname.toLowerCase()
  if (url.protocol !== 'https:' || url.username || url.password || !host.includes('.') || host.includes(':') ||
    /^(localhost|127\.|10\.|0\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host) || /\.(local|localhost|internal)$/.test(host)) throw new Error('La lecture Web exige une URL HTTPS publique.')
  return url.href
}

export async function executeBrowserWebTool(name: string, input: { query?: unknown; count?: unknown; url?: unknown }, cap = 16000, signal?: AbortSignal) {
  const config = useWebSearchConfig.getState()
  if (!config.webSearchEnabled) throw new Error('La recherche Internet est désactivée.')
  const budget = Math.min(40000, Math.max(1, Number.isFinite(cap) ? Math.floor(cap) : 16000))
  if (config.searchProvider === 'duckduckgo') {
    if (name === 'web_fetch' && typeof input.url === 'string') return { content: await fetchPublicBrowserPage(input.url, budget, signal) }
    if (name !== 'web_search' || typeof input.query !== 'string') throw new Error('Requête DuckDuckGo invalide.')
    return { content: await searchDuckDuckGo(input.query, typeof input.count === 'number' ? input.count : 5, budget, signal) }
  }
  if (config.searchProvider !== 'exa') throw new Error('Choisissez Exa ou DuckDuckGo dans les paramètres Internet Web.')
  const call = async (tool: string, args: object) => {
    if (!useWebSearchConfig.getState().webSearchEnabled) throw new Error('La recherche Internet est désactivée.')
    return browserSearch.textTool(BROWSER_SEARCH_ENDPOINT, tool, args, signal)
  }
  if (name === 'web_fetch') {
    const url = publicUrl(typeof input.url === 'string' ? input.url : '')
    const content = await call('web_fetch_exa', { urls: [url], maxCharacters: budget })
    const text = `URL: ${url}\n\n${content}`
    return { content: text.length > budget ? text.slice(0, Math.max(0, budget - 24)) + '\n[content truncated]' : text }
  }
  if (name !== 'web_search' || typeof input.query !== 'string' || !input.query.trim() || input.query.length > 2000) throw new Error('Requête de recherche invalide.')
  const query = input.query.trim(), count = typeof input.count === 'number' && Number.isFinite(input.count) ? Math.max(1, Math.min(10, Math.floor(input.count))) : 5
  const text = await call('web_search_exa', { query, numResults: count, objective: 'Find relevant reliable sources that directly answer the query; prefer primary sources.' })
  const results = []
  for (const block of text.split(/\n---\n/)) {
    const title = block.match(/^Title:\s*(.+)$/m)?.[1]?.trim()
    const address = block.match(/^URL:\s*(\S+)/m)?.[1]
    if (!title || !address) continue
    let url: string
    try { url = publicUrl(address) } catch { continue }
    const highlights = block.split(/Highlights:|Text:/)[1] || ''
    results.push({ title: title.slice(0, 300), url, text: highlights.trim().slice(0, Math.min(1500, Math.floor(budget / count))) })
    if (results.length === count) break
  }
  if (!results.length && text.trim()) throw new Error('Exa n’a pas fourni de résultats exploitables (service indisponible ou quota atteint).')
  return { content: { kind: 'web', query, results } }
}
