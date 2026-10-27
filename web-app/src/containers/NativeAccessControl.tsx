import { ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
import { useNativeAccess } from '@/hooks/useNativeAccess'
import { toast } from 'sonner'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { FolderAccessDialog } from '@/containers/dialogs/FolderAccessDialog'

export function ResetWorkspacePermissions({ owner }: { owner: string }) {
  const { t } = useTranslation()
  const session = useCoworkSessions((s) => s.sessions.find((p) => p.id === owner))
  const [editing, setEditing] = useState(false)
  const folder = session?.folder ?? null
  const shellGranted = useNativeAccess((s) => Boolean(s.grants[JSON.stringify([owner, 'shell'])]))
  const reset = () => {
    useNativeAccess.getState().reset(owner)
    if (session?.folder) useCoworkSessions.getState().setFolder(owner, session.folder, 'read')
    toast.info(t('tools:toolApproval.needsApproval'))
  }
  return <>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon-sm" title={t('tools:toolApproval.title')} aria-label={t('tools:toolApproval.title')}><ShieldCheck className="size-4" /></Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 space-y-3" align="end">
        <p className="font-medium">{t('tools:toolApproval.title')}</p>
        {folder && <div className="space-y-2 text-sm">
          <p className="break-all">{folder}</p>
          <p>{t(`common:access.${session?.folderAccess ?? 'read'}`)}</p>
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>{t('common:workspace.change')}</Button>
        </div>}
        <p className="text-sm">{t('common:shell')} · {t(shellGranted ? 'tools:toolApproval.allowInThread' : 'tools:toolApproval.needsApproval')}</p>
        <Button variant="outline" size="sm" onClick={reset}>{t('common:reset')}</Button>
      </PopoverContent>
    </Popover>
    <FolderAccessDialog key={editing ? folder : 'closed'} path={editing ? folder : null} onCancel={() => setEditing(false)} onConfirm={(access) => {
      if (folder) useCoworkSessions.getState().setFolder(owner, folder, access)
      setEditing(false)
    }} />
  </>
}
