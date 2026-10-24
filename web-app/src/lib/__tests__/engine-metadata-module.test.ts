import { describe, expect, it, vi } from 'vitest'
// Importing the engine policy must not require an initialized UI store.
vi.mock('@/hooks/useAppState', () => { throw new Error('engine module accessed UI state') })
import { createProviderMetadataExtractor } from '@/modules/engines/stream-metadata'

describe('engine metadata observer boundary', () => {
  it('reports request-owned progress independently for interleaved streams', () => {
    const a = vi.fn()
    const b = vi.fn()
    const first = createProviderMetadataExtractor('A', a).createStreamExtractor()
    const second = createProviderMetadataExtractor('B', b).createStreamExtractor()
    first.processChunk({ timings: { prompt_n: 8, cache_n: 2, predicted_n: 3 } })
    second.processChunk({ prompt_progress: { total: 20, processed: 10 } })
    first.processChunk({ timings: { prompt_n: 9, cache_n: 4, predicted_n: 5 } })
    expect(a.mock.calls.map(([event]) => event.threadId)).toEqual(['A', 'A'])
    expect(b).toHaveBeenCalledWith({ threadId: 'B', prompt: { total: 20, processed: 10, cache: 0, time_ms: 0 } })
    expect(first.buildMetadata()?.providerMetadata?.promptTokens).toBe(13)
    expect(second.buildMetadata()).toBeUndefined()
  })
  it('allows non-UI consumers to omit the observer entirely', async () => {
    const metadata = createProviderMetadataExtractor()
    const stream = metadata.createStreamExtractor()
    expect(() => stream.processChunk(null)).not.toThrow()
    expect(await metadata.extractMetadata({ parsedBody: { timings: { cache_n: 7, predicted_n: 2 } } })).toEqual({
      providerMetadata: { promptTokens: 7, completionTokens: 2, tokensPerSecond: null, promptPerSecond: null },
    })
  })
  it('keeps unscoped results unscoped instead of guessing an active conversation', () => {
    const observer = vi.fn()
    const stream = createProviderMetadataExtractor(undefined, observer).createStreamExtractor()
    stream.processChunk({ prompt_progress: { total: 2, processed: 1 } })
    expect(observer.mock.calls[0][0].threadId).toBeUndefined()
  })
  it('ignores incomplete progress without corrupting the last valid metadata', () => {
    const observer = vi.fn()
    const stream = createProviderMetadataExtractor('A', observer).createStreamExtractor()
    stream.processChunk({ timings: { predicted_n: 4 } })
    stream.processChunk({ prompt_progress: { total: 10 } })
    expect(observer.mock.calls[1][0].prompt).toBeUndefined()
    expect(stream.buildMetadata()?.providerMetadata?.completionTokens).toBe(4)
  })
})
