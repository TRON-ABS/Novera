import { create } from 'zustand'
import { useDashboardPanel } from './useDashboardPanel'

type SearchDialogState = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useSearchDialog = create<SearchDialogState>()((set) => ({
  open: false,
  setOpen: (value) => {
    const dashboard = useDashboardPanel.getState()
    if (!value) dashboard.closePanel('search')
    set({ open: value && dashboard.openPanel('search') })
  },
}))
