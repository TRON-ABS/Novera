import { useEffect, useId, useState } from 'react'
import { ChevronDown, Gauge, ListChecks, X } from 'lucide-react'
import { AutoTuneContribution } from './AutoTuneContribution'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { cn, getProviderTitle } from '@/lib/utils'
import { browserModelFolderPickerAvailable, chooseBrowserModelFolder } from '@/services/browser-preview/model-folder'
import { autoTuneTasks, refreshAutoTuneModels, selectAllAutoTuneModels, selectAutoTuneModel, type AutoTuneTask, type CalibrationTrial, type getAutoTuneProgress } from '@/services/creation/auto-tune'

export type ConfirmedGain = {
  task: AutoTuneTask
  model: string
  metric: 'load' | 'rate' | 'duration'
  percent: number
  recordedAt?: number
  profile?: Record<string, unknown>
}

type Props = {
  browser?: boolean
  unavailable?: boolean
  enabled: boolean
  changing: boolean
  gains: ConfirmedGain[]
  progress: ReturnType<typeof getAutoTuneProgress>
  onToggle: () => void
  onClose: () => void
}

const fileName = (path: string) => path.split(/[\\/]/).at(-1) || path

export function AutoTuneDashboard({ browser, unavailable, enabled, changing, gains, progress, onToggle, onClose }: Props) {
  const { t, i18n } = useTranslation()
  const id = useId()
  const [collapsed, setCollapsed] = useState(false)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  async function importModels() {
    setImporting(true)
    setImportError('')
    try {
      await chooseBrowserModelFolder()
      await refreshAutoTuneModels()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setImportError(String(error))
    } finally {
      setImporting(false)
    }
  }
  const { active, remaining, total, completed, browserComplete, standby, pass, failed, startedAt, taskCounts, lastError, models, excluded } = progress
  const deselected = new Set(excluded)
  const selectedCount = models.filter(model => !deselected.has(model.id)).length
  const history = new Map<string, ConfirmedGain[]>()
  for (const gain of gains) {
    const key = JSON.stringify([gain.task, gain.model])
    const group = history.get(key)
    if (group) group.push(gain)
    else history.set(key, [gain])
  }
  const dateTime = new Intl.DateTimeFormat(i18n.language, { dateStyle: 'short', timeStyle: 'short' })
  const report = active?.report
  const trials = report?.trials ?? []
  const trial = trials.at(-1)
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    if (!trial?.pending) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [trial?.pending, trial?.startedAt])
  const elapsed = trial?.pending && trial.startedAt ? Math.max(0, Math.floor((now - trial.startedAt) / 1000)) : null
  const clock = (seconds: number) => Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0')
  const comparisons = [...(report?.comparisons ?? []), ...(report?.confirmation ?? []), ...(report?.pairs ?? [])]
  const format = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 2 })
  const percent = new Intl.NumberFormat(i18n.language, { style: 'percent', signDisplay: 'always', maximumFractionDigits: 1 })
  const started = startedAt ? new Intl.DateTimeFormat(i18n.language, { hour: '2-digit', minute: '2-digit' }).format(startedAt) : null
  const categories = { text: t('chat:creation.text'), image: t('chat:creation.image'), music: t('chat:creation.music'), video: t('chat:creation.video') }
  const componentLabels = { generator: t('chat:creation.ggufImageModel'), encoder: t('chat:creation.ggufTextEncoder'),
    vae: t('chat:creation.ggufVae'), planner: t('chat:creation.musicPlanner'), upscaler: t('chat:creation.upscaleModel') }
  const metrics = { load: t('ui:autoTuneGainLoad'), rate: t('ui:autoTuneGainRate'), duration: t('ui:autoTuneGainDuration') }
  const checkLabel = (value: string) => value.replace(/\bAuto\b/g, () => t('chat:creation.auto'))
    .replace(/\bOFF\b/g, () => t('ui:off')).replace(/\bsteps\b/g, () => t('chat:creation.steps'))
  const phases = {
    quick: t('ui:autoTuneQuick'), screening: t('ui:autoTuneScreening'),
    profile: t('ui:autoTuneScreening'), confirmation: t('ui:autoTuneConfirmation'),
  }
  const phase = trial?.phase ? phases[trial.phase as keyof typeof phases] : undefined
  const work = trial?.pending ? trial.work : undefined
  const workLabel = work?.stage === 'decoding' ? 'VAE' : work?.stage === 'encoding' ? t('ui:export')
    : work?.stage === 'generating' ? t('chat:creation.generating') : t('chat:creation.loading')
  const rateUnit = report?.embedding ? t('ui:autoTuneVectorsPerSecond') : t('ui:autoTuneTokensPerSecond')
  const measurement = (sample: CalibrationTrial) => [
    typeof sample.loadSeconds === 'number' ? metrics.load + ' ' + format.format(sample.loadSeconds) + ' s' : null,
    typeof sample.rate === 'number' ? format.format(sample.rate) + ' ' + rateUnit : null,
    typeof sample.seconds === 'number' ? format.format(sample.seconds) + ' s' : null,
  ].filter(Boolean).join(' · ')
  const variant = (sample: CalibrationTrial) => {
    if (!sample.profile) return typeof sample.candidate === 'boolean'
      ? [t(sample.candidate ? 'ui:autoTuneCandidate' : 'ui:autoTuneReference'), sample.label].filter(Boolean).join(' · ') : '—'
    const threads = sample.profile.threads === null ? t('chat:creation.auto') : String(sample.profile.threads)
    const load = sample.profile.load_mode === 'none' ? t('ui:autoTuneBuffered') : t('chat:creation.auto')
    return threads + ' ' + t('ui:autoTuneThreads') + ' · ' + load
  }
  const state = browserComplete ? t('ui:autoTuneBrowserComplete') : !enabled ? t('ui:autoTunePaused') : active
    ? categories[active.task] + ' · ' + fileName(active.model)
    : standby ? t('ui:autoTuneWaiting') : remaining === 0 ? t(total > 0 ? 'ui:autoTuneBetweenPasses' : 'ui:autoTuneNoSelection') : t('ui:autoTuneWaiting')
  const lastFailure = report?.error ?? trial?.error ?? lastError

  return (
    <section data-auto-tune-dashboard aria-labelledby={id} className="novera-dashboard-window mb-2 overflow-hidden border">
      <div className="flex flex-wrap items-center gap-2 border-b border-border bg-card/40 px-4 py-2">
        <button type="button" aria-expanded={!collapsed} onClick={() => setCollapsed(value => !value)}
          className="inline-flex min-w-0 items-center gap-2 rounded-md text-sm font-semibold focus-visible:outline-2 focus-visible:outline-ring">
          <Gauge size={16} className="shrink-0 text-cyan-600 dark:text-cyan-400" aria-hidden="true" />
          <span id={id}>{t('ui:autoTuneDashboard')}</span>
          <ChevronDown size={14} className={collapsed ? '-rotate-90' : ''} aria-hidden="true" />
        </button>
        <span className="min-w-0 flex-1 truncate text-xs text-muted-foreground" title={state} aria-live="polite">{state}</span>
        <div className="auto-tune-dashboard-actions ml-auto flex shrink-0 items-center gap-2">
          <Button type="button" size="icon-xs" variant="ghost" role="switch"
            className={cn('composer-tool', enabled && 'composer-tool-active')}
            data-state={enabled ? 'on' : 'off'} aria-label="Auto Tune" aria-checked={enabled}
            disabled={changing || unavailable} onClick={onToggle}>
            <Gauge className="size-4" strokeWidth={1.8} aria-hidden="true" />
            <span className="composer-state" aria-hidden="true">{enabled ? t('ui:on') : t('ui:off')}</span>
          </Button>
          <Button type="button" size="icon-xs" variant="ghost" aria-label={t('ui:autoTuneCloseDashboard')} title={t('ui:autoTuneCloseDashboard')} disabled={changing} onClick={onClose}>
            <X size={15} aria-hidden="true" />
          </Button>
        </div>
      </div>

      {!collapsed && (
        <div className="max-h-[min(56vh,40rem)] space-y-3 overflow-y-auto overscroll-contain px-3 py-3 text-xs">
          <section aria-labelledby={id + '-models'} className="min-w-0 rounded-xl border border-border bg-card/60 p-3">
            <h3 id={id + '-models'} className="mb-2 flex flex-wrap items-center gap-2 text-sm font-semibold">
              <ListChecks size={16} className="shrink-0 text-cyan-700 dark:text-cyan-300" aria-hidden="true" />
              <span>{t('ui:autoTuneModels')} · <span className="tabular-nums">{format.format(selectedCount)}/{format.format(models.length)}</span></span>
            </h3>
            {browser && browserModelFolderPickerAvailable() && (
              <Button type="button" size="xs" variant="outline" className="mb-2" disabled={importing || enabled}
                onClick={() => void importModels()}>
                {t('common:selectFolder')} · Novera models
              </Button>
            )}
            {importError && <p role="alert" className="mb-2 break-words text-destructive">{importError}</p>}
            {models.length > 0 ? (
              <>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  <Button type="button" size="xs" variant="outline" disabled={selectedCount === models.length} onClick={() => selectAllAutoTuneModels(true)}>
                    {t('ui:autoTuneSelectAll')}
                  </Button>
                  <Button type="button" size="xs" variant="outline" disabled={selectedCount === 0} onClick={() => selectAllAutoTuneModels(false)}>
                    {t('ui:autoTuneSelectNone')}
                  </Button>
                </div>
                <div className="space-y-3">
                  {autoTuneTasks.map(task => (
                    <div key={task}>
                      <div className="mb-1 font-medium">{categories[task]} · {models.filter(model => model.task === task).length}</div>
                      <div className="grid gap-1.5 sm:grid-cols-2">
                  {models.filter(model => model.task === task).map(model => {
                    const result = active?.task === model.task && active.model === model.model && active.provider === model.provider ? active
                      : progress.results?.find(result => result.task === model.task && result.model === model.model && result.provider === model.provider)
                    const measurements = result?.report?.trials ?? []
                    return (
                    <div key={model.id} className="min-w-0 rounded-lg border border-border bg-background/70 px-2.5 py-2">
                    <label className="flex min-w-0 cursor-pointer items-center gap-2" title={model.model}>
                      <input type="checkbox" className="shrink-0 accent-cyan-600" checked={!deselected.has(model.id)}
                        onChange={event => selectAutoTuneModel(model.id, event.currentTarget.checked)} />
                      <span className="min-w-0">
                        <strong className="block truncate font-medium">{fileName(model.model)}</strong>
                        <span className="text-muted-foreground">{categories[model.task]} · {getProviderTitle(model.provider)} · {model.profiles} {t('ui:autoTuneProfiles')}</span>
                      </span>
                    </label>
                    {Boolean(model.components?.length) && (
                      <ul className="mt-1 space-y-0.5 text-muted-foreground">
                        {model.components!.map(component => (
                          <li key={component.role + ':' + component.model} title={component.model} className="break-words">
                            {componentLabels[component.role]} · {fileName(component.model)}
                          </li>
                        ))}
                      </ul>
                    )}
                    {Boolean(model.checks?.length) && (
                      <details className="mt-1.5 border-t border-border pt-1.5">
                        <summary className="cursor-pointer text-muted-foreground">{t('ui:autoTuneProfiles')} · {model.checks!.length}</summary>
                        <ul className="mt-1 space-y-1 break-words text-muted-foreground">
                          {model.checks!.map(check => <li key={check}>{checkLabel(check)}</li>)}
                        </ul>
                      </details>
                    )}
                    {measurements.length > 0 && (
                      <details className="mt-1.5 border-t border-border pt-1.5">
                        <summary className="cursor-pointer">{measurements.length} {t('ui:autoTuneMeasurements')}</summary>
                        <ol className="mt-1 space-y-1 break-words text-muted-foreground">
                          {measurements.map((sample, index) => <li key={index}>
                            {sample.phase && phases[sample.phase as keyof typeof phases]} · {variant(sample)} · {sample.error ?? measurement(sample)}
                          </li>)}
                        </ol>
                      </details>
                    )}
                    </div>
                  )})}
                      </div>
                      {!models.some(model => model.task === task) && <p className="text-muted-foreground">{t('ui:autoTuneNoModels')}</p>}
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-muted-foreground">{t('ui:autoTuneSelectionNextPass')}</p>
              </>
            ) : <p className="py-1 text-muted-foreground">{t('ui:autoTuneNoModels')}</p>}
          </section>
          <div className="rounded-xl border border-border bg-card/60 p-3">
            <div className="mb-2 text-sm font-semibold">{t('ui:autoTuneConfirmedGains')} · {gains.length}</div>
            {history.size ? (
              <ul className="space-y-1">
                {[...history.entries()].map(([key, entries]) => {
                  const [latest] = entries
                  return (
                    <li key={key} className="rounded-md border border-border">
                      <details>
                        <summary className="cursor-pointer px-2 py-1.5">
                          <span className="break-all">{categories[latest.task]} · {fileName(latest.model)}</span>
                          <span className="ml-2 text-muted-foreground">{t('ui:autoTuneGainCount', { count: entries.length })}</span>
                          <span className="ml-2 text-emerald-700 dark:text-emerald-300">{percent.format(latest.percent / 100)} · {metrics[latest.metric]}</span>
                        </summary>
                        <ol className="border-t border-border px-2 py-1.5">
                          {entries.map((gain, index) => (
                            <li key={index} className="flex flex-wrap justify-between gap-x-2 py-0.5">
                              <span>{metrics[gain.metric]} · <strong>{percent.format(gain.percent / 100)}</strong></span>
                              {gain.recordedAt !== undefined && <time className="text-muted-foreground">{dateTime.format(gain.recordedAt)}</time>}
                            </li>
                          ))}
                        </ol>
                      </details>
                    </li>
                  )
                })}
              </ul>
            ) : <span className="text-muted-foreground">—</span>}
          </div>
          <AutoTuneContribution gains={gains} browser={browser === true} />
          {(enabled || (browserComplete && total > 0)) && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                <div className="font-medium">{pass > 0 ? t('ui:autoTunePass') + ' ' + pass : t('ui:autoTuneWaiting')}{started ? ' · ' + started : ''}</div>
                {remaining !== null && (
                  <div className="text-muted-foreground">
                    {completed}/{total} {t('ui:autoTuneProcessed')} · {remaining} {t('ui:autoTuneRemaining')}
                    {failed > 0 ? ' · ' + failed + ' ' + t('ui:autoTuneFailures') : ''}
                  </div>
                )}
              </div>
              {total > 0 && (
                <div className="flex items-center gap-2">
                  <progress className="h-2 min-w-0 flex-1 accent-cyan-500" aria-label={t('ui:autoTuneProgress')} value={completed} max={total} />
                  <span className="min-w-12 text-end font-semibold tabular-nums">
                    {new Intl.NumberFormat(i18n.language, { style: 'percent' }).format(completed / total)}
                  </span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
                {autoTuneTasks.map(task => (
                  <div key={task} data-active={active?.task === task}
                    className="flex items-center justify-between gap-1 rounded-md border border-border px-2 py-1.5 data-[active=true]:border-cyan-500 data-[active=true]:bg-cyan-500/10">
                    <span>{categories[task]}</span>
                    <span className="text-muted-foreground tabular-nums">
                      {taskCounts ? taskCounts[task].completed + '/' + taskCounts[task].total : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {enabled && active && (
            <div className="rounded-lg border border-border bg-muted/20 px-2.5 py-2">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <strong className="break-all">{fileName(active.model)}</strong>
                <span className="text-muted-foreground">{getProviderTitle(active.provider)}</span>
                {phase && <span className="text-cyan-700 dark:text-cyan-300">{phase}{trial?.round ? ' · ' + t('ui:autoTuneRound') + ' ' + trial.round : ''}</span>}
              </div>
              {trials.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
                  <span>{trials.filter(sample => !sample.pending).length} {t('ui:autoTuneMeasurements')}</span>
                  {elapsed !== null && <span className="tabular-nums">⏱ {clock(elapsed)}{trial?.timeoutMs ? ' / ' + clock(trial.timeoutMs / 1000) : ''}</span>}
                  {comparisons.length > 0 && <span>{comparisons.filter(item => item.identical).length}/{comparisons.length} {t('ui:autoTuneIdentical')}</span>}
                  {trial && !trial.error && <span>{variant(trial)}{measurement(trial) ? ' · ' + measurement(trial) : ''}</span>}
                </div>
              )}
              {work && (
                <div className="mt-2 flex flex-wrap items-center gap-2" aria-live="polite">
                  <span>{workLabel}{work.total ? ` · ${work.completed ?? 0}/${work.total}` : ''}</span>
                  {work.total && <progress className="h-2 min-w-24 flex-1 accent-cyan-500" aria-label={t('ui:autoTuneProgress') + ' · ' + workLabel}
                    value={work.completed ?? 0} max={work.total} />}
                </div>
              )}
            </div>
          )}

          {(enabled || browserComplete) && lastFailure && <p className="break-words text-amber-700 dark:text-amber-300">{t('ui:autoTuneLastError')} · {lastFailure}</p>}
          {browser && unavailable && <p className="text-muted-foreground">{t('ui:autoTuneNoModels')}</p>}
          <p className="text-muted-foreground">{t('ui:autoTuneValidationRule')}</p>
        </div>
      )}
    </section>
  )
}
