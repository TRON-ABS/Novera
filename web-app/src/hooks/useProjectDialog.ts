import { create } from 'zustand'
import { useDashboardPanel } from './useDashboardPanel'

type ProjectDialogState = {
  open: boolean
  setOpen: (value: boolean) => void
}

export const useProjectDialog = create<ProjectDialogState>()((set) => ({
  open: false,
  setOpen: (value) => {
    const dashboard = useDashboardPanel.getState()
    if (!value) dashboard.closePanel('thread-project')
    set({ open: value && dashboard.openPanel('thread-project') })
  },
}))
