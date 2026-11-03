import type { UIMessage } from 'ai'
import { stripToolCallMarkup } from '@/modules/tools/tool-call-markup'

/** Prefer the answer; when it is absent, copy only the trace visible to the user. */
export function messageExportText(message: UIMessage): string {
  const text = message.parts.filter(p => p.type === 'text').map(p => p.text).join('\n')
  const answer = message.role === 'assistant' ? stripToolCallMarkup(text) : text
  if (answer.trim()) return answer
  return message.parts.flatMap(part => {
    if (part.type === 'reasoning') return part.text?.trim() ? [part.text] : []
    const value = part as unknown as { state?: string; errorText?: unknown; error?: unknown }
    if (value.state !== 'output-error') return []
    const error = value.errorText ?? value.error
    return typeof error === 'string' && error.trim() ? [error] : []
  }).join('\n\n')
}
