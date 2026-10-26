import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'

export const useImageUpscale = create<{
  enabled: boolean
  factor: 2 | 4
  models: { 2: string; 4: string }
  installedModels: { 2: string; 4: string }
  setEnabled: (enabled: boolean) => void
  setFactor: (factor: 2 | 4) => void
  setModel: (factor: 2 | 4, path: string) => void
  registerModel: (factor: 2 | 4, path: string) => void
}>()(
  persist(
    (set) => ({
      enabled: false,
      factor: 2,
      models: { 2: '', 4: '' },
      installedModels: { 2: '', 4: '' },
      setEnabled: (enabled) => set({ enabled }),
      setFactor: (factor) => set({ factor }),
      setModel: (factor, path) =>
        set((s) => ({ models: { ...s.models, [factor]: path } })),
      registerModel: (factor, path) =>
        set((s) => ({ installedModels: { ...s.installedModels, [factor]: path } })),
    }),
    {
      name: 'novera-image-upscale',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: ({ enabled, factor, models, installedModels }) => ({
        enabled,
        factor,
        models,
        installedModels,
      }),
    }
  )
)
