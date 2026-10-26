import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { backendStorage } from '@/lib/backendStorage'
import type { OutputMode } from '@/modules/engines/creation'
import type { ImageSeedMode } from '@/modules/engines/image-seed'

export interface CreationSettings {
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
  seed: number
  seedMode?: ImageSeedMode
  lastImageSeed?: number
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
  width: 512,
  height: 512,
  steps: 20,
  frames: 17,
  fps: 8,
  seed: 42,
  seedMode: 'random',
}
export type MediaSelection = { provider: string; id: string }
export const useCreation = create<{
  selections: Record<string, { image?: MediaSelection; video?: MediaSelection }>
  setSelection: (
    scope: string,
    task: 'image' | 'video',
    value?: MediaSelection
  ) => void
  copySelections: (from: string, to: string) => void
  settings: CreationSettings
  modes: Record<string, OutputMode>
  sources: Record<string, string>
  progress: Record<string, { stage: string; progress: number } | undefined>
  setSource: (scope: string, value?: string) => void
  setProgress: (
    scope: string,
    value?: { stage: string; progress: number }
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
      sources: {},
      progress: {},
      setSource: (scope, value) =>
        set((state) => ({
          sources: { ...state.sources, [scope]: value ?? '' },
        })),
      setProgress: (scope, value) =>
        set((state) => ({ progress: { ...state.progress, [scope]: value } })),
      setSettings: (value) =>
        set((state) => ({ settings: { ...state.settings, ...value } })),
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
        modes: state.modes,
        sources: state.sources,
      }),
    }
  )
)
