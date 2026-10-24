import { describe, expect, it } from 'vitest'
import { stripToolCallMarkup } from '../tool-call-markup'
import { exportConversation, conversationFormats } from '@/modules/conversations/export'
import { convertThreadMessageToUIMessage, extractContentPartsFromUIMessage } from '@/modules/conversations/messages'
import { ContentType, MessageStatus, type ThreadMessage } from '@janhq/core'

const raw = "<|tool_call_start|>[google(query='Ferrari F50 complete summary history specifications'), google(query='Ferrari F50 1988 racing car technical specifications history')]<|tool_call_end|>"

describe('printed tool protocol is not conversation prose', () => {
  it('removes the reported Google calls and preserves the actual answer', () => {
    expect(stripToolCallMarkup(`Before\n${raw}\nFinal answer`)).toBe('Before\n\nFinal answer')
    expect(stripToolCallMarkup(raw)).toBe('')
    expect(stripToolCallMarkup(raw + raw + 'Answer')).toBe('Answer')
  })
  it('does not expose unfinished calls while their tokens arrive', () => {
    for (let end = 2; end < raw.length; end++) {
      expect(stripToolCallMarkup(raw.slice(0, end))).toBe('')
    }
  })
  it.each([
    `\`${raw}\``, `\`\`example \` ${raw}\`\``,
    `~~~txt\n${raw}\n~~~`, `\`\`\`\`txt\n\`\`\`\n${raw}\n\`\`\`\``,
    `\`\`\`txt\n${raw}`,
  ])('preserves literal protocol in code examples: %s', (code) => {
    expect(stripToolCallMarkup(code)).toBe(code)
  })
  const message: ThreadMessage = {
    id: 'a', thread_id: 't', object: 'thread.message', role: 'assistant',
    content: [{ type: ContentType.Text, text: { value: `${raw}Final answer`, annotations: [] } }],
    created_at: 1, completed_at: 1, status: MessageStatus.Ready,
  }
  it('cleans history on reload and persistence without interpreting or running it', () => {
    const ui = convertThreadMessageToUIMessage(message)
    expect(JSON.stringify(ui.parts)).not.toContain('google(query')
    expect(JSON.stringify(ui.parts)).toContain('Final answer')
    const clean = extractContentPartsFromUIMessage({ id: 'a', role: 'assistant', parts: [{ type: 'text', text: raw + 'Answer' }] })
    expect(clean[0].text?.value).toBe('Answer')
    const user = extractContentPartsFromUIMessage({ id: 'u', role: 'user', parts: [{ type: 'text', text: raw }] })
    expect(user[0].text?.value).toBe(raw)
  })
  it.each(conversationFormats)('excludes printed calls from %s exports', (format) => {
    const file = exportConversation({ id: 't', title: 'Conversation' }, [message], format)
    expect(file.content).not.toContain('google(query')
    expect(file.content).not.toContain('tool_call_start')
    expect(file.content).toContain('Final answer')
  })
})
