import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { nativeImageStream } from './native-image-stream'
import { generateNativeImage } from './native-image-bridge'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { browserRuntime } from './runtime'
import { readBrowserMedia } from './media'
import { parseCreationReference } from '@/modules/engines/creation'

vi.mock('./native-image-bridge', () => ({ NATIVE_IMAGE_MODEL: 'flux-2-klein-4b-Q4_K_M', NATIVE_IMAGE_PROVIDER: 'novera-native-bridge', generateNativeImage: vi.fn() }))
vi.mock('./runtime', () => ({ browserRuntime: { snapshot: () => ({ phase: 'ready' }), unload: vi.fn().mockResolvedValue(undefined) } }))
vi.mock('@/hooks/useNoveraInstructions', () => ({ withNoveraInstructions: (_task: string, prompt: string) => prompt }))
beforeEach(() => {
  vi.stubGlobal('Blob', NodeBlob)
  useCreation.setState({ progress: {}, settings: { ...creationDefaults, width: 2048, height: 880, steps: 4, seed: 42, seedMode: 'fixed' } })
  useImageUpscale.setState({ enabled: true, factor: 2 })
  vi.mocked(generateNativeImage).mockReset()
})
afterEach(() => vi.unstubAllGlobals())

it('saves native media with provenance and the full Web duration before completing the chat', async () => {
  const bytes = Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,16,0,0,0,6,224])
  vi.mocked(generateNativeImage).mockResolvedValue({ image: new NodeBlob([bytes], { type: 'image/png' }) as Blob, timings: { nativeTotalMs: 29000 }, engineSha256: 'b'.repeat(64) })
  const finish = vi.fn(), chunks = []
  const reader = nativeImageStream('/image cube', 'native-success', undefined, finish).getReader()
  while (true) { const next = await reader.read(); if (next.done) break; chunks.push(next.value) }
  const file = chunks.find(chunk => chunk.type === 'file')!
  expect(file.type).toBe('file')
  if (file.type !== 'file') throw Error('missing file')
  const reference = parseCreationReference(file.url)!
  const saved = await readBrowserMedia('image', reference.name)
  expect(saved.metadata.provider).toBe('novera-native-bridge')
  expect(file.providerMetadata?.novera).toMatchObject({ nativeTotalMs: 29000, seed: 42, width: 2048, height: 880, steps: 4, upscaleFactor: 2 })
  expect(browserRuntime.unload).toHaveBeenCalled()
  expect(finish).toHaveBeenCalledTimes(1)
  expect(useCreation.getState().progress['native-success']).toBeUndefined()
})

it('releases the creation slot and finishes once after a native error', async () => {
  vi.mocked(generateNativeImage).mockRejectedValue(new Error('Native failure'))
  const finish = vi.fn()
  await expect(nativeImageStream('cube', 'native-error', undefined, finish).getReader().read()).rejects.toThrow('Native failure')
  expect(finish).toHaveBeenCalledTimes(1)
  expect(useCreation.getState().progress['native-error']).toBeUndefined()
})
