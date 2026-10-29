import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { route } from '@/constants/routes'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useThreads } from '@/hooks/useThreads'
import { noveraRecommendedModelFor } from '@/lib/noveraRecommendedModel'
import DropdownModelProvider from './DropdownModelProvider'
import { DownloadButtonPlaceholder } from './DownloadButton'
import { HubHardwareDiagnostic } from './HubHardwareDiagnostic'
import { ImportLlamacppModelDialog } from './dialogs/ImportLlamacppModelDialog'
import { ModelSetting } from './ModelSetting'
import { useCreationInstall } from '@/hooks/useCreationInstall'

const recommended = noveraRecommendedModelFor(false)

export function TextSetupPanel({ scope, onNavigate }: { scope: string; onNavigate: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const provider = useModelProvider((s) => s.providers.find((p) => p.provider === 'llamacpp'))
  const model = useThreads((s) => s.threads[scope]?.model)
  const selected=useModelProvider((s)=>s.selectedModel)
  const active=provider?.models.find((m)=>m.id===(model?.id??selected?.id))
  const globalDownload=useCreationInstall((s)=>s.job?.plan.variant==='all-recommended'&&s.job.running)
  return <section className="space-y-4">
    <p className="text-sm text-muted-foreground">{t('hub:catalog.advisorNote')}</p>
    <div className="rounded-lg border p-3 space-y-3">
      <h3 className="text-sm font-medium">{recommended.display_name} · {recommended.quants![0].file_size}</h3>
      <HubHardwareDiagnostic model={recommended} />
      {globalDownload?<p role="status" className="text-xs">{t('chat:creationInstall.background')}</p>:<DownloadButtonPlaceholder model={recommended} handleUseModel={(id) => {
        onNavigate()
        void navigate({ to: route.home, search: { threadModel: { id, provider: 'llamacpp' } } })
      }} />}
    </div>
    <DropdownModelProvider allowMedia={false} model={model} onModelChange={(choice) => {
      if (useThreads.getState().threads[scope]) useThreads.getState().updateThread(scope, { model: choice })
    }} />
    {provider&&active&&<div className="flex items-center gap-2 text-sm"><span>{active.displayName??active.name??active.id}</span><ModelSetting provider={provider} model={active}/></div>}
    {provider && <ImportLlamacppModelDialog provider={provider}
      trigger={<Button variant="outline">{t('common:browse')}</Button>} />}
  </section>
}
