import type { CatalogModel } from '@/services/models/types'
import hubCatalog from './noveraHubCatalog.json'

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
