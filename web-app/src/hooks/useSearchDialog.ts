import { create } from 'zustand'
import { useDashboardPanel } from './useDashboardPanel'

type SearchDialogState = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useSearchDialog = create<SearchDialogState>()((set) => ({
  open: false,
  setOpen: (value) => {
    if (value) useDashboardPanel.getState().openPanel('search')
    else useDashboardPanel.getState().closePanel('search')
    set({ open: value })
  },
}))
