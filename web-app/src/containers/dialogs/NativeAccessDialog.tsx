import { useNativeAccess } from '@/hooks/useNativeAccess'
import { ToolApprovalDialog } from './ToolApprovalDialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
import { useThreads } from '@/hooks/useThreads'

export function NativeAccessDialog() {
  const { t } = useTranslation()
  const request = useNativeAccess((s) => s.pending[0])
  if (!request) return null
  const ownerTitle = useCoworkSessions.getState().sessions.find((s) => s.id === request.owner)?.title
    ?? useThreads.getState().threads[request.owner]?.title
    ?? t('common:newChat')
  return (
    <ToolApprovalDialog
      key={request.id}
      open
      focusDeny
      alwaysLabel={t('tools:toolApproval.allowInThread')}
      toolName={request.kind === 'shell' ? t('common:shell') : t('common:workspace.attach')}
      description={<><strong>{request.kind === 'shell' ? t('common:shell') : t('common:workspace.attach')} · {ownerTitle}</strong><br />{t('tools:toolApproval.needsApproval')}<br />{t('tools:toolApproval.allowInThread')}</>}
      onDecision={(decision) => useNativeAccess.getState().resolve(request.id, decision)}
    >
      <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-all rounded-lg border bg-muted p-3 text-xs select-text">{request.details}</pre>
    </ToolApprovalDialog>
  )
}
