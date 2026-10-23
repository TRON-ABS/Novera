import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: vi.fn(async () => JSON.stringify({ state: { model: { display_name: 'Jan V3.5' }, lastFetchedAt: 1 }, version: 0 })),
  setItem: vi.fn(), removeItem: vi.fn(),
} }))
import { useLatestJanModel } from '../useLatestJanModel'
import { NOVERA_RECOMMENDED_MODEL } from '@/lib/noveraRecommendedModel'

afterEach(() => vi.unstubAllGlobals())
describe('Novera recommendation persistence', () => {
  it('keeps the fixed LiquidAI choice after hydrating an outdated recommendation', async () => {
    await useLatestJanModel.persist.rehydrate()
    expect(useLatestJanModel.getState().model).toEqual(NOVERA_RECOMMENDED_MODEL)
  })
  it('refreshes offline without requesting the upstream model feed', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await useLatestJanModel.getState().fetchLatestJanModel(true)
    expect(fetch).not.toHaveBeenCalled()
    expect(useLatestJanModel.getState().model?.quants?.[0].model_id).toBe('LFM2.5-2.6B-Q6_K')
  })
})
