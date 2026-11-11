import { create } from 'zustand'

export type DashboardPanel = 'auto-tune' | 'models' | 'settings' | 'search' | 'project' | 'thread-project' | 'model-settings'
export const dashboardPanelLimit = 4

export const useDashboardPanel = create<{
  panels: DashboardPanel[]
  anchor: HTMLElement | null
  modelSettings: { model: Model; provider: ProviderObject } | null
  settingsPath: string | null
  openPanel: (panel: DashboardPanel, anchor?: HTMLElement | null) => boolean
  openModelSettings: (model: Model, provider: ProviderObject) => void
  openProviderSettings: (provider: string) => void
  closePanel: (panel: DashboardPanel) => void
}>((set, get) => ({
  panels: [],
  anchor: null,
  modelSettings: null,
  settingsPath: null,
  openPanel(panel, anchor) {
    const state = get()
    const exists = state.panels.includes(panel)
    if (!exists && state.panels.length >= dashboardPanelLimit) return false
    set({ panels: exists ? state.panels : [...state.panels, panel], anchor: anchor ?? state.anchor })
    return true
  },
  openProviderSettings(provider) {
    if (get().openPanel('settings')) set({ settingsPath: `/settings/providers/${encodeURIComponent(provider)}` })
  },
  openModelSettings(model, provider) {
    if (get().openPanel('model-settings')) set({ modelSettings: { model, provider } })
  },
  closePanel: panel => set(state => !state.panels.includes(panel) ? state : {
    panels: state.panels.filter(open => open !== panel),
    ...(panel === 'model-settings' ? { modelSettings: null } : {}),
    ...(panel === 'settings' ? { settingsPath: null } : {}),
  }),
}))
