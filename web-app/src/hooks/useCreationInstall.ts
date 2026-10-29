import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'
import { useEffect } from 'react'
import { backendStorage } from '@/lib/backendStorage'
import { isPlatformTauri } from '@/lib/platform/utils'
import { useMediaLibrary, selectMediaProfile } from './useMediaLibrary'
import { useImageUpscale } from './useImageUpscale'
import { joinLocalPath } from '@/modules/platform/local-path'
import { useMusicCreation } from './useMusicCreation'
import { configureRecommendedBundle } from '@/services/creation/setup'

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
  requiredSpace?: number
  videoRuntimeReady?: boolean
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
  autoApply: Record<string,{scope:string;done:boolean;error?:boolean;detail?:string}>
  requestAutomatic: (token:string,scope:string) => void
  finishAutomatic: (token:string,error?:boolean,detail?:string) => void
}>()(
  persist(
    (set) => ({
      parent: '',
      setParent: (parent) => set({ parent }),
      setJob: (job) => set({ job }),
      autoApply: {},
      requestAutomatic: (token,scope)=>set((state)=>({autoApply:{...state.autoApply,[token]:{scope,done:false}}})),
      finishAutomatic: (token,error=false,detail)=>set((state)=>({autoApply:{...state.autoApply,[token]:{...state.autoApply[token],done:!error,error,detail}}})),
    }),
    {
      name: 'novera-creation-install',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: ({ parent, autoApply }) => ({ parent, autoApply }),
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
export async function applyInstalled(job: InstallSnapshot, scope?: string, notify=true) {
  if (
    job.phase !== 'ready' ||
    job.verified.length !== job.plan.files.length ||
    !job.verified.every(Boolean)
  )
    return
  if(job.plan.variant==='all-recommended') {
    await configureRecommendedBundle(job,scope)
    return
  }
  if(job.plan.variant==='music-gguf') {
    useMusicCreation.getState().importReady(job,true)
    if(scope)useMusicCreation.getState().select(`music-${job.plan.token}`,scope)
    if(notify)window.dispatchEvent(new CustomEvent('novera-creation-settings',{detail:{installed:true,profileId:`music-${job.plan.token}`,task:'music'}}))
    return
  }
  if (job.plan.variant === 'upscale') {
    for (const factor of [2, 4] as const) {
      const file = job.plan.files.find((f) => f.role === `upscale${factor}`)
      if (file)
        useImageUpscale
          .getState()
          .registerModel(factor, joinLocalPath(job.plan.directory, file.name))
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
      detail: { installed: true, profileId, task: profile?.task ?? 'image' },
    })
  )
}
/** Mounted at the application root: changing threads/output never stops a transfer. */
export function useCreationInstallSync() {
  useEffect(() => {
    if (!isPlatformTauri()) return

    let disposed = false
    let timer: ReturnType<typeof setTimeout>
    let configuring: string | undefined
    async function poll() {
      try {
        const job = await invoke<InstallSnapshot | null>(
          'creation_bundle_status'
        )
        if (!disposed) {
          if (job?.plan.variant==='music-gguf')useMusicCreation.getState().importReady(job)
          else if(job&&job.plan.variant!=='all-recommended')useMediaLibrary.getState().importReady(job)
          useCreationInstall.getState().setJob(job ?? undefined)
          const automatic=job&&useCreationInstall.getState().autoApply[job.plan.token]
          if(job?.phase==='ready'&&automatic&&!automatic.done&&!automatic.error&&configuring!==job.plan.token) {
            configuring=job.plan.token
            try {await applyInstalled(job,automatic.scope,false);useCreationInstall.getState().finishAutomatic(job.plan.token)}
            catch(error) {useCreationInstall.getState().finishAutomatic(job.plan.token,true,String(error).slice(0,1600))}
            finally {configuring=undefined}
          }
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
      useMusicCreation.persist.rehydrate(),
    ]).then(() => {
      if (!disposed) void poll()
    })
    return () => {
      disposed = true
      clearTimeout(timer)
    }
  }, [])
}
