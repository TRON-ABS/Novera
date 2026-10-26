/** Input understanding and output creation are separate capabilities. */
export type Modality = 'text' | 'image' | 'video' | 'audio'
export type ModelCategory = 'all' | 'text' | 'image' | 'video' | 'multimodal'
export type ModelSource = 'all' | 'local' | 'cloud'
export interface ModalModel {
  embedding?: boolean
  capabilities?: readonly string[]
  input_modalities?: readonly Modality[]
  output_modalities?: readonly Modality[]
}
export const LOCAL_MODEL_PROVIDERS = new Set([
  'llamacpp',
  'mlx',
  'transformers',
  'diffusers',
])
export function modelModalities(model: ModalModel) {
  const capabilities = model.capabilities ?? []
  const inputs = new Set<Modality>(model.input_modalities ?? ['text'])
  if (capabilities.includes('vision')) inputs.add('image')
  if (capabilities.includes('video')) inputs.add('video')
  if (capabilities.includes('audio')) inputs.add('audio')
  const outputs = new Set<Modality>(model.output_modalities ?? [])
  if (capabilities.includes('image-generation')) outputs.add('image')
  if (capabilities.includes('video-generation')) outputs.add('video')
  if (
    capabilities.includes('completion') ||
    (!outputs.size && !model.embedding && !capabilities.includes('embeddings'))
  )
    outputs.add('text')
  return {
    inputs: [...inputs],
    outputs: [...outputs],
    multimodal: inputs.size > 1 || outputs.size > 1,
  }
}
export function matchesModelFilter(
  model: ModalModel,
  provider: string,
  category: ModelCategory,
  source: ModelSource
): boolean {
  if (model.embedding || model.capabilities?.includes('embeddings'))
    return false
  const local = LOCAL_MODEL_PROVIDERS.has(provider)
  if (source !== 'all' && local !== (source === 'local')) return false
  const modes = modelModalities(model)
  return (
    category === 'all' ||
    (category === 'multimodal'
      ? modes.multimodal
      : modes.outputs.includes(category))
  )
}
