import type { CatalogModel } from '@/services/models/types'
import hubCatalog from './noveraHubCatalog.json'

export const NOVERA_RECOMMENDED_CONTEXT_SIZE = IS_ANDROID ? 4096 : 16384

/** Fixed Novera onboarding choice; independent of the upstream Jan feed/cache. */
const desktopModel: CatalogModel = {
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
  if (!android) return desktopModel
  const mobileModel = hubCatalog.find(m => m.model_name === 'LFM2.5-1.2B-Instruct')!
  return { ...mobileModel, display_name: 'LFM2.5-1.2B-Instruct · Q4_K_M', quants: mobileModel.quants.filter(q => q.model_id.endsWith('Q4_K_M')) }
}
export const NOVERA_RECOMMENDED_MODEL = noveraRecommendedModelFor(IS_ANDROID)
