import { useEffect } from 'react'
import { useWebSearchConfig } from './useWebSearchConfig'
import { isPlatformAndroid, isPlatformIOS, isPlatformTauri } from '@/lib/platform/utils'

export function useWebSearchWarmup(ready: boolean) {
  const enabled = useWebSearchConfig(state => state.webSearchEnabled)
  const provider = useWebSearchConfig(state => state.searchProvider)
  useEffect(() => {
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
  }, [ready, enabled, provider])
}
