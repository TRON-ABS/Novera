import { useMemo, useState } from 'react'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useHardware } from '@/hooks/useHardware'
import { adviseHub, type HubPriority } from '@/modules/engines/hub-advisor'
import { diagnoseHubModel } from '@/modules/engines/hub-catalog'
import type { CatalogModel } from '@/services/models/types'
import { hubWeight, hubKey, hubFormatBytes } from '@/lib/hubDiscovery'
import { HubHardwareDiagnostic } from './HubHardwareDiagnostic'

export function HubAdvisor({ models }: { models: CatalogModel[] }) {
  const { t, i18n } = useTranslation()
  const hardware = useHardware(state => state.hardwareData)
  const usage = useHardware(state => state.systemUsage)
  const [priority, setPriority] = useState<HubPriority>('ready')
  const advice = useMemo(() => {
    const hardwareProfile = {
      platform: IS_WINDOWS ? 'windows' : IS_MACOS ? 'macos' : IS_LINUX ? 'linux' : hardware.os_type || 'web',
      ramBytes: hardware.total_memory > 0 ? hardware.total_memory * 1024 ** 2 : null,
      availableRamBytes: usage?.total_memory > 0 ? Math.max(0, usage.total_memory - usage.used_memory) * 1024 ** 2 : null,
      gpus: hardware.gpus.filter(gpu => gpu.activated !== false).map(gpu => {
        const live = usage?.gpus.find(item => item.uuid === gpu.uuid)
        return { name: gpu.name, vendor: gpu.vendor, totalBytes: gpu.total_memory * 1024 ** 2,
          ...(live ? { availableBytes: Math.max(0, live.total_memory - live.used_memory) * 1024 ** 2 } : {}) }
      }),
    }
    return adviseHub(models.map(model => ({ id: hubKey(model), updatedAt: model.updated_at ?? model.created_at,
      languages: model.languages, preferred: model.hub?.recommended, diagnosis: diagnoseHubModel(model, hardwareProfile, { weightsBytes: hubWeight(model) }),
    })), priority, i18n.language)
  }, [models, hardware, usage, priority, i18n.language])
  return <section className="rounded-xl border bg-card p-4 space-y-3" aria-label={t('hub:catalog.advisorTitle')}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="text-sm font-semibold">✦ {t('hub:catalog.advisorTitle')}</h2>
      <label className="flex items-center gap-2 text-xs text-muted-foreground">{t('hub:catalog.priority')}
        <select value={priority} onChange={event => setPriority(event.target.value as HubPriority)} className="rounded border bg-background p-1.5 text-foreground">
          <option value="ready">{t('hub:catalog.goalReady')}</option><option value="compact">{t('hub:discovery.smallest')}</option><option value="recent">{t('hub:sortNewest')}</option>
        </select>
      </label>
    </div>
    <p className="text-[11px] text-muted-foreground">{t('hub:catalog.advisorNote')}</p>
    {hardware.total_memory > 0 && <p className="text-[11px] text-muted-foreground">{hardware.cpu.name} · RAM {hubFormatBytes(hardware.total_memory * 1024 ** 2, i18n.language)}{hardware.gpus[0] ? ` · ${hardware.gpus[0].name}` : ''}</p>}
    {advice.picks.length ? <div className="grid gap-2 lg:grid-cols-3">{advice.picks.map(pick => {
      const model = models.find(item => hubKey(item) === pick.id)!
      return <article key={pick.id} className="min-w-0 rounded-lg border p-3">
        <h3 className="break-words text-xs font-medium">{model.display_name ?? model.model_name}</h3>
        <p className="mt-1 text-xs text-muted-foreground">{hubFormatBytes(hubWeight(model), i18n.language)}</p>
        <ul className="mt-2 list-disc space-y-1 pl-3 text-[11px] text-muted-foreground">{pick.reasons.map(reason => <li key={reason}>{t(`hub:catalog.${reason}`)}</li>)}</ul>
        <HubHardwareDiagnostic model={model} />
      </article>
    })}</div> : <p className="text-xs text-muted-foreground">{t('hub:catalog.advisorEmpty')}</p>}
    {advice.tips.length > 0 && <ul className="space-y-1 rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">{advice.tips.map(tip => <li key={tip}>• {t(`hub:catalog.${tip}`)}</li>)}</ul>}
  </section>
}
