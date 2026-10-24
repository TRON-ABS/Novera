import type { UIMessage } from '@ai-sdk/react'
import { stripToolImageSentinels } from '@/modules/tools/tool-images'

/**
 * Approximate token count using a character-based heuristic.
 *
 * On average, 1 token ≈ 4 characters for English text across most
 * tokenizers (GPT, Claude, etc.). This is intentionally conservative
 * so the trimmer leaves a safety margin.
 */
export const CHARS_PER_TOKEN = 3.5

// Match the CLI's conservative fallback when a remote deployment has not
// reported a window. This budget is client-side only and an explicit assistant
// limit wins. Bundled engines keep their existing context/shift handling.
const REMOTE_CONTEXT_FALLBACK = 128_000

export function resolveAutoCompactWindow(
  configuredTokens: number,
  providerId: string,
  autoCompact: boolean
): number {
  if (Number.isFinite(configuredTokens) && configuredTokens > 0) {
    return configuredTokens
  }
  return autoCompact && providerId !== 'llamacpp' && providerId !== 'mlx'
    ? REMOTE_CONTEXT_FALLBACK
    : 0
}

export function estimateTokens(text: string): number {
  if (!text) return 0
  return Math.ceil(text.length / CHARS_PER_TOKEN)
}

/**
 * Share of the model's context window a single tool result may occupy.
 *
 * One result should never crowd out the conversation that gives it meaning, so
 * this is deliberately a minority of the window: enough for a substantial page
 * or file, far short of the whole budget.
 */
const TOOL_OUTPUT_FRACTION_OF_CONTEXT = 0.25

/**
 * Per-tool-result character budget derived from the active model's context
 * window, so a bigger window earns a proportionally bigger allowance instead of
 * being held to one hardcoded number.
 *
 * Returns `undefined` when the window is unknown - remote providers often don't
 * report one - leaving the user's configured cap in sole charge.
 */
export function deriveToolOutputCap(
  contextWindowTokens: number | undefined
): number | undefined {
  if (!contextWindowTokens || contextWindowTokens <= 0) return undefined
  return Math.floor(
    contextWindowTokens * CHARS_PER_TOKEN * TOOL_OUTPUT_FRACTION_OF_CONTEXT
  )
}

/**
 * What one tool-result image costs the model. Vision encoders turn an image
 * into a roughly fixed number of tokens, not one per base64 character, so
 * counting the characters would put a 1 MB screenshot at hundreds of thousands
 * of tokens and evict the user's question from the window.
 */
const TOOL_IMAGE_TOKENS = 2_000
const TOOL_IMAGE_STAND_IN = 'x'.repeat(
  Math.ceil(TOOL_IMAGE_TOKENS * CHARS_PER_TOKEN)
)

function messageToText(message: UIMessage): string {
  const parts: string[] = []
  for (const part of message.parts) {
    if (part.type === 'text') {
      parts.push(part.text)
    } else if (part.type === 'dynamic-tool' || part.type.startsWith('tool-')) {
      // Swap each image's base64 for a stand-in of `TOOL_IMAGE_TOKENS`. An
      // image takes two forms in a tool output: an MCP `{ type: 'image',
      // data }` item and an inline tool image sentinel inside a string.
      parts.push(
        JSON.stringify(part, function (this: { type?: unknown }, key, value) {
          if (typeof value !== 'string') return value
          if (key === 'data' && this.type === 'image') return TOOL_IMAGE_STAND_IN
          return stripToolImageSentinels(value, TOOL_IMAGE_STAND_IN)
        })
      )
    }
  }

  const metadata = message.metadata as
    | { inline_file_contents?: Array<{ name?: string; content?: string }> }
    | undefined
  if (Array.isArray(metadata?.inline_file_contents)) {
    for (const file of metadata.inline_file_contents) {
      if (file?.content) {
        parts.push(`File: ${file.name || 'attachment'}\n${file.content}`)
      }
    }
  }

  return parts.join('\n')
}

export function estimateMessageTokens(message: UIMessage): number {
  const text = messageToText(message)
  // Add a small overhead per message for role/formatting tokens
  return estimateTokens(text) + 4
}

/** Tokens a whole conversation already occupies in the context window. */
export function estimateConversationTokens(
  messages: readonly UIMessage[] | undefined
): number {
  return (messages ?? []).reduce(
    (sum, message) => sum + estimateMessageTokens(message),
    0
  )
}

export interface ContextManagerConfig {
  maxContextTokens: number
  maxOutputTokens: number
  autoCompact: boolean
}

export interface TrimResult {
  messages: UIMessage[]
  trimmedCount: number
  compactedSummary?: string
}

/**
 * Trim messages to fit within the context budget.
 *
 * Strategy:
 * 1. Always keep the system prompt (counted separately) and the most recent message
 * 2. Walk backwards from the newest message, accumulating tokens
 * 3. Drop the oldest messages that don't fit
 * 4. Never drop the first user message if it would leave no context
 */
export function trimMessages(
  messages: UIMessage[],
  config: ContextManagerConfig,
  systemPromptTokens: number = 0
): TrimResult {
  const { maxContextTokens, maxOutputTokens } = config

  if (maxContextTokens <= 0) {
    return { messages, trimmedCount: 0 }
  }

  const inputBudget = maxContextTokens - maxOutputTokens - systemPromptTokens
  if (inputBudget <= 0) {
    return { messages: messages.slice(-1), trimmedCount: messages.length - 1 }
  }

  // Estimate tokens for each message
  const estimates = messages.map((msg) => ({
    message: msg,
    tokens: estimateMessageTokens(msg),
  }))

  // Walk backwards, accumulating tokens
  let totalTokens = 0
  const kept: UIMessage[] = []

  for (let i = estimates.length - 1; i >= 0; i--) {
    const { message, tokens } = estimates[i]
    if (totalTokens + tokens > inputBudget && kept.length > 0) {
      break
    }
    totalTokens += tokens
    kept.unshift(message)
  }

  // Ensure we always have at least the last message
  if (kept.length === 0 && messages.length > 0) {
    kept.push(messages[messages.length - 1])
  }

  return {
    messages: kept,
    trimmedCount: messages.length - kept.length,
  }
}

