import type { ThreadMessage } from '@janhq/core'
import { computeActivePath } from './branching'

export const conversationFormats = ['md', 'txt', 'json', 'html', 'csv'] as const
export type ConversationFormat = (typeof conversationFormats)[number]
export type ConversationExport = {
  filename: string
  mime: string
  content: string
}
export type ExportThread = {
  id: string
  title: string
  metadata?: Record<string, unknown>
}

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ]!
  )

// Older messages store reasoning inside text instead of dedicated parts. Skip
// those sections, including unfinished ones, but preserve literal code examples.
function assistantExportText(value: string): string {
  const tag = '(?:[a-zA-Z][a-zA-Z0-9]*:)?(?:think|thought|thinking|reasoning|analysis)'
  const tokens = new RegExp(
    '```[\\s\\S]*?(?:```|$)|~~~[\\s\\S]*?(?:~~~|$)|`[^`\\n]*`' +
      `|<(?<closing>/)?(?<tag>${tag})(?:\\s[^>]*)?>` +
      '|(?:<\\|start\\|>assistant)?<\\|channel\\|>(?<channel>analysis|final)<\\|message\\|>' +
      '|<\\|(?:end|im_end|eot_id)\\|>',
    'gi'
  )
  const stack: string[] = []
  let analysis = false
  let offset = 0
  let result = ''
  for (const token of value.matchAll(tokens)) {
    if (!stack.length && !analysis) result += value.slice(offset, token.index)
    const groups = token.groups!
    if (groups.tag) {
      const name = groups.tag.toLowerCase()
      if (!groups.closing) stack.push(name)
      else if (stack.at(-1) === name) stack.pop()
    } else if (groups.channel) {
      analysis = groups.channel.toLowerCase() === 'analysis'
    } else if (!stack.length && !analysis && !token[0].startsWith('<|')) {
      result += token[0]
    }
    offset = token.index! + token[0].length
  }
  if (!stack.length && !analysis) result += value.slice(offset)
  return result
}

/** A file export contains conversation content, never execution traces. */
function conversationMessage(message: ThreadMessage): ThreadMessage | undefined {
  if (message.role !== 'user' && message.role !== 'assistant') return
  const content = message.content.flatMap<ThreadMessage['content'][number]>((part) => {
    if (part.type === 'text' && part.text) {
      const value = message.role === 'assistant'
        ? assistantExportText(part.text.value)
        : part.text.value
      return value.trim()
        ? [{ type: part.type, text: { value, annotations: [] } }]
        : []
    }
    if (part.type === 'image_url' && part.image_url)
      return [{ type: part.type, image_url: part.image_url }]
    if (part.type === 'input_audio' && part.input_audio)
      return [{ type: part.type, input_audio: part.input_audio }]
    if (part.type === 'input_video' && part.input_video)
      return [{ type: part.type, input_video: part.input_video }]
    return []
  })
  if (!content.length && !message.attachments?.length) return
  const metadata = Object.fromEntries(
    Object.entries(message.metadata ?? {}).filter(([key, value]) =>
      (key === 'parentId' && (value === null || typeof value === 'string')) ||
      (key === 'activeChildId' && typeof value === 'string')
    )
  )
  return {
    id: message.id,
    object: message.object,
    thread_id: message.thread_id,
    role: message.role,
    content,
    status: message.status,
    created_at: message.created_at,
    completed_at: message.completed_at,
    ...(message.attachments && {
      attachments: message.attachments.map(({ file_id }) => ({ file_id })),
    }),
    ...(Object.keys(metadata).length && { metadata }),
  }
}

// Text formats describe external/binary attachments; JSON preserves their
// stored data. No exporter reads a path or fetches URLs.
export function messageExportText(message: ThreadMessage): string {
  const clean = conversationMessage(message)
  if (!clean) return ''
  const parts = clean.content.map((part) => {
    if (part.text) return part.text.value
    if (part.type === 'image_url') {
      const url = part.image_url?.url ?? ''
      return url.startsWith('data:')
        ? '[image: embedded data in JSON]'
        : `[image: ${url}]`
    }
    if (part.type === 'input_audio') return '[audio: stored data in JSON]'
    if (part.type === 'input_video') return '[video: stored data in JSON]'
    return ''
  })
  for (const attachment of clean.attachments ?? []) {
    parts.push(`[attachment: ${attachment.file_id ?? 'external file'}]`)
  }
  return parts.join('\n\n')
}

export function exportBasename(title: string): string {
  let safe = title
    .normalize('NFC')
    .replace(/[<>:"/\\|?*\x00-\x1f\x7f]/g, '_')
    .replace(/^[. ]+|[. ]+$/g, '')
    .slice(0, 80)
    .replace(/[. ]+$/g, '')
  if (!safe || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(safe))
    safe = `Novera-${safe || 'discussion'}`
  return safe
}

function csvCell(value: string): string {
  // Spreadsheet apps can execute cells beginning with formula prefixes, even
  // when CSV quotes are present. Prefix those values before standard escaping.
  const safe = /^[\s\uFEFF]*[=+@-]/.test(value) ? `'${value}` : value
  return `"${safe.replace(/"/g, '""')}"`
}

export function exportConversation(
  thread: ExportThread,
  messages: ThreadMessage[],
  format: ConversationFormat,
  exportedAt = new Date().toISOString()
): ConversationExport {
  const title = thread.title || 'Novera'
  const activeRootId =
    typeof thread.metadata?.activeRootId === 'string'
      ? thread.metadata.activeRootId
      : undefined
  // Select the branch before filtering: tool-only nodes may link visible turns.
  const visible = computeActivePath(messages, activeRootId)
    .flatMap((message) => conversationMessage(message) ?? [])
  const stamp = exportedAt.replace(/[^0-9TZ]/g, '-')
  const filename = `${exportBasename(title)}-${stamp}.${format}`
  if (format === 'json')
    return {
      filename,
      mime: 'application/json;charset=utf-8',
      content: JSON.stringify(
        {
          format: 'novera-conversation',
          version: 2,
          exportedAt,
          attachmentPolicy:
            'Stored message data and references only; external attachment files are not bundled.',
          contentPolicy: 'Conversation only; internal reasoning and tool activity omitted.',
          thread: {
            id: thread.id,
            title: thread.title,
            ...(activeRootId && { metadata: { activeRootId } }),
          },
          messages: messages.flatMap((message) => conversationMessage(message) ?? []),
          activeMessageIds: visible.map((m) => m.id),
        },
        null,
        2
      ),
    }
  if (format === 'html') {
    const entries = visible
      .map(
        (m) =>
          `<article><h2>${escapeHtml(m.role)}</h2><pre dir="auto">${escapeHtml(messageExportText(m))}</pre></article>`
      )
      .join('\n')
    return {
      filename,
      mime: 'text/html;charset=utf-8',
      content: `<!doctype html>
<html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'self' 'unsafe-inline'; base-uri 'none'; form-action 'none'"><title>${escapeHtml(title)}</title><style>body{font:16px system-ui,sans-serif;max-width:900px;margin:32px auto;padding:0 24px;color:#202020}pre{font:inherit;white-space:pre-wrap;overflow-wrap:anywhere}article{border-top:1px solid #ddd;padding:12px 0}h1,h2{overflow-wrap:anywhere}@media print{body{margin:0;max-width:none}h2{break-after:avoid}}</style></head><body><h1 dir="auto">${escapeHtml(title)}</h1><p>Novera · ${escapeHtml(exportedAt)}</p>${entries}</body></html>`,
    }
  }
  if (format === 'csv')
    return {
      filename,
      mime: 'text/csv;charset=utf-8',
      content:
        '\uFEFF' +
        [
          ['id', 'role', 'created_at', 'content'],
          ...visible.map((m) => [
            m.id,
            m.role,
            String(m.created_at),
            messageExportText(m),
          ]),
        ]
          .map((row) => row.map(csvCell).join(','))
          .join('\r\n'),
    }
  const heading =
    format === 'md' ? `# ${title.replace(/[\r\n]/g, ' ')}\n\n` : `${title}\n\n`
  return {
    filename,
    mime:
      format === 'md'
        ? 'text/markdown;charset=utf-8'
        : 'text/plain;charset=utf-8',
    content:
      heading +
      visible
        .map(
          (m) =>
            `${format === 'md' ? '## ' : ''}${m.role}\n\n${messageExportText(m)}`
        )
        .join('\n\n'),
  }
}
