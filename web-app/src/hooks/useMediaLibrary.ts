import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { invoke } from '@tauri-apps/api/core'
import { backendStorage } from '@/lib/backendStorage'
import {
  useCreation,
  videoSettingsFor,
  creationDefaults,
  type CreationSettings,
} from './useCreation'
import type { InstallSnapshot } from './useCreationInstall'
import { joinLocalPath } from '@/modules/platform/local-path'

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
            ? videoSettingsFor(state).videoModel === profile.settings.videoModel
            : (state.settings.ggufImageModel &&
                state.settings.ggufImageModel ===
                  profile.settings.ggufImageModel) ||
              (state.settings.imageModel &&
                state.settings.imageModel === profile.settings.imageModel))
        ) {
          if (profile.task === 'video') state.setVideoSettings({ videoModel: '', ggufTextEncoder: '', ggufVae: '' })
          else state.setSettings({
                  imageModel: '',
                  ggufImageModel: '',
                  ggufTextEncoder: '',
                  ggufVae: '',
                })
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
                    name: job.plan.variant === 'video-gguf' ? 'Wan2.1 T2V 1.3B · Q4_K_M' : job.plan.variant?.startsWith('nvfp4')
                      ? 'FLUX.2 Klein 4B · NVFP4'
                      : 'FLUX.2 Klein 4B · Q4_K_M',
                    task: job.plan.variant === 'video-gguf' ? 'video' : 'image',
                    settings: {
                      ...creationDefaults,
                      ...Object.fromEntries(
                        job.plan.files
                          .filter((f) =>
                            [
                              'videoModel',
                              'ggufImageModel',
                              'ggufTextEncoder',
                              'ggufVae',
                            ].includes(f.role)
                          )
                          .map((f) => [
                            f.role,
                            joinLocalPath(job.plan.directory, f.name),
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
                      ...(job.plan.variant === 'video-gguf' ? { videoEngine: 'sdcpp' as const, width: 512, height: 224, mediaRatio: '21:9', frames: 81, fps: 16, durationSeconds: 5, steps: 20, ggufGuidance: 6 } : { steps: 4, ggufGuidance: 1 }),
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
  const configure = profile.task === 'video' ? state.setVideoSettings : state.setSettings
  configure({
    ...profile.settings,
    seedMode: profile.settings.seedMode ?? 'random',
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
    profile.task === 'image' ? ['sdcpp', 'nvfp4-cuda'].includes(s.imageEngine ?? '') : s.videoEngine === 'sdcpp'
  await invoke('creation_check_files', {
    request: {
      task: profile.task,
      prompt: 'validate',
      model: components && profile.task === 'image'
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
      backend: profile.task === 'image' ? s.imageEngine : s.videoEngine ?? 'diffusers',
      cpp_llm: s.ggufTextEncoder,
      cpp_vae: s.ggufVae,
      cpp_cfg: s.ggufGuidance,
    },
  })
}
