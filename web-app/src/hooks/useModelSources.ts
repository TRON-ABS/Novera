import { create } from 'zustand'
import { localStorageKey } from '@/constants/localStorage'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getServiceHub } from '@/hooks/useServiceHub'
import type { CatalogModel } from '@/services/models/types'
import { sanitizeModelId } from '@/lib/utils'

// Zustand store for model sources
type ModelSourcesState = {
  sources: CatalogModel[]
  error: Error | null
  loading: boolean
  nextCursor?: string
  fetchSources: () => Promise<void>
  fetchMore: () => Promise<void>
}

export const useModelSources = create<ModelSourcesState>()(
  persist(
    (set, get) => ({
      sources: [],
      error: null,
      loading: false,
      nextCursor: undefined,
      fetchSources: async () => {
        if (get().loading) return
        set({ loading: true, error: null })
        try {
          const newSources = await getServiceHub()
            .models()
            .fetchModelCatalogPage()
            .then((page) => ({ ...page,
              models: page.models.map((catalog) => ({
                ...catalog,
                quants: catalog.quants?.map((quant) => ({
                  ...quant,
                  model_id: sanitizeModelId(quant.model_id),
                })),
                is_mlx: catalog.is_mlx || catalog.library_name === 'mlx',
              })).filter(e => IS_MACOS ? true : !e.is_mlx) })
            )

          set({
            sources: newSources.models.length ? newSources.models : get().sources,
            nextCursor: newSources.nextCursor,
            loading: false,
          })
        } catch (error) {
          set({ error: error as Error, loading: false })
        }
      },
      fetchMore: async () => {
        const cursor = get().nextCursor
        if (!cursor || get().loading) return
        set({ loading: true, error: null })
        try {
          const page = await getServiceHub().models().fetchModelCatalogPage(cursor)
          const models = page.models.map((model) => ({ ...model,
            quants: model.quants?.map((quant) => ({ ...quant, model_id: sanitizeModelId(quant.model_id) })),
            is_mlx: model.is_mlx || model.library_name === 'mlx',
          })).filter((model) => IS_MACOS || !model.is_mlx)
          const merged = new Map(get().sources.map((model) => [model.model_name, model]))
          for (const model of models) merged.set(model.model_name, model)
          set({ sources: [...merged.values()], nextCursor: page.nextCursor === cursor ? undefined : page.nextCursor, loading: false })
        } catch (error) { set({ error: error as Error, loading: false }) }
      },
    }),
    {
      // Kept in webview localStorage, not the backend settings store: this is a
      // re-fetchable network cache (the full Hub catalog, ~500 KB), not a user
      // setting. Persisting it to settings.json rewrote the whole file on every
      // Hub visit. localStorage is synchronous, so no skipHydration needed.
      name: localStorageKey.modelSources,
      storage: createJSONStorage(() => localStorage),
      // Discard only the regenerable legacy Jan catalog cache.
      version: 1,
      migrate: () => ({ sources: [], nextCursor: undefined, error: null, loading: false }),
      partialize: (state) => ({ sources: state.sources, nextCursor: state.nextCursor }),
    }
  )
)
