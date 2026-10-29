import { describe, it, expect, vi } from 'vitest'
import { generateCloudMedia } from './cloud'
import {
  mediaModelPresets,
  mediaProviderDefinitions,
  mediaPreset,
} from '@/constants/mediaProviders'
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
const audio = () =>
  new Response(new Uint8Array([73, 68, 51, 1, 2, 3]), {
    headers: { 'content-type': 'audio/mpeg' },
  })
function options(provider: string, fetch: typeof globalThis.fetch) {
  return {
    provider: {
      provider,
      api_key: 'test-only',
      active: true,
      base_url: mediaProviderDefinitions.find((p) => p.id === provider)!.base,
    } as ModelProvider,
    preset: mediaModelPresets.find(
      (p) => p.provider === provider && p.task === 'music'
    )!,
    prompt: 'epic orchestral music',
    music: {
      duration: 180,
      seed: 42,
      instrumental: true,
      lyrics: '',
      quality: 'wav24',
    },
    signal: new AbortController().signal,
    fetch,
    progress: vi.fn(),
    wait: async () => {},
  }
}
describe('official cloud music contracts', () => {
  it('offers four audio providers with no MiniMax music and preserves other MiniMax capabilities', () => {
    expect(
      mediaModelPresets.filter((p) => p.task === 'music').map((p) => p.provider)
    ).toEqual(['elevenlabs', 'stability', 'fal', 'replicate'])
    expect(
      mediaModelPresets.some(
        (p) => p.provider === 'minimax' && p.task === 'video'
      )
    ).toBe(true)
  })
  it('uses ElevenMusic raw audio with its API key and explicit duration, without unsupported prompt seeds', async () => {
    const fetch = vi.fn().mockResolvedValue(audio())
    expect(await generateCloudMedia(options('elevenlabs', fetch))).toEqual({
      base64: 'SUQzAQID',
    })
    const [url, init] = fetch.mock.calls[0]
    expect(url).toContain('/v1/music?output_format=mp3_48000_192')
    expect(init.headers['xi-api-key']).toBe('test-only')
    expect(JSON.parse(init.body)).toEqual({
      model_id: 'music_v2_5',
      prompt: 'epic orchestral music',
      music_length_ms: 180000,
      force_instrumental: true,
    })
  })
  it('polls Stability Audio results through pending 202 responses, and saves audio bytes', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(json({ id: 'abc' }, 202))
      .mockResolvedValueOnce(new Response(null, { status: 202 }))
      .mockResolvedValueOnce(audio())
    expect(await generateCloudMedia(options('stability', fetch))).toEqual({
      base64: 'SUQzAQID',
    })
    expect(fetch.mock.calls[0][1].body.get('duration')).toBe('180')
    expect(fetch.mock.calls[0][1].body.get('model')).toBe('stable-audio-3')
    expect(fetch.mock.calls[2][0]).toMatch(/\/audio\/results\/abc$/)
  })
  it('passes fal musical settings and reads audio rather than an image result', async () => {
    const base = 'https://queue.fal.run'
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        json({ status_url: `${base}/status`, response_url: `${base}/result` })
      )
      .mockResolvedValueOnce(json({ status: 'COMPLETED' }))
      .mockResolvedValueOnce(
        json({ audio: { url: 'https://cdn.example.test/a.wav' } })
      )
    expect(await generateCloudMedia(options('fal', fetch))).toEqual({
      url: 'https://cdn.example.test/a.wav',
    })
    expect(JSON.parse(fetch.mock.calls[0][1].body)).toMatchObject({
      duration: 180,
      seed: 42,
      lyrics: '[inst]',
    })
  })
  it('uses the official Replicate Stable Audio schema and rejects unsupported durations before spending', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce(
        json({ urls: { get: 'https://api.replicate.com/v1/predictions/one' } })
      )
      .mockResolvedValueOnce(
        json({ status: 'succeeded', output: 'https://cdn.example.test/a.mp3' })
      )
    const o = options('replicate', fetch)
    expect(await generateCloudMedia(o)).toEqual({
      url: 'https://cdn.example.test/a.mp3',
    })
    expect(JSON.parse(fetch.mock.calls[0][1].body).input).toMatchObject({
      duration: 180,
      steps: 8,
      seed: 42,
    })
    fetch.mockClear()
    o.music.duration = 210
    await expect(generateCloudMedia(o)).rejects.toThrow('failed')
    expect(fetch).not.toHaveBeenCalled()
    expect(mediaPreset('replicate', 'minimax/music-2.5')).toBeUndefined()
  })
  it('refuses missing credentials and foreign authenticated polling origins', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        json({
          status_url: 'https://evil.example/status',
          response_url: 'https://evil.example/result',
        })
      )
    const o = options('fal', fetch)
    o.provider.api_key = ''
    await expect(generateCloudMedia(o)).rejects.toThrow('keyRequired')
    expect(fetch).not.toHaveBeenCalled()
    o.provider.api_key = 'test-only'
    await expect(generateCloudMedia(o)).rejects.toThrow('failed')
    expect(fetch).toHaveBeenCalledOnce()
  })
})
