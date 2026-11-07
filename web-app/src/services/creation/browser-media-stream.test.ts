import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { creationStream } from './stream'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
import { parseCreationReference } from '@/modules/engines/creation'
import { readBrowserMedia } from '../browser-preview/media'
import { invoke } from '@tauri-apps/api/core'

const transport = vi.hoisted(() => vi.fn())
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('../browser-preview/config', () => ({ browserPreviewEnabled: () => true }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => false }))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('@/hooks/useServiceHub', () => ({ getServiceHub: () => ({ providers: () => ({ fetch: () => transport }) }) }))
vi.mock('@/hooks/useModelProvider', () => ({ useModelProvider: { getState: () => ({ providers: [{ provider: 'fal', active: true, api_key: 'synthetic-test-key', base_url: 'https://queue.fal.run' }] }) } }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))

const models = { image: 'fal-ai/qwen-image-2512', music: 'fal-ai/ace-step', video: 'fal-ai/kling-video/v3/standard/text-to-video' }
beforeEach(() => {
  vi.stubGlobal('Blob', NodeBlob)
  transport.mockReset()
  vi.mocked(invoke).mockClear()
  useCreation.setState({ settings: { ...creationDefaults }, selections: { test: { image: { provider: 'fal', id: models.image }, music: { provider: 'fal', id: models.music }, video: { provider: 'fal', id: models.video } } }, modes: {}, sources: {}, progress: {} })
  useMusicCreation.setState({ settings: { ...musicDefaults, durationSeconds: 30 }, profiles: [], selections: {} })
})
afterEach(() => vi.unstubAllGlobals())

it.each(['image','music','video'] as const)('runs the %s queue protocol and persists its file before publishing a message', async task => {
  const bytes = task === 'image' ? Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1]) : new TextEncoder().encode(task === 'music' ? 'RIFF0000WAVEfmt synthetic fixture' : '0000ftypisom0000synthetic fixture')
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(bytes)))
  transport.mockImplementation(async (input: string, init?: RequestInit) => {
    if (init?.method === 'POST') return Response.json({ status_url: 'https://queue.fal.run/status', response_url: 'https://queue.fal.run/result', cancel_url: 'https://queue.fal.run/cancel' })
    if (input.endsWith('/status')) return Response.json({ status: 'COMPLETED' })
    return Response.json(task === 'image' ? { images: [{ url: 'https://media.example/result' }] } : { [task === 'music' ? 'audio' : 'video']: { url: 'https://media.example/result' } })
  })
  const finished = vi.fn()
  const reader = creationStream(task, 'Synthetic test, not a real generation', [{ id: 'u', role: 'user', parts: [{ type: 'text', text: 'Synthetic test' }] }], 'test', undefined, finished).getReader()
  const chunks = []
  for (;;) { const next = await reader.read(); if (next.done) break; chunks.push(next.value) }
  await vi.waitFor(() => expect(finished).toHaveBeenCalledOnce())
  const file = chunks.find(chunk => chunk.type === 'file')
  expect(file).toBeDefined()
  const reference = parseCreationReference(file!.url)!
  const record = await readBrowserMedia(reference.task, reference.name)
  expect(record.blob.size).toBe(bytes.length)
  expect(JSON.stringify(record.metadata)).not.toContain('synthetic-test-key')
  expect(transport.mock.calls[0][1].headers.Authorization).toBe('Key synthetic-test-key')
  expect(chunks.at(-1)).toMatchObject({ type: 'finish', finishReason: 'stop' })
  expect(invoke).not.toHaveBeenCalled()
})

it('keeps failed provider responses out of the saved conversation', async () => {
  transport.mockResolvedValue(new Response('', { status: 401 }))
  const reader = creationStream('image', 'Synthetic test', [], 'test', undefined, vi.fn()).getReader()
  expect((await reader.read()).value).toMatchObject({ type: 'start' })
  await expect(reader.read()).rejects.toThrow('keyRequired')
  expect(invoke).not.toHaveBeenCalled()
})
