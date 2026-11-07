import 'fake-indexeddb/auto'
import { Blob as NodeBlob } from 'node:buffer'
import { IDBObjectStore } from 'fake-indexeddb'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { browserMediaCommand, readBrowserMedia } from './media'

beforeEach(() => { vi.stubGlobal('Blob', NodeBlob) })
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })
const samples = {
  image: { bytes: Uint8Array.from([137,80,78,71,13,10,26,10,0,0,0,13,73,72,68,82,0,0,0,1,0,0,0,1]), type: 'image/png' },
  music: { bytes: new TextEncoder().encode('RIFF0000WAVEfmt synthetic fixture'), type: 'audio/wav' },
  video: { bytes: new TextEncoder().encode('0000ftypisom0000synthetic fixture'), type: 'video/mp4' },
}
const payload = (id: string, task: keyof typeof samples) => ({ request: { id, task, provider: 'fal', model: 'test-fixture', prompt: 'Synthetic fixture, not generated', url: 'https://media.example/result' } })

it.each(['image','music','video'] as const)('stores %s bytes durably and reads them through their stable reference', async task => {
  const id = crypto.randomUUID()
  const fetch = vi.fn().mockResolvedValue(new Response(samples[task].bytes, { headers: { 'content-type': 'application/octet-stream' } }))
  vi.stubGlobal('fetch', fetch)
  await browserMediaCommand('creation_cloud_prepare', { id })
  try {
    const saved = await browserMediaCommand('creation_cloud_save', payload(id, task)) as { name: string; mediaType: string }
    expect(saved.mediaType).toBe(samples[task].type)
    const record = await readBrowserMedia(task, saved.name)
    expect(Array.from(new Uint8Array(await record.blob.arrayBuffer()))).toEqual(Array.from(samples[task].bytes))
    expect(record.metadata.model).toBe('test-fixture')
    expect(fetch.mock.calls[0][1]).toMatchObject({ credentials: 'omit', referrerPolicy: 'no-referrer' })
    expect(fetch.mock.calls[0][1].headers).toBeUndefined()
    await expect(readBrowserMedia(task === 'image' ? 'video' : 'image', saved.name)).rejects.toThrow()
  } finally { await browserMediaCommand('creation_cloud_release', { id }) }
})

it('rejects a CORS/download failure without claiming a saved file', async () => {
  const id = crypto.randomUUID()
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')))
  await browserMediaCommand('creation_cloud_prepare', { id })
  try { await expect(browserMediaCommand('creation_cloud_save', payload(id, 'image'))).rejects.toThrow('Failed to fetch') }
  finally { await browserMediaCommand('creation_cloud_release', { id }) }
})

it('rejects mismatched bytes and interrupted saves', async () => {
  const id = crypto.randomUUID()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('<html>error</html>')))
  await browserMediaCommand('creation_cloud_prepare', { id })
  try {
    await expect(browserMediaCommand('creation_cloud_save', payload(id, 'image'))).rejects.toThrow('compatible')
    await browserMediaCommand('creation_cancel', { id })
    await expect(browserMediaCommand('creation_cloud_save', payload(id, 'image'))).rejects.toThrow()
  } finally { await browserMediaCommand('creation_cloud_release', { id }) }
})

it('propagates a full or unavailable media database', async () => {
  const id = crypto.randomUUID()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(samples.image.bytes)))
  await browserMediaCommand('creation_cloud_prepare', { id })
  vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(() => { throw new DOMException('Quota exceeded', 'QuotaExceededError') })
  try { await expect(browserMediaCommand('creation_cloud_save', payload(id, 'image'))).rejects.toThrow('Quota exceeded') }
  finally { await browserMediaCommand('creation_cloud_release', { id }) }
})

it('bounds untrusted downloads before buffering and keeps one active job', async () => {
  const id = crypto.randomUUID()
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { headers: { 'content-length': '268435457' } })))
  await browserMediaCommand('creation_cloud_prepare', { id })
  try {
    await expect(browserMediaCommand('creation_cloud_prepare', { id: 'second' })).rejects.toThrow('déjà')
    await expect(browserMediaCommand('creation_cloud_save', payload(id, 'image'))).rejects.toThrow('volumineux')
  } finally { await browserMediaCommand('creation_cloud_release', { id }) }
})
