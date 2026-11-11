import { useNavigate } from '@tanstack/react-router'
import { useThreadManagement } from '@/hooks/useThreadManagement'
import { useSearchDialog } from '@/hooks/useSearchDialog'
import { useProjectDialog } from '@/hooks/useProjectDialog'
import AddProjectDialog from '@/containers/dialogs/AddProjectDialog'
import { SearchDialog } from '@/containers/dialogs/SearchDialog'
import { NewWorkspaceProject } from '@/components/left-sidebar/WorkspaceProjects'
import { lazy, Suspense, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useThreads } from '@/hooks/useThreads'
import { localStorageKey } from '@/constants/localStorage'

const DashboardNavigationPages = lazy(() => import('./DashboardNavigationPages'))
const ModelSettingWindow = lazy(() => import('./ModelSetting').then(module => ({ default: module.ModelSettingWindow })))

/** One owner for navigation dialogs, independent of sidebar and composer mounts. */
export function GlobalNavigationDialogs() {
  const navigate = useNavigate()
  const { addFolder } = useThreadManagement()
  const { open: searchOpen, setOpen: setSearchOpen } = useSearchDialog()
  const { open: projectOpen, setOpen: setProjectOpen } = useProjectDialog()
  const panels = useDashboardPanel(state => state.panels)
  const settingsPath = useDashboardPanel(state => state.settingsPath)
  const { t } = useTranslation()
  const finish = useCallback((panel: 'models' | 'settings', model?: ThreadModel) => {
    if (model) {
      useModelProvider.getState().selectModelProvider(model.provider, model.id)
      useThreads.getState().updateCurrentThreadModel(model)
      try {
        localStorage.setItem(localStorageKey.lastUsedModel, JSON.stringify({ provider: model.provider, model: model.id }))
      } catch { /* Model selection still works when browser storage is unavailable. */ }
    }
    useDashboardPanel.getState().closePanel(panel)
  }, [])
  return (
    <>
      <NewWorkspaceProject controllerOnly />
      {panels.includes('model-settings') && <Suspense fallback={null}><ModelSettingWindow /></Suspense>}
      <SearchDialog docked open={searchOpen && panels.includes('search')} onOpenChange={setSearchOpen} />
      {panels.filter(panel => panel === 'models' || panel === 'settings').map(panel => (
        <Dialog key={panel} open modal={false}
          onOpenChange={open => { if (!open) useDashboardPanel.getState().closePanel(panel) }}>
          <DialogContent docked className={`flex flex-col gap-0 p-0 ${panel === 'settings' ? 'novera-settings-window' : ''}`}>
            <DialogHeader className="shrink-0 border-b border-cyan-400/30 p-4 pr-12">
              <DialogTitle>{t(panel === 'models' ? 'providers:models' : 'common:settings')}</DialogTitle>
            </DialogHeader>
            <Suspense fallback={<p className="p-4">{t('common:loading')}</p>}>
              <DashboardNavigationPages key={panel === 'settings' ? settingsPath : panel} panel={panel}
                initialPath={panel === 'settings' ? settingsPath ?? undefined : undefined}
                onExit={model => finish(panel, model)} />
            </Suspense>
          </DialogContent>
        </Dialog>
      ))}
      <AddProjectDialog docked open={projectOpen && panels.includes('thread-project')} onOpenChange={setProjectOpen} editingKey={null}
        onSave={async (name, assistantId) => {
          const project = await addFolder(name, assistantId)
          setProjectOpen(false)
          void navigate({ to: '/project/$projectId', params: { projectId: project.id } })
        }} />
    </>
  )
}
