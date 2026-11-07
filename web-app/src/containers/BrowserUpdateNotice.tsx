import { useEffect, useState } from 'react'
import { useCreation } from '@/hooks/useCreation'
import { usePrompt } from '@/hooks/usePrompt'
import { browserRuntime } from '@/services/browser-preview/runtime'
import { flushBrowserConversations } from '@/services/browser-preview/storage'

declare const NOVERA_BUILD_ID: string

export function newerWebVersion(value: unknown, currentBuildId: string): string | undefined {
  if (!value || typeof value !== 'object') return
  const manifest = value as Record<string, unknown>
  if (manifest.application !== 'NoveraWeb' || manifest.schemaVersion !== 1 ||
      typeof manifest.buildId !== 'string' || !/^[A-Za-z0-9._-]{1,96}$/.test(manifest.buildId) ||
      manifest.buildId === currentBuildId || typeof manifest.version !== 'string' ||
      !/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(manifest.version)) return
  return manifest.version
}

export function BrowserUpdateNotice({ modelBusy }: { modelBusy: boolean }) {
  const [available, setAvailable] = useState<string>()
  const [reloading, setReloading] = useState(false)
  const [error, setError] = useState('')
  const mediaBusy = useCreation(state => Object.keys(state.progress).length > 0)
  const draft = usePrompt(state => state.prompt)
  useEffect(() => {
    if (!import.meta.env.PROD) return
    let active = true
    let fetching = false
    let controller: AbortController | undefined
    const check = async () => {
      if (fetching) return
      fetching = true
      controller = new AbortController()
      const timeout = window.setTimeout(() => controller?.abort(), 10_000)
      try {
        const manifestUrl = new URL(`${import.meta.env.BASE_URL}novera-web-version.json`, document.baseURI)
        manifestUrl.searchParams.set('check', String(Date.now()))
        const response = await fetch(manifestUrl, {
          cache: 'no-store', credentials: 'omit', signal: controller.signal,
        })
        if (!response.ok) return
        const version = newerWebVersion(await response.json(), typeof NOVERA_BUILD_ID === 'undefined' ? 'unknown' : NOVERA_BUILD_ID)
        if (active) setAvailable(version)
      } catch { /* Offline sessions keep working without an update check. */ }
      finally { window.clearTimeout(timeout); fetching = false }
    }
    void check()
    const focus = () => { void check() }
    window.addEventListener('focus', focus)
    const interval = window.setInterval(focus, 60_000)
    return () => { active = false; controller?.abort(); window.clearInterval(interval); window.removeEventListener('focus', focus) }
  }, [])
  if (!available) return null
  const busy = modelBusy || mediaBusy || Boolean(draft.trim())
  const reload = async () => {
    if (busy || reloading) return
    setReloading(true); setError('')
    try {
      await flushBrowserConversations()
      const phase = browserRuntime.snapshot().phase
      if (['loading', 'generating'].includes(phase) || Object.keys(useCreation.getState().progress).length || usePrompt.getState().prompt.trim()) {
        setReloading(false)
        return
      }
      const next = new URL(window.location.href)
      next.searchParams.set('novera_reload', String(Date.now()))
      window.location.replace(next.href)
    } catch { setReloading(false); setError('Les discussions ne sont pas encore enregistrées. Réessayez avant de recharger.') }
  }
  return <div className="mt-2 flex flex-wrap items-center gap-2" role="status">
    <strong>Nouvelle version disponible · {available}</strong>
    <button className="underline" disabled={busy || reloading} onClick={() => { void reload() }}>Recharger Novera</button>
    {busy && <span>Terminez la génération et envoyez ou conservez votre brouillon avant de recharger.</span>}
    {error && <span role="alert">{error}</span>}
  </div>
}
