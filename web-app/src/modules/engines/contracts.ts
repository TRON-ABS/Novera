export interface ModelParameters {
  temperature?: number
  top_k?: number
  top_p?: number
  repeat_penalty?: number
  max_output_tokens?: number
  max_context_tokens?: number
  auto_compact?: boolean
  presence_penalty?: number
  frequency_penalty?: number
  stop_sequences?: string[]
}

/** Progress types shared with adapters without depending on React or Zustand. */
export interface EngineLiveStats {
  promptTokens: number
  completionTokens: number
  tokensPerSecond: number | null
  promptPerSecond: number | null
}
export interface EnginePromptProgress {
  total: number
  processed: number
  cache: number
  time_ms: number
}
export interface EngineStreamProgress {
  threadId?: string
  stats?: EngineLiveStats
  prompt?: EnginePromptProgress
}
export type EngineProgressObserver = (event: EngineStreamProgress) => void
