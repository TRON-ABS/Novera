import { afterEach, expect, it, vi } from 'vitest'
import { getAutoTuneProgress, startAutoTune } from './auto-tune'
import { registerBrowserAutoTuneSource, removeBrowserAutoTuneSource } from '../browser-preview/auto-tune-registry'

const state = vi.hoisted(() => ({ enabled: true, imported: false, tested: [] as string[] }))
vi.mock('@/services/browser-preview/config', () => ({ browserPreviewEnabled: () => true }))
vi.mock('@/services/browser-preview/auto-tune', () => ({
  browserAutoTuneAvailable: () => true,
  browserAutoTuneTextModels: () => [{ id: 'LFM3' }, { id: 'LFM3-1.7B' }],
  browserAutoTuneEnabled: () => state.enabled,
  browserAutoTuneTested: () => false,
  calibrateBrowserSampling: async (_update: unknown, id: string) => { state.tested.push(id) },
  calibrateBrowserMedia: async (probe: { model: string }) => { state.tested.push(probe.model) },
}))
afterEach(() => { vi.useRealTimers(); localStorage.clear(); removeBrowserAutoTuneSource('new-import') })

it('automatically includes a newly available Web model on the next pass without restarting or repeating completed models', async () => {
  vi.useFakeTimers()
  const loop = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B'])
    state.imported = true
    registerBrowserAutoTuneSource('new-import', () => ({
      task: 'image', model: 'FLUX', provider: 'web', key: 'new-image', candidates: [],
      components: [{ model: 'Qwen3-4B-Q4_K_M.gguf', role: 'encoder' }, { model: 'diffusion_pytorch_model.safetensors', role: 'vae' }],
      run: async () => new Blob(),
    }))
    await vi.advanceTimersByTimeAsync(0)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B', 'FLUX'])
    expect(getAutoTuneProgress().models.map(model => model.model)).toEqual(['LFM3', 'LFM3-1.7B', 'FLUX'])
    expect(getAutoTuneProgress().excluded).toEqual([])
    expect(getAutoTuneProgress().models[2].components?.map(component => component.model))
      .toEqual(['Qwen3-4B-Q4_K_M.gguf', 'diffusion_pytorch_model.safetensors'])
    await vi.advanceTimersByTimeAsync(6_000)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B', 'FLUX'])
  } finally {
    state.enabled = false
    await vi.advanceTimersByTimeAsync(3_000)
    await loop
  }
})
