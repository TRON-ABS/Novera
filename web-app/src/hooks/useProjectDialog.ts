import { create } from 'zustand'
import { useDashboardPanel } from './useDashboardPanel'

type ProjectDialogState = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useProjectDialog = create<ProjectDialogState>()((set) => ({
  open: false,
  setOpen: (value) => {
    if (value) useDashboardPanel.getState().openPanel('thread-project')
    else useDashboardPanel.getState().closePanel('thread-project')
    set({ open: value })
  },
}))
