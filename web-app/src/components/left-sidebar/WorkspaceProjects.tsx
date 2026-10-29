import { useEffect, useRef, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { FolderOpen, FolderPlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
import { FolderAccessDialog } from '@/containers/dialogs/FolderAccessDialog'
import { basenameOf } from '@/lib/coworkPreview'
import { route } from '@/constants/routes'
import { toast } from 'sonner'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'

export function NewWorkspaceProject({ controllerOnly = false }: { controllerOnly?: boolean }) {
  const { t } = useTranslation()
  const hub = useServiceHub()
  const navigate = useNavigate()
  const [folder, setFolder] = useState<string | null>(null)
  const [picking, setPicking] = useState(false)
  const pickingRef = useRef(false)
  const panel = useDashboardPanel(state => state.panel)
  useEffect(() => {
    if (controllerOnly && panel !== 'project') setFolder(null)
  }, [controllerOnly, panel])
  const pick = async () => {
    if (pickingRef.current) return
    pickingRef.current = true
    if (controllerOnly) useDashboardPanel.getState().openPanel('project')
    setPicking(true)
    try {
      const path = await hub.dialog().open({ directory: true })
      if (typeof path === 'string' && (!controllerOnly || useDashboardPanel.getState().panel === 'project')) setFolder(path)
      else if (controllerOnly) useDashboardPanel.getState().closePanel('project')
    } catch {
      if (controllerOnly) useDashboardPanel.getState().closePanel('project')
      toast.error(t('common:workspace.openFailed'))
    }
    finally { pickingRef.current = false; setPicking(false) }
  }
  useEffect(() => {
    const handler = () => { void pick() }
    window.addEventListener('novera-new-workspace-project', handler)
    return () => window.removeEventListener('novera-new-workspace-project', handler)
  })
  return <>
    {!controllerOnly && <Button className="novera-new-project w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0" aria-label={t('settings:shortcuts.newProject')} title={t('settings:shortcuts.newProject')} variant="outline" onClick={() => void pick()} disabled={picking}>
      <FolderPlus className="size-4 shrink-0" />
      <span className="group-data-[collapsible=icon]:hidden">{t('settings:shortcuts.newProject')}</span>
    </Button>}
    <FolderAccessDialog key={folder ?? 'closed'} path={folder} docked={controllerOnly} visible={!controllerOnly || panel === 'project'} onCancel={() => {
      setFolder(null)
      if (controllerOnly) useDashboardPanel.getState().closePanel('project')
    }} onConfirm={(access) => {
      if (!folder) return
      const state = useCoworkSessions.getState()
      const id = state.createSession()
      state.setFolder(id, folder, access)
      state.setTitle(id, basenameOf(folder))
      setFolder(null)
      if (controllerOnly) useDashboardPanel.getState().closePanel('project')
      void navigate({ to: route.cowork })
    }} />
  </>
}

export function WorkspaceProjects() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const sessions = useCoworkSessions((s) => s.sessions)
  const current = useCoworkSessions((s) => s.currentId)
  const projects = sessions.filter((s) => s.folder)
  if (!projects.length) return null
  return <div className="px-2 py-3 group-data-[collapsible=icon]:hidden">
    <p className="px-2 pb-2 text-xs font-medium text-muted-foreground">{t('common:projects.title')}</p>
    {projects.map((project) => <Button key={project.id} variant="ghost" className="w-full justify-start gap-2 overflow-hidden" data-active={project.id === current} onClick={() => {
      useCoworkSessions.getState().selectSession(project.id)
      void navigate({ to: route.cowork })
    }}>
      <FolderOpen className="size-4 shrink-0" /><span className="truncate">{project.title}</span>
    </Button>)}
  </div>
}
