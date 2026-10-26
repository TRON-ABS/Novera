import { HUB_CATEGORIES, type HubCategory } from '@/modules/engines/hub-catalog'
import type { HuggingFaceRepo } from './types'

const API = 'https://huggingface.co/api/models'
type Page = { repos: HuggingFaceRepo[]; nextCursor?: string }
const cache = new Map<string, { expires: number; page: Promise<Page> }>()
const safeUrl = (raw: string) => {
  try { const url = new URL(raw); return url.origin === 'https://huggingface.co' && url.pathname === '/api/models' && !url.username && !url.password && !url.hash } catch { return false }
}

/** Broad discovery is metadata-only. Task support is assessed separately from format. */
export function fetchHubCategoryPage(fetchImpl: typeof fetch, category: HubCategory, cursor?: string, search = ''): Promise<Page> {
  const key = `${category}:${search}:${cursor ?? ''}`
  const cached = cache.get(key)
  if (cached && cached.expires > Date.now()) return cached.page
  const page = load(fetchImpl, category, cursor, search)
  cache.set(key, { expires: Date.now() + 600000, page })
  void page.catch(() => cache.delete(key))
  if (cache.size > 30) cache.delete(cache.keys().next().value!)
  return page
}

async function load(fetchImpl: typeof fetch, category: HubCategory, cursor?: string, search = ''): Promise<Page> {
  const definition = HUB_CATEGORIES.find(item => item.id === category)
  if (!definition) throw new Error('Unknown Hub category')
  let urls: string[]
  if (cursor) {
    const decoded: unknown = JSON.parse(cursor)
    if (!Array.isArray(decoded) || decoded.length > 6 || !decoded.every(url => typeof url === 'string' && safeUrl(url))) throw new Error('Invalid Hub category cursor')
    urls = decoded
  } else {
    const queries: Record<string, string>[] = [
      ...definition.tasks.slice(0, 4).map(task => ({ pipeline_tag: task })),
      ...definition.tags.slice(0, 2).map(tag => ({ filter: tag })),
    ]
    const popular = queries.length ? queries.slice(0, 5) : [{}]
    const newest = { ...popular[0], sort: 'lastModified' }
    const batches: Record<string, string>[] = [...popular, newest]
    urls = batches.map(query => {
      const { sort = 'downloads', ...filters } = query
      return `${API}?${new URLSearchParams({ limit: '8', sort, direction: '-1', full: 'true', config: 'true', ...(search ? { search: search.slice(0, 120) } : {}), ...filters })}`
    })
  }
  const repos = new Map<string, HuggingFaceRepo>()
  const next: string[] = []
  // Keep concurrency and metadata volume bounded for large multimodal catalogs.
  for (const url of urls) {
    const response = await fetchImpl(url, { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(20000) })
    if (!response.ok) throw new Error(`Hub category: HTTP ${response.status}`)
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new Error('Invalid Hub category response')
    for (const row of data.slice(0, 8)) {
      const id = row?.modelId ?? row?.id
      if (typeof id === 'string' && /^[\w.-]+\/[\w.-]+$/.test(id)) repos.set(id, { ...row, id, modelId: id, author: id.split('/')[0] })
    }
    const match = response.headers.get('Link')?.match(/<([^>]+)>;\s*rel="next"/)
    if (match && safeUrl(match[1])) next.push(match[1])
  }
  return { repos: [...repos.values()], ...(next.length ? { nextCursor: JSON.stringify([...new Set(next)]) } : {}) }
}
