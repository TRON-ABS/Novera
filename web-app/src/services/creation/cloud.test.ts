import { describe, expect, it, vi } from 'vitest'
import { generateCloudMedia } from './cloud'
import {
  mediaModelPresets,
  mediaProviderDefinitions,
  mediaModels,
} from '@/constants/mediaProviders'
import { predefinedProviders } from '@/constants/providers'
import {
  matchesModelFilter,
  modelModalities,
} from '@/modules/engines/model-modalities'

const cdn = 'https://cdn.example.test/result.png'
const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json' },
  })
const contracts = [
  {
    adapter: 'openai-image',
    provider: 'openai',
    path: '/images/generations',
    responses: [{ data: [{ b64_json: 'AAAA' }] }],
    result: { base64: 'AAAA' },
  },
  {
    adapter: 'google-image',
    provider: 'gemini',
    path: '/interactions',
    responses: [
      {
        steps: [
          { type: 'model_output', content: [{ type: 'video', data: 'AAAA' }] },
        ],
      },
    ],
    result: { base64: 'AAAA' },
  },
  {
    adapter: 'bfl',
    provider: 'bfl',
    path: '/flux-2-max',
    responses: [
      { polling_url: 'https://api.bfl.ai/v1/get_result?id=x' },
      { status: 'Ready', result: { sample: cdn } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'stability',
    provider: 'stability',
    path: '/stable-image/generate/ultra',
    responses: [{ image: 'AAAA' }],
    result: { base64: 'AAAA' },
  },
  {
    adapter: 'ideogram',
    provider: 'ideogram',
    path: '/v2/image/generate/ideogram-4-5',
    responses: [{ data: [{ url: cdn }] }],
    result: { url: cdn },
  },
  {
    adapter: 'xai-video',
    provider: 'xai',
    path: '/videos/generations',
    responses: [{ request_id: 'id' }, { status: 'done', video: { url: cdn } }],
    result: { url: cdn },
  },
  {
    adapter: 'runway',
    provider: 'runway',
    path: '/text_to_video',
    responses: [{ id: 'id' }, { status: 'SUCCEEDED', output: [cdn] }],
    result: { url: cdn },
  },
  {
    adapter: 'luma',
    provider: 'luma',
    path: '/generations',
    responses: [{ id: 'id' }, { state: 'completed', output: [{ url: cdn }] }],
    result: { url: cdn },
  },
  {
    adapter: 'ltx',
    provider: 'ltx',
    path: '/text-to-video',
    responses: [
      { id: 'id' },
      { status: 'completed', result: { video_url: cdn } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'fal',
    provider: 'fal',
    path: '/fal-ai/pika/v2.2/text-to-video',
    responses: [
      {
        status_url: 'https://queue.fal.run/job/status',
        response_url: 'https://queue.fal.run/job/result',
      },
      { status: 'COMPLETED' },
      { video: { url: cdn } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'replicate',
    provider: 'replicate',
    path: '/models/black-forest-labs/flux-2-max/predictions',
    responses: [
      { urls: { get: 'https://api.replicate.com/v1/predictions/id' } },
      { status: 'succeeded', output: [cdn] },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'leonardo',
    provider: 'leonardo',
    path: '/generations',
    responses: [
      { generationId: 'id' },
      {
        generations_by_pk: {
          status: 'COMPLETE',
          generated_images: [{ url: cdn }],
        },
      },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'krea',
    provider: 'krea',
    path: '/generate/image/krea/krea-3',
    responses: [
      { job_id: 'id' },
      { status: 'completed', result: { urls: [cdn] } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'minimax-video',
    provider: 'minimax',
    path: '/v2/video_generation',
    responses: [
      { task_id: 'id' },
      { task: { status: 'succeeded', content: { url: cdn } } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'minimax-image',
    provider: 'minimax',
    path: '/image_generation',
    responses: [{ data: { image_urls: [cdn] } }],
    result: { url: cdn },
  },
  {
    adapter: 'vidu',
    provider: 'vidu',
    path: '/img2video',
    responses: [
      { task_id: 'id' },
      { state: 'success', creations: [{ url: cdn }] },
    ],
    result: { url: cdn },
    image: true,
  },
  {
    adapter: 'pixverse',
    provider: 'pixverse',
    path: '/openapi/v2/video/text/generate',
    responses: [{ Resp: { video_id: 123 } }, { Resp: { status: 1, url: cdn } }],
    result: { url: cdn },
  },
  {
    adapter: 'adobe',
    provider: 'adobe-firefly',
    path: '/v4/images/generate-async',
    responses: [
      { statusUrl: 'https://firefly-api.adobe.io/v3/status/id' },
      { status: 'succeeded', result: { outputs: [{ image: { url: cdn } }] } },
    ],
    result: { url: cdn },
  },
  {
    adapter: 'byteplus-image',
    provider: 'byteplus',
    path: '/images/generations',
    responses: [{ data: [{ url: cdn }] }],
    result: { url: cdn },
  },
  {
    adapter: 'byteplus-video',
    provider: 'byteplus',
    path: '/contents/generations/tasks',
    responses: [
      { id: 'id' },
      { status: 'succeeded', content: { video_url: cdn } },
    ],
    result: { url: cdn },
  },
]
function options(adapter = 'runway') {
  const preset = mediaModelPresets.find((item) => item.adapter === adapter)!
  const provider = {
    ...predefinedProviders.find((item) => item.provider === preset.provider)!,
    api_key: 'test-only-key',
    custom_header: [{ header: 'x-api-key', value: 'test-client-id' }],
  } as ModelProvider
  return {
    provider,
    preset,
    prompt: 'test scene',
    signal: new AbortController().signal,
    progress: vi.fn(),
    wait: vi.fn().mockResolvedValue(undefined),
    fetch: vi.fn(),
  }
}

describe('cloud media contracts (mock HTTP, no paid generation)', () => {
  it.each(contracts)(
    'dispatches the $adapter API and decodes its result',
    async (contract) => {
      const o = options(contract.adapter)
      for (const response of contract.responses)
        o.fetch.mockResolvedValueOnce(json(response))
      const output = await generateCloudMedia({
        ...o,
        ...(contract.image ? { inputImage: 'data:image/png;base64,AAAA' } : {}),
      })
      expect(output).toEqual(contract.result)
      expect(o.fetch.mock.calls[0][0]).toContain(contract.path)
      for (const [url, init] of o.fetch.mock.calls) {
        expect(new URL(url).origin).toBe(new URL(o.provider.base_url!).origin)
        expect(url).not.toContain('test-only-key')
        expect(init.redirect).toBe('error')
      }
      if (contract.adapter === 'runway')
        expect(o.fetch.mock.calls[0][1].headers['X-Runway-Version']).toBe(
          '2024-11-06'
        )
      if (contract.adapter === 'vidu')
        expect(o.fetch.mock.calls[0][1].headers.Authorization).toBe(
          'Token test-only-key'
        )
      if (contract.adapter === 'pixverse')
        expect(o.fetch.mock.calls[0][1].headers['API-KEY']).toBe(
          'test-only-key'
        )
      if (contract.adapter === 'bfl')
        expect(o.fetch.mock.calls[0][1].headers['x-key']).toBe('test-only-key')
    }
  )
  it('rejects missing credentials, unsupported inputs and image-required models before any request', async () => {
    const o = options('runway')
    o.provider.api_key = ''
    await expect(generateCloudMedia(o)).rejects.toMatchObject({
      code: 'keyRequired',
    })
    expect(o.fetch).not.toHaveBeenCalled()
    const input = options('pixverse')
    await expect(
      generateCloudMedia({ ...input, inputImage: 'data:image/png;base64,AAAA' })
    ).rejects.toMatchObject({ code: 'inputUnsupported' })
    expect(input.fetch).not.toHaveBeenCalled()
    const vidu = options('vidu')
    await expect(generateCloudMedia(vidu)).rejects.toMatchObject({
      code: 'inputRequired',
    })
  })
  it('never retries a paid submit on 429 or uses a fallback API key', async () => {
    const o = options()
    o.provider.api_key_fallbacks = ['another-test-key']
    o.fetch.mockResolvedValueOnce(json({}, 429))
    await expect(generateCloudMedia(o)).rejects.toMatchObject({ status: 429 })
    expect(o.fetch).toHaveBeenCalledTimes(1)
  })
  it('will not send a key to a foreign polling or cancellation URL', async () => {
    const o = options('bfl')
    o.fetch.mockResolvedValueOnce(
      json({ polling_url: 'https://attacker.test/status' })
    )
    await expect(generateCloudMedia(o)).rejects.toMatchObject({
      code: 'failed',
    })
    expect(o.fetch).toHaveBeenCalledTimes(1)
  })
  it('does not silently return an image when the server reports failed moderation', async () => {
    const o = options('pixverse')
    o.fetch
      .mockResolvedValueOnce(json({ Resp: { video_id: 12 } }))
      .mockResolvedValueOnce(json({ Resp: { status: 7, url: cdn } }))
    await expect(generateCloudMedia(o)).rejects.toMatchObject({
      code: 'failed',
    })
  })
  it('attempts documented Runway cancellation on local abort without submitting again', async () => {
    const o = options()
    const abort = new AbortController()
    o.fetch
      .mockResolvedValueOnce(json({ id: 'id' }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
    o.wait.mockImplementationOnce(async () => {
      abort.abort()
      abort.signal.throwIfAborted()
    })
    await expect(
      generateCloudMedia({ ...o, signal: abort.signal })
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(o.fetch).toHaveBeenCalledTimes(2)
    expect(o.fetch.mock.calls[1][1].method).toBe('DELETE')
  })
  it('uses the minimum polling interval, then times out without re-submitting', async () => {
    const o = options()
    o.fetch
      .mockImplementation(async () => json({ status: 'RUNNING' }))
      .mockResolvedValueOnce(json({ id: 'id' }))
    await expect(generateCloudMedia(o)).rejects.toMatchObject({
      code: 'cloudTimeout',
    })
    expect(o.wait).toHaveBeenCalledWith(5000, o.signal)
    expect(
      o.fetch.mock.calls.filter(([, init]) => init.method === 'POST')
    ).toHaveLength(1)
  })
})
describe('model modality catalog', () => {
  it('defines one profile per provider and an implemented adapter for every preset', () => {
    expect(predefinedProviders).toHaveLength(41)
    expect(new Set(predefinedProviders.map((p) => p.provider)).size).toBe(41)
    const adapters = new Set(contracts.map((c) => c.adapter))
    for (const p of mediaModelPresets) {
      expect(adapters.has(p.adapter), p.id).toBe(true)
      expect(p.source).toMatch(/^https:\/\//)
      expect(p.id).not.toMatch(/sora|dall-e|gpt-image-1$/)
    }
    for (const p of mediaProviderDefinitions)
      expect(mediaModels(p.id).length, p.id).toBeGreaterThan(0)
  })
  it('distinguishes image understanding from image output and local from cloud', () => {
    const vision = { capabilities: ['completion', 'vision'] }
    expect(matchesModelFilter(vision, 'openai', 'image', 'all')).toBe(false)
    expect(matchesModelFilter(vision, 'openai', 'multimodal', 'cloud')).toBe(
      true
    )
    expect(matchesModelFilter(vision, 'transformers', 'text', 'local')).toBe(
      true
    )
    for (const p of mediaProviderDefinitions)
      for (const model of mediaModels(p.id))
        expect(modelModalities(model).outputs).not.toContain('text')
    expect(
      matchesModelFilter(
        { capabilities: ['embeddings'] },
        'openai',
        'all',
        'all'
      )
    ).toBe(false)
  })
})
