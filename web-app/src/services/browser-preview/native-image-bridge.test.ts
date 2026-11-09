import { File as NodeFile } from 'node:buffer'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { connectNativeImageBridge, disconnectNativeImageBridge, generateNativeImage, parseNativeConnection, useNativeImageBridge } from './native-image-bridge'

const id = 'ecba0c42-8685-40fe-8116-382bbfa5cfb5'
const health = { version: '1.0.1', model: 'flux-2-klein-4b-Q4_K_M', upscaleX2: true, engineSha256: 'b'.repeat(64) }
const connection = () => ({ version: 1 as const, origin: location.origin, endpoint: 'http://127.0.0.1:49123', token: 'a'.repeat(64) })
const parameters = { prompt: 'cube', width: 2048, height: 880, steps: 4, seed: 42, upscale: true }
const json = (value: unknown, status = 200) => new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } })

beforeEach(() => { vi.spyOn(crypto, 'randomUUID').mockReturnValue(id); useNativeImageBridge.setState({ connection: connection(), health }) })
afterEach(() => { disconnectNativeImageBridge(); vi.unstubAllGlobals(); vi.restoreAllMocks() })

it('only accepts a loopback connection paired with this exact Web origin', () => {
  expect(parseNativeConnection(connection(), location.origin).endpoint).toBe(connection().endpoint)
  for (const change of [{ endpoint: 'https://remote.example' }, { endpoint: 'http://192.168.1.2:49123' }, { endpoint: 'http://127.0.0.1:49123/private' }, { endpoint: 'http://name:secret@127.0.0.1:49123' }, { origin: 'https://another.example' }, { token: 'short' }]) {
    expect(() => parseNativeConnection({ ...connection(), ...change }, location.origin)).toThrow()
  }
})

it('authenticates a session connection without cookies or credential persistence', async () => {
  const fetcher = vi.fn().mockResolvedValue(json(health)); vi.stubGlobal('fetch', fetcher)
  const file = new NodeFile([JSON.stringify(connection())], 'connection.json') as unknown as File
  await connectNativeImageBridge(file)
  expect(useNativeImageBridge.getState().health).toEqual(health)
  expect(fetcher).toHaveBeenCalledWith(connection().endpoint+'/v1/health', expect.objectContaining({ credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer', headers: { Authorization: `Bearer ${connection().token}` } }))
  disconnectNativeImageBridge()
  expect(useNativeImageBridge.getState().connection).toBeUndefined()
})

it('retrieves the genuine PNG with requested dimensions and native timings', async () => {
  const fetcher = vi.fn()
    .mockResolvedValueOnce(json({ id }, 202))
    .mockResolvedValueOnce(json({ id, status: 'complete', stage: 'complete', progress: 100, width: 4096, height: 1760, timings: { nativeTotalMs: 29000, diffusionMs: 12000, invalid: 'no' } }))
    .mockResolvedValueOnce(new Response('fixture PNG body', { headers: { 'Content-Type': 'image/png' } }))
  vi.stubGlobal('fetch', fetcher)
  const progress = vi.fn()
  const result = await generateNativeImage(parameters, new AbortController().signal, progress)
  expect(result.timings).toEqual({ nativeTotalMs: 29000, diffusionMs: 12000 })
  expect(result.image.size).toBeGreaterThan(0)
  expect(JSON.parse(fetcher.mock.calls[0][1].body)).toEqual({ id, ...parameters })
  expect(progress).toHaveBeenCalledWith('complete', 100)
})

it('rejects a successful engine response that omitted the requested x2', async () => {
  const fetcher = vi.fn().mockResolvedValueOnce(json({ id }, 202)).mockResolvedValueOnce(json({ id, status: 'complete', width: 2048, height: 880 })).mockResolvedValue(json({ id, status: 'cancelled' }))
  vi.stubGlobal('fetch', fetcher)
  await expect(generateNativeImage(parameters, new AbortController().signal, vi.fn())).rejects.toThrow('Dimensions')
  expect(fetcher).toHaveBeenLastCalledWith(connection().endpoint+`/v1/jobs/${id}`, expect.objectContaining({ method: 'DELETE' }))
})

it('cancels a known client id even when the POST response is lost', async () => {
  const fetcher = vi.fn().mockRejectedValueOnce(new TypeError('Interrupted connection')).mockResolvedValue(json({ id, status: 'cancelled' }))
  vi.stubGlobal('fetch', fetcher)
  await expect(generateNativeImage(parameters, new AbortController().signal, vi.fn())).rejects.toThrow('Interrupted')
  expect(fetcher).toHaveBeenLastCalledWith(connection().endpoint+`/v1/jobs/${id}`, expect.objectContaining({ method: 'DELETE' }))
})

it('does not start a native process after cancellation', async () => {
  const fetcher = vi.fn(); vi.stubGlobal('fetch', fetcher)
  const stop = new AbortController(); stop.abort(new DOMException('cancel', 'AbortError'))
  await expect(generateNativeImage(parameters, stop.signal, vi.fn())).rejects.toThrow('cancel')
  expect(fetcher).not.toHaveBeenCalled()
})
