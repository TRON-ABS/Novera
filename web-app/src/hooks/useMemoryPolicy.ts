import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
export type MemoryPolicy = 'auto' | 'manual'
export const useMemoryPolicy = create<{
  policy: MemoryPolicy
  waiting: Record<string, number>
  setPolicy: (policy: MemoryPolicy) => void
  setWaiting: (scope: string, value: boolean) => void
}>()(
  persist(
    (set) => ({
      policy: 'auto',
      waiting: {},
      setPolicy: (policy) => set({ policy }),
      setWaiting: (scope, value) =>
        set((state) => {
          const waiting = { ...state.waiting }
          const count = (waiting[scope] ?? 0) + (value ? 1 : -1)
          if (count > 0) waiting[scope] = count
          else delete waiting[scope]
          return { waiting }
        }),
    }),
    {
      name: 'novera-memory-policy',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: (state) => ({ policy: state.policy }),
    }
  )
)
