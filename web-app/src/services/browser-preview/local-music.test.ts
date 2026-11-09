import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { waitFor } from '@testing-library/react'
import { browserLocalMusicStream, musicComponentNames, setBrowserMusicFiles } from './local-music'
import { musicWav } from './music-wav'
import { browserMusicTiming, browserMusicPerformance } from './music-performance'
import { musicDefaults } from '@/modules/engines/music'
import { useCreation } from '@/hooks/useCreation'
import { readBrowserMedia } from './media'
import { parseCreationReference } from '@/modules/engines/creation'

vi.mock('./runtime', () => ({ browserRuntime: { snapshot: () => ({ phase: 'ready' }), unload: vi.fn().mockResolvedValue(undefined) } }))
class TestWorker {
  static instances: TestWorker[] = []
  onmessage?: ((event: { data: unknown }) => void) | null
  onerror?: (() => void) | null
  terminate = vi.fn()
  postMessage = vi.fn()
  constructor() { TestWorker.instances.push(this) }
}
const settings = { ...musicDefaults, durationSeconds: 10, durationAuto: false, seedMode: 'fixed' as const }
const files = () => musicComponentNames.map(name => new File(['test-model'], name))
beforeEach(() => {
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MUSIC', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MUSIC_PATH', `novera-runtime/${'b'.repeat(64)}`)
  vi.stubGlobal('Blob', NodeBlob); vi.stubGlobal('Worker', TestWorker)
  TestWorker.instances = []; useCreation.setState({ progress: {} })
})
afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('requires the actual four model files before claiming the GPU', async () => {
  await expect(browserLocalMusicStream('Piano', 'music-test', settings, undefined, vi.fn()).getReader().read()).rejects.toThrow('quatre fichiers')
  expect(TestWorker.instances).toHaveLength(0)
})

it.each([
  ['mp3-320', 320, 'audio/mpeg', '.mp3'],
  ['mp3-128', 128, 'audio/mpeg', '.mp3'],
  ['wav32', 0, 'audio/wav', '.wav'],
] as const)('persists %s before emitting its conversation reference and preserves French lyrics', async (quality, bitrate, mime, extension) => {
  // A completed prior job leaves an undefined progress entry in the shared store.
  useCreation.setState({ progress: { 'previous-job': undefined } })
  setBrowserMusicFiles(files())
  const finish = vi.fn()
  const reader = browserLocalMusicStream('French piano and guitar song.', 'music-test', { ...settings, quality, instrumental: false, lyrics: '[Verse]\nBonjour le monde', language: 'fr' }, undefined, finish).getReader()
  const first = reader.read()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  const worker = TestWorker.instances[0]
  expect(worker.postMessage).toHaveBeenCalledWith(expect.objectContaining({ runtimeUrl: expect.stringContaining(`novera-runtime/${'b'.repeat(64)}/novera-music.mjs`), lyrics: '[Verse]\nBonjour le monde', language: 'fr', seconds: 10, seed: 42, bitrate }))
  worker.onmessage?.({ data: { type: 'music-timing', phase: 'planningMs', milliseconds: 1200 } })
  worker.onmessage?.({ data: { type: 'music-timing', phase: 'synthesisMs', milliseconds: NaN } })
  const audio = bitrate ? new Blob([new Uint8Array([0xff, 0xfb, 0xb4, 0x04])], { type: mime }) : musicWav(new Float32Array([0.2, -0.2]), 1, 48000)
  worker.onmessage?.({ data: { type: 'complete', audio, seconds: 1 / 48000 } })
  expect((await first).value).toMatchObject({ type: 'start' })
  const chunk = (await reader.read()).value as { url: string }
  expect(chunk).toMatchObject({ providerMetadata: { novera: { planningMs: 1200 } } })
  expect(JSON.stringify(chunk)).not.toContain('synthesisMs')
  const reference = parseCreationReference(chunk.url)!
  const record = await readBrowserMedia('music', reference.name)
  expect(record.metadata).toMatchObject({ provider: 'novera-browser-music', model: 'acestep-v15-turbo-Q4_K_M', prompt: 'French piano and guitar song.' })
  expect(reference.name.endsWith(extension)).toBe(true)
  expect(record.blob.type).toBe(mime)
  expect((await reader.read()).value).toMatchObject({ type: 'finish' })
  expect((await reader.read()).done).toBe(true)
  expect(finish).toHaveBeenCalledTimes(1); expect(worker.terminate).toHaveBeenCalled()
  expect(useCreation.getState().progress).toEqual({})
})

it('bounds stored musical timings and ignores unknown or inherited phase names', () => {
  for (const [phase, ms] of [['totalMs', 10], ['__proto__', 1], ['planningMs', -1], ['planningMs', Infinity], ['planningMs', '20'], ['planningMs', 604800001]]) expect(browserMusicTiming(phase, ms)).toEqual({})
  expect(browserMusicPerformance({ planningMs: 2000, audioDecodeMs: 0, totalMs: 50 })).toEqual([{ label: 'Chargement et planification musicale', ms: 2000 }, { label: 'Chargement et décodage audio', ms: 0 }])
})

it('cancels the owning worker and ignores a queued late completion', async () => {
  setBrowserMusicFiles(files())
  const abort = new AbortController(), finish = vi.fn()
  const reader = browserLocalMusicStream('Piano without vocals', 'music-cancel', settings, abort.signal, finish).getReader()
  const rejected = expect(reader.read()).rejects.toThrow()
  await waitFor(() => expect(TestWorker.instances).toHaveLength(1))
  const worker = TestWorker.instances[0], queued = worker.onmessage
  abort.abort(); await rejected
  queued?.({ data: { type: 'complete', audio: musicWav(new Float32Array(2), 1, 48000), seconds: 1 / 48000 } })
  expect(worker.terminate).toHaveBeenCalled(); expect(finish).toHaveBeenCalledTimes(1)
  expect(useCreation.getState().progress).toEqual({})
})

it('rejects unsupported settings and oversized UTF-8 lyrics before loading', async () => {
  setBrowserMusicFiles(files())
  for (const patch of [{ steps: 20 }, { durationSeconds: 60 }, { instrumental: false, lyrics: 'é'.repeat(257) }]) {
    await expect(browserLocalMusicStream('Piano', 'music-invalid', { ...settings, ...patch }, undefined, vi.fn()).getReader().read()).rejects.toThrow()
  }
  expect(TestWorker.instances).toHaveLength(0)
})
