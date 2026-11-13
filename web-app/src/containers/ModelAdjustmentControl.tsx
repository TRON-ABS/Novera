import { useEffect, useRef, useState } from 'react'
import { Save, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogDescription, DialogTitle,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { dashboardPanelLimit, singleDashboardPanel, useDashboardPanel } from '@/hooks/useDashboardPanel'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { KL_THRESHOLD } from '@/lib/model-adjustment-kl'
import { intlLocale } from '@/utils/intlLocale'


type WeightMetrics = { mean_kl: number | null; max_kl: number | null }
type WeightReport = { baseline?: WeightMetrics; candidate?: WeightMetrics; stage?: string; corpus?: string; referenceBytes?: number; referenceName?: string; recalibrating?: boolean; recalibrationFailed?: boolean; canStop?: boolean; stopping?: boolean; runId?: string; runs?: (WeightMetrics & { label: string; bytes: number; referenceBytes?: number; file?: string; corpus_max_kl?: number[] })[] }
const numericCell = 'min-w-0 wrap-anywhere px-2 py-1.5 text-right font-medium tabular-nums text-emerald-700 dark:text-emerald-300'
const compactLabel = 'block text-xs font-normal text-muted-foreground @min-[640px]:hidden'
const local = import.meta.env.DEV && import.meta.env.VITE_NOVERA_PRIVATE_NATIVE_CONVERSATION === 'true' &&
  typeof window !== 'undefined' && window.location.hostname === '127.0.0.1'

// Older benchmark reports store display labels in French.
function reportText(value: string) {
  return value
    .replace('Comparaison terminée', 'Comparison complete')
    .replace('Comparaison interrompue', 'Comparison interrupted')
    .replace('Comparaison arrêtée', 'Comparison stopped')
    .replace('Démarrage du recalibrage', 'Starting recalibration')
    .replace(/(Q\d) face au (Q\d)/g, '$1 vs $2')
    .replace(/(\d+) corpus/g, (_, count: string) => `${count} ${count === '1' ? 'corpus' : 'corpora'}`)
    .replace('Calcul de la référence Q8 sur le nouveau corpus', 'Computing the Q8 reference on the new corpus')
    .replace('Calcul de la référence Q8', 'Computing the Q8 reference')
    .replace('Référence', 'Reference')
    .replace('référence', 'reference')
    .replace('mixte précédent', 'previous mixed')
    .replace('mixte', 'mixed')
    .replace('portes et attention Q8', 'Q8 gates and attention')
    .replace(/montée FFN (\d+) à (\d+) en (Q\d)/g, 'FFN up projection, layers $1–$2 in $3')
    .replace('Nouveau corpus · documentation, exemples de code et exercices', 'New corpus · documentation, code examples, and exercises')
    .replace('Corpus indépendant · textes multilingues et problèmes pratiques', 'Independent corpus · multilingual texts and practical problems')
    .replace('Matrice d’importance sur corpus varié', 'Importance matrix on a varied corpus')
    .replace('Matrice d’importance du Q4', 'Q4 importance matrix')
    .replace('Matrice d’importance', 'Importance matrix')
    .replace('Vérification du meilleur Q4', 'Validating the best Q4')
    .replace('troisième corpus', 'third corpus')
    .replace('contrôle de mesure', 'measurement control')
    .replace('toutes les clés d’attention', 'all attention keys')
    .replace('clé d’attention', 'attention key')
    .replace('valeurs d’attention', 'attention values')
    .replace('réglage LFM3 transféré', 'transferred LFM3 configuration')
    .replace('dernière porte FFN', 'last FFN gate')
    .replace('attention et embeddings Q8', 'Q8 attention and embeddings')
    .replace(/FFN des couches (\d+) à (\d+)/g, 'FFN in layers $1–$2')
    .replace(/\bportes\b/g, 'gates')
    .replace(/\bporte\b/g, 'gate')
    .replace(/\bmontée\b/g, 'up projection')
    .replace(/\bdescente\b/g, 'down projection')
    .replace(/\bet\b/g, 'and')
    .replace(/\ben (Q\d)/g, 'in $1')
    .replace(/\bMixte\b/g, 'Mixed')
    .replace('Mesure', 'Measuring')
    .replace('Quantification', 'Quantizing')
    .replace('actuel', 'current')
    .replace('recalibré', 'recalibrated')
}

function weightReportInLocale(report: WeightReport | null, french: boolean, t: ReturnType<typeof useTranslation>['t']) {
  if (!report || french) return report
  const localize = (value: string): string => {
    const fixed: Record<string, string> = {
      'Comparaison terminée': 'Complete',
      'Comparaison interrompue': 'Interrupted',
      'Comparaison arrêtée': 'Stopped',
      'Démarrage du recalibrage': 'Starting',
      'Q4 mixte précédent · portes et attention Q8': 'PreviousMixed',
    }
    if (fixed[value]) return t(`ui:modelAdjustment${fixed[value]}`)
    const comparison = /^(Q\d) face au (Q\d) · (\d+) corpus$/.exec(value)
    if (comparison) {
      return t('ui:modelAdjustmentComparison', { variant: comparison[1], reference: comparison[2], total: comparison[3] })
    }
    const layers = /^Q4 mixte · montée FFN (\d+) à (\d+) en (Q\d)$/.exec(value)
    if (layers) return t('ui:modelAdjustmentLayers', { first: layers[1], last: layers[2], precision: layers[3] })
    const reference = /^(Q\d) · référence$/.exec(value)
    if (reference) return `${reference[1]} · ${t('ui:modelAdjustmentReference')}`
    const progress = /^(.*) · corpus (\d+(?:\/\d+)?)$/.exec(value)
    if (progress) return t('ui:modelAdjustmentCorpusProgress', { label: localize(progress[1]), index: progress[2] })
    return reportText(value)
  }
  return {
    ...report,
    stage: report.stage && localize(report.stage),
    corpus: report.corpus && localize(report.corpus),
    runs: report.runs?.map(run => ({ ...run, label: localize(run.label) })),
  }
}

export function useWeightRecalibration() {
  const [weightReport, setWeightReport] = useState<WeightReport | null>(null)
  const [startingWeights, setStartingWeights] = useState(false)
  const [requestingStop, setRequestingStop] = useState(false)
  const [weightError, setWeightError] = useState('')
  const running = startingWeights || Boolean(weightReport?.recalibrating)

  async function startWeightRecalibration(variant: string) {
    setStartingWeights(true)
    setWeightError('')
    try {
      const params = new URLSearchParams({ level: variant, reference: 'q8' })
      const response = await fetch('/__novera/quantization-start?' + params, { method: 'POST' })
      if (response.status === 409) throw new Error('Busy')
      if (!response.ok) throw new Error('StartError')
      setWeightReport({ stage: 'Démarrage du recalibrage', runs: [], recalibrating: true, canStop: true })
    } catch (cause) {
      setWeightError(cause instanceof Error && cause.message === 'Busy' ? 'Busy' : 'StartError')
    } finally {
      setStartingWeights(false)
    }
  }

  async function stopWeightRecalibration() {
    setRequestingStop(true)
    setWeightError('')
    try {
      const response = await fetch('/__novera/quantization-stop', { method: 'POST' })
      if (!response.ok && response.status !== 409) throw new Error('StopError')
      if (response.ok) {
        setWeightReport(current => current?.recalibrating ? { ...current, canStop: false, stopping: true } : current)
      }
    } catch {
      setWeightError('StopError')
    } finally {
      setRequestingStop(false)
    }
  }
  useEffect(() => {
    if (!local) return
    const request = new AbortController()
    const refresh = async () => {
      try {
        const response = await fetch('/__novera/quantization-report', { signal: request.signal })
        if (response.ok) {
          setWeightReport(await response.json() as WeightReport)
        }
      } catch { /* The local benchmark can run independently of this panel. */ }
    }
    void refresh()
    const timer = window.setInterval(() => void refresh(), 4000)
    return () => { window.clearInterval(timer); request.abort() }
  }, [])
  return { weightReport, weightError, running, requestingStop, startWeightRecalibration, stopWeightRecalibration }
}

export function ModelAdjustmentControl({ disabled, recalibration }: { disabled: boolean; recalibration: ReturnType<typeof useWeightRecalibration> }) {
  const { t, i18n } = useTranslation()
  const french = /^fr(?:-|$)/i.test(i18n.language)
  const locale = intlLocale(i18n.language)
  const formatKl = new Intl.NumberFormat(locale, { maximumFractionDigits: 8 })
  const formatGain = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 1, signDisplay: 'exceptZero' })
  const formatSizeGain = new Intl.NumberFormat(locale, { style: 'percent', maximumFractionDigits: 2 })
  const panelOpen = useDashboardPanel(state => state.panels.includes('model-adjustment'))
  const stackFull = useDashboardPanel(state => !singleDashboardPanel && state.panels.length >= dashboardPanelLimit)
  const openPanel = useDashboardPanel(state => state.openPanel)
  const closePanel = useDashboardPanel(state => state.closePanel)
  const trigger = useRef<HTMLButtonElement>(null)
  const [variant, setVariant] = useState('4')
  const { weightError, running, requestingStop, startWeightRecalibration, stopWeightRecalibration } = recalibration
  const weightReport = weightReportInLocale(recalibration.weightReport, french, t)
  const [savingModel, setSavingModel] = useState<string | null>(null)
  const [completedSaves, setCompletedSaves] = useState<ReadonlySet<string>>(() => new Set())
  const [savedModel, setSavedModel] = useState<{ name: string; folder: string; projector: string | null } | null>(null)
  const [saveFailed, setSaveFailed] = useState(false)
  const statusLabel = t(running ? 'ui:on' : 'ui:off')

  async function saveModel(run: string, file: string) {
    const saveKey = `${run}/${file}`
    setSavingModel(saveKey)
    setCompletedSaves(previous => {
      const next = new Set(previous)
      next.delete(saveKey)
      return next
    })
    setSavedModel(null)
    setSaveFailed(false)
    try {
      const response = await fetch(`/__novera/quantization-download?${new URLSearchParams({ run, file })}`, { method: 'POST' })
      if (!response.ok) throw new Error('SaveError')
      setSavedModel(await response.json())
      setCompletedSaves(previous => new Set(previous).add(saveKey))
    } catch {
      setSaveFailed(true)
    } finally {
      setSavingModel(null)
    }
  }
  useEffect(() => () => closePanel('model-adjustment'), [closePanel])

  function saveReport() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(weightReport, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'novera-model-adjustment.json'
    link.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <Dialog modal={false} open={panelOpen} onOpenChange={open => {
      if (open) openPanel('model-adjustment', trigger.current?.closest<HTMLElement>('[data-dashboard-composer]'))
      else closePanel('model-adjustment')
    }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={trigger} type="button" variant="ghost" size="icon-xs"
            className={`composer-tool shrink-0${running ? ' composer-tool-active' : ''}`}
            aria-label={`${t('ui:modelAdjustmentTitle')} · ${statusLabel}`} aria-expanded={panelOpen} aria-haspopup="dialog"
            data-state={running ? 'on' : 'off'} disabled={!panelOpen && (disabled || stackFull)}
            onClick={() => panelOpen ? closePanel('model-adjustment')
              : openPanel('model-adjustment', trigger.current?.closest<HTMLElement>('[data-dashboard-composer]'))}>
            <Zap className="size-4" aria-hidden="true" />
            <span className="composer-state" aria-hidden="true">{statusLabel}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('ui:modelAdjustmentTitle')} · {statusLabel}</TooltipContent>
      </Tooltip>
      <DialogContent docked positionEnabled={panelOpen}>
        <DialogTitle>{t('ui:modelAdjustmentTitle')}</DialogTitle>
        <DialogDescription className={local ? 'sr-only' : undefined}>
          {local ? t('ui:modelAdjustmentChoose') : t('ui:modelAdjustmentLocalOnly')}
        </DialogDescription>
        {local && <div className="grid items-start gap-3 sm:grid-cols-2">
          <label className="grid min-w-0 gap-1 text-sm">
            <span>{t('ui:modelAdjustmentReference')}{french ? ' : ' : ': '}<span className="text-muted-foreground">{t('ui:modelAdjustmentPrecision')}</span></span>
            <select className="h-10 w-full rounded border bg-background px-2" defaultValue="q8" disabled>
              <option value="q8">LFM3 Omni 2B Q8</option>
            </select>
          </label>
          <label className="grid min-w-0 gap-1 text-sm">
            <span>{t('ui:modelAdjustmentVariant')} <span className="text-muted-foreground">{t('ui:modelAdjustmentSmaller')}</span></span>
            <select className="h-10 w-full rounded border bg-background px-2" value={variant} disabled={running}
              onChange={event => setVariant(event.target.value)}>
              <option value="4">LFM3 Omni 2B Q4</option>
              <option value="3">LFM3 Omni 2B Q3</option>
              <option value="2">LFM3 Omni 2B Q2</option>
            </select>
          </label>
        </div>}
        {local && <section className="grid min-w-0 gap-1 rounded border p-3" aria-label={t('ui:modelAdjustmentWeights')}>
          <p>{t('ui:modelAdjustmentSubtitle')}</p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" className="h-auto min-w-0 flex-1 whitespace-normal py-2"
              disabled={running || disabled} onClick={() => void startWeightRecalibration(variant)}>
              {`${statusLabel} · ${running ? t('ui:modelAdjustmentProgress') : t('ui:modelAdjustmentStart', { variant })}`}
            </Button>
            {running && <Button type="button" variant="destructive" aria-label={t('ui:modelAdjustmentStopLabel')}
              disabled={!weightReport?.canStop || requestingStop || weightReport.stopping}
              onClick={() => void stopWeightRecalibration()}>
              {requestingStop || weightReport?.stopping ? t('ui:modelAdjustmentStopping') : t('ui:modelAdjustmentStop')}
            </Button>}
          </div>
          {weightError && <p role="alert">{t(`ui:modelAdjustment${weightError}`)}</p>}
          {saveFailed && <p role="alert">{t('ui:modelAdjustmentSaveError')}</p>}
          {(savingModel || savedModel) && <div role="status" className="grid gap-1 py-1">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span>{t('ui:modelAdjustmentSave')}</span>
              <strong className="tabular-nums">{formatSizeGain.format(savedModel ? 1 : 0)}</strong>
            </div>
            <progress className="h-2 w-full accent-emerald-500" max={100} value={savedModel ? 100 : 0}
              aria-label={t('ui:modelAdjustmentSave')} />
          </div>}
          {savedModel && <p role="status" className="wrap-anywhere">
            {t('ui:modelAdjustmentSaved', { name: savedModel.name, folder: savedModel.folder })}
            {savedModel.projector && ` · ${t('ui:modelAdjustmentProjector', { name: savedModel.projector })}`}
          </p>}
          {weightReport?.recalibrationFailed && <p role="alert">{t('ui:modelAdjustmentFailed')}</p>}
          {weightReport?.corpus && <p>{weightReport.corpus}</p>}
          {weightReport?.stage && <p aria-live="polite">{weightReport.stage} · {t('ui:modelAdjustmentTarget', { threshold: formatKl.format(KL_THRESHOLD) })}</p>}
          {weightReport?.runs ? (weightReport.runs.length > 0 && <div className="@container min-w-0 rounded-md border">
            <table role="table" className="block w-full text-sm @min-[640px]:table @min-[640px]:table-fixed" aria-label={t('ui:modelAdjustmentResults')}>
              <thead role="rowgroup" className="sr-only bg-muted text-muted-foreground @min-[640px]:not-sr-only">
                <tr>
                  <th scope="col" className="w-[21%] px-2 py-2 text-left">{t('ui:modelAdjustmentModel')}</th>
                  <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentSize')}</th>
                  <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentMean')}</th>
                  <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentMax')}</th>
                  <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentByCorpus')}</th>
                  {weightReport.referenceBytes && <th scope="col" className="px-2 py-2 text-right">
                    {t('ui:modelAdjustmentGain', { reference: weightReport.referenceName ?? 'Q8' })}
                  </th>}
                  <th scope="col" className="w-16 px-2 py-2 text-center"><span className="sr-only">{t('ui:modelAdjustmentSave')}</span></th>
                </tr>
              </thead>
              <tbody role="rowgroup" className="block divide-y @min-[640px]:table-row-group">
              {weightReport.runs.map((run, index, runs) => {
            const downloadable = Boolean(run.file?.match(/^(?:LFM3-(?:Q4_K_M|Q[234])|Qwen3\.5-Q4)-/))
            const saveKey = `${weightReport.runId}/${run.file}`
            const saveProgress = savingModel === saveKey ? 0 : completedSaves.has(saveKey) ? 1 : null
            const referenceBytes = run.referenceBytes ?? weightReport.referenceBytes
            const sizeGain = referenceBytes && (index > 0 || run.referenceBytes)
              ? formatSizeGain.format(1 - run.bytes / referenceBytes)
              : '—'
            const gain = (key: keyof WeightMetrics) => {
              if (weightReport.referenceBytes) return ''
              const start = runs[0][key]
              const value = run[key]
              return start !== null && start > 0 && value !== null ? ` (${formatGain.format(1 - value / start)})` : ''
            }
            return <tr role="row" key={run.label} className="grid grid-cols-2 hover:bg-muted/50 @min-[640px]:table-row">
              <th role="rowheader" scope="row" className="col-span-2 min-w-0 wrap-anywhere px-2 py-2 text-left font-medium">{run.label}
                {index > 0 && downloadable && run.max_kl !== null && run.max_kl <= KL_THRESHOLD &&
                  <span className="block text-xs text-emerald-700 dark:text-emerald-300">{t('ui:modelAdjustmentMet')}</span>}
              </th>
              <td role="cell" className={numericCell}><span className={compactLabel}>{t('ui:modelAdjustmentSize')}</span>{formatKl.format(Math.round(run.bytes / 1e6))}</td>
              <td role="cell" className={numericCell}><span className={compactLabel}>{t('ui:modelAdjustmentMean')}</span>{run.mean_kl === null ? '—' : formatKl.format(run.mean_kl)}{index > 0 && gain('mean_kl')}</td>
              <td role="cell" className={numericCell}><span className={compactLabel}>{t('ui:modelAdjustmentMax')}</span>{run.max_kl === null ? '—' : formatKl.format(run.max_kl)}{index > 0 && gain('max_kl')}</td>
              <td role="cell" className={numericCell}>
                <span className={compactLabel}>{t('ui:modelAdjustmentByCorpus')}</span>
                {run.corpus_max_kl?.map((value, corpusIndex) => (
                  <span key={corpusIndex} className="block">
                    <span className="text-muted-foreground">{corpusIndex + 1} · </span>{formatKl.format(value)}
                  </span>
                )) ?? '—'}
              </td>
              {weightReport.referenceBytes && <td role="cell" className={numericCell}><span className={compactLabel}>{t('ui:modelAdjustmentGain', { reference: weightReport.referenceName ?? 'Q8' })}</span>{sizeGain}</td>}
              <td role="cell" className="px-2 py-1.5 text-right @min-[640px]:text-center">
              {weightReport.runId && downloadable && run.file && <Button size="icon-xs" variant="outline" type="button"
                disabled={savingModel !== null} aria-label={t('ui:modelAdjustmentSaveModel', { model: run.label })} title={t('ui:modelAdjustmentSaveFolder')}
                onClick={() => { if (weightReport.runId && run.file) void saveModel(weightReport.runId, run.file) }}>
                <Save aria-hidden="true" className="size-4" />
              </Button>}
              {saveProgress !== null && <span role="status" className="block text-xs tabular-nums text-emerald-700 dark:text-emerald-300">
                {formatSizeGain.format(saveProgress)}
              </span>}
              </td>
            </tr>
          })}
              </tbody>
            </table>
          </div>) : (['baseline', 'candidate'] as const).map(key => {
            const metrics = weightReport?.[key]
            return <p key={key}>{key === 'baseline' ? t('ui:modelAdjustmentBaseline') : t('ui:modelAdjustmentCandidate')} · {metrics
              ? `${t('ui:modelAdjustmentMean')} ${metrics.mean_kl === null ? t('ui:modelAdjustmentUnavailable') : formatKl.format(metrics.mean_kl)} · ${t('ui:modelAdjustmentMax')} ${metrics.max_kl === null ? t('ui:modelAdjustmentUnavailable') : formatKl.format(metrics.max_kl)} nat`
              : t('ui:modelAdjustmentWaiting')}</p>
          })}
          {weightReport?.runs && !weightReport.referenceBytes && <p>{t('ui:modelAdjustmentPercentages')}</p>}
          <Button type="button" variant="outline" disabled={running || !weightReport?.runs?.length} onClick={saveReport}>
            {t('ui:modelAdjustmentSaveReport')}
          </Button>
        </section>}
      </DialogContent>
    </Dialog>
  )
}
