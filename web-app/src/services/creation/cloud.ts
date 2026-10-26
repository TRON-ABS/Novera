/* eslint-disable @typescript-eslint/no-explicit-any */
import type { MediaPreset } from '@/constants/mediaProviders'
import { providerRemoteApiKeyChain } from '@/lib/provider-api-keys'

export type CloudMedia = { url?: string; base64?: string }
export class CloudCreationError extends Error {
  constructor(
    public code:
      | 'keyRequired'
      | 'inputUnsupported'
      | 'inputRequired'
      | 'failed'
      | 'cloudTimeout'
      | 'adobeCredentials',
    public status?: number
  ) {
    super(code)
  }
}
type Options = {
  provider: ModelProvider
  preset: MediaPreset
  prompt: string
  inputImage?: string
  signal: AbortSignal
  fetch: typeof fetch
  progress: (value: number) => void
  wait?: (ms: number, signal: AbortSignal) => Promise<void>
}
function pause(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => {
      clearTimeout(timer)
      signal.removeEventListener('abort', abort)
      reject(new DOMException('Aborted', 'AbortError'))
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', abort)
      resolve()
    }, ms)
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
}
/** Use a recipe for the actual generation API, never chat completions or a paid fallback. */
export async function generateCloudMedia(o: Options): Promise<CloudMedia> {
  const { provider, preset: p, inputImage: image, signal } = o
  const key = providerRemoteApiKeyChain(provider)[0]
  if (!key) throw new CloudCreationError('keyRequired')
  if (
    image &&
    (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=\r\n]+$/.test(image) ||
      image.length > 32 * 1024 * 1024)
  )
    throw new CloudCreationError('inputUnsupported')
  if (image && !p.inputImage) throw new CloudCreationError('inputUnsupported')
  if (!image && p.requiresImage) throw new CloudCreationError('inputRequired')
  const prompt = o.prompt.replace(/^\/(?:image|video)\s*/i, '').trim()
  if (!prompt || prompt.length > 32_000) throw new CloudCreationError('failed')
  let base = (provider.base_url ?? '').replace(/\/+$/, '')
  if (provider.provider === 'gemini') base = base.replace(/\/openai$/, '')
  if (p.adapter === 'minimax-video') base = base.replace(/\/v1$/, '')
  const origin = new URL(base).origin
  if (new URL(base).protocol !== 'https:')
    throw new CloudCreationError('failed')
  let headers: Record<string, string> = { Authorization: `Bearer ${key}` }
  if (p.adapter === 'bfl') headers = { 'x-key': key }
  if (p.adapter === 'google-image') headers = { 'x-goog-api-key': key }
  if (p.adapter === 'ideogram') headers = { 'Api-Key': key }
  if (p.adapter === 'vidu') headers = { Authorization: `Token ${key}` }
  if (p.adapter === 'fal') headers = { Authorization: `Key ${key}` }
  if (p.adapter === 'pixverse')
    headers = { 'API-KEY': key, 'Ai-trace-id': crypto.randomUUID() }
  if (p.adapter === 'runway') headers['X-Runway-Version'] = '2024-11-06'
  if (p.adapter === 'adobe') {
    const clientId = provider.custom_header?.find(
      (item) => item.header.toLowerCase() === 'x-api-key'
    )?.value
    if (!clientId) throw new CloudCreationError('adobeCredentials')
    headers['x-api-key'] = clientId
  }
  // Provider-returned polling URLs may carry a credential only on the original HTTPS origin.
  function safe(url: string) {
    const parsed = new URL(url, `${base}/`)
    if (parsed.origin !== origin || parsed.username || parsed.password)
      throw new CloudCreationError('failed')
    return parsed.href
  }
  async function request(
    path: string,
    body?: unknown,
    method?: string,
    detached = false
  ): Promise<any> {
    const url = safe(path.startsWith('https://') ? path : `${base}${path}`)
    const multipart = body instanceof FormData
    const response = await o.fetch(url, {
      method: method ?? (body === undefined ? 'GET' : 'POST'),
      headers: {
        ...headers,
        ...(!multipart && body !== undefined
          ? { 'Content-Type': 'application/json' }
          : {}),
      },
      body:
        body === undefined
          ? undefined
          : multipart
            ? body
            : JSON.stringify(body),
      signal: detached ? AbortSignal.timeout(10_000) : signal,
      redirect: 'error',
    })
    if (!response.ok)
      throw new CloudCreationError(
        response.status === 401 || response.status === 403
          ? 'keyRequired'
          : 'failed',
        response.status
      )
    return response.status === 204 ? {} : response.json()
  }
  let cancel: (() => Promise<unknown>) | undefined
  let completed = false
  async function poll(
    path: string,
    get: (data: any) => CloudMedia | undefined,
    state: (data: any) => unknown = (data) => data.status
  ): Promise<CloudMedia> {
    const started = Date.now()
    for (
      let count = 0;
      count < 360 && Date.now() - started < 30 * 60_000;
      count++
    ) {
      await (o.wait ?? pause)(5000, signal)
      signal.throwIfAborted()
      const data = await request(path)
      const status = String(state(data)).toLowerCase()
      if (
        [
          'failed',
          'failure',
          'error',
          'cancelled',
          'canceled',
          'expired',
          'moderated',
          'timeout',
          '7',
          '8',
        ].includes(status) ||
        /moderated|rejected/.test(status)
      )
        throw new CloudCreationError('failed')
      const result = get(data)
      if (result?.url || result?.base64) return result
      o.progress(Math.min(95, 5 + count * 2))
    }
    throw new CloudCreationError('cloudTimeout')
  }
  const media = (data: any): CloudMedia | undefined =>
    data?.b64_json
      ? { base64: data.b64_json }
      : typeof data?.url === 'string'
        ? { url: data.url }
        : undefined
  let output: CloudMedia | undefined
  try {
    signal.throwIfAborted()
    switch (p.adapter) {
      case 'openai-image': {
        let result
        if (image && provider.provider === 'openai') {
          const blob = await (await fetch(image, { signal })).blob()
          const form = new FormData()
          form.set('model', p.id)
          form.set('prompt', prompt)
          form.set(
            'image',
            blob,
            `input.${blob.type.includes('png') ? 'png' : 'jpg'}`
          )
          result = await request('/images/edits', form)
        } else if (image && provider.provider === 'xai')
          result = await request('/images/edits', {
            model: p.id,
            prompt,
            image: { type: 'image_url', url: image },
          })
        else
          result = await request('/images/generations', {
            model: p.id,
            prompt,
            n: 1,
          })
        output = media(result.data?.[0])
        break
      }
      case 'google-image': {
        const input: any[] = [{ type: 'text', text: prompt }]
        if (image) {
          const match = /^data:(image\/[\w.+-]+);base64,(.+)$/s.exec(image)
          if (!match) throw new CloudCreationError('inputUnsupported')
          input.push({ type: 'image', mime_type: match[1], data: match[2] })
        }
        const extract = (data: any) => {
          const parts =
            data.steps
              ?.filter((step: any) => step.type === 'model_output')
              .flatMap((step: any) => step.content ?? []) ?? []
          const part = parts.find(
            (part: any) => part.type === p.task && part.data
          )
          return part ? { base64: part.data } : undefined
        }
        const result = await request('/interactions', {
          model: p.id,
          input,
          ...(p.task === 'video' ? { background: true } : {}),
        })
        output = extract(result)
        if (!output && result.id)
          output = await poll(
            `/interactions/${encodeURIComponent(result.id)}`,
            extract
          )
        break
      }
      case 'bfl': {
        const result = await request(`/${p.id}`, {
          prompt,
          ...(image ? { input_image: image } : {}),
        })
        if (!result.polling_url) throw new CloudCreationError('failed')
        output = await poll(safe(result.polling_url), (data) =>
          data.status === 'Ready' ? { url: data.result?.sample } : undefined
        )
        break
      }
      case 'stability': {
        const form = new FormData()
        form.set('prompt', prompt)
        form.set('output_format', 'png')
        headers.Accept = 'application/json'
        const result = await request(`/${p.id}`, form)
        output = result.image ? { base64: result.image } : undefined
        break
      }
      case 'ideogram': {
        let result
        if (image) {
          const blob = await (await fetch(image, { signal })).blob()
          const form = new FormData()
          form.set('prompt', prompt)
          form.set('image', blob, 'input.png')
          result = await request(`/v2/image/precise-edit/${p.id}`, form)
        } else result = await request(`/v2/image/generate/${p.id}`, { prompt })
        output = media(result.data?.[0])
        break
      }
      case 'xai-video': {
        const result = await request('/videos/generations', {
          model: p.id,
          prompt,
          duration: 5,
          ...(image ? { image: { url: image } } : {}),
        })
        output = await poll(
          `/videos/${encodeURIComponent(result.request_id)}`,
          (data) => (data.status === 'done' ? media(data.video) : undefined)
        )
        break
      }
      case 'runway': {
        const result = await request(
          image ? '/image_to_video' : '/text_to_video',
          {
            model: p.id,
            promptText: prompt,
            ratio: '1280:720',
            duration: 5,
            ...(image ? { promptImage: image } : {}),
          }
        )
        const path = `/tasks/${encodeURIComponent(result.id)}`
        cancel = () => request(path, undefined, 'DELETE', true)
        output = await poll(path, (data) =>
          data.status === 'SUCCEEDED' ? { url: data.output?.[0] } : undefined
        )
        break
      }
      case 'luma': {
        const result = await request('/generations', {
          model: p.id,
          prompt,
          aspect_ratio: '16:9',
          ...(p.task === 'video'
            ? { type: 'video', video: { resolution: '720p', duration: '5s' } }
            : {}),
        })
        output = await poll(
          `/generations/${encodeURIComponent(result.id)}`,
          (data) =>
            data.state === 'completed' ? media(data.output?.[0]) : undefined,
          (data) => data.state
        )
        break
      }
      case 'ltx': {
        const path = image ? '/image-to-video' : '/text-to-video'
        const result = await request(path, {
          model: p.id,
          prompt,
          duration: 8,
          resolution: '1920x1080',
          ...(image ? { image_uri: image } : {}),
        })
        output = await poll(
          `${path}/${encodeURIComponent(result.id)}`,
          (data) =>
            data.status === 'completed'
              ? { url: data.result?.video_url }
              : undefined
        )
        break
      }
      case 'fal': {
        const result = await request(`/${p.id}`, { prompt })
        const statusUrl = safe(result.status_url)
        const responseUrl = safe(result.response_url)
        if (result.cancel_url)
          cancel = () =>
            request(safe(result.cancel_url), undefined, 'PUT', true)
        await poll(statusUrl, (data) =>
          data.status === 'COMPLETED' ? { url: 'completed' } : undefined
        )
        const data = await request(responseUrl)
        output =
          p.task === 'video' ? media(data.video) : media(data.images?.[0])
        break
      }
      case 'replicate': {
        const result = await request(`/models/${p.id}/predictions`, {
          input: { prompt },
        })
        if (result.urls?.cancel)
          cancel = () => request(safe(result.urls.cancel), {}, 'POST', true)
        output = await poll(safe(result.urls?.get), (data) =>
          data.status === 'succeeded'
            ? {
                url:
                  typeof data.output === 'string'
                    ? data.output
                    : data.output?.[0],
              }
            : undefined
        )
        break
      }
      case 'leonardo': {
        const result = await request('/generations', {
          model: p.id,
          parameters: { prompt, quantity: 1, width: 1024, height: 1024 },
          public: false,
        })
        const id =
          result.generate?.generationId ??
          result.generationId ??
          result.sdGenerationJob?.generationId
        if (!id) throw new CloudCreationError('failed')
        // Generation retrieval retains the v1 URL in Leonardo's documented v2 create workflow.
        const path = `${base.replace(/\/v2$/, '/v1')}/generations/${encodeURIComponent(id)}`
        output = await poll(
          path,
          (data) =>
            data.generations_by_pk?.status === 'COMPLETE'
              ? media(data.generations_by_pk.generated_images?.[0])
              : undefined,
          (data) => data.generations_by_pk?.status
        )
        break
      }
      case 'krea': {
        const result = await request('/generate/image/krea/krea-3', {
          prompt,
          ...(image ? { image_urls: [image] } : {}),
        })
        output = await poll(
          `/jobs/${encodeURIComponent(result.job_id)}`,
          (data) =>
            data.status === 'completed'
              ? { url: data.result?.urls?.[0] }
              : undefined
        )
        break
      }
      case 'minimax-video': {
        const result = await request('/v2/video_generation', {
          model: p.id,
          content: [
            { type: 'text', text: prompt },
            ...(image
              ? [
                  {
                    type: 'image_url',
                    image_url: { url: image },
                    role: 'first_frame',
                  },
                ]
              : []),
          ],
          resolution: '768P',
          duration: 5,
          ratio: '16:9',
        })
        if (result.base_resp?.status_code)
          throw new CloudCreationError('failed')
        output = await poll(
          `/v2/query/video_generation/${encodeURIComponent(result.task_id)}`,
          (data) =>
            data.task?.status === 'succeeded'
              ? media(data.task.content)
              : undefined,
          (data) => data.task?.status
        )
        break
      }
      case 'minimax-image': {
        const result = await request('/image_generation', {
          model: p.id,
          prompt,
          n: 1,
          aspect_ratio: '1:1',
          response_format: 'url',
        })
        output = result.data?.image_urls?.[0]
          ? { url: result.data.image_urls[0] }
          : undefined
        break
      }
      case 'byteplus-image': {
        const result = await request('/images/generations', {
          model: p.id,
          prompt,
          size: '2K',
          response_format: 'url',
          watermark: true,
          ...(image ? { image } : {}),
        })
        output = media(result.data?.[0])
        break
      }
      case 'byteplus-video': {
        const result = await request('/contents/generations/tasks', {
          model: p.id,
          content: [
            { type: 'text', text: prompt },
            ...(image
              ? [
                  {
                    type: 'image_url',
                    image_url: { url: image },
                    role: 'first_frame',
                  },
                ]
              : []),
          ],
          duration: 5,
          ratio: '16:9',
          watermark: true,
        })
        output = await poll(
          `/contents/generations/tasks/${encodeURIComponent(result.id)}`,
          (data) =>
            data.status === 'succeeded'
              ? { url: data.content?.video_url }
              : undefined
        )
        break
      }
      case 'vidu': {
        const result = await request(image ? '/img2video' : '/text2video', {
          model: p.id,
          prompt,
          duration: 5,
          resolution: '720p',
          ...(image ? { images: [image] } : { aspect_ratio: '16:9' }),
        })
        output = await poll(
          `/tasks/${encodeURIComponent(result.task_id)}/creations`,
          (data) =>
            data.state === 'success' ? media(data.creations?.[0]) : undefined,
          (data) => data.state
        )
        break
      }
      case 'pixverse': {
        const result = await request('/openapi/v2/video/text/generate', {
          model: p.id,
          prompt,
          duration: 5,
          quality: '720p',
          aspect_ratio: '16:9',
        })
        if (result.ErrCode) throw new CloudCreationError('failed')
        output = await poll(
          `/openapi/v2/video/result/${encodeURIComponent(result.Resp?.video_id)}`,
          (data) => (data.Resp?.status === 1 ? media(data.Resp) : undefined),
          (data) => (data.ErrCode ? 'failed' : data.Resp?.status)
        )
        break
      }
      case 'adobe': {
        const result = await request(
          p.task === 'image'
            ? '/v4/images/generate-async'
            : '/v3/videos/generate',
          p.task === 'image'
            ? { prompt, modelId: 'firefly_image', numVariations: 1 }
            : { prompt }
        )
        if (result.cancelUrl)
          cancel = () => request(safe(result.cancelUrl), undefined, 'PUT', true)
        output = await poll(safe(result.statusUrl), (data) =>
          ['succeeded', 'completed'].includes(data.status)
            ? media(
                data.result?.outputs?.[0]?.image ??
                  data.result?.outputs?.[0]?.video ??
                  data.result?.videos?.[0]
              )
            : undefined
        )
        break
      }
      default:
        throw new CloudCreationError('failed')
    }
    signal.throwIfAborted()
    if (!output?.url && !output?.base64) throw new CloudCreationError('failed')
    completed = true
    o.progress(100)
    return output
  } finally {
    // Unsupported remote cancellation is never represented as a billing cancellation.
    if (!completed && cancel) await cancel().catch(() => {})
  }
}
