import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
import type { OutputMode } from '@/modules/engines/creation'
import type { ImageSeedMode } from '@/modules/engines/image-seed'

export interface CreationSettings {
  videoEngine?: 'diffusers' | 'sdcpp'
  imageEngine?: 'diffusers' | 'sdcpp' | 'nvfp4-cuda'
  encoderDevice?: 'auto' | 'cpu' | 'cuda'
  cppExecutable?: string
  ggufImageModel?: string
  ggufTextEncoder?: string
  ggufVae?: string
  ggufGuidance?: number
  python: string
  device: 'auto' | 'cpu' | 'cuda'
  imageModel: string
  videoModel: string
  width: number
  height: number
  mediaRatio?: string
  steps: number
  frames: number
  fps: number
  durationSeconds?: number
  durationAuto?: boolean
  seed: number
  seedMode?: ImageSeedMode
  lastImageSeed?: number
  generationCount?: number
}
export const creationDefaults: CreationSettings = {
  imageEngine: 'diffusers',
  encoderDevice: 'auto',
  cppExecutable: '',
  ggufImageModel: '',
  ggufTextEncoder: '',
  ggufVae: '',
  ggufGuidance: 1,
  python: 'python',
  device: 'auto',
  imageModel: '',
  videoModel: '',
  width: 1024,
  height: 432,
  mediaRatio: '21:9',
  steps: 20,
  frames: 17,
  fps: 8,
  seed: 42,
  seedMode: 'random',
  generationCount: 1,
}
export type MediaSelection = { provider: string; id: string }
export const useCreation = create<{
  selections: Record<
    string,
    { image?: MediaSelection; music?: MediaSelection; video?: MediaSelection }
  >
  setSelection: (
    scope: string,
    task: 'image' | 'music' | 'video',
    value?: MediaSelection
  ) => void
  copySelections: (from: string, to: string) => void
  settings: CreationSettings
  videoSettings?: CreationSettings
  setVideoSettings: (value: Partial<CreationSettings>) => void
  modes: Record<string, OutputMode>
  resolvedModes: Record<string, Exclude<OutputMode, 'auto'>>
  setResolvedMode: (scope: string, mode: Exclude<OutputMode, 'auto'>) => void
  sources: Record<string, string>
  progress: Record<
    string,
    { stage: string; progress: number; detail?: string } | undefined
  >
  setSource: (scope: string, value?: string) => void
  setProgress: (
    scope: string,
    value?: { stage: string; progress: number; detail?: string }
  ) => void
  setSettings: (value: Partial<CreationSettings>) => void
  setMode: (scope: string, mode: OutputMode) => void
}>()(
  persist(
    (set) => ({
      selections: {},
      setSelection: (scope, task, value) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [scope]: { ...state.selections[scope], [task]: value },
          },
        })),
      copySelections: (from, to) =>
        set((state) => ({
          selections: {
            ...state.selections,
            [to]: { ...state.selections[from] },
          },
        })),
      settings: creationDefaults,
      modes: {},
      resolvedModes: {},
      setResolvedMode: (scope, mode) =>
        set((state) => ({
          resolvedModes: { ...state.resolvedModes, [scope]: mode },
        })),
      sources: {},
      progress: {},
      setSource: (scope, value) =>
        set((state) => ({
          sources: { ...state.sources, [scope]: value ?? '' },
        })),
      setProgress: (scope, value) =>
        set((state) => ({ progress: { ...state.progress, [scope]: value } })),
      setSettings: (value) =>
        set((state) => ({
          settings: { ...state.settings, ...value },
          videoSettings: videoSettingsFor(state),
        })),
      setVideoSettings: (value) =>
        set((state) => ({
          videoSettings: { ...videoSettingsFor(state), ...value },
        })),
      setMode: (scope, mode) =>
        set((state) => ({ modes: { ...state.modes, [scope]: mode } })),
    }),
    {
      name: 'novera-creation',
      storage: createJSONStorage(() => backendStorage),
      skipHydration: true,
      partialize: (state) => ({
        selections: state.selections,
        settings: state.settings,
        videoSettings: state.videoSettings,
        modes: state.modes,
        sources: state.sources,
      }),
    }
  )
)

/** Keep legacy video folders readable while giving new profiles a separate bank. */
export function videoSettingsFor(state: {
  settings: CreationSettings
  videoSettings?: CreationSettings
}): CreationSettings {
  if (state.videoSettings) return state.videoSettings
  const legacy = state.settings
  return {
    ...creationDefaults,
    videoEngine: 'diffusers',
    python: legacy.python,
    width: 512,
    height: 224,
    mediaRatio: '21:9',
    frames: 81,
    fps: 16,
    durationSeconds: 5,
    ggufGuidance: 6,
    ...(legacy.videoModel
      ? {
          videoModel: legacy.videoModel,
          device: legacy.device,
          width: legacy.width,
          height: legacy.height,
          mediaRatio: legacy.mediaRatio,
          steps: legacy.steps,
          frames: legacy.frames,
          fps: legacy.fps,
          seed: legacy.seed,
        }
      : {}),
  }
}
