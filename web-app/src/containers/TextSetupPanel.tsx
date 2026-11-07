import { useNavigate } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { route } from '@/constants/routes'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useThreads } from '@/hooks/useThreads'
import { NOVERA_RECOMMENDED_MODEL, NOVERA_TEXT_ALTERNATIVE, noveraRecommendedContextFor } from '@/lib/noveraRecommendedModel'
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
  const recommendations = [NOVERA_RECOMMENDED_MODEL, NOVERA_TEXT_ALTERNATIVE]
  const context = noveraRecommendedContextFor(automatic.mobile)
  const [error, setError] = useState<string>()
  const provider = useModelProvider((s) => s.providers.find((p) => p.provider === 'llamacpp'))
  const model = useThreads((s) => s.threads[scope]?.model)
  const selected=useModelProvider((s)=>s.selectedModel)
  const active=provider?.models.find((m)=>m.id===(model?.id??selected?.id))
  const globalDownload=useCreationInstall((s)=>s.job?.plan.variant==='all-recommended'&&s.job.running)
  return <section className="space-y-4">
    <p className="text-sm text-muted-foreground">{t('hub:catalog.advisorNote')}</p>
    <p className="text-sm">{t('ui:modelDefault')} · {NOVERA_RECOMMENDED_MODEL.display_name}</p>
    <p className="text-xs text-muted-foreground">{t('hub:catalog.context')}: {context.toLocaleString()} · {t('hub:catalog.tipLimited')}</p>
    {!automatic.known && <p role="status" className="text-xs">{t('hub:catalog.hardwareUnknown')}</p>}
    {automatic.known && automatic.light && !automatic.textFits && <p role="status" className="text-xs">{t('hub:catalog.insufficient')} · {t('hub:catalog.tipLimited')}</p>}
    {!automatic.engineReady && <p className="text-xs">{t('hub:catalog.engine')}: LFM3-Omni · llama.cpp ≥ b11960 · {t('hub:catalog.check')}</p>}
    {recommendations.map((recommended,index) => <div key={recommended.model_name} data-testid={index===0?'default-omni-model':'alternative-text-model'} className="rounded-lg border p-3 space-y-3">
      <h3 dir="auto" className="text-sm font-medium">{recommended.developer} · {recommended.display_name} · {recommended.quants![0].file_size}</h3>
      <p className="text-xs text-muted-foreground">{t(index===0?'chat:creation.setupOmniNote':'chat:creation.setupTextNote',{size:index===0?'1.39 GB':'6.18 GB',projector:'mmproj',defaultModel:'LFM3-Omni'})}</p>
      <p dir="ltr" className="text-xs break-words">{recommended.quants![0].model_id}.gguf</p>
      {recommended.mmproj_models?.map(file => <p key={file.path} dir="ltr" className="text-xs break-words">{file.model_id}.gguf · {file.file_size}</p>)}
      <HubHardwareDiagnostic model={recommended} context={context} />
      {globalDownload?<p role="status" className="text-xs">{t('chat:creationInstall.background')}</p>:<DownloadButtonPlaceholder model={recommended} context={context} handleUseModel={(id) => {
        setError(undefined)
        void (async () => {
            await service.models().updateModelSettings(id, { ctx_len: context })
            const store = useModelProvider.getState()
            const local = store.providers.find(p => p.provider === 'llamacpp')
            if (local) store.updateProvider('llamacpp', { models: local.models.map(model => {
              if (model.id !== id) return model
              const setting = model.settings?.ctx_len ?? modelSettings.ctx_len
              return { ...model, settings: { ...model.settings, ctx_len: { ...setting,
                controller_props: { ...setting.controller_props, value: context } } } }
            }) })
          onNavigate()
          await navigate({ to: route.home, search: { threadModel: { id, provider: 'llamacpp' } } })
        })().catch(() => setError(recommended.model_name))
      }} />}
      {error===recommended.model_name && <p role="alert">{t('chat:creationInstall.error')}</p>}
    </div>)}
    <DropdownModelProvider allowMedia={false} model={model} onModelChange={(choice) => {
      if (useThreads.getState().threads[scope]) useThreads.getState().updateThread(scope, { model: choice })
    }} />
    {provider&&active&&<div className="flex items-center gap-2 text-sm"><span>{active.displayName??active.name??active.id}</span><ModelSetting provider={provider} model={active}/></div>}
    {provider && <ImportLlamacppModelDialog provider={provider}
      trigger={<Button variant="outline">{t('common:browse')}</Button>} />}
  </section>
}
