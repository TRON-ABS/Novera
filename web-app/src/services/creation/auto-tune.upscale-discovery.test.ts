import { afterEach, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { getAutoTuneProgress, refreshAutoTuneModels, startAutoTune } from './auto-tune'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/services/browser-preview/config', () => ({ browserPreviewEnabled: () => false }))
vi.mock('@/hooks/useCreation', () => ({
  useCreation: { getState: () => ({ settings: { imageEngine: 'sdcpp', ggufImageModel: '/models/image.gguf',
    ggufTextEncoder: '/models/Qwen3-4B-Q4_K_M.gguf', ggufVae: '/models/diffusion_pytorch_model.safetensors', width: 512, height: 512, steps: 4 } }) },
  videoSettingsFor: () => ({}),
}))
vi.mock('@/hooks/useMediaLibrary', () => ({ useMediaLibrary: { getState: () => ({ profiles: [] }) } }))
vi.mock('@/hooks/useMusicCreation', () => ({ useMusicCreation: { getState: () => ({ profiles: [], settings: {} }) } }))
vi.mock('@/hooks/useImageUpscale', () => ({ useImageUpscale: { getState: () => ({ enabled: false,
  models: { 2: '/models/custom-x2.pth', 4: '/models/RealESRGAN_x4plus.pth' },
  installedModels: { 2: '/models/RealESRGAN_x2plus.pth', 4: '/models/RealESRGAN_x4plus.pth' },
}) } }))

afterEach(() => { vi.useRealTimers(); vi.unstubAllGlobals(); localStorage.clear() })

it('automatically queues every registered upscaler once with a compatible image pipeline, independently of the creation toggle', async () => {
  vi.useFakeTimers()
  let enabled = false
  vi.stubGlobal('window', { core: { extensionManager: { getByName: () => undefined } } })
  vi.mocked(invoke).mockImplementation(async command => command === 'desktop_calibration' ? enabled : [])
  await refreshAutoTuneModels()
  const models = getAutoTuneProgress().models
  expect(models.map(model => model.model).sort()).toEqual([
    '/models/image.gguf', '/models/custom-x2.pth', '/models/RealESRGAN_x2plus.pth', '/models/RealESRGAN_x4plus.pth',
  ].sort())
  expect(models.every(model => model.components?.some(component => component.role === 'vae'))).toBe(true)
  expect(vi.mocked(invoke).mock.calls.some(([command]) => command === 'creation_calibrate')).toBe(false)
  enabled = true
  const loop = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    const calls = vi.mocked(invoke).mock.calls.filter(([command]) => command === 'creation_calibrate')
    expect(calls).toHaveLength(4)
    expect(calls.every(([, args]) => args?.quick === false)).toBe(true)
    expect(calls.map(([, args]) => (args?.request as { upscale_factor?: number }).upscale_factor).sort())
      .toEqual([2, 2, 4, undefined])
    await vi.advanceTimersByTimeAsync(3_000)
    expect(vi.mocked(invoke).mock.calls.filter(([command]) => command === 'creation_calibrate')).toHaveLength(4)
  } finally { enabled = false; await vi.advanceTimersByTimeAsync(3_000); await loop }
})
