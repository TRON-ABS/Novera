import { useState } from 'react'
import { FolderOpen } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import type { FolderAccess } from '@/hooks/useNativeAccess'

export function FolderAccessDialog({ path, onConfirm, onCancel, docked = false, visible = true }: {
  path: string | null
  onConfirm: (access: FolderAccess) => void
  onCancel: () => void
  docked?: boolean
  visible?: boolean
}) {
  const { t } = useTranslation()
  const [access, setAccess] = useState<FolderAccess>('read')
  return <Dialog open={path !== null && visible} modal={!docked} onOpenChange={(open) => { if (!open) onCancel() }}>
    <DialogContent docked={docked} positionEnabled={path !== null && visible} className="novera-access-dialog">
      <DialogHeader>
        <DialogTitle>{t('tools:toolApproval.title')}</DialogTitle>
        <DialogDescription>{t('common:access.folderNote')}</DialogDescription>
      </DialogHeader>
      <div className="flex items-center gap-2 rounded-lg border p-3 text-sm break-all"><FolderOpen className="size-5 shrink-0" />{path}</div>
      <fieldset className="space-y-2">
        <legend className="sr-only">{t('tools:toolApproval.title')}</legend>
        {(['read', 'ask', 'allow'] as const).map((value) => <label key={value} className="flex cursor-pointer items-start gap-3 rounded-xl border p-3 has-checked:border-cyan-400 has-checked:bg-cyan-400/5">
          <input type="radio" name="folder-access" value={value} checked={access === value} onChange={() => setAccess(value)} className="mt-1" />
          <span>{t(`common:access.${value}`)}</span>
        </label>)}
      </fieldset>
      <DialogFooter>
        <Button variant="ghost" onClick={onCancel}>{t('common:cancel')}</Button>
        <Button onClick={() => onConfirm(access)}>{t('common:workspace.open')}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
}
