import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { CatalogModel } from '@/services/models/types'
import { backendStorage } from '@/lib/backendStorage'
import { NOVERA_RECOMMENDED_MODEL } from '@/lib/noveraRecommendedModel'

type LatestJanModelState = {
  model: CatalogModel | null
  lastFetchedAt: number | null
  loading: boolean
  error: boolean
  fetchLatestJanModel: (force?: boolean) => Promise<void>
}

// Keep the store interface for existing consumers; the recommendation belongs
// to Novera and never depends on the upstream feed or a stale cached model.
export const useLatestJanModel = create<LatestJanModelState>()(
  persist(
    (set) => ({
      model: NOVERA_RECOMMENDED_MODEL,
      lastFetchedAt: null,
      loading: false,
      error: false,
      fetchLatestJanModel: async () => {
        set({ model: NOVERA_RECOMMENDED_MODEL, lastFetchedAt: Date.now(), loading: false, error: false })
      },
    }),
    {
      name: 'novera-recommended-model-v1',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: (state) => ({ lastFetchedAt: state.lastFetchedAt }),
      merge: (_persisted, current) => ({ ...current, model: NOVERA_RECOMMENDED_MODEL }),
    }
  )
)
