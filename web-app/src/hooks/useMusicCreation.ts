import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
import { musicDefaults, normalizeMusicSettings, type MusicSettings } from '@/modules/engines/music'
import type { InstallSnapshot } from './useCreationInstall'
export type MusicProfile = { id: string; name: string; settings: MusicSettings }
export const useMusicCreation = create<{
  settings: MusicSettings
  profiles: MusicProfile[]
  installed: string[]
  selections: Record<string, string>
  setSettings: (value: Partial<MusicSettings>, scope?: string) => void
  put: (profile: MusicProfile) => void
  remove: (id: string) => void
  select: (id: string, scope: string) => void
  importReady: (job: InstallSnapshot, restore?: boolean) => void
}>()(
  persist(
    (set) => ({
      settings: musicDefaults,
      profiles: [],
      selections: {},
      installed: [],
      setSettings: (value, scope) =>
        set((state) => ({
          settings: { ...state.settings, ...value },
          profiles: state.profiles.map((profile) =>
            profile.id === (scope ? state.selections[scope] : undefined)
              ? { ...profile, settings: { ...profile.settings, ...value } }
              : profile
          ),
        })),
      put: (profile) =>
        set((state) => ({
          profiles: [
            ...state.profiles.filter((p) => p.id !== profile.id),
            profile,
          ],
        })),
      remove: (id) =>
        set((state) => {
          const profile = state.profiles.find((p) => p.id === id)
          return {
            profiles: state.profiles.filter((p) => p.id !== id),
            ...(profile?.settings.directory === state.settings.directory &&
            profile?.settings.generator === state.settings.generator
              ? { settings: { ...musicDefaults } }
              : {}),
            selections: Object.fromEntries(
              Object.entries(state.selections).filter(
                ([, selected]) => selected !== id
              )
            ),
          }
        }),
      select: (id, scope) =>
        set((state) => {
          const profile = state.profiles.find((p) => p.id === id)
          return profile
            ? {
                settings: { ...profile.settings },
                selections: { ...state.selections, [scope]: id },
              }
            : {}
        }),
      importReady: (job, restore = false) =>
        set((state) => {
          if (
            job.plan.variant !== 'music-gguf' ||
            job.phase !== 'ready' ||
            job.verified.length !== job.plan.files.length ||
            !job.verified.every(Boolean) ||
            (state.installed.includes(job.plan.token) && !restore) ||
            state.profiles.some((p) => p.id === `music-${job.plan.token}`)
          )
            return {}
          const files = Object.fromEntries(
            job.plan.files.map((file) => [file.role, file.name])
          )
          if (
            !files.musicGenerator ||
            !files.musicPlanner ||
            !files.musicEncoder ||
            !files.musicVae
          )
            return {}
          return {
            installed: [...new Set([...state.installed, job.plan.token])],
            profiles: [
              ...state.profiles,
              {
                id: `music-${job.plan.token}`,
                name: 'ACE-Step 1.5 Turbo 2B · Q4_K_M',
                settings: {
                  ...musicDefaults,
                  directory: job.plan.directory,
                  engineDirectory: job.plan.directory,
                  generator: files.musicGenerator,
                  planner: files.musicPlanner,
                  encoder: files.musicEncoder,
                  vae: files.musicVae,
                },
              },
            ],
          }
        }),
    }),
    {
      name: 'novera-music-creation',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
    }
  )
)

export function musicSettingsFor(scope: string): MusicSettings {
  const state = useMusicCreation.getState()
  return normalizeMusicSettings(
    state.profiles.find((p) => p.id === state.selections[scope])?.settings ??
    state.settings
  )
}
