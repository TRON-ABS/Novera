import { getProviderLogo } from '@/lib/utils'
import type { CatalogModel } from '@/services/models/types'

// Identify the declared publisher, never infer a brand from a model's name.
export function modelPublisherLogo(model: Pick<CatalogModel, 'developer'>): string | undefined {
  const publisher = model.developer?.trim().toLowerCase()
  if (!publisher) return undefined
  const aliases: Record<string, string> = {
    'liquid ai': 'liquidai', 'meta-llama': 'meta', 'coherelabs': 'cohere',
    'zai-org': 'zai', 'mistralai': 'mistral', 'google': 'gemini',
    'deepseek-ai': 'deepseek', 'moonshotai': 'moonshot', 'minimaxai': 'minimax',
  }
  return getProviderLogo(aliases[publisher] ?? publisher)
}

export default function ModelPublisherAvatar({ model }: { model: Pick<CatalogModel, 'developer'> }) {
  const src = modelPublisherLogo(model)
  if (!src) return null
  return <img src={src} alt={model.developer} title={model.developer} className="size-6 shrink-0 object-contain rounded-full bg-white p-0.5" loading="lazy" decoding="async" draggable={false} />
}
