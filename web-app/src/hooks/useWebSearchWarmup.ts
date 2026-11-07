import { useEffect } from 'react'
import { useWebSearchConfig } from './useWebSearchConfig'
import { isPlatformAndroid, isPlatformIOS, isPlatformTauri } from '@/lib/platform/utils'
import { browserPreviewEnabled } from '@/services/browser-preview/config'

export function useWebSearchWarmup(ready: boolean) {
  const enabled = useWebSearchConfig(state => state.webSearchEnabled)
  const provider = useWebSearchConfig(state => state.searchProvider)
  const endpoint = browserPreviewEnabled()
  useEffect(() => {
    if (endpoint) {
      let disposed = false
      void import('@/services/browser-preview/web-search').then(async ({ browserSearch, BROWSER_SEARCH_ENDPOINT }) => {
        const current = useWebSearchConfig.getState()
        if (disposed) return
        if (!ready || !current.webSearchEnabled || current.searchProvider !== 'exa') { browserSearch.reset(); return }
        await browserSearch.prepare(BROWSER_SEARCH_ENDPOINT)
      }).catch(() => { /* The visible connection state reports failure; a real request can retry. */ })
      return () => { disposed = true }
    }
    // The ready flag is set after persisted settings have been hydrated, so a
    // saved Web-off choice cannot accidentally start the desktop service.
    if (!ready || !enabled || provider !== 'duckduckgo' || !isPlatformTauri() || isPlatformAndroid() || isPlatformIOS()) return
    let disposed = false
    void import('@/lib/duckduckgoSearch').then(async ({ prepareDuckDuckGo }) => {
      const current = useWebSearchConfig.getState()
      if (disposed || !current.webSearchEnabled || current.searchProvider !== 'duckduckgo') return
      await prepareDuckDuckGo()
    }).catch(() => {
      // A failed preparation must not block the app. A real search can retry.
      if (!disposed) console.warn('[Novera web] background preparation unavailable')
    })
    return () => { disposed = true }
  }, [ready, enabled, provider, endpoint])
}
