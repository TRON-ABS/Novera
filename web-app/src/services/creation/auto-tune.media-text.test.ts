import { afterEach, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { getAutoTuneProgress, refreshAutoTuneModels, startAutoTune } from './auto-tune'

const qwen = 'C:/models/Qwen3-4B-Q4_K_M.gguf'
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/services/browser-preview/config', () => ({ browserPreviewEnabled: () => false }))
vi.mock('@/hooks/useCreation', () => ({
  useCreation: { getState: () => ({ settings: {
    imageEngine: 'sdcpp', ggufImageModel: '/models/flux.gguf',
    ggufTextEncoder: 'C:/models/Qwen3-4B-Q4_K_M.gguf',
  } }) },
  videoSettingsFor: () => ({}),
}))
vi.mock('@/hooks/useMediaLibrary', () => ({ useMediaLibrary: { getState: () => ({ profiles: [
  { task: 'image', settings: { ggufImageModel: '/models/flux.gguf', ggufTextEncoder: 'C:/models/Qwen3-4B-Q4_K_M.gguf' } },
] }) } }))
vi.mock('@/hooks/useMusicCreation', () => ({ useMusicCreation: { getState: () => ({ profiles: [], settings: {} }) } }))
vi.mock('@/hooks/useImageUpscale', () => ({ useImageUpscale: { getState: () => ({ models: {}, installedModels: {} }) } }))
vi.mock('./calibration', () => ({ visualCalibrationRequest: () => undefined, musicCalibrationRequest: () => undefined }))

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); localStorage.clear() })

it('adds the selected media decoder as a normal text job without enabling Auto Tune or rerunning completed models', async () => {
  vi.useFakeTimers()
  let enabled = false
  const candidates = vi.fn(async (paths: string[]) => paths.includes(qwen) ? ['LFM3', 'Qwen3-4B-Q4_K_M'] : ['LFM3'])
  const calibrate = vi.fn(async (_id: string) => {})
  vi.stubGlobal('window', { core: { extensionManager: { getByName: (name: string) =>
    name === '@janhq/llamacpp-extension' ? { calibrationCandidates: candidates, calibrateRegisteredModel: calibrate } : undefined,
  } } })
  vi.mocked(invoke).mockImplementation(async command => command === 'desktop_calibration' ? enabled : [])
  await refreshAutoTuneModels()
  expect(candidates).toHaveBeenCalledWith([qwen])
  expect(getAutoTuneProgress().models.map(model => model.model)).toEqual(['LFM3', 'Qwen3-4B-Q4_K_M'])
  expect(getAutoTuneProgress().models[1].checks).toHaveLength(8)
  expect(calibrate).not.toHaveBeenCalled()
  enabled = true
  const loop = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(calibrate.mock.calls).toEqual([['LFM3'], ['Qwen3-4B-Q4_K_M']])
    await vi.advanceTimersByTimeAsync(3000)
    expect(calibrate).toHaveBeenCalledTimes(2)
  } finally {
    enabled = false
    await vi.advanceTimersByTimeAsync(3000)
    await loop
  }
})
