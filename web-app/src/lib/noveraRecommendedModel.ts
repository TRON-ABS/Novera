import type { CatalogModel } from '@/services/models/types'

export const NOVERA_RECOMMENDED_CONTEXT_SIZE = 32768

/** Fixed Novera onboarding choice; independent of the upstream Jan feed/cache. */
export const NOVERA_RECOMMENDED_MODEL: CatalogModel = {
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
