import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'
import { backendStorage } from '@/lib/backendStorage'
import {
  useCreation,
  creationDefaults,
  type CreationSettings,
} from './useCreation'
import type { InstallSnapshot } from './useCreationInstall'

export interface MediaProfile {
  id: string
  name: string
  task: 'image' | 'video'
  settings: CreationSettings
}
/** Local registrations, like imported llama models: removing one preserves its files. */
export const useMediaLibrary = create<{
  profiles: MediaProfile[]
  installed: string[]
  put: (profile: MediaProfile) => void
  remove: (id: string) => void
  importReady: (job: InstallSnapshot, restore?: boolean) => void
}>()(
  persist(
    (set) => ({
      profiles: [],
      installed: [],
      put: (profile) =>
        set((state) => ({
          profiles: [
            ...state.profiles.filter((p) => p.id !== profile.id),
            profile,
          ],
        })),
      remove: (id) => {
        const profile = useMediaLibrary
          .getState()
          .profiles.find((p) => p.id === id)
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
        }))
        const state = useCreation.getState()
        const selections = Object.fromEntries(
          Object.entries(state.selections).map(([scope, tasks]) => [
            scope,
            Object.fromEntries(
              Object.entries(tasks).filter(
                ([, selection]) =>
                  selection?.provider !== 'diffusers' || selection.id !== id
              )
            ),
          ])
        )
        useCreation.setState({ selections })
        if (
          profile &&
          (profile.task === 'video'
            ? state.settings.videoModel === profile.settings.videoModel
            : (state.settings.ggufImageModel &&
                state.settings.ggufImageModel ===
                  profile.settings.ggufImageModel) ||
              (state.settings.imageModel &&
                state.settings.imageModel === profile.settings.imageModel))
        ) {
          state.setSettings(
            profile.task === 'video'
              ? { videoModel: '' }
              : {
                  imageModel: '',
                  ggufImageModel: '',
                  ggufTextEncoder: '',
                  ggufVae: '',
                }
          )
        }
      },
      importReady: (job, restore = false) => {
        if (job.plan.variant === 'upscale') return
        if (
          job.phase !== 'ready' ||
          job.verified.length !== job.plan.files.length ||
          !job.verified.every(Boolean)
        )
          return
        const id = `media-${job.plan.token}`
        const existing = useMediaLibrary.getState()
        if (
          existing.profiles.some((p) => p.id === id) ||
          (existing.installed.includes(id) && !restore)
        )
          return
        set((state) =>
          state.profiles.some((p) => p.id === id) ||
          (state.installed.includes(id) && !restore)
            ? state
            : {
                installed: [...new Set([...state.installed, id])],
                profiles: [
                  ...state.profiles,
                  {
                    id,
                    name: job.plan.variant?.startsWith('nvfp4')
                      ? 'FLUX.2 Klein 4B · NVFP4'
                      : 'FLUX.2 Klein 4B · Q4_K_M',
                    task: 'image',
                    settings: {
                      ...creationDefaults,
                      ...Object.fromEntries(
                        job.plan.files
                          .filter((f) =>
                            [
                              'ggufImageModel',
                              'ggufTextEncoder',
                              'ggufVae',
                            ].includes(f.role)
                          )
                          .map((f) => [
                            f.role,
                            `${job.plan.directory}/${f.name}`,
                          ])
                      ),
                      imageEngine: job.plan.variant?.startsWith('nvfp4')
                        ? 'nvfp4-cuda'
                        : 'sdcpp',
                      python: job.plan.python || creationDefaults.python,
                      encoderDevice: 'cpu',
                      device: job.plan.variant?.startsWith('nvfp4')
                        ? 'cuda'
                        : 'auto',
                      steps: 4,
                      ggufGuidance: 1,
                    },
                  },
                ],
              }
        )
      },
    }),
    {
      name: 'novera-media-library',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
    }
  )
)
export function selectMediaProfile(profile: MediaProfile, scope?: string) {
  const state = useCreation.getState()
  state.setSettings({
    ...profile.settings,
    seedMode: profile.settings.seedMode ?? 'fixed',
    lastImageSeed: profile.settings.lastImageSeed,
    mediaRatio: profile.settings.mediaRatio,
  })
  if (scope) {
    state.setSelection(scope, profile.task, {
      provider: 'diffusers',
      id: profile.id,
    })
    state.setMode(scope, profile.task)
  }
}
export async function validateMediaProfile(profile: MediaProfile) {
  const s = profile.settings
  const components =
    profile.task === 'image' &&
    ['sdcpp', 'nvfp4-cuda'].includes(s.imageEngine ?? '')
  await invoke('creation_check_files', {
    request: {
      task: profile.task,
      prompt: 'validate',
      model: components
        ? s.ggufImageModel
        : profile.task === 'image'
          ? s.imageModel
          : s.videoModel,
      python: s.python,
      device: s.device,
      encoder_device: s.encoderDevice,
      width: s.width,
      height: s.height,
      steps: s.steps,
      frames: s.frames,
      fps: s.fps,
      seed: s.seed,
      backend: profile.task === 'image' ? s.imageEngine : 'diffusers',
      cpp_llm: s.ggufTextEncoder,
      cpp_vae: s.ggufVae,
      cpp_cfg: s.ggufGuidance,
    },
  })
}
