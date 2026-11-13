import { afterEach, expect, it, vi } from 'vitest'
import { getAutoTuneProgress, startAutoTune } from './auto-tune'
import { registerBrowserAutoTuneSource, removeBrowserAutoTuneSource } from '../browser-preview/auto-tune-registry'

import { registerBrowserLocalTextModel } from '../browser-preview/local-text-imports'

const state = vi.hoisted(() => ({ enabled: true, imported: false, tested: [] as string[] }))
vi.mock('@/services/browser-preview/config', () => ({ browserPreviewEnabled: () => true }))
vi.mock('@/services/browser-preview/auto-tune', () => ({
  browserAutoTuneAvailable: () => true,
  browserAutoTuneTextModels: () => [{ id: 'LFM3', repo: 'LiquidAI/LFM3' }, { id: 'LFM3-1.7B', repo: 'LiquidAI/LFM3-1.7B' }],
  browserAutoTuneEnabled: () => state.enabled,
  setBrowserAutoTune: (enabled: boolean) => (state.enabled = enabled),
  browserAutoTuneTested: () => false,
  calibrateBrowserSampling: async (_update: unknown, model: { id: string; file?: File }) => { state.tested.push(model.file?.name ?? model.id) },
  calibrateBrowserMedia: async (probe: { model: string }) => { state.tested.push(probe.model) },
}))
afterEach(() => { vi.useRealTimers(); localStorage.clear(); removeBrowserAutoTuneSource('new-import') })

it('stops at the end of each Web pass and includes new models on manual restart', async () => {
  vi.useFakeTimers()
  const loop = startAutoTune()
  try {
    await vi.advanceTimersByTimeAsync(0)
    await loop
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B'])
    expect(state.enabled).toBe(false)
    expect(getAutoTuneProgress()).toMatchObject({ browserComplete: true, completed: 2 })
    const header = new ArrayBuffer(24)
    const view = new DataView(header)
    view.setUint32(0, 0x46554747, true)
    view.setUint32(4, 3, true)
    view.setBigUint64(8, 1n, true)
    view.setBigUint64(16, 1n, true)
    const name = 'Qwen3.5-4B-Q4_K_M.gguf'
    const file = { name, size: 64, lastModified: 1, slice: () => ({ arrayBuffer: async () => header }) } as File
    expect(await registerBrowserLocalTextModel(file)).toBeDefined()
    registerBrowserAutoTuneSource('new-import', () => ({
      task: 'image', model: 'FLUX', provider: 'web', key: 'new-image', candidates: [],
      components: [{ model: 'Qwen3-4B-Q4_K_M.gguf', role: 'encoder' }, { model: 'diffusion_pytorch_model.safetensors', role: 'vae' }],
      run: async () => new Blob(),
    }))
    await vi.advanceTimersByTimeAsync(0)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B'])
    state.enabled = true
    const restarted = startAutoTune()
    await vi.advanceTimersByTimeAsync(0)
    await restarted
    expect(state.enabled).toBe(false)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B', name, 'FLUX'])
    expect(getAutoTuneProgress().models.map(model => model.model)).toEqual(['LFM3', 'LFM3-1.7B', name, 'FLUX'])
    expect(getAutoTuneProgress().excluded).toEqual([])
    expect(getAutoTuneProgress().models[3].components?.map(component => component.model))
      .toEqual(['Qwen3-4B-Q4_K_M.gguf', 'diffusion_pytorch_model.safetensors'])
    await vi.advanceTimersByTimeAsync(6_000)
    expect(state.tested).toEqual(['LFM3', 'LFM3-1.7B', name, 'FLUX'])
  } finally {
    state.enabled = false
    await vi.advanceTimersByTimeAsync(3_000)
    await loop
  }
})
