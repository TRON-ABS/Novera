import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { browserLocalImageStream, imageComponentNames, setBrowserImageFiles } from './local-media'
import { useCreation } from '@/hooks/useCreation'
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
  vi.stubGlobal('Blob', NodeBlob)
  vi.stubGlobal('Worker', TestWorker)
  TestWorker.instances = []
  useCreation.setState({ progress: {} })
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
  expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ files: expect.any(Array), prompt: 'cube' }))
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
