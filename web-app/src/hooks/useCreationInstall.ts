import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'
import { useEffect } from 'react'
import { backendStorage } from '@/lib/backendStorage'
import { isPlatformTauri } from '@/lib/platform/utils'
import { useMediaLibrary, selectMediaProfile } from './useMediaLibrary'
import { useImageUpscale } from './useImageUpscale'

export interface InstallPlan {
  variant?: string
  python?: string
  token: string
  directory: string
  files: {
    role: string
    name: string
    url: string
    size: number
    sha256: string
  }[]
  total: number
  available: number
}
export interface InstallSnapshot {
  plan: InstallPlan
  phase:
    | 'downloading'
    | 'verifying'
    | 'paused'
    | 'cancelled'
    | 'error'
    | 'ready'
  bytes: number[]
  verified: boolean[]
  acknowledged: boolean
  error?: string
  running: boolean
}
export const useCreationInstall = create<{
  parent: string
  job?: InstallSnapshot
  setParent: (parent: string) => void
  setJob: (job?: InstallSnapshot) => void
}>()(
  persist(
    (set) => ({
      parent: '',
      setParent: (parent) => set({ parent }),
      setJob: (job) => set({ job }),
    }),
    {
      name: 'novera-creation-install',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: ({ parent }) => ({ parent }),
    }
  )
)
export async function installAction(action: string, token?: string) {
  const job = await invoke<InstallSnapshot | null>('creation_bundle_action', {
    action,
    token,
  })
  useCreationInstall.getState().setJob(job ?? undefined)
}
export function applyInstalled(job: InstallSnapshot) {
  if (
    job.phase !== 'ready' ||
    job.verified.length !== job.plan.files.length ||
    !job.verified.every(Boolean)
  )
    return
  if (job.plan.variant === 'upscale') {
    for (const factor of [2, 4] as const) {
      const file = job.plan.files.find((f) => f.role === `upscale${factor}`)
      if (file) useImageUpscale.getState().registerModel(factor, `${job.plan.directory}/${file.name}`)
    }
    window.dispatchEvent(new CustomEvent('novera-creation-settings'))
    return
  }
  useMediaLibrary.getState().importReady(job, true)
  const profileId = `media-${job.plan.token}`
  const profile = useMediaLibrary
    .getState()
    .profiles.find((p) => p.id === profileId)
  if (profile) selectMediaProfile(profile)
  window.dispatchEvent(
    new CustomEvent('novera-creation-settings', {
      detail: { installed: true, profileId, task: 'image' },
    })
  )
}
/** Mounted at the application root: changing threads/output never stops a transfer. */
export function useCreationInstallSync() {
  useEffect(() => {
    if (!isPlatformTauri()) return

    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    async function poll() {
      try {
        const job = await invoke<InstallSnapshot | null>(
          'creation_bundle_status'
        )
        if (!disposed) {
          if (job) useMediaLibrary.getState().importReady(job)
          useCreationInstall.getState().setJob(job ?? undefined)
        }
      } catch {
        /* Keep the last known state if IPC is temporarily unavailable. */
      }
      if (!disposed) timer = setTimeout(poll, 1000)
    }
    void Promise.all([
      useCreationInstall.persist.rehydrate(),
      useMediaLibrary.persist.rehydrate(),
      useImageUpscale.persist.rehydrate(),
    ]).then(() => {
      if (!disposed) void poll()
    })
    return () => {
      disposed = true
      clearTimeout(timer)
    }
  }, [])
}
