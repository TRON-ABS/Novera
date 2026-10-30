import { groupGgufFiles } from './ggufShards'
import type { HuggingFaceRepo } from './types'
import { isSpecSidecar } from '@/lib/specDraft'

export type HuggingFacePage = { repos: HuggingFaceRepo[]; nextCursor?: string }
const API = 'https://huggingface.co/api/models'
const TTL = 10 * 60 * 1000
const cache = new Map<string, { expires: number; page: Promise<HuggingFacePage> }>()
export const clearHuggingFaceCatalogCache = () => cache.clear()

// Publisher identity is an explicit allowlist, never a model name or community tag.
export const ORIGINAL_PUBLISHERS = new Set([
  'liquidai', 'qwen', 'mistralai', 'meta-llama', 'google', 'microsoft',
  'huggingfacetb', 'deepseek-ai', 'zai-org', 'coherelabs', 'ibm-granite',
  'nvidia', 'moonshotai', 'minimaxai', 'tiiuae', 'allenai', 'apple',
])

export const isOriginalPublisher = (author?: string) => ORIGINAL_PUBLISHERS.has(author?.toLowerCase() ?? '')

function listUrl(params: Record<string, string>): string {
  return `${API}?${new URLSearchParams({ sort: 'downloads', direction: '-1', limit: '8', full: 'true', config: 'true', ...params })}`
}

function safeListUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.origin === 'https://huggingface.co' && url.pathname === '/api/models' && !url.username && !url.password && !url.hash
  } catch { return false }
}

function compatible(repo: HuggingFaceRepo): boolean {
  const task = repo.pipeline_tag
  if (task && !['text-generation', 'image-text-to-text', 'text2text-generation'].includes(task)) return false
  return groupGgufFiles(repo.siblings ?? []).some(([f]) => /\.gguf$/i.test(f.rfilename) && !/mmproj|(?:^|\/)imatrix/i.test(f.rfilename) && !isSpecSidecar({ model_id: f.rfilename, path: f.rfilename })) ||
    (repo.library_name === 'mlx' && !!repo.siblings?.some((f) => f.rfilename.endsWith('.safetensors')))
}

/** Public metadata only. No account token, weights or model code are fetched. */
export function fetchHuggingFacePage(
  fetchImpl: typeof fetch,
  includeMlx: boolean,
  cursor?: string
): Promise<HuggingFacePage> {
  const cacheKey = `${includeMlx}:${cursor ?? 'first'}`
  const cached = cache.get(cacheKey)
  if (cached && cached.expires > Date.now()) return cached.page
  const page = loadPage(fetchImpl, includeMlx, cursor)
  cache.set(cacheKey, { expires: Date.now() + TTL, page })
  // Rejected requests must remain retryable; do not silently retry HTTP 429.
  void page.catch(() => cache.delete(cacheKey))
  if (cache.size > 12) cache.delete(cache.keys().next().value!)
  return page
}

async function loadPage(fetchImpl: typeof fetch, includeMlx: boolean, cursor?: string): Promise<HuggingFacePage> {
  let urls: string[]
  if (cursor) {
    const decoded: unknown = JSON.parse(cursor)
    if (!Array.isArray(decoded) || decoded.length > 6 || !decoded.every((u) => typeof u === 'string' && safeListUrl(u))) throw new Error('Invalid Hugging Face catalog cursor')
    urls = decoded
  } else {
    urls = [
      listUrl({ filter: 'gguf', author: 'LiquidAI' }),
      listUrl({ filter: 'gguf', author: 'Qwen' }),
      listUrl({ filter: 'gguf', pipeline_tag: 'text-generation', limit: '24' }),
      listUrl({ filter: 'gguf', pipeline_tag: 'image-text-to-text' }),
      listUrl({ filter: 'gguf', pipeline_tag: 'text-generation', sort: 'lastModified' }),
      ...(includeMlx ? [listUrl({ filter: 'mlx', pipeline_tag: 'text-generation', limit: '12' })] : []),
    ]
  }
  const next: string[] = []
  const candidates = new Map<string, HuggingFaceRepo>()
  const options: RequestInit = { credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(20000) }
  for (const url of urls) {
    const response = await fetchImpl(url, options)
    if (!response.ok) throw new Error(`Hugging Face catalog: ${response.status} ${response.statusText}`)
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new Error('Invalid Hugging Face model list')
    const limit = Math.max(1, Math.min(24, Number(new URL(url).searchParams.get('limit')) || 24))
    for (const row of data.slice(0, limit)) {
      const id = row?.modelId ?? row?.id
      if (typeof id !== 'string' || !/^[\w.-]+\/[\w.-]+$/.test(id)) continue
      const repo = { ...row, modelId: id, author: id.split('/')[0] } as HuggingFaceRepo
      if (compatible(repo) && (includeMlx || repo.library_name !== 'mlx')) candidates.set(id, repo)
    }
    const link = response.headers?.get('Link')?.match(/<([^>]+)>;\s*rel="next"/)
    if (link && safeListUrl(link[1])) next.push(link[1])
  }
  const rows = [...candidates.values()].sort((a, b) => Number(isOriginalPublisher(b.author)) - Number(isOriginalPublisher(a.author)) || (b.downloads ?? 0) - (a.downloads ?? 0))
  // Three workers bound detail requests. Sizes come from metadata, never guesses.
  const hydrated: HuggingFaceRepo[] = new Array(rows.length)
  let index = 0
  let rateLimited = false
  await Promise.all(Array.from({ length: Math.min(3, rows.length) }, async () => {
    while (index < rows.length) {
      const current = index++
      const repo = rows[current]
      if (rateLimited) { hydrated[current] = repo; continue }
      try {
        const response = await fetchImpl(`${API}/${repo.modelId}?blobs=true&files_metadata=true`, { ...options, signal: AbortSignal.timeout(20000) })
        if (response.status === 429) rateLimited = true
        if (!response.ok) { hydrated[current] = repo; continue }
        const detail = await response.json()
        hydrated[current] = { ...repo, ...detail, modelId: repo.modelId, author: repo.author }
      } catch { hydrated[current] = repo }
    }
  }))
  return { repos: hydrated.filter(compatible), ...(next.length ? { nextCursor: JSON.stringify([...new Set(next)]) } : {}) }
}
