import { afterEach, expect, it, vi } from 'vitest'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { discoverBrowserAutoTuneProbes } from './auto-tune-registry'

vi.mock('./runtime', () => ({ browserRuntime: {} }))
vi.mock('./media', () => ({ saveBrowserLocalMedia: vi.fn() }))
vi.mock('@/hooks/useNoveraInstructions', () => ({ withNoveraInstructions: vi.fn() }))

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('registers accepted imports, retains their components and exposes only hardware-supported upscale tests while creation upscale is off', async () => {
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MEDIA', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MEDIA_PATH', `novera-runtime/${'a'.repeat(64)}`)
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MUSIC', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MUSIC_PATH', `novera-runtime/${'b'.repeat(64)}`)
  vi.stubGlobal('navigator', { gpu: { requestAdapter: async () => ({
    features: new Set(['shader-f16']), limits: { maxStorageBufferBindingSize: 2 ** 31 },
  }) } })
  useCreation.setState({ progress: {}, settings: { ...creationDefaults, width: 512, height: 512, steps: 4, browserGpuBudgetGiB: 4 } })
  useImageUpscale.setState({ enabled: false })
  const media = await import('./local-media')
  const music = await import('./local-music')
  expect(await discoverBrowserAutoTuneProbes()).toEqual([])
  expect(() => media.setBrowserImageFiles([new File(['x'], 'unknown.safetensors')])).toThrow()
  expect(await discoverBrowserAutoTuneProbes()).toEqual([])

  media.setBrowserImageFiles(media.imageComponentNames.map(name => new File(['x'], name, { lastModified: 1 })))
  music.setBrowserMusicFiles(music.musicComponentNames.map(name => new File(['x'], name, { lastModified: 1 })))
  media.setBrowserImageUpscaleFile({ name: 'RealESRGAN_x2plus.pth', size: 67061725, lastModified: 1 } as File)
  const probes = await discoverBrowserAutoTuneProbes()
  expect(probes.map(probe => probe.task)).toEqual(['image', 'music', 'image'])
  expect(probes[0].components?.map(component => component.role)).toEqual(['encoder', 'vae'])
  expect(probes[1].components).toContainEqual({ model: 'Qwen3-Embedding-0.6B-Q8_0.gguf', role: 'encoder' })
  expect(probes[2].candidates.map(profile => profile.settings.upscaleTilePixels)).toEqual([128, 256])
  expect(useImageUpscale.getState().enabled).toBe(false)

  // Removing the input removes its eligibility; it does not leave a stale test.
  media.setBrowserImageUpscaleFile()
  expect((await discoverBrowserAutoTuneProbes()).map(probe => probe.model)).not.toContain('RealESRGAN_x2plus.pth')
  // Replacing the current selection preserves the other accepted registration.
  media.setBrowserImageFiles(media.imageComponentNames.map(name => new File(['y'], name, { lastModified: 2 })))
  expect((await discoverBrowserAutoTuneProbes()).filter(probe => probe.task === 'image')).toHaveLength(2)
})
