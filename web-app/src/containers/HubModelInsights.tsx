import { useEffect, useRef, useState } from 'react'
import type { CatalogModel } from '@/services/models/types'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { intlLocale } from '@/utils/intlLocale'
import { hubWeight, hubKey, hubFormatBytes } from '@/lib/hubDiscovery'
import { useHardware } from '@/hooks/useHardware'
import { useAppState } from '@/hooks/useAppState'
import { useCoworkRun } from '@/hooks/useCoworkRun'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useModelProvider } from '@/hooks/useModelProvider'
import { measureHubModel, type HubMeasurement } from '@/lib/hubBenchmark'
import { Button } from '@/components/ui/button'
import { HubHardwareDiagnostic, useHubDiagnosis } from './HubHardwareDiagnostic'
import { modelEngine } from '@/modules/engines/hub-catalog'

export function HubModelFacts({ model }: { model: CatalogModel }) {
  const { t, i18n } = useTranslation()
  const diagnosis = useHubDiagnosis(model)
  const numbers = new Intl.NumberFormat(intlLocale(i18n.language), { maximumFractionDigits: 2 })
  const bytes = (value: number | null) => hubFormatBytes(value, i18n.language)
  return <div className="mt-3 space-y-2 text-xs">
    <div className="flex flex-wrap gap-x-4 gap-y-1">
      {model.hub && <span>{t('hub:discovery.parameters')}: {numbers.format(model.hub.parametersB)} B</span>}
      <span>{t('hub:discovery.weight')}: {bytes(hubWeight(model))}</span>
      {modelEngine(model) !== 'future' && <span>{t('hub:discovery.memory')}: {bytes(diagnosis.requiredBytes)}</span>}
    </div>
    <p className="text-muted-foreground">{t('hub:discovery.estimated')}</p>
    <HubHardwareDiagnostic model={model} />
    {model.hub ? <>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        <a className="underline" href={model.hub.source} target="_blank" rel="noopener noreferrer">{t('hub:discovery.benchmarks')}</a>
        {model.hub.benchmarks.map(b => <span key={b.name}>{b.name}: {numbers.format(b.score)} / 100 · {t(`hub:discovery.${b.mode}`)}</span>)}
        <time dateTime={model.hub.verifiedAt}>{new Intl.DateTimeFormat(intlLocale(i18n.language), { dateStyle: 'medium', timeZone: 'UTC' }).format(new Date(`${model.hub.verifiedAt}T12:00:00Z`))}</time>
      </div>
      <p className="text-muted-foreground">{t('hub:discovery.benchmarkNote')}</p>
    </> : <p className="text-muted-foreground">{t('hub:discovery.unavailable')}</p>}
  </div>
}

export function HubComparison({ models, clear }: { models: CatalogModel[]; clear: () => void }) {
  const { t, i18n } = useTranslation()
  const hub = useServiceHub()
  const controller = useRef<AbortController | null>(null)
  const [running, setRunning] = useState<string | null>(null)
  const [measurements, setMeasurements] = useState<Record<string, HubMeasurement & { modelId: string }>>({})
  const [error, setError] = useState('')
  const nums = new Intl.NumberFormat(intlLocale(i18n.language), { maximumFractionDigits: 2 })
  useEffect(() => () => controller.current?.abort(), [])
  useEffect(() => { if (running && !models.some(m => hubKey(m) === running)) controller.current?.abort() }, [models, running])
  const busy = useAppState(s => !!s.streamingContent || !!s.loadingModel || Object.keys(s.busyThreads).length > 0 || Object.keys(s.streamingContents).length > 0 || Object.values(s.loadingModels).some(Boolean))
  const coworkBusy = useCoworkRun(s => Object.keys(s.runId).length > 0)
  useEffect(() => { if (busy || coworkBusy) controller.current?.abort() }, [busy, coworkBusy])
  async function test(model: CatalogModel) {
    if (controller.current || busy || coworkBusy || model.is_mlx) return
    const ac = new AbortController(); controller.current = ac
    setRunning(hubKey(model)); setError('')
    const timeout = setTimeout(() => ac.abort(), 60000)
    try {
      const provider = useModelProvider.getState().getProviderByName('llamacpp')
      const active = await hub.models().getActiveModels('llamacpp')
      ac.signal.throwIfAborted()
      const ids = new Set(model.quants?.flatMap(q => [q.model_id, `${model.developer}/${q.model_id}`]) ?? [])
      const id = active.find(id => ids.has(id) && provider?.models.some(m => m.id === id))
      if (!id || !provider) { setError("testHint"); return }
      const { ModelFactory } = await import('@/lib/model-factory')
      const engine = await ModelFactory.createModel(id, provider, { chat_template_kwargs: { enable_thinking: false } })
      ac.signal.throwIfAborted()
      const result = await measureHubModel(engine, ac.signal)
      const used = useHardware.getState().systemUsage.used_memory
      if (used > 0) result.systemMemoryBytes = used * 1024 ** 2
      setMeasurements(prev => ({ ...prev, [hubKey(model)]: { ...result, modelId: id } }))
    } catch {
      if (!ac.signal.aborted) setError('failed')
    } finally {
      clearTimeout(timeout); controller.current = null; setRunning(null)
    }
  }
  if (!models.length) return null
  return <section className="border rounded-lg p-3 space-y-3" aria-label={t('hub:discovery.compare')}>
    <div className="flex justify-between gap-2"><h2 className="font-medium">{t('hub:discovery.compare')} ({models.length}/3)</h2><Button size="sm" variant="outline" disabled={!!running} onClick={clear}>{t('common:cancel')}</Button></div>
    <p className="text-xs text-muted-foreground">{t('hub:discovery.testHint')}</p>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">{models.map(m => {
      const key = hubKey(m), result = measurements[key]
      return <article className="border rounded p-3 min-w-0" key={key}>
        <h3 className="font-medium break-words">{m.display_name ?? m.model_name}</h3>
        <HubModelFacts model={m} />
        <Button className="mt-3" size="sm" disabled={!!running || busy || coworkBusy || !!m.is_mlx} onClick={() => void test(m)}>{running === key ? t('common:loading') : t('hub:discovery.test')}</Button>
        {running === key && <Button size="sm" variant="outline" onClick={() => controller.current?.abort()}>{t('common:cancel')}</Button>}
        {result && <dl className="text-xs mt-2 space-y-1">
          <div className="break-all">{result.modelId}</div>
          <div>{t('hub:discovery.firstToken')}: {result.firstTokenMs === null ? '—' : `${nums.format(result.firstTokenMs)} ms`}</div>
          <div>{t('hub:discovery.throughput')}: {result.tokensPerSecond === null ? '—' : `${nums.format(result.tokensPerSecond)} ${t('chat:messageStats.perSecond')}`}</div>
          <div>{t('chat:messageStats.tokens')}: {result.outputTokens === null ? '—' : nums.format(result.outputTokens)}</div>
          <div>{t('hub:discovery.systemMemory')}: {hubFormatBytes(result.systemMemoryBytes, i18n.language)}</div>
          <time dateTime={result.measuredAt}>{new Intl.DateTimeFormat(intlLocale(i18n.language), { dateStyle: 'short', timeStyle: 'short' }).format(new Date(result.measuredAt))}</time>
        </dl>}
      </article>
    })}</div>
    {(busy || coworkBusy) && <p role="status" className="text-xs">{t('hub:discovery.busy')}</p>}
    {error && <p role="alert" className="text-xs">{t(`hub:discovery.${error}`)}</p>}
  </section>
}
