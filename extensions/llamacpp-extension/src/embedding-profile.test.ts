import { describe, expect, it } from 'vitest'
import { DEFAULT_EMBEDDER_ID, embeddingInputs, embeddingSettings } from './embedding-profile'

describe('Qwen3 embedding profile', () => {
  it('uses the official last pooling, microbatch and trained context from the embedding GGUF', () => {
    expect(embeddingSettings({ 'general.architecture': 'qwen3', 'general.name': 'Qwen3 Embedding 0.6b', 'qwen3.pooling_type': 3 }))
      .toEqual({ pooling: 'last', ubatch_size: 8192, batch_size: 8192, ctx_size: 32768, n_gpu_layers: 0 })
    expect(embeddingSettings({ 'general.architecture': 'bert', 'bert.pooling_type': 1 }).pooling).toBe('mean')
  })
  it('adds the retrieval instruction only to Qwen queries, in every language', () => {
    const text = ['Où est la tour Eiffel ?', '¿Dónde está la torre Eiffel?', 'エッフェル塔はどこですか？']
    expect(embeddingInputs(DEFAULT_EMBEDDER_ID, text, 'query')).toEqual(text.map((query) =>
      `Instruct: Given a web search query, retrieve relevant passages that answer the query\nQuery: ${query}`))
    expect(embeddingInputs(DEFAULT_EMBEDDER_ID, text)).toEqual(text)
    expect(embeddingInputs(DEFAULT_EMBEDDER_ID, text, 'document')).toEqual(text)
    expect(embeddingInputs('custom-embedder', text, 'query')).toEqual(text)
  })
})
