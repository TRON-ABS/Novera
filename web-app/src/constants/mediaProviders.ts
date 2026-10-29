// Official API sources reviewed on 2026-10-26. Public availability is not account entitlement.
export const MEDIA_CATALOG_VERIFIED_AT = '2026-10-26'
export interface MediaPreset {
  provider: string
  id: string
  name: string
  task: 'image' | 'music' | 'video'
  adapter: string
  source: string
  inputImage?: boolean
  requiresImage?: boolean
  preview?: boolean
  apiModel?: string
}
export const mediaProviderDefinitions = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    base: 'https://api.elevenlabs.io/v1',
    docs: 'https://elevenlabs.io/docs/api-reference/music/compose',
    home: 'https://elevenlabs.io',
  },
  {
    id: 'bfl',
    name: 'Black Forest Labs',
    base: 'https://api.bfl.ai/v1',
    docs: 'https://docs.bfl.ai/quick_start/generating_images',
    home: 'https://blackforestlabs.ai',
  },
  {
    id: 'stability',
    name: 'Stability AI',
    base: 'https://api.stability.ai/v2beta',
    docs: 'https://docs.stability.ai/api-reference',
    home: 'https://stability.ai',
  },
  {
    id: 'recraft',
    name: 'Recraft',
    base: 'https://external.api.recraft.ai/v1',
    docs: 'https://www.recraft.ai/docs/api-reference/agents.md',
    home: 'https://www.recraft.ai',
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    base: 'https://api.ideogram.ai',
    docs: 'https://developer.ideogram.ai/ideogram-api/api-overview',
    home: 'https://ideogram.ai',
  },
  {
    id: 'adobe-firefly',
    name: 'Adobe Firefly',
    base: 'https://firefly-api.adobe.io',
    docs: 'https://developer.adobe.com/firefly-services/docs/firefly-api/',
    home: 'https://www.adobe.com/products/firefly.html',
  },
  {
    id: 'runway',
    name: 'Runway',
    base: 'https://api.dev.runwayml.com/v1',
    docs: 'https://docs.dev.runwayml.com/api/',
    home: 'https://runwayml.com',
  },
  {
    id: 'luma',
    name: 'Luma',
    base: 'https://agents.lumalabs.ai/v1',
    docs: 'https://docs.agents.lumalabs.ai/guides/model/',
    home: 'https://lumalabs.ai',
  },
  {
    id: 'ltx',
    name: 'LTX (Lightricks)',
    base: 'https://api.ltx.io/v2',
    docs: 'https://docs.ltx.io/models',
    home: 'https://ltx.io',
  },
  {
    id: 'fal',
    name: 'fal',
    base: 'https://queue.fal.run',
    docs: 'https://fal.ai/docs/documentation/model-apis/inference/queue',
    home: 'https://fal.ai',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    base: 'https://api.replicate.com/v1',
    docs: 'https://replicate.com/docs/reference/http',
    home: 'https://replicate.com',
  },
  {
    id: 'leonardo',
    name: 'Leonardo.Ai',
    base: 'https://cloud.leonardo.ai/api/rest/v2',
    docs: 'https://docs.leonardo.ai/reference/creategeneration',
    home: 'https://leonardo.ai',
  },
  {
    id: 'krea',
    name: 'Krea',
    base: 'https://api.krea.ai',
    docs: 'https://www.krea.ai/docs/developers/krea-3/overview',
    home: 'https://www.krea.ai',
  },
  {
    id: 'vidu',
    name: 'Vidu',
    base: 'https://api.vidu.com/ent/v2',
    docs: 'https://platform.vidu.com/docs/model-map',
    home: 'https://www.vidu.com',
  },
  {
    id: 'pixverse',
    name: 'PixVerse',
    base: 'https://app-api.pixverse.ai',
    docs: 'https://docs.platform.pixverse.ai/changelog-2394996m0',
    home: 'https://pixverse.ai',
  },
] as const

const image = (
  provider: string,
  id: string,
  name: string,
  adapter: string,
  source: string,
  inputImage = false
): MediaPreset => ({
  provider,
  id,
  name,
  task: 'image',
  adapter,
  source,
  inputImage,
})
const video = (
  provider: string,
  id: string,
  name: string,
  adapter: string,
  source: string,
  inputImage = false
): MediaPreset => ({
  provider,
  id,
  name,
  task: 'video',
  adapter,
  source,
  inputImage,
})
export const mediaModelPresets: MediaPreset[] = [
  {
    provider: 'elevenlabs',
    id: 'music_v2_5',
    name: 'ElevenMusic v2.5',
    task: 'music',
    adapter: 'elevenlabs-music',
    source: 'https://elevenlabs.io/docs/api-reference/music/compose',
  },
  {
    provider: 'stability',
    id: 'stable-audio-3',
    name: 'Stable Audio 3',
    task: 'music',
    adapter: 'stability-music',
    source:
      'https://docs.stability.ai/api-reference/stable-audio/text-to-audio',
  },
  {
    provider: 'fal',
    id: 'fal-ai/ace-step',
    name: 'ACE-Step · cloud',
    task: 'music',
    adapter: 'fal',
    source: 'https://fal.ai/models/fal-ai/ace-step/api',
  },
  {
    provider: 'replicate',
    id: 'stability-ai/stable-audio-2.5',
    name: 'Stable Audio 2.5 · Replicate',
    task: 'music',
    adapter: 'replicate',
    source: 'https://replicate.com/stability-ai/stable-audio-2.5/api/schema',
  },
  image(
    'byteplus',
    'dola-seedream-5-0-pro-260628',
    'Dola Seedream 5 Pro',
    'byteplus-image',
    'https://docs.byteplus.com/en/docs/ModelArk/image-generation-api',
    true
  ),
  video(
    'byteplus',
    'dreamina-seedance-2-5-260628',
    'Dreamina Seedance 2.5',
    'byteplus-video',
    'https://docs.byteplus.com/en/docs/ModelArk/seedance-2-5',
    true
  ),
  video(
    'fal',
    'fal-ai/pika/v2.2/text-to-video',
    'Pika 2.2 · fal',
    'fal',
    'https://fal.ai/models/fal-ai/pika/v2.2/text-to-video'
  ),
  image(
    'fal',
    'fal-ai/qwen-image-2512',
    'Qwen Image 2512 · fal',
    'fal',
    'https://fal.ai/models/fal-ai/qwen-image-2512/api'
  ),
  image(
    'adobe-firefly',
    'firefly_image',
    'Adobe Firefly Image 5',
    'adobe',
    'https://developer.adobe.com/firefly-services/docs/firefly-api/api/'
  ),
  video(
    'adobe-firefly',
    'firefly-video',
    'Adobe Firefly Video',
    'adobe',
    'https://developer.adobe.com/firefly-services/docs/firefly-api/api/'
  ),
  video(
    'gemini',
    'gemini-omni-1.1-flash',
    'Gemini Omni 1.1 Flash',
    'google-image',
    'https://ai.google.dev/gemini-api/docs/omni',
    true
  ),
  image(
    'krea',
    'krea-3',
    'Krea 3',
    'krea',
    'https://www.krea.ai/docs/developers/krea-3/overview.md',
    true
  ),
  image(
    'leonardo',
    'lucid-origin',
    'Lucid Origin',
    'leonardo',
    'https://docs.leonardo.ai/docs/lucid-origin'
  ),
  image(
    'fal',
    'fal-ai/flux-2-max',
    'FLUX.2 Max · fal',
    'fal',
    'https://fal.ai/models/fal-ai/flux-2-max/api'
  ),
  video(
    'fal',
    'fal-ai/kling-video/v3/pro/text-to-video',
    'Kling 3 Pro · fal',
    'fal',
    'https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video/api'
  ),
  video(
    'fal',
    'fal-ai/kling-video/v3/standard/text-to-video',
    'Kling 3 Standard · fal',
    'fal',
    'https://fal.ai/models/fal-ai/kling-video/v3/standard/text-to-video/api'
  ),
  image(
    'replicate',
    'black-forest-labs/flux-2-max',
    'FLUX.2 Max · Replicate',
    'replicate',
    'https://replicate.com/black-forest-labs/flux-2-max/api'
  ),
  {
    ...video(
      'vidu',
      'viduq4-preview',
      'Vidu Q4 Preview',
      'vidu',
      'https://platform.vidu.com/docs/api-reference/video-models/vidu-q4-preview/image-to-video',
      true
    ),
    requiresImage: true,
    preview: true,
  },
  image(
    'openai',
    'gpt-image-2.5-sunburst',
    'GPT Image 2.5 Sunburst',
    'openai-image',
    'https://developers.openai.com/api/docs/guides/image-generation',
    true
  ),
  image(
    'openai',
    'gpt-image-2.5-flare',
    'GPT Image 2.5 Flare',
    'openai-image',
    'https://developers.openai.com/api/docs/guides/image-generation',
    true
  ),
  image(
    'gemini',
    'gemini-nano-banana-2.1',
    'Gemini Nano Banana 2.1',
    'google-image',
    'https://ai.google.dev/gemini-api/docs/image-generation',
    true
  ),
  image(
    'xai',
    'grok-imagine-image-2.0',
    'Grok Imagine Image 2.0',
    'openai-image',
    'https://docs.x.ai/developers/model-capabilities/imagine',
    true
  ),
  video(
    'xai',
    'grok-imagine-video-1.5',
    'Grok Imagine Video 1.5',
    'xai-video',
    'https://docs.x.ai/developers/model-capabilities/imagine',
    true
  ),
  video(
    'xai',
    'grok-imagine-video-1.5-lite',
    'Grok Imagine Video 1.5 Lite',
    'xai-video',
    'https://docs.x.ai/developers/model-capabilities/imagine',
    true
  ),
  image(
    'bfl',
    'flux-2-max',
    'FLUX.2 [max]',
    'bfl',
    'https://docs.bfl.ai/quick_start/generating_images',
    true
  ),
  image(
    'bfl',
    'flux-2-pro',
    'FLUX.2 [pro]',
    'bfl',
    'https://docs.bfl.ai/quick_start/generating_images',
    true
  ),
  image(
    'bfl',
    'flux-2-klein-9b',
    'FLUX.2 [klein] 9B',
    'bfl',
    'https://docs.bfl.ai/quick_start/generating_images',
    true
  ),
  image(
    'stability',
    'stable-image/generate/ultra',
    'Stable Image Ultra',
    'stability',
    'https://docs.stability.ai/api-reference'
  ),
  image(
    'stability',
    'stable-image/generate/core',
    'Stable Image Core',
    'stability',
    'https://docs.stability.ai/api-reference'
  ),
  image(
    'recraft',
    'recraftv4_1',
    'Recraft V4.1',
    'openai-image',
    'https://www.recraft.ai/docs/api-reference/agents.md'
  ),
  image(
    'recraft',
    'recraftv4_1_flash',
    'Recraft V4.1 Flash',
    'openai-image',
    'https://www.recraft.ai/docs/api-reference/agents.md'
  ),
  image(
    'recraft',
    'recraftv4_1_pro',
    'Recraft V4.1 Pro',
    'openai-image',
    'https://www.recraft.ai/docs/api-reference/agents.md'
  ),
  image(
    'ideogram',
    'ideogram-4-5',
    'Ideogram 4.5',
    'ideogram',
    'https://developer.ideogram.ai/ideogram-api/api-overview',
    true
  ),
  video(
    'runway',
    'gen4.5',
    'Runway Gen-4.5',
    'runway',
    'https://docs.dev.runwayml.com/api/',
    true
  ),
  image(
    'luma',
    'uni-1-max',
    'Luma Uni-1 Max',
    'luma',
    'https://docs.agents.lumalabs.ai/guides/model/'
  ),
  image(
    'luma',
    'uni-1',
    'Luma Uni-1',
    'luma',
    'https://docs.agents.lumalabs.ai/guides/model/'
  ),
  video(
    'luma',
    'ray-3.2',
    'Luma Ray 3.2',
    'luma',
    'https://docs.agents.lumalabs.ai/guides/model/'
  ),
  video(
    'ltx',
    'ltx-2-5-pro',
    'LTX-2.5 Pro',
    'ltx',
    'https://docs.ltx.io/models',
    true
  ),
  video(
    'ltx',
    'ltx-2-5-fast',
    'LTX-2.5 Fast',
    'ltx',
    'https://docs.ltx.io/models',
    true
  ),
  image(
    'leonardo',
    'krea-2-turbo',
    'Krea 2 Turbo · Leonardo',
    'leonardo',
    'https://docs.leonardo.ai/docs/krea-2-turbo'
  ),
  image(
    'leonardo',
    'ideogram-v3.0',
    'Ideogram 3 · Leonardo',
    'leonardo',
    'https://docs.leonardo.ai/docs/ideogram-30'
  ),
  video(
    'minimax',
    'MiniMax-H3-Max',
    'MiniMax H3 Max',
    'minimax-video',
    'https://platform.minimax.io/docs/api-reference/video-generation-v2-create',
    true
  ),
  video(
    'minimax',
    'MiniMax-H3',
    'MiniMax H3',
    'minimax-video',
    'https://platform.minimax.io/docs/api-reference/video-generation-v2-create',
    true
  ),
  video(
    'minimax',
    'MiniMax-H3-Highspeed',
    'MiniMax H3 Highspeed',
    'minimax-video',
    'https://platform.minimax.io/docs/api-reference/video-generation-v2-create',
    true
  ),
  image(
    'minimax',
    'image-01',
    'MiniMax Image-01',
    'minimax-image',
    'https://platform.minimax.io/docs/api-reference/image-generation-t2i'
  ),
  video(
    'vidu',
    'viduq3-pro',
    'Vidu Q3 Pro',
    'vidu',
    'https://platform.vidu.com/docs/api-reference/video-models/vidu-q3/image-to-video',
    true
  ),
  video(
    'vidu',
    'viduq3-turbo',
    'Vidu Q3 Turbo',
    'vidu',
    'https://platform.vidu.com/docs/api-reference/video-models/vidu-q3/image-to-video',
    true
  ),
  video(
    'pixverse',
    'v6-max',
    'PixVerse V6 Max',
    'pixverse',
    'https://docs.platform.pixverse.ai/changelog-2394996m0'
  ),
  video(
    'pixverse',
    'v6',
    'PixVerse V6',
    'pixverse',
    'https://docs.platform.pixverse.ai/capability-matrix-2144288m0'
  ),
]

export function mediaPreset(provider: string, model: string) {
  return mediaModelPresets.find(
    (item) => item.provider === provider && item.id === model
  )
}
export function mediaModels(provider: string): Model[] {
  return mediaModelPresets
    .filter((item) => item.provider === provider)
    .map((item) => ({
      id: item.id,
      model: item.id,
      name: item.name,
      displayName: item.name,
      media_adapter: item.adapter,
      verified_at:
        item.task === 'music' ? '2026-10-27' : MEDIA_CATALOG_VERIFIED_AT,
      preview: item.preview,
      input_modalities: item.inputImage ? ['text', 'image'] : ['text'],
      output_modalities: [item.task === 'music' ? 'audio' : item.task],
      capabilities: [
        item.task === 'image'
          ? 'image-generation'
          : item.task === 'music'
            ? 'audio-generation'
            : 'video-generation',
        ...(item.inputImage ? ['image-input'] : []),
      ],
    }))
}
export function mergeMediaModels(provider: string, models: Model[]): Model[] {
  const media = mediaModels(provider)
  const ids = new Set(media.map((model) => model.id))
  return [
    ...media.map((model) => ({
      ...models.find((saved) => saved.id === model.id),
      ...model,
    })),
    ...models.filter((model) => !ids.has(model.id)),
  ]
}
