import type { CoreService } from '@/services/core/types'
import type { DialogService } from '@/services/dialog/types'
import type {
  ShareEntry,
  ShareAsset,
  ShareFormat,
} from '@/modules/conversations/share'
import { exportBasename } from '@/modules/conversations/export'
import { parseCreationReference } from '@/modules/engines/creation'
import { isPlatformTauri } from '@/lib/platform/utils'
import { zipFiles } from './zip'
import { renderShareHtml, markdownImages, escapeXml } from './rich'
import {
  wordDocument,
  openDocument,
  epubDocument,
  rtfDocument,
} from './documents'

const LIMIT = 256 * 1024 * 1024
export type ShareLabels = {
  user: string
  assistant: string
  sources: string
  parameters: string
}
export type PreparedShare = {
  title: string
  format: ShareFormat
  html: string
  text: string
  filename: string
  mime: string
  bytes?: Uint8Array
  original?: ShareAsset
  previewUrl?: string
  files?: File[]
}
const utf8 = (s: string) => new TextEncoder().encode(s)
export function bytesBase64(bytes: Uint8Array): string {
  const chunks: string[] = []
  for (let i = 0; i < bytes.length; i += 8192)
    chunks.push(String.fromCharCode(...bytes.subarray(i, i + 8192)))
  return btoa(chunks.join(''))
}
const decode = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0))
const fileFrom = (value: PreparedShare) =>
  new File([value.bytes!.slice().buffer], value.filename, { type: value.mime })

async function readAsset(
  asset: ShareAsset,
  core: CoreService,
  signal?: AbortSignal
): Promise<{ bytes: Uint8Array; mime: string }> {
  const ref = parseCreationReference(asset.url)
  if (ref && isPlatformTauri()) {
    const value = await core.invoke<{ base64: string; mime: string }>(
      'sharing_read_asset',
      ref
    )
    return { bytes: decode(value.base64), mime: value.mime }
  }
  if (!/^(https?:|data:(?:image|video|audio)\/|blob:)/i.test(asset.url))
    throw new Error('SHARE_MEDIA_MISSING')
  const response = await fetch(asset.url, {
    signal,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
  })
  if (!response.ok) throw new Error('SHARE_MEDIA_MISSING')
  if (Number(response.headers.get('content-length')) > LIMIT)
    throw new Error('SHARE_TOO_LARGE')
  const reader = response.body?.getReader(),
    chunks: Uint8Array[] = []
  let size = 0
  if (!reader) throw new Error('SHARE_MEDIA_MISSING')
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    size += value.length
    if (size > LIMIT) {
      await reader.cancel()
      throw new Error('SHARE_TOO_LARGE')
    }
    chunks.push(value)
  }
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) {
    bytes.set(chunk, offset)
    offset += chunk.length
  }
  return {
    bytes,
    mime: response.headers.get('content-type')?.split(';')[0] || asset.mime,
  }
}

async function imageConvert(
  bytes: Uint8Array,
  format: string,
  core: CoreService
): Promise<{ bytes: Uint8Array; mime: string }> {
  if (isPlatformTauri()) {
    try {
      const result = await core.invoke<{ base64: string; mime: string }>(
        'sharing_convert_image',
        { base64: bytesBase64(bytes), format }
      )
      return { bytes: decode(result.base64), mime: result.mime }
    } catch (error) {
      if (
        !['png', 'jpeg', 'webp'].includes(format) ||
        typeof createImageBitmap !== 'function'
      )
        throw error
    }
  }
  if (!['png', 'jpeg', 'webp'].includes(format))
    throw new Error('SHARE_UNSUPPORTED')
  const blob = new Blob([bytes.slice().buffer]),
    bitmap = await createImageBitmap(blob)
  try {
    if (bitmap.width * bitmap.height > 100_000_000)
      throw new Error('SHARE_TOO_LARGE')
    const canvas = document.createElement('canvas')
    canvas.width = bitmap.width
    canvas.height = bitmap.height
    const ctx = canvas.getContext('2d')!
    if (format === 'jpeg') {
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    ctx.drawImage(bitmap, 0, 0)
    const result = await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (b) =>
          b && b.type === `image/${format}`
            ? resolve(b)
            : reject(new Error('SHARE_UNSUPPORTED')),
        `image/${format}`,
        0.95
      )
    )
    return {
      bytes: new Uint8Array(await result.arrayBuffer()),
      mime: result.type,
    }
  } finally {
    bitmap.close()
  }
}

export async function prepareShare(input: {
  title: string
  entries: ShareEntry[]
  format: ShareFormat
  labels: ShareLabels
  sources?: { title: string; url: string }[]
  parameters?: unknown[]
  core: CoreService
  signal?: AbortSignal
}): Promise<PreparedShare> {
  const { format, core, signal } = input
  if (!input.entries.length) throw new Error('SHARE_EMPTY')
  const entries = input.entries.map((entry) => ({
    ...entry,
    assets: [
      ...entry.assets,
      ...markdownImages(entry.text).map((url, index) => ({
        url,
        id: `${entry.id}-inline-${index}`,
        name: `inline-${index}.png`,
        mime: 'image/png',
        messageId: entry.id,
        inline: true,
      })),
    ],
  }))
  const assets = entries.flatMap((e) => e.assets),
    media = new Map<string, string>(),
    data = new Map<string, { bytes: Uint8Array; mime: string }>()
  const originalData = new Map<string, { bytes: Uint8Array; mime: string }>()
  const title = input.title || 'Novera',
    name = exportBasename(title)
  const sources = (input.sources ?? []).filter((s) =>
    /^https?:\/\//i.test(s.url)
  )
  const extraText =
    (sources.length
      ? `\n\n${input.labels.sources}\n${sources.map((s) => `${s.title}: ${s.url}`).join('\n')}`
      : '') +
    ((input.parameters?.length ?? 0) > 0
      ? `\n\n${input.labels.parameters}\n${JSON.stringify(input.parameters, null, 2)}`
      : '')
  const text =
    entries
      .map(
        (e) =>
          `${e.role === 'user' ? input.labels.user : input.labels.assistant}\n\n${e.text}${e.assets.length ? '\n' + e.assets.map((a) => a.name).join('\n') : ''}`
      )
      .join('\n\n') + extraText
  if (
    format === 'original' &&
    assets.length === 1 &&
    parseCreationReference(assets[0].url) &&
    isPlatformTauri()
  ) {
    const path = await core.invoke<string>(
      'creation_resolve',
      parseCreationReference(assets[0].url)!
    )
    return {
      title,
      format,
      text,
      html: '',
      filename: assets[0].name,
      mime: assets[0].mime,
      original: assets[0],
      previewUrl: core.convertFileSrc(path),
    }
  }
  let total = 0
  for (const asset of assets) {
    signal?.throwIfAborted()
    if (
      ['txt', 'csv'].includes(format) ||
      (asset.mime.startsWith('video/') &&
        !['original', 'html', 'zip', 'epub', 'json', 'md'].includes(format))
    ) {
      media.set(asset.id, '')
      media.set(asset.url, '')
      continue
    }
    let content = await readAsset(asset, core, signal)
    originalData.set(asset.id, content)
    if (
      content.mime.startsWith('image/') &&
      ((['docx', 'odt', 'rtf', 'epub'].includes(format) &&
        content.mime !== 'image/png') ||
        (['html', 'pdf', 'zip'].includes(format) &&
          ![
            'image/png',
            'image/jpeg',
            'image/gif',
            'image/webp',
            'image/svg+xml',
          ].includes(content.mime)))
    )
      content = await imageConvert(content.bytes, 'png', core)
    total += content.bytes.length
    if (total > LIMIT) throw new Error('SHARE_TOO_LARGE')
    data.set(asset.id, content)
    const uri = `data:${content.mime};base64,${bytesBase64(content.bytes)}`
    media.set(asset.id, uri)
    media.set(asset.url, uri)
  }
  signal?.throwIfAborted()
  let html = renderShareHtml(
    title,
    entries,
    media,
    input.labels,
    sources,
    input.parameters ?? []
  )
  {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    for (const img of Array.from(doc.images)) {
      const source = img.getAttribute('src'),
        asset = assets.find((a) => media.get(a.id) === source),
        content = asset ? data.get(asset.id) : undefined
      if (!content) continue
      if (
        content.bytes.length >= 24 &&
        content.bytes[0] === 137 &&
        content.bytes[1] === 80 &&
        content.bytes[2] === 78 &&
        content.bytes[3] === 71
      ) {
        const view = new DataView(
          content.bytes.buffer,
          content.bytes.byteOffset,
          content.bytes.byteLength
        )
        img.setAttribute('width', String(view.getUint32(16)))
        img.setAttribute('height', String(view.getUint32(20)))
        continue
      }
      if (typeof createImageBitmap !== 'function') continue
      try {
        const bitmap = await createImageBitmap(
          new Blob([content.bytes.slice().buffer], { type: content.mime })
        )
        img.setAttribute('width', String(bitmap.width))
        img.setAttribute('height', String(bitmap.height))
        bitmap.close()
      } catch {
        /* Keep the media itself even if this browser cannot inspect its dimensions. */
      }
    }
    html = '<!doctype html>\n' + doc.documentElement.outerHTML
  }
  const base = {
    title,
    format,
    text,
    html,
    filename: `${name}.${format}`,
    mime: 'application/octet-stream',
  }
  let bytes: Uint8Array,
    mime: string = base.mime
  if (format === 'original') {
    bytes = data.get(assets[0].id)!.bytes
    mime = data.get(assets[0].id)!.mime
    return { ...base, filename: assets[0].name, mime, bytes }
  }
  if (
    [
      'png',
      'jpeg',
      'webp',
      'gif',
      'bmp',
      'tiff',
      'ico',
      'tga',
      'ppm',
      'qoi',
      'avif',
    ].includes(format)
  ) {
    const image = await imageConvert(
      data.get(assets[0].id)!.bytes,
      format,
      core
    )
    const preview = ['png', 'jpeg', 'webp', 'gif', 'bmp', 'ico'].includes(
      format
    )
      ? image
      : await imageConvert(image.bytes, 'png', core)
    return {
      ...base,
      filename: `${name}.${format === 'jpeg' ? 'jpg' : format}`,
      mime: image.mime,
      bytes: image.bytes,
      previewUrl: `data:${preview.mime};base64,${bytesBase64(preview.bytes)}`,
    }
  }
  if (format === 'svg') {
    const img = new DOMParser()
        .parseFromString(html, 'text/html')
        .querySelector('img'),
      w = Number(img?.getAttribute('width')) || 1024,
      h = Number(img?.getAttribute('height')) || 1024
    bytes = utf8(
      `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" xlink:href="${escapeXml(media.get(assets[0].id)!)}"/></svg>`
    )
    mime = 'image/svg+xml'
  } else if (format === 'docx') {
    bytes = wordDocument(html)
    mime =
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  } else if (format === 'odt') {
    bytes = openDocument(html)
    mime = 'application/vnd.oasis.opendocument.text'
  } else if (format === 'epub') {
    bytes = epubDocument(html, title)
    mime = 'application/epub+zip'
  } else if (format === 'rtf') {
    bytes = utf8(rtfDocument(html))
    mime = 'application/rtf'
  } else if (format === 'json') {
    bytes = utf8(
      JSON.stringify(
        {
          format: 'novera-share',
          version: 1,
          title,
          entries: entries.map((e) => ({
            ...e,
            assets: e.assets.map((a) => ({
              name: a.name,
              mime: data.get(a.id)!.mime,
              data: media.get(a.id),
            })),
          })),
          sources,
          parameters: input.parameters ?? [],
        },
        null,
        2
      )
    )
    mime = 'application/json'
  } else if (format === 'csv') {
    const cell = (v: string) =>
      `"${(/^[\s\uFEFF]*[=+@-]/.test(v) ? "'" + v : v).replace(/"/g, '""')}"`
    bytes = utf8(
      '\uFEFF' +
        [
          ['role', 'text', 'media'],
          ...entries.map((e) => [
            e.role,
            e.text,
            e.assets.map((a) => a.name).join('; '),
          ]),
          ...(extraText ? [['metadata', extraText, '']] : []),
        ]
          .map((r) => r.map(cell).join(','))
          .join('\r\n')
    )
    mime = 'text/csv'
  } else if (format === 'zip') {
    let offline = html
    const originals: { name: string; bytes: Uint8Array }[] = []
    const files = assets.map((a, index) => {
      const original = originalData.get(a.id)!,
        preview = data.get(a.id)!,
        converted = original !== preview
      const path = `media/${index}-${exportBasename(a.name)}${converted ? '.png' : ''}`
      if (converted)
        originals.push({
          name: `originals/${index}-${exportBasename(a.name)}`,
          bytes: original.bytes,
        })
      offline = offline.split(media.get(a.id)!).join(path)
      return { name: path, bytes: preview.bytes }
    })
    // Relative local files are permitted only in this portable, script-free copy.
    offline = offline.replace(
      'img-src data:; media-src data:;',
      "img-src data: 'self'; media-src data: 'self';"
    )
    bytes = zipFiles([
      { name: 'index.html', bytes: utf8(offline) },
      {
        name: 'conversation.md',
        bytes: utf8(entries.map((e) => e.text).join('\n\n') + extraText),
      },
      {
        name: 'manifest.json',
        bytes: utf8(
          JSON.stringify(
            { title, files: [...files, ...originals].map((f) => f.name) },
            null,
            2
          )
        ),
      },
      ...files,
      ...originals,
    ])
    mime = 'application/zip'
  } else if (format === 'html' || format === 'pdf') {
    bytes = utf8(html)
    mime = 'text/html'
  } else {
    bytes = utf8(
      format === 'md'
        ? `# ${title}\n\n${entries
            .map(
              (e) =>
                `## ${e.role === 'user' ? input.labels.user : input.labels.assistant}\n\n${e.assets.filter((a) => a.inline).reduce((body, a) => body.split(a.url).join(media.get(a.id)!), e.text)}\n\n${e.assets
                  .filter((a) => !a.inline)
                  .map(
                    (a) =>
                      `${a.mime.startsWith('image/') ? '!' : ''}[${a.name.replaceAll('[', '').replaceAll(']', '')}](${media.get(a.id)})`
                  )
                  .join('\n')}`
            )
            .join('\n\n')}${extraText}`
        : text
    )
    mime = format === 'md' ? 'text/markdown' : 'text/plain'
  }
  if (bytes.length > LIMIT) throw new Error('SHARE_TOO_LARGE')
  return { ...base, bytes, mime }
}

export async function savePrepared(
  value: PreparedShare,
  dialog: DialogService,
  core: CoreService
): Promise<boolean> {
  if (isPlatformTauri()) {
    const ext = value.filename.split('.').at(-1)!,
      path = await dialog.save({
        defaultPath: value.filename,
        filters: [{ name: ext.toUpperCase(), extensions: [ext] }],
      })
    if (!path) return false
    const destination =
      path.startsWith('content://') || /\.[^/\\.]+$/.test(path)
        ? path
        : `${path}.${ext}`
    await core.invoke('sharing_save', {
      destination,
      payload: {
        filename: value.filename,
        mime: value.mime,
        base64: value.bytes ? bytesBase64(value.bytes) : null,
        asset: value.original
          ? parseCreationReference(value.original.url)
          : null,
      },
    })
    return true
  }
  const file = fileFrom(value),
    url = URL.createObjectURL(file),
    link = document.createElement('a')
  link.href = url
  link.download = value.filename
  document.body.append(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
  return true
}

export function canSystemShare(value: PreparedShare): boolean {
  if (value.format === 'pdf') return false
  if (
    isPlatformTauri() &&
    (IS_WINDOWS || IS_MACOS || IS_LINUX || IS_ANDROID || IS_IOS)
  )
    return true
  if (!navigator.share) return false
  if (['txt', 'md'].includes(value.format)) return true
  return !!value.bytes && !!navigator.canShare?.({ files: [fileFrom(value)] })
}
export async function systemShare(value: PreparedShare, core: CoreService) {
  if (
    isPlatformTauri() &&
    (IS_WINDOWS || IS_MACOS || IS_LINUX || IS_ANDROID || IS_IOS)
  ) {
    await core.invoke('sharing_native', {
      title: value.title,
      text: ['md', 'txt'].includes(value.format) ? value.text : '',
      payload: {
        filename: value.filename,
        mime: value.mime,
        base64: value.bytes ? bytesBase64(value.bytes) : null,
        asset: value.original
          ? parseCreationReference(value.original.url)
          : null,
      },
    })
  } else if (['txt', 'md'].includes(value.format))
    await navigator.share({ title: value.title, text: value.text })
  else await navigator.share({ title: value.title, files: [fileFrom(value)] })
}
export async function copyShareFile(value: PreparedShare, core: CoreService) {
  if (!isPlatformTauri() || value.format === 'pdf')
    throw new Error('SHARE_UNSUPPORTED')
  await core.invoke('sharing_copy_file', {
    payload: {
      filename: value.filename,
      mime: value.mime,
      base64: value.bytes ? bytesBase64(value.bytes) : null,
      asset: value.original ? parseCreationReference(value.original.url) : null,
    },
  })
}
export async function copyPrepared(value: PreparedShare, core: CoreService) {
  if (value.mime.startsWith('video/')) throw new Error('SHARE_UNSUPPORTED')
  if (
    value.mime.startsWith('image/') &&
    navigator.clipboard.write &&
    typeof ClipboardItem !== 'undefined'
  ) {
    const image = (async () => {
      const content = value.original
        ? await readAsset(value.original, core)
        : { bytes: value.bytes!, mime: value.mime }
      const png =
        content.mime === 'image/png'
          ? content
          : await imageConvert(content.bytes, 'png', core)
      return new Blob([png.bytes.slice().buffer], { type: 'image/png' })
    })()
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': image })])
    return
  }
  if (
    navigator.clipboard.write &&
    typeof ClipboardItem !== 'undefined' &&
    value.html
  )
    await navigator.clipboard.write([
      new ClipboardItem({
        'text/plain': new Blob([value.text], { type: 'text/plain' }),
        'text/html': new Blob([value.html], { type: 'text/html' }),
      }),
    ])
  else await navigator.clipboard.writeText(value.text)
}
