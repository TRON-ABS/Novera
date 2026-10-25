import type { CatalogModel } from '@/services/models/types'
import hubCatalog from './noveraHubCatalog.json'

/** Optional draft companion, paired only with the desktop onboarding target. */
export const NOVERA_RECOMMENDED_DRAFT = {
  targetModelId: 'LFM2.5-2.6B-Q6_K',
  targetPath: 'https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/resolve/main/LFM2.5-2.6B-Q6_K.gguf?download=true',
  path: 'https://huggingface.co/LiquidAI/LFM2.5-2.6B-DSpark-GGUF/resolve/main/LFM2.5-2.6B-DSpark-Q8_0.gguf?download=true',
  kind: 'dspark' as const,
  fileSize: '356 MB',
  sizeBytes: 356491776,
} as const

export const NOVERA_RECOMMENDED_CONTEXT_SIZE = IS_ANDROID ? 4096 : 32768

/** Fixed Novera onboarding choice; independent of the upstream Jan feed/cache. */
const desktopModel: CatalogModel = {
  model_name: 'LFM2.5-2.6B',
  display_name: 'LFM2.5-2.6B · Q6_K',
  description: 'LiquidAI LFM2.5-2.6B, Q6_K quantization.',
  developer: 'LiquidAI',
  downloads: 0,
  quants: [{
    model_id: 'LFM2.5-2.6B-Q6_K',
    path: 'https://huggingface.co/LiquidAI/LFM2.5-2.6B-GGUF/resolve/main/LFM2.5-2.6B-Q6_K.gguf?download=true',
    file_size: '2.22 GB',
  }],
}

export function noveraRecommendedModelFor(android: boolean): CatalogModel {
  if (!android) return desktopModel
  const mobileModel = hubCatalog.find(m => m.model_name === 'LFM2.5-1.2B-Instruct')!
  return { ...mobileModel, display_name: 'LFM2.5-1.2B-Instruct · Q4_K_M', quants: mobileModel.quants.filter(q => q.model_id.endsWith('Q4_K_M')) }
}
export const NOVERA_RECOMMENDED_MODEL = noveraRecommendedModelFor(IS_ANDROID)
