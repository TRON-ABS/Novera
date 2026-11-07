import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { browserLocalImageStream, imageComponentNames, setBrowserImageFiles, setBrowserImageUpscaleFile } from './local-media'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { readBrowserMedia } from './media'
import { parseCreationReference } from '@/modules/engines/creation'

vi.mock('./runtime', () => ({ browserRuntime: { snapshot: () => ({ phase: 'ready' }), unload: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('@/hooks/useNoveraInstructions', () => ({ withNoveraInstructions: (_task: string, prompt: string) => prompt }))
class TestWorker {
  static instances: TestWorker[] = []
  onmessage?: (event: { data: unknown }) => void
  onerror?: () => void
  terminate = vi.fn()
  postMessage = vi.fn()
  constructor() { TestWorker.instances.push(this) }
}
const files = () => imageComponentNames.map(name => new File(['test-model'], name))
const png = () => new NodeBlob([Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1])], { type: 'image/png' })
beforeEach(() => {
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MEDIA', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MEDIA_PATH', `novera-runtime/${'a'.repeat(64)}`)
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('Worker', TestWorker)
  TestWorker.instances = []
  useImageUpscale.setState({ enabled: false, factor: 2 })
  setBrowserImageUpscaleFile()
  useCreation.setState({ progress: {}, settings: { ...creationDefaults, width: 256, height: 256, steps: 4, seed: 42, seedMode: 'fixed' } })
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('requires actual model files before starting a local image job', async () => {
  const finish = vi.fn()
  await expect(browserLocalImageStream('cube', 'local-test', undefined, finish).getReader().read()).rejects.toThrow('trois fichiers')
  expect(TestWorker.instances).toHaveLength(0)
  expect(finish).toHaveBeenCalledTimes(1)
})

it('commits local bytes and model provenance before emitting a conversation file', async () => {
  setBrowserImageFiles(files())
  const finish = vi.fn()
  const stream = browserLocalImageStream('/image cube', 'local-test', undefined, finish)
  const reader = stream.getReader()
  const first = reader.read()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  const worker = TestWorker.instances[0]
  expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ runtimeUrl: expect.stringContaining(`novera-runtime/${'a'.repeat(64)}/novera-diffusion.mjs`) }))
  expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ files: expect.any(Array), prompt: 'cube', width: 256, height: 256, steps: 4, seed: 42 }))
  worker.onmessage?.({ data: { type: 'complete', image: png() } })
  expect((await first).value).toMatchObject({ type: 'start' })
  const chunk = (await reader.read()).value as { type: string; url: string }
  expect(chunk.type).toBe('file')
  const reference = parseCreationReference(chunk.url)!
  const record = await readBrowserMedia('image', reference.name)
  expect(record.metadata).toMatchObject({ provider: 'novera-browser', model: 'flux-2-klein-4b-Q4_K_M', prompt: 'cube' })
  expect(record.blob.size).toBe(png().size)
  expect((await reader.read()).value).toMatchObject({ type: 'finish' })
  expect((await reader.read()).done).toBe(true)
  expect(worker.terminate).toHaveBeenCalled()
  expect(finish).toHaveBeenCalledTimes(1)
  expect(useCreation.getState().progress).toEqual({})
})

it('passes full panorama dimensions to the worker and refuses invalid resolutions before loading', async () => {
  setBrowserImageFiles(files())
  useCreation.setState({ settings: { ...creationDefaults, width: 2048, height: 880, steps: 4, seedMode: 'fixed', browserGpuBudgetGiB: 6 } })
  const stop = new AbortController()
  const reader = browserLocalImageStream('Panoramic valley', 'panorama', stop.signal, vi.fn()).getReader()
  const rejected = expect(reader.read()).rejects.toThrow()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  expect(TestWorker.instances[0].postMessage).toHaveBeenCalledWith(expect.objectContaining({ width: 2048, height: 880, steps: 4, seed: 42, gpuBudgetGiB: 6 }))
  stop.abort(); await rejected
  useCreation.getState().setSettings({ width: 4096 })
  await expect(browserLocalImageStream('Panorama', 'invalid', undefined, vi.fn()).getReader().read()).rejects.toThrow('Dimensions')
  expect(TestWorker.instances).toHaveLength(1)
})

it('terminates a cancelled worker, releases the slot and never emits its late result', async () => {
  setBrowserImageFiles(files())
  const controller = new AbortController()
  const finish = vi.fn()
  const reader = browserLocalImageStream('cube', 'local-cancel', controller.signal, finish).getReader()
  const result = reader.read()
  const rejected = expect(result).rejects.toThrow()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  controller.abort()
  await rejected
  expect(TestWorker.instances[0].terminate).toHaveBeenCalled()
  expect(finish).toHaveBeenCalledTimes(1)
  expect(useCreation.getState().progress).toEqual({})
  expect(() => setBrowserImageFiles(files())).not.toThrow()
})

it('requires the exact x2 model and uses a separate cancellable worker before committing any output', async () => {
  setBrowserImageFiles(files())
  useImageUpscale.setState({ enabled: true, factor: 2 })
  await expect(browserLocalImageStream('valley', 'upscale', undefined, vi.fn()).getReader().read()).rejects.toThrow('fichier officiel ×2')
  expect(TestWorker.instances).toHaveLength(0)
  expect(() => setBrowserImageUpscaleFile(new File(['bad'], 'RealESRGAN_x2plus.pth'))).toThrow('officiel')
  const model = new File([new Uint8Array(67061725)], 'RealESRGAN_x2plus.pth')
  setBrowserImageUpscaleFile(model)
  const abort = new AbortController()
  const result = expect(browserLocalImageStream('valley', 'upscale', abort.signal, vi.fn()).getReader().read()).rejects.toThrow()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  expect(TestWorker.instances[0].postMessage).toHaveBeenCalledWith(expect.objectContaining({ files: expect.arrayContaining(files()) }))
  expect(TestWorker.instances[0].postMessage.mock.calls[0][0]).not.toHaveProperty('upscaleFile')
  TestWorker.instances[0].onmessage?.({ data: { type: 'complete', image: png() } })
  await waitFor(() => expect(TestWorker.instances).toHaveLength(2))
  expect(TestWorker.instances[0].terminate).toHaveBeenCalled()
  expect(TestWorker.instances[1].postMessage).toHaveBeenCalledWith(expect.objectContaining({ upscaleFile: model, files: [model], upscaleOnly: true, inputImage: expect.any(NodeBlob) }))
  abort.abort(); await result
  expect(TestWorker.instances[1].terminate).toHaveBeenCalled()
  useImageUpscale.setState({ factor: 4 })
  await expect(browserLocalImageStream('valley', 'upscale', undefined, vi.fn()).getReader().read()).rejects.toThrow('×4 reste indisponible')
})

it('retains both phase timings and never regresses decoding progress during x2', async () => {
  setBrowserImageFiles(files())
  const model = new File(['stub'], 'RealESRGAN_x2plus.pth')
  Object.defineProperty(model, 'size', { value: 67061725 })
  setBrowserImageUpscaleFile(model)
  useImageUpscale.setState({ enabled: true, factor: 2 })
  const finish = vi.fn()
  const reader = browserLocalImageStream('valley', 'x2-complete', undefined, finish).getReader()
  const first = reader.read()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  const base = TestWorker.instances[0]
  base.onmessage?.({ data: { type: 'engine-log', level: 1, message: 'decoding 1 latents' } })
  base.onmessage?.({ data: { type: 'engine-progress', step: 4, total: 4 } })
  expect(useCreation.getState().progress['x2-complete']?.progress).toBe(85)
  base.onmessage?.({ data: { type: 'complete', image: png(), timings: { generationMs: 1000, encodingMs: 10 } } })
  await waitFor(() => expect(TestWorker.instances).toHaveLength(2))
  const x2 = TestWorker.instances[1]
  x2.onmessage?.({ data: { type: 'stage', stage: 'generating', progress: 90 } })
  x2.onmessage?.({ data: { type: 'engine-progress', step: 1, total: 4 } })
  expect(useCreation.getState().progress['x2-complete']?.progress).toBe(90)
  x2.onmessage?.({ data: { type: 'complete', image: png(), timings: { upscalingMs: 2000 } } })
  expect((await first).value).toMatchObject({ type: 'start' })
  expect((await reader.read()).value).toMatchObject({ type: 'file', providerMetadata: { novera: { generationMs: 1000, encodingMs: 10, upscalingMs: 2000, upscaleFactor: 2 } } })
  await reader.read(); await reader.read()
  expect(x2.terminate).toHaveBeenCalled()
  expect(finish).toHaveBeenCalledTimes(1)
})
