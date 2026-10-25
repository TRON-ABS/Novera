import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
import { analyticsConsentScope } from '@/lib/noveraTelemetry'

// Separate permission: existing analytics consent never enables error reports.
export const useErrorTracking = create<{
  enabled: boolean
  promptPending: boolean
  setEnabled: (enabled: boolean) => void
}>()(persist((set) => ({
  enabled: false,
  promptPending: true,
  setEnabled: (enabled) => set({ enabled, promptPending: false }),
}), {
  name: `novera-error-tracking-v1:${analyticsConsentScope}`,
  storage: createJSONStorage(() => backendStorage),
  skipHydration: true,
}))
