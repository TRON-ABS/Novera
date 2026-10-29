/** Hub taxonomy and conservative pre-download estimates. No UI, store, IPC or network. */
export const HUB_CATEGORIES = [
  { id: 'all', icon: '✦', tasks: [], tags: [] },
  {
    id: 'text',
    icon: '💬',
    tasks: [
      'text-generation',
      'text2text-generation',
      'question-answering',
      'summarization',
      'fill-mask',
      'text-classification',
      'token-classification',
      'zero-shot-classification',
    ],
    tags: [],
  },
  { id: 'code', icon: '⌘', tasks: [], tags: ['code', 'code-generation'] },
  { id: 'reasoning', icon: '◎', tasks: [], tags: ['reasoning', 'math'] },
  {
    id: 'agents',
    icon: '⚙',
    tasks: [],
    tags: ['agents', 'tool-calling', 'function-calling'],
  },
  {
    id: 'vision',
    icon: '◉',
    tasks: [
      'image-text-to-text',
      'image-to-text',
      'image-classification',
      'image-segmentation',
      'object-detection',
      'depth-estimation',
      'keypoint-detection',
      'mask-generation',
      'zero-shot-image-classification',
      'zero-shot-object-detection',
      'image-feature-extraction',
    ],
    tags: [],
  },
  {
    id: 'image',
    icon: '▧',
    tasks: [
      'text-to-image',
      'image-to-image',
      'image-text-to-image',
      'unconditional-image-generation',
    ],
    tags: [],
  },
  {
    id: 'video',
    icon: '▶',
    tasks: [
      'text-to-video',
      'image-to-video',
      'image-text-to-video',
      'video-to-video',
      'video-classification',
      'video-text-to-text',
    ],
    tags: [],
  },
  {
    id: 'speech',
    icon: '🎙',
    tasks: [
      'text-to-speech',
      'automatic-speech-recognition',
      'audio-text-to-text',
      'audio-classification',
    ],
    tags: [],
  },
  {
    id: 'music',
    icon: '♫',
    tasks: ['audio-to-audio'],
    tags: ['music', 'text-to-audio'],
  },
  {
    id: 'documents',
    icon: '▤',
    tasks: [
      'document-question-answering',
      'table-question-answering',
      'visual-question-answering',
    ],
    tags: ['ocr'],
  },
  {
    id: 'search',
    icon: '⌕',
    tasks: [
      'feature-extraction',
      'sentence-similarity',
      'text-ranking',
      'visual-document-retrieval',
    ],
    tags: ['embeddings', 'reranker'],
  },
  {
    id: 'translation',
    icon: '文',
    tasks: ['translation'],
    tags: ['translation'],
  },
  {
    id: 'threeD',
    icon: '◇',
    tasks: ['text-to-3d', 'image-to-3d'],
    tags: ['3d'],
  },
  {
    id: 'data',
    icon: '▥',
    tasks: ['tabular-classification', 'tabular-regression'],
    tags: ['time-series'],
  },
  {
    id: 'robotics',
    icon: '⚒',
    tasks: ['reinforcement-learning'],
    tags: ['robotics'],
  },
  {
    id: 'science',
    icon: '⚛',
    tasks: [],
    tags: ['science', 'biology', 'chemistry'],
  },
  {
    id: 'medical',
    icon: '✚',
    tasks: [],
    tags: ['medical', 'biomedical', 'healthcare'],
  },
  { id: 'education', icon: '▱', tasks: [], tags: ['education'] },
  {
    id: 'business',
    icon: '▦',
    tasks: [],
    tags: ['finance', 'business', 'legal'],
  },
  { id: 'security', icon: '◈', tasks: [], tags: ['cybersecurity'] },
  { id: 'multimodal', icon: '⊕', tasks: ['any-to-any'], tags: ['multimodal'] },
  { id: 'other', icon: '⋯', tasks: [], tags: [] },
] as const
export type HubCategory = (typeof HUB_CATEGORIES)[number]['id']

export interface HubTextConfig {
  num_hidden_layers?: number
  num_attention_heads?: number
  num_key_value_heads?: number
  hidden_size?: number
  head_dim?: number
  text_config?: HubTextConfig
}

export interface HubModelMetadata {
  model_name?: string
  display_name?: string
  pipeline_tag?: string
  tags?: readonly string[]
  library_name?: string
  is_mlx?: boolean
  quants?: readonly { path: string; model_id: string; file_size?: string }[]
  safetensors_files?: readonly { path: string; file_size?: string }[]
  mmproj_models?: readonly { path: string; file_size?: string }[]
  model_config?: HubTextConfig & {
    model_type?: string
    architectures?: string[]
    dtype?: string
    torch_dtype?: string
    quantization_config?: unknown
  }
}

export function modelCategories(model: HubModelMetadata): HubCategory[] {
  const tags = new Set((model.tags ?? []).map((tag) => tag.toLowerCase()))
  const ids = HUB_CATEGORIES.filter(
    (category) =>
      (category.tasks as readonly string[]).includes(
        model.pipeline_tag ?? ''
      ) || category.tags.some((tag) => tags.has(tag))
  ).map((category) => category.id)
  // Pinned GGUF presets predate pipeline metadata; they are explicitly chat presets.
  if (!model.pipeline_tag && model.quants?.length && !ids.length)
    ids.push('text')
  return ids.length ? ids : ['other']
}

export function categoryMatches(
  model: HubModelMetadata,
  category: HubCategory
): boolean {
  return category === 'all' || modelCategories(model).includes(category)
}

export type HubQuantization = 'awq' | 'gptq' | 'bitsandbytes-4bit' | 'bitsandbytes-8bit'

export function hubQuantization(model: HubModelMetadata): HubQuantization | 'unsupported' | null {
  const raw = model.model_config?.quantization_config
  if (raw == null) return null
  if (typeof raw !== 'object' || Array.isArray(raw)) return 'unsupported'
  const q = raw as Record<string, unknown>
  if (q.quant_method === 'awq') return q.bits === 4 &&
    (q.version === undefined || (typeof q.version === 'string' && q.version.toLowerCase() === 'gemm')) &&
    (q.do_fuse === undefined || q.do_fuse === false) ? 'awq' : 'unsupported'
  if (q.quant_method === 'gptq') return typeof q.bits === 'number' && [2, 3, 4, 8].includes(q.bits) &&
    (q.checkpoint_format === undefined || ['gptq', 'gptq_v2'].includes(String(q.checkpoint_format))) ? 'gptq' : 'unsupported'
  if (q.quant_method === 'bitsandbytes') {
    const flag = (bits: number) => {
      const value = Object.prototype.hasOwnProperty.call(q, `load_in_${bits}bit`) ? q[`load_in_${bits}bit`] : Object.prototype.hasOwnProperty.call(q, `_load_in_${bits}bit`) ? q[`_load_in_${bits}bit`] : false
      return typeof value === 'boolean' && (q[`_load_in_${bits}bit`] === undefined || q[`_load_in_${bits}bit`] === value) ? value : null
    }
    const four = flag(4), eight = flag(8)
    if (four === null || eight === null || four === eight ||
      (q.llm_int8_enable_fp32_cpu_offload !== undefined && q.llm_int8_enable_fp32_cpu_offload !== false) ||
      (four && q.bnb_4bit_quant_type !== undefined && !['fp4', 'nf4'].includes(String(q.bnb_4bit_quant_type)))) return 'unsupported'
    return four ? 'bitsandbytes-4bit' : 'bitsandbytes-8bit'
  }
  return 'unsupported'
}

export function modelEngine(
  model: HubModelMetadata
): 'llamacpp' | 'mlx' | 'transformers' | 'future' {
  const task = model.pipeline_tag
  const causal =
    !task ||
    task === 'text-generation' ||
    task === 'image-text-to-text' ||
    task === 'image-to-text'
  if (model.is_mlx || model.library_name === 'mlx')
    return causal ? 'mlx' : 'future'
  // A container format alone does not imply that an image/video/audio pipeline can run in chat.
  if (model.quants?.length && causal) return 'llamacpp'
  if (
    model.safetensors_files?.length &&
    task === 'text-generation' &&
    hubQuantization(model) !== 'unsupported'
  )
    return 'transformers'
  return 'future'
}

export interface HubHardware {
  platform: string
  ramBytes: number | null
  availableRamBytes?: number | null
  gpus: readonly {
    name: string
    vendor: string
    totalBytes: number
    availableBytes?: number
    sharedMemory?: boolean
    computeCapability?: string
  }[]
}
export interface HubDiagnosis {
  engine: ReturnType<typeof modelEngine>
  engineState: 'check' | 'runtime' | 'platform' | 'planned'
  memory: 'fits' | 'tight' | 'insufficient' | 'unknown'
  weightsBytes: number | null
  downloadBytes: number | null
  requiredBytes: number | null
  ramBudgetBytes: number | null
  gpuBudgetBytes: number | null
  context: number
  canDownload: boolean
  medical: boolean
  nvfp4Advice?: 'nvfp4Prefer' | 'nvfp4Check' | 'nvfp4Unsupported'
  quantization?: HubQuantization
  quantizationError?: string
}
/** Hardware advice, never a declaration that the selected Python/runtime is ready. */
export function nvfp4Hardware(gpu: HubHardware['gpus'][number]): boolean {
  if (!/nvidia/i.test(`${gpu.vendor} ${gpu.name}`)) return false
  const value = gpu.computeCapability?.trim().replace(/^sm_?/i, '') ?? ''
  const capability = /^\d{1,2}\.\d$/.test(value)
    ? Number(value)
    : /^1\d\d$/.test(value)
      ? Number(value) / 10
      : NaN
  return (
    capability >= 10 &&
    (gpu.availableBytes ?? gpu.totalBytes) >= 4.5 * 1024 ** 3
  )
}
export function nvfp4ModelAdvice(
  model: HubModelMetadata,
  hardware: HubHardware,
  selectedPath?: string
): HubDiagnosis['nvfp4Advice'] {
  if (
    selectedPath &&
    /(?:\.gguf$|(?:bf16|fp16|fp8|q[2-8]_))/i.test(selectedPath)
  )
    return
  const evidence = [
    model.model_name,
    model.display_name,
    ...(model.tags ?? []),
    JSON.stringify(model.model_config?.quantization_config ?? {}),
    ...(selectedPath
      ? [selectedPath]
      : (model.safetensors_files?.map((file) => file.path) ?? [])),
  ].join(' ')
  if (!/(?:^|[^a-z0-9])nvfp4(?:$|[^a-z0-9])/i.test(evidence)) return
  const knownFamily =
    /flux[\s._-]*2[\s._-]*(?:klein[\s._-]*)?4b/i.test(evidence) &&
    ['text-to-image', 'image-to-image'].includes(model.pipeline_tag ?? '')
  if (
    !hardware.gpus.length ||
    !hardware.gpus.some((gpu) => gpu.computeCapability)
  )
    return 'nvfp4Check'
  if (!hardware.gpus.some(nvfp4Hardware)) return 'nvfp4Unsupported'
  return knownFamily ? 'nvfp4Prefer' : 'nvfp4Check'
}
export interface HubRuntime {
  ready: boolean
  cudaAvailable: boolean
  python?: string
  torch?: string
  gpu?: { name: string; totalBytes: number; freeBytes: number } | null
  quantization?: Partial<Record<HubQuantization, { available: boolean; reason?: string }>>
}
const GiB = 1024 ** 3

export function estimateHubMemory(
  weights: number | null,
  context = 8192,
  companions: number | null = 0,
  kvBytes?: number | null
): number | null {
  if (!weights || weights <= 0 || companions === null) return null
  const kv = kvBytes ?? weights * 0.1 * Math.max(128, context) / 4096
  return Math.ceil(weights + Math.max(weights * 0.2, 256 * 1024 ** 2) + kv + companions)
}

/** K and V caches for a conventional attention decoder, one sequence.
 * GGUF defaults to FP16; explicit FP32 Safetensors caches use four bytes.
 * Incomplete, recurrent and compressed-attention architectures use the fallback.
 */
export function estimateHubKvCache(model: HubModelMetadata, context: number): number | null {
  const config = model.model_config?.text_config ?? model.model_config
  if (!config || /mla|deepseek|mamba|jamba|lfm|hybrid|qwen3_next|qwen3_5/i.test(model.model_config?.model_type ?? '')) return null
  const layers = config.num_hidden_layers
  const heads = config.num_attention_heads
  const kvHeads = config.num_key_value_heads ?? heads
  const dimension = config.head_dim ?? (config.hidden_size && heads ? config.hidden_size / heads : undefined)
  if (![layers, heads, kvHeads, dimension].every(value => typeof value === 'number' && Number.isSafeInteger(value) && value > 0)) return null
  if (kvHeads! > heads!) return null
  const dtype = model.model_config?.dtype ?? model.model_config?.torch_dtype
  const elementBytes = !model.quants?.length && /^(?:torch\.)?(?:float32|fp32|float)$/i.test(dtype ?? '') ? 4 : 2
  const bytes = 2 * elementBytes * Math.max(128, context) * layers! * kvHeads! * dimension!
  return Number.isSafeInteger(bytes) ? bytes : null
}

export function diagnoseHubModel(
  model: HubModelMetadata,
  hardware: HubHardware,
  options: {
    weightsBytes: number | null
    projectorBytes?: number | null
    context?: number
    runtime?: HubRuntime
    variantPath?: string
  }
): HubDiagnosis {
  const engine = modelEngine(model)
  const method = hubQuantization(model)
  const quantization = engine === 'transformers' && method && method !== 'unsupported' ? method : undefined
  const quantizationReady = !quantization || (!!options.runtime?.cudaAvailable && options.runtime?.quantization?.[quantization]?.available === true)
  const nvfp4Advice = nvfp4ModelAdvice(model, hardware, options.variantPath)
  const context = Math.max(128, options.context ?? 8192)
  const weights =
    options.weightsBytes && options.weightsBytes > 0
      ? options.weightsBytes
      : null
  const projector = options.projectorBytes ?? 0
  const ram = hardware.availableRamBytes ?? hardware.ramBytes
  const ramBudget =
    ram !== null && ram !== undefined && ram >= 0
      ? Math.max(0, ram - 2 * GiB)
      : null
  const eligibleGpus =
    engine === 'transformers'
      ? hardware.gpus.filter((gpu) =>
          /nvidia/i.test(`${gpu.vendor} ${gpu.name}`)
        )
      : hardware.gpus.filter(gpu => !gpu.sharedMemory && !(hardware.platform === 'macos' && /apple/i.test(`${gpu.vendor} ${gpu.name}`)))
  // Never sum unrelated GPUs; Transformers has no tensor parallelism/offload here.
  const detectedGpuBudget = eligibleGpus.length
    ? Math.max(
        ...eligibleGpus.map((gpu) =>
          Math.max(0, (gpu.availableBytes ?? gpu.totalBytes) - GiB)
        )
      )
    : null
  const gpuBudget =
    engine !== 'transformers'
      ? detectedGpuBudget
      : options.runtime?.cudaAvailable && options.runtime.gpu
        ? Math.max(0, options.runtime.gpu.freeBytes - GiB)
        : null
  const dtype = model.model_config?.dtype ?? model.model_config?.torch_dtype
  const cpuExpansion =
    engine === 'transformers' && !quantization &&
    (!dtype || /^(?:torch\.)?(?:b?float16|fp16|bf16|half)$/i.test(dtype))
      ? 2
      : 1
  // A heuristic is labelled an estimate by the caller, never a guarantee.
  const kvBytes = estimateHubKvCache(model, context)
  const required = estimateHubMemory(
    weights,
    context,
    options.projectorBytes ?? (options.projectorBytes === null ? null : 0),
    kvBytes
  )
  const cpuRequired =
    required && weights
      ? Math.ceil(required + (weights + (kvBytes ?? weights * 0.1 * context / 4096)) * (cpuExpansion - 1))
      : null
  let memory: HubDiagnosis['memory'] = 'unknown'
  if (required && ramBudget !== null && engine !== 'future') {
    if (engine === 'transformers') {
      if (quantization) {
        // Packed CUDA models cannot use the full-precision CPU fallback.
        if (gpuBudget !== null) memory = required <= gpuBudget * 0.85 ? 'fits' : required <= gpuBudget ? 'tight' : 'insufficient'
        if (!quantizationReady && memory !== 'insufficient') memory = 'unknown'
      } else if (gpuBudget !== null && required <= gpuBudget * 0.85) memory = 'fits'
      else if (cpuRequired && cpuRequired <= ramBudget * 0.85)
        memory = gpuBudget !== null ? 'tight' : 'fits'
      else if (
        (gpuBudget !== null && required <= gpuBudget) ||
        (cpuRequired && cpuRequired <= ramBudget)
      )
        memory = 'tight'
      else memory = 'insufficient'
      if ((!dtype || !options.runtime?.ready) && memory === 'fits')
        memory = 'tight'
    } else {
      const unified = hardware.platform === 'macos' && !hardware.gpus.length
      const budget = ramBudget + (unified ? 0 : (gpuBudget ?? 0))
      if (required > budget) memory = 'insufficient'
      else if (required <= (gpuBudget ?? ramBudget) * 0.85) memory = 'fits'
      else memory = 'tight'
    }
  }
  const platformBlocked =
    engine === 'mlx'
      ? hardware.platform !== 'macos'
      : engine === 'transformers'
        ? !['windows', 'linux'].includes(hardware.platform)
        : engine === 'llamacpp' &&
          !['windows', 'linux', 'macos', 'android'].includes(hardware.platform)
  return {
    engine,
    engineState:
      engine === 'future'
        ? nvfp4Advice === 'nvfp4Prefer'
          ? 'runtime'
          : 'planned'
        : platformBlocked
          ? 'platform'
          : engine === 'transformers' && (!options.runtime?.ready || !quantizationReady)
            ? 'runtime'
            : 'check',
    nvfp4Advice,
    quantization,
    quantizationError: quantization ? options.runtime?.quantization?.[quantization]?.reason : undefined,
    memory,
    weightsBytes: weights,
    downloadBytes:
      weights && options.projectorBytes !== null ? weights + projector : null,
    requiredBytes:
      engine === 'transformers' &&
      !(gpuBudget !== null && required && required <= gpuBudget)
        ? cpuRequired
        : required,
    ramBudgetBytes: ramBudget,
    gpuBudgetBytes: gpuBudget,
    context,
    canDownload: !platformBlocked && engine !== 'future',
    medical: modelCategories(model).includes('medical'),
  }
}
