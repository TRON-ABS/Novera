import { afterEach, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { getAutoTuneProgress, selectAutoTuneModel, startAutoTune } from './auto-tune'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/hooks/useCreation', () => ({
  useCreation: { getState: () => ({ settings: { model: 'current-image' } }) },
  videoSettingsFor: () => ({ model: 'saved-video' }),
}))
vi.mock('@/hooks/useMediaLibrary', () => ({
  useMediaLibrary: { getState: () => ({ profiles: [
    { task: 'image', settings: { model: 'saved-image' } },
    { task: 'image', settings: { model: 'current-image' } },
    { task: 'video', settings: { model: 'saved-video' } },
  ] }) },
}))
vi.mock('@/hooks/useMusicCreation', () => ({
  useMusicCreation: { getState: () => ({
    profiles: [{ settings: { model: 'saved-music' } }],
    settings: { model: 'current-music' },
  }) },
}))
vi.mock('@/hooks/useImageUpscale', () => ({
  useImageUpscale: { getState: () => ({ enabled: false, models: {}, installedModels: {} }) },
}))
vi.mock('@/modules/platform/local-path', () => ({ normalizeLocalPath: (path: string) => path }))
vi.mock('./calibration', () => ({
  visualCalibrationRequest: (task: string, settings: { model: string }) => ({ task, model: settings.model }),
  musicCalibrationRequest: (settings: { model: string }) => ({ task: 'music', model: settings.model }),
}))

afterEach(() => {
  localStorage.removeItem('novera-auto-tune-completed-profiles')
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('waits after finishing and only tests new imports, including after restarting Auto Tune', async () => {
  vi.useFakeTimers()
  let enabled = true
  let models = ['LFM3']
  const route: Array<[string, number | null]> = []
  const tested = vi.fn(async (id: string) => { route.push([id, getAutoTuneProgress().remaining]) })
  const media = vi.fn((request: { model: string }) => { route.push([request.model, getAutoTuneProgress().remaining]) })
  vi.stubGlobal('window', { core: { extensionManager: { getByName: (name: string) =>
    name === '@janhq/llamacpp-extension'
      ? { calibrationCandidates: async () => models, calibrateRegisteredModel: tested }
      : undefined
  } } })
  vi.mocked(invoke).mockImplementation(async (command, args) => {
    if (command === 'desktop_calibration') return enabled
    if (command === 'creation_calibrate') media(args?.request as { model: string })
    return []
  })
  const loop = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(route).toEqual([
      ['LFM3', 6], ['saved-image', 5], ['saved-music', 4], ['saved-video', 3],
      ['current-image', 2], ['current-music', 1],
    ])
    expect(getAutoTuneProgress()).toMatchObject({ remaining: 0, completed: 6, standby: true })
    await vi.advanceTimersByTimeAsync(12000)
    expect(route).toHaveLength(6)
    expect(media).toHaveBeenCalledTimes(5)

    const image = getAutoTuneProgress().models.find(model => model.model === 'saved-image')!
    expect(getAutoTuneProgress().excluded).toEqual([])
    selectAutoTuneModel(image.id, false)
    models = [...models, 'newly-imported']
    await vi.advanceTimersByTimeAsync(3000)
    expect(tested.mock.calls.flat()).toEqual(['LFM3', 'newly-imported'])
    expect(route).toContainEqual(['newly-imported', 1])
    expect(route.filter(([model]) => model === 'saved-image')).toHaveLength(1)
    expect(getAutoTuneProgress().models.some(model => model.model === 'newly-imported')).toBe(true)
  } finally {
    enabled = false
    await vi.advanceTimersByTimeAsync(3000)
    await loop
  }
  expect(getAutoTuneProgress()).toMatchObject({ active: null, remaining: null })
  models = [...models, 'added-while-off']
  await vi.advanceTimersByTimeAsync(6000)
  expect(tested).not.toHaveBeenCalledWith('added-while-off')
  enabled = true
  const restarted = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(tested.mock.calls.flat()).toEqual(['LFM3', 'newly-imported', 'added-while-off'])
    expect(media).toHaveBeenCalledTimes(5)
  } finally {
    enabled = false
    await vi.advanceTimersByTimeAsync(3000)
    await restarted
  }
})
