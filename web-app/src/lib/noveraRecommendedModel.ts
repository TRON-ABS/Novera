import type { CatalogModel } from '@/services/models/types'

export const noveraRecommendedContextFor = (mobile: boolean) => mobile ? 2048 : 32768
export const NOVERA_RECOMMENDED_CONTEXT_SIZE = noveraRecommendedContextFor(IS_ANDROID || IS_IOS)

const liquidRevision = 'bad5729bba61d076fff20d2548e62526665af215'
const omniRevision = 'd508b88f08a5b4286f2d2805a6a8d69a0ff44c72'
export const LIGHT_TEXT_MODEL: CatalogModel = {
  model_name: 'LFM3-1.7B', display_name: 'LFM3-1.7B · Q4_K_M',
  description: '', developer: 'LiquidAI', downloads: 0,
  library_name: 'gguf', pipeline_tag: 'text-generation', revision: liquidRevision,
  hub: { parametersB: 1.7, repo: 'LiquidAI/LFM3-1.7B-GGUF', revision: liquidRevision,
    verifiedAt: '2026-11-01', recommended: true, source: 'https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF', benchmarks: [] },
  quants: [{ model_id: 'LFM3-1.7B-Q4_K_M', file_size: '1.10 GB',
    path: `https://huggingface.co/LiquidAI/LFM3-1.7B-GGUF/resolve/${liquidRevision}/LFM3-1.7B-Q4_K_M.gguf?download=true` }],
}
export const LIGHT_OMNI_MODEL: CatalogModel = {
  model_name: 'LFM3-Omni-2B', display_name: 'LFM3-Omni-2B · Q4_K_M',
  tools: true,
  description: '', developer: 'LiquidAI', downloads: 0,
  library_name: 'gguf', pipeline_tag: 'image-text-to-text', revision: omniRevision,
  hub: { parametersB: 2.17, repo: 'LiquidAI/LFM3-Omni-2B-GGUF', revision: omniRevision,
    verifiedAt: '2026-11-07', recommended: true, source: 'https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF', benchmarks: [] },
  quants: [{ model_id: 'LFM3-Omni-2B-Q4_K_M', file_size: '1.10 GB',
    path: `https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/${omniRevision}/LFM3-Omni-2B-Q4_K_M.gguf?download=true` }],
  mmproj_models: [{ model_id: 'mmproj-LFM3-Omni-2B-Q4_K_M', file_size: '291.59 MB',
    path: `https://huggingface.co/LiquidAI/LFM3-Omni-2B-GGUF/resolve/${omniRevision}/mmproj-LFM3-Omni-2B-Q4_K_M.gguf?download=true` }],
}

/** Optional text-only recommendation, kept alongside the default Omni pair. */
export const NOVERA_TEXT_ALTERNATIVE: CatalogModel = {
  model_name: 'Nemotron-3.5-Bolt-E4B',
  display_name: 'Nemotron-3.5-Bolt-E4B · Q4_K_M',
  description: 'Text conversation, writing, tool calling and structured outputs.',
  library_name: 'gguf', pipeline_tag: 'text-generation', tools: true,
  developer: 'NVIDIA',
  downloads: 0,
  quants: [{
    model_id: 'Nemotron-3.5-Bolt-E4B-Q4_K_M',
    path: 'https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/resolve/main/Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf?download=true',
    file_size: '6.18 GB',
  }],
}

export function noveraRecommendedModelFor(android: boolean): CatalogModel {
  // The same default pair is offered on desktop, Android and iOS.
  void android
  return LIGHT_OMNI_MODEL
}
export const NOVERA_RECOMMENDED_MODEL = noveraRecommendedModelFor(IS_ANDROID || IS_IOS)
