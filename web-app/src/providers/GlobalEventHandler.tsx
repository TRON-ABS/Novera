import { useEffect } from 'react'
import { events } from '@janhq/core'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useHardware } from '@/hooks/useHardware'
import { useMcpToolProgress } from '@/hooks/useMcpToolProgress'
import { isPlatformTauri } from '@/lib/platform/utils'

/**
 * GlobalEventHandler handles global events that should be processed across all screens
 * This provider should be mounted at the root level to ensure all screens can benefit from global event handling
 */
export function GlobalEventHandler() {
  const { setProviders } = useModelProvider()
  const serviceHub = useServiceHub()
  const setHardwareData = useHardware((state) => state.setHardwareData)
  const updateSystemUsage = useHardware((state) => state.updateSystemUsage)

  useMcpToolProgress()

  // Probe hardware on mount so Hub fit-status renders before the user
  // visits Settings → Hardware. Re-detect on visibility return (post-sleep, #6447).
  useEffect(() => {
    if (!isPlatformTauri()) return
    let active = true
    let sampling = false
    const sampleUsage = async () => {
      if (!active || sampling || document.visibilityState === 'hidden') return
      sampling = true
      try {
        const usage = await serviceHub.hardware().getSystemUsage()
        if (active && usage) updateSystemUsage(usage)
      } catch (error) { console.error('Failed to refresh hardware usage:', error) }
      finally { sampling = false }
    }

    const probe = async () => {
      try {
        const data = await serviceHub.hardware().getHardwareInfo()
        if (active && data) setHardwareData(data)
        await sampleUsage()
      } catch (e) {
        console.error('Failed to fetch hardware info:', e)
      }
    }

    void probe()

    const handleVisibilityChange = async () => {
      if (document.visibilityState !== 'visible') return
      try {
        await serviceHub.hardware().refreshHardwareInfo()
        const data = await serviceHub.hardware().getHardwareInfo()
        if (active && data) setHardwareData(data)
        await sampleUsage()
      } catch (e) {
        console.error('Failed to refresh hardware info after visibility change:', e)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    const interval = setInterval(() => void sampleUsage(), 5000)
    return () => {
      active = false
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [serviceHub, setHardwareData, updateSystemUsage])

  // Handle settingsChanged event globally
  useEffect(() => {
    const handleSettingsChanged = async (event: {
      key: string
      value: string
    }) => {
      console.log('Global settingsChanged event:', event)

      if (
        event.key === 'llamacpp_version' ||
        event.key === 'llamacpp_backend'
      ) {
        try {
          const updatedProviders = await serviceHub.providers().getProviders()
          setProviders(updatedProviders)
        } catch (error) {
          console.error(
            'Failed to refresh providers after settingsChanged:',
            error
          )
        }
      }

      // Add more global event handlers here as needed
      // For example:
      // if (event.key === 'some_other_setting') {
      //   // Handle other setting changes
      // }
    }

    // Subscribe to the settingsChanged event
    events.on('settingsChanged', handleSettingsChanged)

    // Cleanup subscription on unmount
    return () => {
      events.off('settingsChanged', handleSettingsChanged)
    }
  }, [setProviders, serviceHub])

  // This component doesn't render anything
  return null
}
