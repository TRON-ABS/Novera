import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchHuggingFacePage, clearHuggingFaceCatalogCache } from '../huggingfaceCatalog'
import { mergeHubCatalog, NOVERA_HUB_MODELS, sortHubModels } from '@/lib/hubDiscovery'
import { DefaultModelsService } from '../default'

const repo = (author = 'community', name = 'chat-GGUF') => ({
  id: `${author}/${name}`, modelId: `${author}/${name}`, author, sha: 'revision',
  downloads: 100, likes: 1, private: false, disabled: false, gated: false,
  pipeline_tag: 'text-generation', tags: ['gguf'],
  siblings: [{ rfilename: 'model-Q4_K_M.gguf', size: 1000000000 }],
})
const json = (body: unknown, headers?: HeadersInit) => new Response(JSON.stringify(body), { headers })
beforeEach(clearHuggingFaceCatalogCache)

describe('direct Hugging Face discovery', () => {
  it('lists public metadata, hydrates sizes and prioritizes original publishers', async () => {
    const rows = [repo(), repo('Qwen'), { ...repo('other', 'embedding-GGUF'), pipeline_tag: 'feature-extraction' }]
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input))
      return json(url.pathname === '/api/models' ? rows : rows.find((r) => url.pathname.endsWith(r.id)))
    })
    const page = await fetchHuggingFacePage(fetchImpl, false)
    expect(page.repos.map((r) => r.author)).toEqual(['Qwen', 'community'])
    for (const [url, options] of fetchImpl.mock.calls) {
      expect(String(url)).toMatch(/^https:\/\/huggingface.co\/api\/models/)
      expect(options).toMatchObject({ credentials: 'omit', redirect: 'error' })
      expect(options?.headers).toBeUndefined()
    }
    expect(page.repos[0].siblings[0].size).toBe(1000000000)
    expect(fetchImpl).toHaveBeenCalledTimes(7) // five lists + two unique details
  })

  it('discovers repositories containing only a complete split GGUF series', async () => {
    const rows = [{ ...repo(), siblings: [2, 1].map((i) => ({ rfilename: `model-${String(i).padStart(5, '0')}-of-00002.gguf`, size: 100 })) }]
    const page = await fetchHuggingFacePage(vi.fn().mockImplementation(async (input) =>
      json(new URL(String(input)).pathname === '/api/models' ? rows : rows[0])
    ), false)
    expect(page.repos).toHaveLength(1)
    expect(new DefaultModelsService().convertHfRepoToCatalogModel(page.repos[0]).quants).toHaveLength(1)
  })

  it('retains seven pinned presets and deduplicates their complete HF repository IDs', () => {
    const converted = new DefaultModelsService().convertHfRepoToCatalogModel(repo('LiquidAI', 'LFM2.5-230M-GGUF'))
    const merged = mergeHubCatalog([converted])
    expect(merged).toHaveLength(7)
    expect(merged).toEqual(NOVERA_HUB_MODELS)
  })

  it('pages through HF cursors but never follows an external next URL', async () => {
    const next = 'https://huggingface.co/api/models?filter=gguf&cursor=next'
    const fetchImpl = vi.fn().mockImplementation(async () => json([], { Link: `<${next}>; rel="next"` }))
    const first = await fetchHuggingFacePage(fetchImpl, false)
    expect(JSON.parse(first.nextCursor!)).toEqual([next])
    fetchImpl.mockImplementation(async () => json([], { Link: '<https://evil.test/api/models>; rel="next"' }))
    const second = await fetchHuggingFacePage(fetchImpl, false, first.nextCursor)
    expect(second.nextCursor).toBeUndefined()
    expect(fetchImpl.mock.lastCall?.[0]).toBe(next)
    await expect(fetchHuggingFacePage(fetchImpl, false, '["https://evil.test"]')).rejects.toThrow('cursor')
  })

  it('caches and shares concurrent first-page requests', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => json([]))
    await Promise.all([fetchHuggingFacePage(fetchImpl, false), fetchHuggingFacePage(fetchImpl, false)])
    expect(fetchImpl).toHaveBeenCalledTimes(5)
  })

  it('does not retry a rate-limited list and permits an explicit later retry', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response('', { status: 429 }))
    await expect(fetchHuggingFacePage(fetchImpl, false)).rejects.toThrow('429')
    expect(fetchImpl).toHaveBeenCalledTimes(1)
    fetchImpl.mockImplementation(async () => json([]))
    await expect(fetchHuggingFacePage(fetchImpl, false)).resolves.toMatchObject({ repos: [] })
  })

  it('excludes unsupported tasks, draft-only and incomplete split GGUF repositories', async () => {
    const rows = [
      { ...repo(), pipeline_tag: 'object-detection' },
      { ...repo('a'), siblings: [{ rfilename: 'model-00001-of-00002.gguf' }] },
      { ...repo('b'), siblings: [{ rfilename: 'model-DSpark-Q8_0.gguf' }] },
    ]
    const fetchImpl = vi.fn().mockImplementation(async () => json(rows))
    expect((await fetchHuggingFacePage(fetchImpl, false)).repos).toEqual([])
  })

  it('queries MLX only when the platform supports it', async () => {
    const fetchImpl = vi.fn().mockImplementation(async () => json([]))
    await fetchHuggingFacePage(fetchImpl, false)
    expect(fetchImpl.mock.calls.every(([u]) => !String(u).includes('filter=mlx'))).toBe(true)
    await fetchHuggingFacePage(fetchImpl, true)
    expect(fetchImpl.mock.calls.some(([u]) => String(u).includes('filter=mlx'))).toBe(true)
  })

  it('limits simultaneous metadata requests to three', async () => {
    let active = 0
    let peak = 0
    const rows = Array.from({ length: 6 }, (_, i) => repo('community', `model-${i}`))
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      if (new URL(String(input)).pathname === '/api/models') return json(rows)
      active++
      peak = Math.max(peak, active)
      await Promise.resolve()
      active--
      return json(rows.find((r) => String(input).includes(r.id)))
    })
    expect((await fetchHuggingFacePage(fetchImpl, false)).repos).toHaveLength(6)
    expect(peak).toBe(3)
  })

  it('honors download counts across original publishers and community conversions', () => {
    const make = (developer: string) => ({ model_name: 'Chat', developer, downloads: developer === 'community' ? 1e9 : 1, description: '', quants: [{ model_id: 'q4', path: '', file_size: '1 GB' }] })
    expect(sortHubModels([make('community'), make('Qwen')], 'most-downloaded', {} as never)[0].developer).toBe('community')
  })
  it('preserves byte-exact weights at small and large filter boundaries', () => {
    for (const size of [999999999, 1e9, 500e9, 501e9]) {
      const row = { ...repo(), siblings: [{ rfilename: 'model-Q4_K_M.gguf', size }] }
      expect(new DefaultModelsService().convertHfRepoToCatalogModel(row as never).quants?.[0].file_size).toBe(`${size} B`)
    }
  })
})
