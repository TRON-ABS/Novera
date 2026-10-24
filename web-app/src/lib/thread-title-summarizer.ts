import { generateText } from 'ai'
import { ModelFactory } from './model-factory'
import { useModelProvider } from '@/hooks/useModelProvider'
import { BACKGROUND_THREAD_ID, CHAT_SLOT_ID } from '@/constants/models'

import { cleanTitle, MAX_TITLE_WORDS } from '@/modules/conversations/titles'
export { cleanTitle } from '@/modules/conversations/titles'

const MAX_PROMPT_LENGTH = 1500

function buildSummarizePrompt(transcript: string): string {
  const truncated =
    transcript.length > MAX_PROMPT_LENGTH
      ? transcript.slice(0, MAX_PROMPT_LENGTH) + '...'
      : transcript
  return `Summarize the following conversation into a concise title of at most ${MAX_TITLE_WORDS} words. Capture the overall topic, not just the latest turn. Output the title only, no quotes, no explanation.\n\nConversation:\n${truncated}`
}

/**
 * Generate a summarized thread title from the user's first message.
 * Uses the owning thread's model via a non-streaming generateText call.
 * Returns null on failure or if the signal is aborted.
 */
export async function generateThreadTitle(
  transcript: string,
  abortSignal: AbortSignal,
  threadModel: ThreadModel | undefined
): Promise<string | null> {
  try {
    const { getProviderByName } = useModelProvider.getState()
    if (!threadModel?.id || !threadModel.provider || abortSignal.aborted) {
      return null
    }
    const { id: modelId, provider: selectedProvider } = threadModel

    // MLX models often emit reasoning that can't be reliably suppressed; fall back to default title.
    if (selectedProvider === 'mlx') return null

    const provider = getProviderByName(selectedProvider)
    if (!provider) {
      console.warn('[ThreadTitle] Provider not found:', selectedProvider)
      return null
    }

    console.log('[ThreadTitle] Creating model:', modelId, 'provider:', selectedProvider)
    // Slot 0 like every other surface, but under its own thread identity: the
    // engine parks the chat's KV prefix before this call takes the slot and
    // restores it on the next chat turn. Sending no thread_id would overwrite
    // that prefix with nothing saved, and pinning a higher slot is unsafe --
    // upstream wraps an out-of-range id_slot modulo the slot count instead of
    // rejecting it, so it would land back on slot 0 anyway.
    const params: Record<string, unknown> = {}
    if (selectedProvider === 'llamacpp') {
      params.chat_template_kwargs = { enable_thinking: false }
      params.id_slot = CHAT_SLOT_ID
      params.thread_id = BACKGROUND_THREAD_ID
    }
    const model = await ModelFactory.createModel(
      modelId,
      provider,
      params
    )

    if (abortSignal.aborted) return null

    console.log('[ThreadTitle] Calling generateText...')
    const { text } = await generateText({
      model,
      messages: [{ role: 'user', content: buildSummarizePrompt(transcript) }],
      maxOutputTokens: 128,
      abortSignal,
    })

    console.log('[ThreadTitle] Raw response:', JSON.stringify(text))
    const cleaned = cleanTitle(text)
    console.log('[ThreadTitle] Cleaned title:', cleaned)
    return cleaned
  } catch (error) {
    // Silently swallow abort errors — this is expected when the user sends a new message
    if ((error as Error).name === 'AbortError') return null
    console.error('[ThreadTitle] Failed to generate title:', error)
    return null
  }
}
