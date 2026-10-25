import { useEffect } from 'react'
import { useAnalytic } from '@/hooks/useAnalytic'
import { sendStartupStatistic } from '@/lib/noveraTelemetry'
import { startErrorTracking } from '@/lib/noveraErrorTracking'
import { useErrorTracking } from '@/hooks/useErrorTracking'

export function AnalyticProvider() {
  const { productAnalytic, analyticsAvailable } = useAnalytic()
  const errorTracking = useErrorTracking((state) => state.enabled)
  useEffect(() => {
    if (!analyticsAvailable || !errorTracking) return
    return startErrorTracking(window)
  }, [analyticsAvailable, errorTracking])
  useEffect(() => {
    if (!analyticsAvailable || !productAnalytic) return
    const controller = new AbortController()
    // Defer one tick so React StrictMode's probe mount cannot send twice.
    const timer = setTimeout(() => {
      void sendStartupStatistic(controller.signal).catch(() => {})
    }, 0)
    return () => { clearTimeout(timer); controller.abort() }
  }, [productAnalytic, analyticsAvailable])
  return null
}
