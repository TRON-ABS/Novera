import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AutoTuneDashboard, type ConfirmedGain } from './AutoTuneDashboard'
import { invoke } from '@tauri-apps/api/core'
import { Gauge } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { submitConfirmedGains } from '@/services/creation/auto-tune-contribution'
import { browserPreviewEnabled } from '@/services/browser-preview/config'
import { subscribeBrowserAutoTuneSources } from '@/services/browser-preview/auto-tune-registry'
import { browserAutoTuneAvailable, browserAutoTuneGains, setBrowserAutoTune } from '@/services/browser-preview/auto-tune'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { startAutoTune, readAutoTuneEnabled, getAutoTuneProgress, getInitialAutoTuneProgress, subscribeAutoTuneProgress, refreshAutoTuneModels, setAutoTuneActivity, type ActiveTest } from '@/services/creation/auto-tune'

export function useDesktopAutoTuneEnabled() {
  const [enabled, setEnabled] = useState<boolean | null>(null)
  useEffect(() => {
    if (!browserPreviewEnabled() && (typeof IS_TAURI === 'undefined' || !IS_TAURI)) return
    let active = true
    let revision = 0
    const refresh = (event?: Event) => {
      const request = ++revision
      const value = (event as CustomEvent<boolean> | undefined)?.detail
      if (typeof value === 'boolean') {
        setEnabled(value)
        return
      }
      void readAutoTuneEnabled().then(value => {
        if (active && request === revision) setEnabled(typeof value === 'boolean' ? value : null)
      }).catch(() => {})
    }
    refresh()
    window.addEventListener('novera:calibration-change', refresh)
    return () => {
      active = false
      window.removeEventListener('novera:calibration-change', refresh)
    }
  }, [])
  return enabled
}

export function AutoTuneControl() {
  const { t } = useTranslation()
  const progress = useSyncExternalStore(subscribeAutoTuneProgress, getAutoTuneProgress, getInitialAutoTuneProgress)
  const controlRef = useRef<HTMLButtonElement>(null)
  const [panelHost, setPanelHost] = useState<HTMLElement | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)
  const enabled = useDesktopAutoTuneEnabled()
  const browser = browserPreviewEnabled()
  const ios = typeof IS_IOS !== 'undefined' && IS_IOS
  const unavailable = ios || (browser && !browserAutoTuneAvailable())
  const [changing, setChanging] = useState(false)
  const [gains, setGains] = useState<ConfirmedGain[]>([])
  useEffect(() => {
    if (enabled === null && !unavailable) return
    setPanelHost(controlRef.current?.closest('[data-dashboard-composer]')?.querySelector<HTMLElement>('[data-auto-tune-panel]') ?? null)
    if (enabled) setPanelOpen(true)
  }, [enabled, unavailable])
  useEffect(() => {
    if (!panelOpen || enabled || unavailable) return
    const refresh = () => void refreshAutoTuneModels().catch(error => console.warn('Auto Tune:', error))
    const unsubscribe = subscribeBrowserAutoTuneSources(refresh)
    refresh()
    const timer = window.setInterval(refresh, 5_000)
    return () => { unsubscribe(); window.clearInterval(timer) }
  }, [panelOpen, enabled, unavailable])
  useEffect(() => {
    if (!panelOpen || !panelHost || enabled === null) return
    let active = true
    const refresh = () => void (browser ? Promise.resolve(browserAutoTuneGains()) :
      invoke<ConfirmedGain[]>('desktop_auto_tune_gains', { includeHistory: true })).then(values => {
      if (active) setGains(previous => JSON.stringify(previous) === JSON.stringify(values) ? previous : values)
    }).catch(() => {})
    refresh()
    const timer = enabled ? window.setInterval(refresh, 5_000) : undefined
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [browser, enabled, panelHost, panelOpen])
  useEffect(() => {
    if (!gains.length) return
    let controller = new AbortController()
    const refresh = () => {
      controller.abort()
      controller = new AbortController()
      void submitConfirmedGains(gains, browser, controller.signal).catch(() => {})
    }
    refresh()
    const timer = window.setInterval(refresh, 60_000)
    window.addEventListener('novera:auto-tune-contribution-consent', refresh)
    return () => {
      controller.abort()
      window.clearInterval(timer)
      window.removeEventListener('novera:auto-tune-contribution-consent', refresh)
    }
  }, [gains, browser])
  useEffect(() => {
    if (browser) return
    if (!enabled || progress.standby) {
      setAutoTuneActivity(null)
      return
    }
    let active = true
    let pending = false
    const refresh = async () => {
      if (pending) return
      pending = true
      try {
        const test = await invoke<ActiveTest | null>('desktop_auto_tune_activity')
        if (active) setAutoTuneActivity(test)
      } catch {
        if (active) setAutoTuneActivity(null)
      } finally {
        pending = false
      }
    }
    void refresh()
    const timer = window.setInterval(refresh, 1_000)
    return () => {
      active = false
      window.clearInterval(timer)
    }
  }, [browser, enabled, progress.standby])
  if (enabled === null && !unavailable) return null
  async function changeCalibration(next: boolean, close = false) {
    if (changing) return
    setChanging(true)
    try {
      const value = browser ? setBrowserAutoTune(next) : await invoke<boolean | null>('desktop_calibration', { enabled: next })
      window.dispatchEvent(new CustomEvent('novera:calibration-change', { detail: value }))
      if (close && value === false) setPanelOpen(false)
      if (value === true) void startAutoTune().catch(error => console.warn('Auto Tune:', error))
    } catch (error) {
      console.warn('Auto Tune:', error)
    } finally {
      setChanging(false)
    }
  }
  function closePanel() {
    if (changing) return
    if (enabled) void changeCalibration(false, true)
    else setPanelOpen(false)
  }
  return (
    <>
      {panelOpen && panelHost && createPortal(
        <AutoTuneDashboard enabled={enabled === true} changing={changing} gains={gains} progress={progress} browser={browser} unavailable={unavailable}
          onToggle={() => void changeCalibration(!enabled)} onClose={closePanel} />,
        panelHost
      )}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button ref={controlRef} type="button" size="icon-xs" variant="ghost"
            className={cn('composer-tool shrink-0', enabled && 'composer-tool-active')}
            data-state={enabled ? 'on' : 'off'} aria-label="Auto Tune" aria-expanded={panelOpen}
            disabled={changing} onClick={() => panelOpen ? closePanel() : setPanelOpen(true)}>
            <Gauge className="size-4" strokeWidth={1.8} aria-hidden="true" />
            <span className="composer-state" aria-hidden="true">{enabled ? t('ui:on') : t('ui:off')}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>Auto Tune · {enabled ? t('ui:on') : t('ui:off')}</TooltipContent>
      </Tooltip>
    </>
  )
}
