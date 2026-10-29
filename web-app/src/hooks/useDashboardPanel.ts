import { create } from 'zustand'

export type DashboardPanel = 'models' | 'settings' | 'search' | 'project' | 'thread-project' | 'model-settings'

export const useDashboardPanel = create<{
  panel: DashboardPanel | null
  anchor: HTMLElement | null
  modelSettings: { model: Model; provider: ProviderObject } | null
  settingsPath: string | null
  openPanel: (panel: DashboardPanel, anchor?: HTMLElement | null) => void
  openModelSettings: (model: Model, provider: ProviderObject) => void
  openProviderSettings: (provider: string) => void
  closePanel: (panel?: DashboardPanel) => void
}>((set) => ({
  panel: null,
  anchor: null,
  modelSettings: null,
  settingsPath: null,
  openPanel: (panel, anchor) => set(state => ({ panel, anchor: anchor ?? state.anchor, modelSettings: null, settingsPath: null })),
  openProviderSettings: provider => set({ panel: 'settings', settingsPath: `/settings/providers/${encodeURIComponent(provider)}`, modelSettings: null }),
  openModelSettings: (model, provider) => set({ panel: 'model-settings', modelSettings: { model, provider } }),
  closePanel: panel => set(state => !panel || state.panel === panel ? { panel: null, modelSettings: null } : {}),
}))
