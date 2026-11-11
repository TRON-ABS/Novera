import { afterEach, expect, it, vi } from 'vitest'
import { getAutoTuneProgress, refreshAutoTuneModels } from './auto-tune'
import { registerBrowserAutoTuneSource, removeBrowserAutoTuneSource } from '../browser-preview/auto-tune-registry'

vi.mock('@/services/browser-preview/config', () => ({ browserPreviewEnabled: () => true }))
vi.mock('@/services/browser-preview/auto-tune', () => ({
  browserAutoTuneAvailable: () => true,
  browserAutoTuneTextModels: () => [{ id: 'LFM3-Q4', repo: 'LiquidAI/LFM3' }, { id: 'LFM3-1.7B', repo: 'LiquidAI/LFM3-1.7B' }], browserAutoTuneTested: () => false,
  calibrateBrowserSampling: vi.fn(), calibrateBrowserMedia: vi.fn(),
}))
afterEach(() => { vi.restoreAllMocks(); ['image', 'music', 'video', 'duplicate'].forEach(removeBrowserAutoTuneSource) })

it('preserves other Web categories and their planned checks when one model is invalid', async () => {
  const warning = vi.spyOn(console, 'warn').mockImplementation(() => {})
  registerBrowserAutoTuneSource('image', () => { throw new Error('Unsupported saved image dimensions') })
  registerBrowserAutoTuneSource('music', () => ({ task: 'music', model: 'ACE-Q4', provider: 'web', key: 'music-v2',
    candidates: [{ label: 'DiT', settings: {} }], run: async () => new Blob() }))
  const video = { task: 'video' as const, model: 'Wan-Q4', provider: 'web', key: 'wan-v2',
    candidates: [{ label: 'WebGPU', settings: {} }], run: async () => new Blob() }
  registerBrowserAutoTuneSource('video', async () => video)
  registerBrowserAutoTuneSource('duplicate', () => video)
  await refreshAutoTuneModels()
  const models = getAutoTuneProgress().models
  expect(models.map(model => model.task)).toEqual(['text', 'text', 'music', 'video'])
  expect(models[0].checks).toHaveLength(12)
  expect(models[1].model).toBe('LFM3-1.7B')
  expect(models[2].checks).toEqual(['DiT'])
  expect(warning).toHaveBeenCalledTimes(1)
})
