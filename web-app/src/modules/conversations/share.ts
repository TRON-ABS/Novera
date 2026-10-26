import type { ThreadMessage } from '@janhq/core'
import { computeActivePath } from './branching'
import { conversationMessage, exportBasename } from './export'

export type ShareScope = 'render' | 'conversation' | 'selection'
export type ShareFormat =
  | 'original'
  | 'md'
  | 'txt'
  | 'html'
  | 'pdf'
  | 'docx'
  | 'odt'
  | 'rtf'
  | 'epub'
  | 'json'
  | 'csv'
  | 'zip'
  | 'png'
  | 'jpeg'
  | 'webp'
  | 'gif'
  | 'bmp'
  | 'tiff'
  | 'ico'
  | 'tga'
  | 'ppm'
  | 'avif'
  | 'qoi'
  | 'svg'
export type ShareAsset = {
  id: string
  url: string
  mime: string
  name: string
  messageId: string
  inline?: boolean
}
export type ShareEntry = {
  id: string
  role: string
  text: string
  assets: ShareAsset[]
}
export type ShareOptions = {
  scope: ShareScope
  messageId?: string
  assetUrl?: string
  selected: string[]
  questions: boolean
  sources: boolean
  parameters: boolean
}

export function shareEntries(
  messages: ThreadMessage[],
  activeRootId?: string
): ShareEntry[] {
  return computeActivePath(messages, activeRootId).flatMap((raw) => {
    const m = conversationMessage(raw)
    if (!m) return []
    const assets: ShareAsset[] = []
    for (const [index, part] of m.content.entries()) {
      let url = '',
        mime = ''
      if (part.type === 'image_url') {
        url = part.image_url?.url ?? ''
        const extension = url.split(/[?#]/)[0].split('.').at(-1)?.toLowerCase()
        const imageTypes: Record<string, string> = {
          jpg: 'jpeg',
          jpeg: 'jpeg',
          webp: 'webp',
          gif: 'gif',
          svg: 'svg+xml',
          avif: 'avif',
          bmp: 'bmp',
          tif: 'tiff',
          tiff: 'tiff',
        }
        mime =
          /^data:([^;,]+)/.exec(url)?.[1] ??
          `image/${imageTypes[extension ?? ''] ?? 'png'}`
      }
      if (part.type === 'input_video') {
        url = part.input_video?.data ?? ''
        const format = part.input_video?.format ?? 'mp4'
        mime =
          /^data:([^;,]+)/.exec(url)?.[1] ??
          (format.includes('/')
            ? format
            : `video/${format === 'mov' ? 'quicktime' : format}`)
      }
      if (url && mime) {
        if (
          !/^(?:data:|https?:|blob:|novera-creation:)/i.test(url) &&
          /^[a-zA-Z0-9+/=\r\n]+$/.test(url)
        )
          url = `data:${mime};base64,${url}`
        const ext = mime.split('/')[1]?.replace(/[^a-z0-9]/gi, '') || 'bin'
        const name = url.startsWith('novera-creation:')
          ? url.split('/').at(-1)!
          : `${exportBasename(m.id)}-${index}.${ext}`
        assets.push({
          id: `${m.id}-${index}`,
          url,
          mime,
          name,
          messageId: m.id,
        })
      }
    }
    const text = m.content
      .filter((p) => p.type === 'text')
      .map((p) => p.text?.value ?? '')
      .join('\n\n')
    return [{ id: m.id, role: m.role, text, assets }]
  })
}

export function selectShareEntries(
  entries: ShareEntry[],
  options: ShareOptions
): ShareEntry[] {
  const chosen =
    options.scope === 'render'
      ? entries.filter(
          (e) =>
            e.id ===
            (options.messageId ??
              [...entries].reverse().find((e) => e.role === 'assistant')?.id)
        )
      : options.scope === 'selection'
        ? entries.filter((e) => options.selected.includes(e.id))
        : entries
  return chosen
    .filter((e) => options.questions || e.role !== 'user')
    .map((e) => ({
      ...e,
      ...(options.scope === 'render' && options.assetUrl
        ? {
            text: '',
            assets: e.assets.filter((a) => a.url === options.assetUrl),
          }
        : {}),
    }))
    .filter((e) => e.text.trim() || e.assets.length)
}

export const documentShareFormats: ShareFormat[] = [
  'md',
  'txt',
  'html',
  'pdf',
  'docx',
  'odt',
  'rtf',
  'epub',
  'json',
  'csv',
  'zip',
]
export function formatsForShare(
  entries: ShareEntry[],
  nativeImages: boolean
): ShareFormat[] {
  const assets = entries.flatMap((e) => e.assets)
  if (entries.length === 1 && !entries[0].text.trim() && assets.length === 1) {
    return assets[0].mime.startsWith('image/')
      ? [
          'original',
          'png',
          'jpeg',
          'webp',
          ...(nativeImages
            ? ([
                'gif',
                'bmp',
                'tiff',
                'ico',
                'tga',
                'ppm',
                'qoi',
                'avif',
              ] as ShareFormat[])
            : []),
          'svg',
          'html',
          'pdf',
          'zip',
        ]
      : ['original', 'html', 'zip']
  }
  return documentShareFormats
}
