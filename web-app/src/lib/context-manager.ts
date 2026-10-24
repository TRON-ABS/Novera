import type { UIMessage } from '@ai-sdk/react'
import { generateText, type LanguageModel } from 'ai'
import { CHARS_PER_TOKEN, estimateTokens, trimMessages, type ContextManagerConfig, type TrimResult } from '@/modules/conversations/context'
export * from '@/modules/conversations/context'

// Model execution remains an application orchestration concern.
const COMPACT_SYSTEM_PROMPT =
  'You are a conversation summarizer. Produce a concise summary that preserves ' +
  'key facts, decisions, code snippets, and action items. Use bullet points. ' +
  'Keep the summary under 500 words.'

/**
 * Summarize older messages that would be trimmed, then prepend the summary
 * as a system-style user message so the model retains context.
 */
export async function compactMessages(
  messages: UIMessage[],
  config: ContextManagerConfig,
  model: LanguageModel,
  systemPromptTokens: number = 0
): Promise<TrimResult> {
  const { maxContextTokens, maxOutputTokens } = config

  if (maxContextTokens <= 0) {
    return { messages, trimmedCount: 0 }
  }

  const inputBudget = maxContextTokens - maxOutputTokens - systemPromptTokens
  if (inputBudget <= 0) {
    return { messages: messages.slice(-1), trimmedCount: messages.length - 1 }
  }

  // First figure out which messages would be kept/dropped
  const trimResult = trimMessages(messages, config, systemPromptTokens)

  if (trimResult.trimmedCount === 0) {
    return trimResult
  }

  const droppedMessages = messages.slice(0, trimResult.trimmedCount)

  // Build conversation text from dropped messages
  const conversationText = droppedMessages
    .map((m) => {
      const text = m.parts
        .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
        .map((p) => p.text)
        .join('')
      return `${m.role}: ${text}`
    })
    .join('\n\n')

  if (!conversationText.trim()) {
    return trimResult
  }

  // The summarization call itself uses context: system prompt + conversation
  // excerpt + summary output. Cap the excerpt to ~70% of the context budget
  // (in characters, using the same heuristic) so the call doesn't exceed limits.
  const summaryOutputTokens = 512
  const summaryBudgetTokens = Math.max(
    1024,
    maxContextTokens - summaryOutputTokens - estimateTokens(COMPACT_SYSTEM_PROMPT)
  )
  const maxExcerptChars = Math.floor(summaryBudgetTokens * CHARS_PER_TOKEN)

  const truncated =
    conversationText.length > maxExcerptChars
      ? conversationText.slice(-maxExcerptChars)
      : conversationText

  try {
    const { text: summary } = await generateText({
      model,
      system: COMPACT_SYSTEM_PROMPT,
      prompt: `Summarize this conversation excerpt:\n\n${truncated}`,
      maxOutputTokens: summaryOutputTokens,
    })

    // Inject the summary as a system message so models treat it as context
    // rather than as a user turn (which could confuse turn-taking logic).
    const summaryMessage: UIMessage = {
      id: `compact-summary-${Date.now()}`,
      role: 'system',
      parts: [
        {
          type: 'text',
          text: `[Previous conversation summary]\n${summary}`,
        },
      ],
    }

    // Re-trim: the summary message itself consumes tokens, so the combined
    // set (summary + kept messages) may exceed the input budget. Run
    // trimMessages again on the merged list to guarantee we stay within
    // the context window.
    const merged = [summaryMessage, ...trimResult.messages]
    const refit = trimMessages(merged, config, systemPromptTokens)

    return {
      messages: refit.messages,
      trimmedCount: trimResult.trimmedCount + refit.trimmedCount,
      compactedSummary: summary,
    }
  } catch (error) {
    console.warn('Auto-compact summarization failed, falling back to trim:', error)
    return trimResult
  }
}
