import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { CatalogModel } from '@/services/models/types'
const fetchPage = vi.hoisted(() => vi.fn())
vi.mock('@/hooks/useServiceHub', () => ({ getServiceHub: () => ({ models: () => ({ fetchModelCatalogPage: fetchPage }) }) }))
import { useModelSources } from '../useModelSources'

const model = (name: string): CatalogModel => ({ model_name: name, developer: 'publisher', downloads: 1, description: '', quants: [{ model_id: `${name}-Q4_K_M`, file_size: '1 GB', path: '' }] })
beforeEach(() => {
  fetchPage.mockReset()
  useModelSources.setState({ sources: [], loading: false, error: null, nextCursor: undefined })
})

describe('public Hugging Face catalog pages', () => {
  it('appends the next batch, updates duplicates and keeps existing entries', async () => {
    fetchPage.mockResolvedValueOnce({ models: [model('a')], nextCursor: 'next' })
    await useModelSources.getState().fetchSources()
    fetchPage.mockResolvedValueOnce({ models: [model('b'), { ...model('a'), downloads: 20 }] })
    await useModelSources.getState().fetchMore()
    expect(fetchPage).toHaveBeenLastCalledWith('next')
    expect(useModelSources.getState().sources.map((m) => m.model_name)).toEqual(['a', 'b'])
    expect(useModelSources.getState().sources[0].downloads).toBe(20)
    expect(useModelSources.getState().nextCursor).toBeUndefined()
  })

  it('keeps usable data and the next cursor after an HTTP 429', async () => {
    useModelSources.setState({ sources: [model('cached')], nextCursor: 'next' })
    fetchPage.mockRejectedValueOnce(new Error('HTTP 429'))
    await useModelSources.getState().fetchMore()
    expect(useModelSources.getState().sources[0].model_name).toBe('cached')
    expect(useModelSources.getState().nextCursor).toBe('next')
    expect(useModelSources.getState().loading).toBe(false)
  })

  it('does not request another page when loading or at the end', async () => {
    await useModelSources.getState().fetchMore()
    useModelSources.setState({ loading: true, nextCursor: 'next' })
    await useModelSources.getState().fetchMore()
    await useModelSources.getState().fetchSources()
    expect(fetchPage).not.toHaveBeenCalled()
  })

  it('drops only the regenerable old catalog cache during migration', async () => {
    const migrated = await useModelSources.persist.getOptions().migrate!({ sources: [model('old-jan-feed')], nextCursor: 'old' }, 0) as { sources: CatalogModel[] }
    expect(migrated.sources).toEqual([])
    expect(useModelSources.getState().fetchSources).toBeTypeOf('function')
  })
})
