import { useEffect, useState } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { useHardware } from './useHardware'
import { resourceProfile } from '@/lib/resourceProfile'
import { isPlatformTauri } from '@/lib/platform/utils'

// Several configuration panels mount together; query the installed worker once.
let engineVersion: Promise<string | undefined> | undefined

export function currentResourceProfile(engineBuild?: string) {
  const { hardwareData: hardware, systemUsage: usage } = useHardware.getState()
  const available = usage.total_memory > 0 ? Math.max(0, usage.total_memory - usage.used_memory) : undefined
  return resourceProfile({
    platform: hardware.os_type || (IS_WINDOWS ? 'windows' : ''),
    ramMiB: hardware.total_memory,
    availableMiB: available,
    gpuMiB: Math.max(0, ...hardware.gpus.filter(g => g.activated !== false).map(g => g.total_memory)),
    unified: hardware.os_type === 'macos' && hardware.cpu.arch === 'aarch64',
    mobile: IS_ANDROID || IS_IOS, engineBuild,
  })
}

export function useAutoConfiguration() {
  useHardware(s => s.hardwareData)
  useHardware(s => s.systemUsage)
  const [engineBuild, setEngineBuild] = useState<string>()
  useEffect(() => {
    let active = true
    if (isPlatformTauri()) {
      engineVersion ??= invoke<{ build_number: string }>('plugin:llamacpp|get_engine_version')
        .then(version => version?.build_number)
        .catch(() => undefined)
      void engineVersion.then(build => { if (active) setEngineBuild(build) })
    }
    return () => { active = false }
  }, [])
  return currentResourceProfile(engineBuild)
}
