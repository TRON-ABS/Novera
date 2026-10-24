import { describe, expect, it } from 'vitest'
import { ContentType, MessageStatus, type ThreadMessage } from '@janhq/core'
import {
  conversationFormats,
  exportBasename,
  exportConversation,
  messageExportText,
} from '../export'

const message = (
  id: string,
  text: string,
  metadata?: Record<string, unknown>
): ThreadMessage => ({
  id,
  thread_id: 't',
  object: 'thread.message',
  role: 'user' as ThreadMessage['role'],
  content: [{ type: ContentType.Text, text: { value: text, annotations: [] } }],
  status: MessageStatus.Ready,
  created_at: 1,
  completed_at: 1,
  metadata,
})
const thread = { id: 't', title: 'École 世界' }
const stamp = '2026-10-24T01:00:00.000Z'

describe('conversation exports', () => {
  it('exports the selected root and branch for readable formats', () => {
    const messages = [
      message('root', 'selected', { parentId: null, activeChildId: 'old' }),
      message('old', 'visible answer', { parentId: 'root' }),
      message('new', 'hidden answer', { parentId: 'root' }),
      message('root2', 'other root', { parentId: null }),
    ]
    for (const format of ['md', 'txt', 'html', 'csv'] as const) {
      const file = exportConversation(
        { ...thread, metadata: { activeRootId: 'root' } },
        messages,
        format,
        stamp
      )
      expect(file.content).toContain('visible answer')
      expect(file.content).not.toContain('hidden answer')
      expect(file.content).not.toContain('other root')
    }
  })
  it('archives every version and the active path in JSON without mutating data', () => {
    const messages = [
      message('a', 'one', { parentId: null }),
      message('b', 'two', { parentId: null }),
    ]
    const before = JSON.stringify(messages)
    const json = JSON.parse(
      exportConversation(thread, messages, 'json', stamp).content
    )
    expect(json.messages).toEqual(messages)
    expect(json.activeMessageIds).toEqual(['b'])
    expect(json.thread).toEqual(thread)
    expect(json.version).toBe(2)
    expect(JSON.stringify(messages)).toBe(before)
  })
  it('escapes model HTML and title so an exported page cannot execute it', () => {
    const html = exportConversation(
      { ...thread, title: '<script>alert(1)</script>' },
      [message('x', '<img src=x onerror="alert(2)"> & \'quote\'')],
      'html',
      stamp
    ).content
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;img')
    expect(html).toContain("default-src 'none'")
    expect(html).toContain('&#39;quote&#39;')
  })
  it.each(['=1+1', '+cmd', '-1+2', '@SUM(A1)', '  =HYPERLINK("x")', '\t=1'])(
    'neutralizes spreadsheet formulas: %s',
    (text) => {
      const csv = exportConversation(
        thread,
        [message('x', text)],
        'csv',
        stamp
      ).content
      expect(csv).toContain(`"'${text.replace(/"/g, '""')}"`)
    }
  )
  it('quotes CSV commas, newlines and Unicode, with an UTF-8 BOM', () => {
    const csv = exportConversation(
      thread,
      [message('x', 'é, "x"\n世界')],
      'csv',
      stamp
    ).content
    expect(csv.startsWith('\uFEFF')).toBe(true)
    expect(csv).toContain('"é, ""x""\n世界"')
  })
  it('names files safely on Windows without losing normal Unicode', () => {
    expect(exportBasename('CON.txt')).toBe('Novera-CON.txt')
    expect(exportBasename('../bad:<name>? ')).not.toMatch(/[<>:"/\\|?*]/)
    expect(exportBasename('...')).toBe('Novera-discussion')
    expect(exportBasename('école 世界')).toBe('école 世界')
    for (const format of conversationFormats) {
      const file = exportConversation(thread, [], format, stamp)
      expect(file.filename.endsWith(`.${format}`)).toBe(true)
      expect(file.content).toBeTruthy()
    }
  })
  it('describes attachments in text and retains embedded data only in JSON', () => {
    const msg = message('a', 'hello')
    msg.content.push({
      type: ContentType.Image,
      image_url: { url: 'data:image/png;base64,AAAA' },
    })
    msg.content.push({
      type: ContentType.InputAudio,
      input_audio: { data: 'BBBB', format: 'wav' },
    })
    msg.attachments = [{ file_id: '/external/file.pdf' }]
    expect(messageExportText(msg)).toContain('/external/file.pdf')
    expect(messageExportText(msg)).not.toContain('AAAA')
    expect(messageExportText(msg)).not.toContain('BBBB')
    const json = exportConversation(thread, [msg], 'json', stamp).content
    expect(json).toContain('AAAA')
    expect(json).toContain('BBBB')
  })

  it.each(conversationFormats)('omits reasoning and search activity from %s without changing stored messages', (format) => {
    const question = message('question', 'What is the answer?')
    const answer = {
      ...message('answer', 'Final answer with https://example.com/source', {
        tool_calls: [{ name: 'web_search', response: 'PRIVATE_METADATA_RESULT' }],
        reasoning: 'PRIVATE_METADATA_REASONING',
      }),
      role: 'assistant' as ThreadMessage['role'],
    }
    answer.content.unshift(
      { type: ContentType.Reasoning, text: { value: 'PRIVATE_THINKING', annotations: [] } },
      { type: ContentType.ToolCall, tool_name: 'web_search', input: 'PRIVATE_QUERY', output: 'PRIVATE_SEARCH_RESULT' }
    )
    const toolOnly = { ...message('search', 'PRIVATE_TOOL_MESSAGE'), role: 'tool' as ThreadMessage['role'] }
    const reasoningOnly = {
      ...message('thinking', ''),
      role: 'assistant' as ThreadMessage['role'],
      content: [{ type: ContentType.Reasoning, text: { value: 'PRIVATE_ONLY_REASONING', annotations: [] } }],
    }
    const messages = [question, toolOnly, reasoningOnly, answer]
    const before = JSON.stringify(messages)
    const file = exportConversation(thread, messages, format, stamp)
    expect(file.content).toContain('What is the answer?')
    expect(file.content).toContain('Final answer with https://example.com/source')
    expect(file.content).not.toContain('PRIVATE_')
    expect(JSON.stringify(messages)).toBe(before)
    if (format === 'json') {
      const json = JSON.parse(file.content)
      expect(json.messages.map((m: ThreadMessage) => m.id)).toEqual(['question', 'answer'])
      expect(json.activeMessageIds).toEqual(['question', 'answer'])
    }
  })

  it.each([
    '<think>PRIVATE_LEGACY</think>Final answer',
    '<thought>PRIVATE_LEGACY</thought>Final answer',
    '<thinking>PRIVATE_LEGACY</thinking>Final answer',
    '<mm:think mode="deep">PRIVATE_LEGACY</mm:think>Final answer',
    '<analysis>PRIVATE_LEGACY</analysis>Final answer',
    '<think>PRIVATE_LEGACY</think><reasoning>PRIVATE_MORE</reasoning>Final answer',
    '<|channel|>analysis<|message|>PRIVATE_LEGACY<|start|>assistant<|channel|>final<|message|>Final answer',
  ])('removes legacy reasoning blocks from every format: %s', (text) => {
    const assistant = { ...message('a', text), role: 'assistant' as ThreadMessage['role'] }
    for (const format of conversationFormats) {
      const file = exportConversation(thread, [assistant], format, stamp)
      expect(file.content).toContain('Final answer')
      expect(file.content).not.toContain('PRIVATE_')
    }
  })

  it('keeps final prose around reasoning and preserves user text and code examples', () => {
    const userText = 'Explain <think>this tag</think> and web_search.'
    const code = '```xml\n<think>literal example</think>\n```'
    const assistant = {
      ...message('a', `Before <think>PRIVATE_THINKING</think>after.\n${code}\nUse \`<analysis>\` here.`),
      role: 'assistant' as ThreadMessage['role'],
    }
    expect(messageExportText(message('u', userText))).toBe(userText)
    expect(messageExportText(assistant)).toBe(`Before after.\n${code}\nUse \`<analysis>\` here.`)
  })

  it.each(['<think>PRIVATE_PENDING', '<|channel|>analysis<|message|>PRIVATE_PENDING'])(
    'does not export unfinished reasoning: %s', (text) => {
      const assistant = { ...message('a', text), role: 'assistant' as ThreadMessage['role'] }
      expect(messageExportText(assistant)).toBe('')
      for (const format of conversationFormats) {
        expect(exportConversation(thread, [assistant], format, stamp).content).not.toContain('PRIVATE_PENDING')
      }
    }
  )

  it('keeps the selected answer when intermediate tool nodes are filtered', () => {
    const root = message('u', 'Question', { parentId: null, activeChildId: 'tool' })
    const tool = {
      ...message('tool', 'PRIVATE_RESULT', { parentId: 'u', activeChildId: 'a' }),
      role: 'tool' as ThreadMessage['role'],
    }
    const answer = { ...message('a', 'Final answer', { parentId: 'tool' }), role: 'assistant' as ThreadMessage['role'] }
    const alternative = { ...message('b', 'Inactive answer', { parentId: 'tool' }), role: 'assistant' as ThreadMessage['role'] }
    for (const format of ['txt', 'md', 'html', 'csv'] as const) {
      const file = exportConversation(thread, [root, tool, answer, alternative], format, stamp)
      expect(file.content).toContain('Final answer')
      expect(file.content).not.toContain('PRIVATE_RESULT')
      expect(file.content).not.toContain('Inactive answer')
    }
  })
})
