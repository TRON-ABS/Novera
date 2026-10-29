import { afterEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: vi.fn(async () => JSON.stringify({ state: { model: { display_name: 'Jan V3.5' }, lastFetchedAt: 1 }, version: 0 })),
  setItem: vi.fn(), removeItem: vi.fn(),
} }))
import { useLatestNoveraModel } from '../useLatestNoveraModel'
import { NOVERA_RECOMMENDED_MODEL } from '@/lib/noveraRecommendedModel'

afterEach(() => vi.unstubAllGlobals())
describe('Novera recommendation persistence', () => {
  it('keeps the fixed NVIDIA choice after hydrating an outdated recommendation', async () => {
    await useLatestNoveraModel.persist.rehydrate()
    expect(useLatestNoveraModel.getState().model).toEqual(NOVERA_RECOMMENDED_MODEL)
  })
  it('refreshes offline without requesting the upstream model feed', async () => {
    const fetch = vi.fn()
    vi.stubGlobal('fetch', fetch)
    await useLatestNoveraModel.getState().fetchLatestNoveraModel(true)
    expect(fetch).not.toHaveBeenCalled()
    expect(useLatestNoveraModel.getState().model?.quants?.[0].model_id).toBe('Nemotron-3.5-Bolt-E4B-Q4_K_M')
  })
})
