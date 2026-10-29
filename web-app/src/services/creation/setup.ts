import type { InstallSnapshot } from '@/hooks/useCreationInstall'
import { useMediaLibrary, selectMediaProfile } from '@/hooks/useMediaLibrary'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { useCreation } from '@/hooks/useCreation'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useThreads } from '@/hooks/useThreads'
import { getServiceHub } from '@/hooks/useServiceHub'
import { joinLocalPath } from '@/modules/platform/local-path'
import { invoke } from '@tauri-apps/api/core'
import { localStorageKey } from '@/constants/localStorage'
import { useDefaultEmbeddingModel } from '@/hooks/useDefaultEmbeddingModel'
import { useImageUpscale } from '@/hooks/useImageUpscale'

const usesModelFolders = (directory: string) => directory.replace(/[\\/]+$/, '').split(/[\\/]/).pop() === 'Novera models'
const modelFolders = { image: 'FLUX.2 Klein 4B', music: 'ACE-Step 1.5 Turbo 2B Q4_K_M', video: 'Wan2.1 T2V 1.3B Q4_K_M' } as const

export function splitRecommendedBundle(job: InstallSnapshot) {
  return (['image', 'music', 'video'] as const).map((kind) => {
    const indexes = job.plan.files.flatMap((file, index) =>
      file.role.startsWith(`${kind}.`) ? [index] : []
    )
    const files = indexes.map((index) => ({
      ...job.plan.files[index],
      role: job.plan.files[index].role.slice(kind.length + 1),
    }))
    return {
      ...job,
      plan: {
        ...job.plan,
        directory: usesModelFolders(job.plan.directory) ? joinLocalPath(job.plan.directory, modelFolders[kind]) : job.plan.directory,
        token: `${job.plan.token}-${kind}`,
        variant: kind === 'image' ? 'gguf' : `${kind}-gguf`,
        files,
        total: files.reduce((sum, file) => sum + file.size, 0),
      },
      bytes: indexes.map((index) => job.bytes[index]),
      verified: indexes.map((index) => job.verified[index]),
    }
  })
}

/** Configure only files from a complete, verified manifest. Text has its own model, separate from the image encoder. */
export async function configureRecommendedBundle(
  job: InstallSnapshot,
  scope?: string
) {
  if (
    job.phase !== 'ready' ||
    job.verified.length !== job.plan.files.length ||
    !job.verified.every(Boolean)
  )
    throw new Error('SETUP_NOT_VERIFIED')
  const text = job.plan.files.find((file) => file.role === 'text.model')
  if (!text) throw new Error('SETUP_TEXT_MISSING')
  const embedding = job.plan.files.find((file) => file.role === 'embedding.model')
  if (!embedding) throw new Error('SETUP_EMBEDDING_MISSING')
  const upscalers = ([2, 4] as const).map((factor) => ({ factor, file: job.plan.files.find((file) => file.role === `upscale.upscale${factor}`) }))
  if (upscalers.some(({ file }) => !file)) throw new Error('SETUP_UPSCALE_MISSING')
  await invoke('creation_video_runtime_check', {
    python: job.plan.python || 'python',
  })
  const parts = splitRecommendedBundle(job)
  for (const part of parts) {
    if (part.plan.variant === 'music-gguf') {
      useMusicCreation.getState().importReady(part, true)
      if (scope)
        useMusicCreation.getState().select(`music-${part.plan.token}`, scope)
    } else {
      useMediaLibrary.getState().importReady(part, true)
      const profile = useMediaLibrary
        .getState()
        .profiles.find((p) => p.id === `media-${part.plan.token}`)
      if (profile) {
        selectMediaProfile(profile)
        if (scope)
          useCreation
            .getState()
            .setSelection(scope, profile.task, {
              provider: 'diffusers',
              id: profile.id,
            })
      }
    }
  }
  const id = text.name.replace(/\.gguf$/, '')
  const models = getServiceHub().models()
  if (!(await models.getModel(id))) {
    await models.pullModel(
      id,
      joinLocalPath(usesModelFolders(job.plan.directory) ? joinLocalPath(job.plan.directory, id) : job.plan.directory, text.name),
      text.sha256,
      text.size
    )
    if (!(await models.getModel(id))) throw new Error('SETUP_TEXT_REGISTRATION')
  }
  const embeddingId = embedding.name.replace(/\.gguf$/, '')
  if (!(await models.getModel(embeddingId))) {
    await models.pullModel(
      embeddingId,
      joinLocalPath(usesModelFolders(job.plan.directory) ? joinLocalPath(job.plan.directory, embeddingId) : job.plan.directory, embedding.name),
      embedding.sha256,
      embedding.size
    )
    if (!(await models.getModel(embeddingId))) throw new Error('SETUP_EMBEDDING_REGISTRATION')
    await models.updateModelSettings(embeddingId, { ngl: 0 })
  }
  useDefaultEmbeddingModel.getState().setDefault('llamacpp', embeddingId)
  for (const { factor, file } of upscalers) {
    const path = joinLocalPath(usesModelFolders(job.plan.directory) ? joinLocalPath(job.plan.directory, 'upscale_models') : job.plan.directory, file!.name)
    useImageUpscale.getState().registerModel(factor, path)
    useImageUpscale.getState().setModel(factor, path)
  }
  // Local import registers the existing file by reference; no duplicate weights.
  const providers = useModelProvider.getState()
  const provider = providers.providers.find((p) => p.provider === 'llamacpp')
  if (!provider) throw new Error('SETUP_TEXT_PROVIDER_MISSING')
  if (provider && !provider.models.some((m) => m.id === id))
    providers.updateProvider('llamacpp', {
      models: [
        ...provider.models,
        {
          id,
          name: id,
          capabilities: ['completion', 'tools'],
          imported: true,
          output_modalities: ['text'],
        },
      ],
    })
  const updatedProvider = useModelProvider.getState().providers.find((p) => p.provider === 'llamacpp')!
  if (!updatedProvider.models.some((m) => m.id === embeddingId))
    useModelProvider.getState().updateProvider('llamacpp', {
      models: [...updatedProvider.models, { id: embeddingId, name: embeddingId, embedding: true, imported: true }],
    })
  useModelProvider.getState().selectModelProvider('llamacpp', id)
  try {localStorage.setItem(localStorageKey.lastUsedModel,JSON.stringify({provider:'llamacpp',model:id}))} catch { /* Selection still works when web storage is unavailable. */ }
  if (scope && useThreads.getState().threads[scope])
    useThreads
      .getState()
      .updateThread(scope, { model: { id, provider: 'llamacpp' } })
}
