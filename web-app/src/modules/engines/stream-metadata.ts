import type { MetadataExtractor } from '@ai-sdk/openai-compatible'
import type { EngineProgressObserver, EngineStreamProgress } from './contracts'

/**
 * Llama.cpp timings structure from the response
 */
interface LlamaCppTimings {
  prompt_n?: number
  predicted_n?: number
  predicted_per_second?: number
  prompt_per_second?: number
  cache_n?: number
}

// prompt_n only counts tokens freshly processed this turn; tokens served from
// the KV cache (the rest of the conversation) are reported separately in
// cache_n, so total prompt/context usage is the sum of both.
const totalPromptTokens = (timings: LlamaCppTimings): number =>
  (timings.prompt_n ?? 0) + (timings.cache_n ?? 0)

interface LlamaCppPromptProgress {
  total?: number
  cache?: number
  processed?: number
  time_ms?: number
}

interface LlamaCppChunk {
  timings?: LlamaCppTimings
  prompt_progress?: LlamaCppPromptProgress
}

/** Per-request metadata; the caller decides where progress should be displayed. */
export const createProviderMetadataExtractor = (
  streamThreadId?: string,
  observer: EngineProgressObserver = () => {},
): MetadataExtractor => ({
  extractMetadata: async ({ parsedBody }: { parsedBody: unknown }) => {
    const body = parsedBody as LlamaCppChunk
    if (!body?.timings) return undefined
    return { providerMetadata: {
      promptTokens: totalPromptTokens(body.timings),
      completionTokens: body.timings.predicted_n ?? null,
      tokensPerSecond: body.timings.predicted_per_second ?? null,
      promptPerSecond: body.timings.prompt_per_second ?? null,
    } }
  },
  createStreamExtractor: () => {
    let lastTimings: LlamaCppTimings | undefined
    return {
      processChunk: (parsedChunk: unknown) => {
        const chunk = parsedChunk as LlamaCppChunk
        const event: EngineStreamProgress = { threadId: streamThreadId }
        if (chunk?.timings) {
          lastTimings = chunk.timings
          event.stats = {
            promptTokens: totalPromptTokens(lastTimings),
            completionTokens: lastTimings.predicted_n ?? 0,
            tokensPerSecond: lastTimings.predicted_per_second ?? null,
            promptPerSecond: lastTimings.prompt_per_second ?? null,
          }
        }
        const pp = chunk?.prompt_progress
        if (pp && typeof pp.total === 'number' && typeof pp.processed === 'number') {
          event.prompt = { total: pp.total, processed: pp.processed, cache: pp.cache ?? 0, time_ms: pp.time_ms ?? 0 }
        }
        observer(event)
      },
      buildMetadata: () => lastTimings ? { providerMetadata: {
        promptTokens: totalPromptTokens(lastTimings),
        completionTokens: lastTimings.predicted_n ?? null,
        tokensPerSecond: lastTimings.predicted_per_second ?? null,
        promptPerSecond: lastTimings.prompt_per_second ?? null,
      } } : undefined,
    }
  },
})
