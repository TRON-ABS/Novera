import { describe, expect, it, vi } from 'vitest'
import { fetchHubCategoryPage } from '../hubCategories'

describe('multimodal Hub metadata discovery', () => {
  it('fetches bounded image metadata and a recent-model page without weights or credentials', async () => {
    const fetch = vi.fn().mockImplementation(async (url: string) => new Response(JSON.stringify([
      { id: 'publisher/image-model', pipeline_tag: new URL(url).searchParams.get('pipeline_tag'), tags: [], siblings: [{ rfilename: 'model.safetensors' }] },
    ])))
    const page = await fetchHubCategoryPage(fetch, 'image', undefined, 'landscape')
    expect(page.repos).toHaveLength(1)
    expect(fetch.mock.calls.length).toBeLessThanOrEqual(6)
    const urls = fetch.mock.calls.map(([url]) => new URL(url))
    expect(urls.some(url => url.searchParams.get('pipeline_tag') === 'text-to-image')).toBe(true)
    expect(urls.some(url => url.searchParams.get('sort') === 'lastModified')).toBe(true)
    for (const [url, options] of fetch.mock.calls) {
      expect(url).toContain('https://huggingface.co/api/models?')
      expect(new URL(url).searchParams.get('search')).toBe('landscape')
      expect(options).toMatchObject({ credentials: 'omit', redirect: 'error' })
      expect(options).not.toHaveProperty('headers')
    }
  })
  it('rejects forged pagination destinations before a request', async () => {
    const fetch = vi.fn()
    await expect(fetchHubCategoryPage(fetch, 'medical', JSON.stringify(['https://other.invalid/api/models']))).rejects.toThrow('cursor')
    expect(fetch).not.toHaveBeenCalled()
  })
  it('reports rate limits and allows retry without inventing models', async () => {
    const fetch = vi.fn().mockResolvedValueOnce(new Response('', { status: 429 })).mockImplementation(async () => new Response('[]'))
    await expect(fetchHubCategoryPage(fetch, 'robotics', undefined, 'retry-test')).rejects.toThrow('429')
    expect((await fetchHubCategoryPage(fetch, 'robotics', undefined, 'retry-test')).repos).toEqual([])
  })
  it('preserves unknown task metadata for future engines', async () => {
    const fetch = vi.fn().mockImplementation(async () => new Response(JSON.stringify([
      { id: 'publisher/future', pipeline_tag: 'future-modality', tags: ['new'] }, { id: 'bad/id/path' },
    ])))
    const page = await fetchHubCategoryPage(fetch, 'other', undefined, 'future-test')
    expect(page.repos).toHaveLength(1)
    expect(page.repos[0].pipeline_tag).toBe('future-modality')
  })
})
