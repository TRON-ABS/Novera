import type { CatalogModel } from '@/services/models/types'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useDefaultEmbeddingModel } from '@/hooks/useDefaultEmbeddingModel'
import { DownloadButtonPlaceholder } from './DownloadButton'
import { EmbeddingDeviceControl } from './EmbeddingDeviceControl'
import embeddingManifest from '@/constants/embedding-manifest.json'

export const recommendedEmbedding: CatalogModel = {
  model_name: 'Qwen3-Embedding-0.6B',
  display_name: 'Qwen3-Embedding-0.6B · Q8_0',
  description: 'Multilingual text embeddings for document retrieval.',
  library_name: 'gguf', pipeline_tag: 'feature-extraction', developer: 'Qwen', downloads: 0,
  quants: [{
    model_id: embeddingManifest[0].name.replace(/\.gguf$/, ''),
    path: embeddingManifest[0].url,
    file_size: '639 MB',
  }],
}

/** Retrieval configuration stays independent of the conversation model. */
export function EmbeddingSetupPanel() {
  const { t } = useTranslation()
  const provider = useModelProvider((state) => state.providers.find((entry) => entry.provider === 'llamacpp'))
  const installed = provider?.models.find((model) => model.embedding &&
    model.id.split('/').pop()?.replace(/\.gguf$/i, '') === recommendedEmbedding.quants![0].model_id)
  const defaultId = useDefaultEmbeddingModel((state) => state.defaultByProvider.llamacpp)
  const setDefault = useDefaultEmbeddingModel((state) => state.setDefault)
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{t('providers:embeddingModelsDesc')}</p>
      <div className="space-y-3 rounded-lg border p-3">
        <h3 className="text-sm font-medium">{recommendedEmbedding.display_name} · {recommendedEmbedding.quants![0].file_size}</h3>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <DownloadButtonPlaceholder model={recommendedEmbedding}
            useLabel={installed && installed.id === defaultId ? t('providers:embeddingModelIsDefault') : t('providers:embeddingModelSetDefault')}
            handleUseModel={(id) => setDefault('llamacpp', id)} />
          {installed && <EmbeddingDeviceControl modelId={installed.id} />}
        </div>
      </div>
    </div>
  )
}
