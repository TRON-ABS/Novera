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
  const panel = useDashboardPanel(state => state.panel)
  const settingsPath = useDashboardPanel(state => state.settingsPath)
  const { t } = useTranslation()
  const finish = useCallback((model?: ThreadModel) => {
    if (model) {
      useModelProvider.getState().selectModelProvider(model.provider, model.id)
      useThreads.getState().updateCurrentThreadModel(model)
      try {
        localStorage.setItem(localStorageKey.lastUsedModel, JSON.stringify({ provider: model.provider, model: model.id }))
      } catch { /* Model selection still works when browser storage is unavailable. */ }
    }
    useDashboardPanel.getState().closePanel()
  }, [])
  return (
    <>
      <NewWorkspaceProject controllerOnly />
      {panel === 'model-settings' && <Suspense fallback={null}><ModelSettingWindow /></Suspense>}
      <SearchDialog docked open={searchOpen && panel === 'search'} onOpenChange={setSearchOpen} />
      <Dialog open={panel === 'models' || panel === 'settings'} modal={false}
        onOpenChange={open => { if (!open) useDashboardPanel.getState().closePanel() }}>
        <DialogContent docked positionEnabled={panel === 'models' || panel === 'settings'} className="flex flex-col gap-0 p-0">
          <DialogHeader className="shrink-0 border-b border-cyan-400/30 p-4 pr-12">
            <DialogTitle>{t(panel === 'models' ? 'providers:models' : 'common:settings')}</DialogTitle>
          </DialogHeader>
          {(panel === 'models' || panel === 'settings') && <Suspense fallback={<p className="p-4">{t('common:loading')}</p>}>
            <DashboardNavigationPages key={`${panel}:${settingsPath}`} panel={panel} initialPath={panel === 'settings' ? settingsPath ?? undefined : undefined} onExit={finish} />
          </Suspense>}
        </DialogContent>
      </Dialog>
      <AddProjectDialog docked open={projectOpen && panel === 'thread-project'} onOpenChange={setProjectOpen} editingKey={null}
        onSave={async (name, assistantId) => {
          const project = await addFolder(name, assistantId)
          setProjectOpen(false)
          void navigate({ to: '/project/$projectId', params: { projectId: project.id } })
        }} />
    </>
  )
}
