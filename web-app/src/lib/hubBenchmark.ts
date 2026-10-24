import { streamText } from 'ai'

export type HubMeasurement = { elapsedMs: number; firstTokenMs: number | null; outputTokens: number | null; tokensPerSecond: number | null; measuredAt: string; systemMemoryBytes?: number }

// Fixed local-only workload; no chat history, tools, network search or persistence.
// End-to-end throughput includes prompt processing, unlike a decode-only figure.
export async function measureHubModel(model: Parameters<typeof streamText>[0]['model'], signal: AbortSignal): Promise<HubMeasurement> {
  const start = performance.now()
  let first: number | null = null
  const run = streamText({ model, prompt: 'Write a clear paragraph explaining how rain forms and why plants need water. Use simple sentences and continue for about 120 words.', maxOutputTokens: 128, temperature: 0, abortSignal: signal, maxRetries: 0 })
  for await (const part of run.fullStream) {
    if (part.type === 'error') throw part.error
    if (part.type === 'text-delta' && part.text && first === null) first = performance.now() - start
  }
  signal.throwIfAborted()
  const elapsedMs = performance.now() - start
  const usage = await run.totalUsage
  const tokens = usage.outputTokens
  const outputTokens = typeof tokens === 'number' && Number.isFinite(tokens) && tokens > 0 ? tokens : null
  if (first === null && !outputTokens) throw new Error('No output')
  return { elapsedMs, firstTokenMs: first, outputTokens, tokensPerSecond: outputTokens && elapsedMs > 0 ? outputTokens / (elapsedMs / 1000) : null, measuredAt: new Date().toISOString() }
}
