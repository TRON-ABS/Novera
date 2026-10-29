export const DEFAULT_EMBEDDER_ID = 'Qwen3-Embedding-0.6B-Q8_0'
export const DEFAULT_EMBEDDER_URL = 'https://huggingface.co/Qwen/Qwen3-Embedding-0.6B-GGUF/resolve/main/Qwen3-Embedding-0.6B-Q8_0.gguf?download=true'
export const DEFAULT_EMBEDDER_SIZE = 639150592
export const DEFAULT_EMBEDDER_SHA256 = '06507c7b42688469c4e7298b0a1e16deff06caf291cf0a5b278c308249c3e439'
export const QWEN_EMBEDDING_UBATCH = 8192

export function isQwenEmbedding(modelId: string) {
  return /^Qwen3-Embedding-0\.6B(?:-|$)/i.test(modelId)
}

/** Follow the GGUF pooling metadata, including decoder embedders' last-token pooling. */
export function embeddingSettings(meta?: Record<string, unknown>) {
  const arch = meta?.['general.architecture']
  const pooling = (['none', 'mean', 'cls', 'last', 'rank'] as const)[Number(meta?.[`${arch}.pooling_type`])] ?? 'mean'
  const qwen = arch === 'qwen3' && /qwen3[ -]embedding/i.test(String(meta?.['general.name']))
  return {
    pooling,
    ubatch_size: qwen ? QWEN_EMBEDDING_UBATCH : 2048,
    batch_size: qwen ? QWEN_EMBEDDING_UBATCH : 2048,
    // Novera keeps the small embedder on CPU so it can coexist with the chat
    // model on an 8 GiB GPU. Pooling/context/microbatch above follow Qwen.
    ...(qwen ? { ctx_size: 32768, n_gpu_layers: 0 } : {}),
  }
}

/** Qwen's instruction belongs only on retrieval queries; indexed passages stay raw. */
export function embeddingInputs(modelId: string, texts: string[], purpose?: 'query' | 'document') {
  if (!isQwenEmbedding(modelId) || purpose !== 'query') return texts
  return texts.map((text) => `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: ${text}`)
}
