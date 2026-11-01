import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { route } from '@/constants/routes'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useThreads } from '@/hooks/useThreads'
import { LIGHT_OMNI_MODEL, LIGHT_TEXT_MODEL, noveraRecommendedModelFor } from '@/lib/noveraRecommendedModel'
import { useAutoConfiguration } from '@/hooks/useAutoConfiguration'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useState } from 'react'
import DropdownModelProvider from './DropdownModelProvider'
import { DownloadButtonPlaceholder } from './DownloadButton'
import { HubHardwareDiagnostic } from './HubHardwareDiagnostic'
import { ImportLlamacppModelDialog } from './dialogs/ImportLlamacppModelDialog'
import { ModelSetting } from './ModelSetting'
import { useCreationInstall } from '@/hooks/useCreationInstall'
import { modelSettings } from '@/lib/predefined'

export function TextSetupPanel({ scope, onNavigate }: { scope: string; onNavigate: () => void }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const service = useServiceHub()
  const automatic = useAutoConfiguration()
  const recommended = automatic.light ? automatic.omni ? LIGHT_OMNI_MODEL : LIGHT_TEXT_MODEL : noveraRecommendedModelFor(false)
  const [error, setError] = useState(false)
  const provider = useModelProvider((s) => s.providers.find((p) => p.provider === 'llamacpp'))
  const model = useThreads((s) => s.threads[scope]?.model)
  const selected=useModelProvider((s)=>s.selectedModel)
  const active=provider?.models.find((m)=>m.id===(model?.id??selected?.id))
  const globalDownload=useCreationInstall((s)=>s.job?.plan.variant==='all-recommended'&&s.job.running)
  return <section className="space-y-4">
    <p className="text-sm text-muted-foreground">{t('hub:catalog.advisorNote')}</p>
    <p className="text-sm">{t('chat:creation.auto')} · {t(automatic.light ? 'hub:catalog.reasonSmall' : 'chat:creation.setupTextNote')}</p>
    {automatic.light && <p className="text-xs text-muted-foreground">{t('hub:catalog.tipLimited')} · {t('hub:catalog.context')}: {automatic.context}</p>}
    {!automatic.known && <p role="status" className="text-xs">{t('hub:catalog.hardwareUnknown')}</p>}
    {automatic.known && automatic.light && !automatic.textFits && <p role="status" className="text-xs">{t('hub:catalog.insufficient')} · {t('hub:catalog.tipLimited')}</p>}
    {automatic.light && !automatic.engineReady && <p className="text-xs">{t('hub:catalog.engine')}: LFM3-Omni · llama.cpp ≥ b11960 · {t('hub:catalog.check')}</p>}
    <div className="rounded-lg border p-3 space-y-3">
      <h3 className="text-sm font-medium">{recommended.display_name} · {recommended.quants![0].file_size}</h3>
      {recommended.mmproj_models?.map(file => <p key={file.path} className="text-xs break-words">{file.model_id} · {file.file_size}</p>)}
      <HubHardwareDiagnostic model={recommended} context={automatic.context} />
      {globalDownload?<p role="status" className="text-xs">{t('chat:creationInstall.background')}</p>:<DownloadButtonPlaceholder model={recommended} context={automatic.context} handleUseModel={(id) => {
        setError(false)
        void (async () => {
          if (automatic.light) {
            await service.models().updateModelSettings(id, { ctx_len: automatic.context })
            const store = useModelProvider.getState()
            const local = store.providers.find(p => p.provider === 'llamacpp')
            if (local) store.updateProvider('llamacpp', { models: local.models.map(model => {
              if (model.id !== id) return model
              const context = model.settings?.ctx_len ?? modelSettings.ctx_len
              return { ...model, settings: { ...model.settings, ctx_len: { ...context,
                controller_props: { ...context.controller_props, value: automatic.context } } } }
            }) })
          }
          onNavigate()
          await navigate({ to: route.home, search: { threadModel: { id, provider: 'llamacpp' } } })
        })().catch(() => setError(true))
      }} />}
      {error && <p role="alert">{t('chat:creationInstall.error')}</p>}
    </div>
    <DropdownModelProvider allowMedia={false} model={model} onModelChange={(choice) => {
      if (useThreads.getState().threads[scope]) useThreads.getState().updateThread(scope, { model: choice })
    }} />
    {provider&&active&&<div className="flex items-center gap-2 text-sm"><span>{active.displayName??active.name??active.id}</span><ModelSetting provider={provider} model={active}/></div>}
    {provider && <ImportLlamacppModelDialog provider={provider}
      trigger={<Button variant="outline">{t('common:browse')}</Button>} />}
  </section>
}
