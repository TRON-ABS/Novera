import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { prepareShare } from './index'
import { zipFiles } from './zip'
import { renderShareHtml } from './rich'
import type { ShareEntry, ShareFormat } from '@/modules/conversations/share'
import type { CoreService } from '@/services/core/types'
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => false }))
const png =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jP8kAAAAASUVORK5CYII='
const labels = {
  user: 'Vous',
  assistant: 'Assistant',
  sources: 'Sources',
  parameters: 'Paramètres',
}
const entries: ShareEntry[] = [
  {
    id: 'a',
    role: 'assistant',
    text: '# École 世界 مرحبًا\n\n**Gras** et *italique*.\n\n| A | B |\n|---|---|\n| 1 | 2 |\n\n```js\nconst x = "<script>"\n```\n\n$\\frac{x^2}{2}$',
    assets: [
      {
        id: 'image',
        url: `data:image/png;base64,${png}`,
        mime: 'image/png',
        name: 'Image.png',
        messageId: 'a',
      },
    ],
  },
]
const core = {
  invoke: vi.fn(),
  convertFileSrc: vi.fn(),
} as unknown as CoreService
function unzip(bytes: Uint8Array) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength),
    files = new Map<string, Uint8Array>()
  let p = 0
  while (view.getUint32(p, true) === 0x04034b50) {
    const size = view.getUint32(p + 18, true),
      nameLength = view.getUint16(p + 26, true),
      extra = view.getUint16(p + 28, true),
      name = new TextDecoder().decode(bytes.slice(p + 30, p + 30 + nameLength)),
      start = p + 30 + nameLength + extra
    files.set(name, bytes.slice(start, start + size))
    p = start + size
  }
  expect(view.getUint32(p, true)).toBe(0x02014b50)
  return files
}
describe('portable rich sharing formats', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'fetch',
      vi.fn(
        async () =>
          new Response(
            Uint8Array.from(atob(png), (c) => c.charCodeAt(0)),
            { headers: { 'content-type': 'image/png' } }
          )
      )
    )
  })
  it.each([
    'html',
    'docx',
    'odt',
    'epub',
    'rtf',
    'json',
    'csv',
    'md',
    'txt',
    'zip',
    'pdf',
  ] as ShareFormat[])(
    'exports %s without scripts or remote assets',
    async (format) => {
      const result = await prepareShare({
        title: 'École 世界',
        entries,
        format,
        labels,
        core,
        sources: [{ url: 'https://example.org/paper', title: 'Paper' }],
        parameters: [{ seed: 42 }],
      })
      expect(result.bytes!.length).toBeGreaterThan(0)
      expect(result.html).not.toContain('<script>')
      expect(result.html).toContain('<table>')
      expect(result.html).toContain('<math')
      expect(result.html).not.toContain('katex-html')
      if (['docx', 'odt', 'epub', 'zip'].includes(format)) {
        const files = unzip(result.bytes!)
        for (const [name, value] of files)
          if (/\.(xml|rels|opf|xhtml)$/.test(name)) {
            const parsed = new DOMParser().parseFromString(
              new TextDecoder().decode(value),
              'application/xml'
            )
            expect(parsed.querySelector('parsererror'), name).toBeNull()
          }
        if (format === 'docx') {
          expect(
            new TextDecoder().decode(files.get('word/document.xml'))
          ).toContain('<m:oMath>')
          expect(files.has('word/media/image1.png')).toBe(true)
        }
        if (format === 'odt') {
          expect(files.has('Object1/content.xml')).toBe(true)
          expect(new TextDecoder().decode(files.get('mimetype'))).toBe(
            'application/vnd.oasis.opendocument.text'
          )
        }
        if (format === 'epub') {
          expect(new TextDecoder().decode(files.get('index.xhtml'))).toContain(
            'media/asset0.png'
          )
          expect(files.has('media/asset0.png')).toBe(true)
        }
        if (format === 'zip')
          expect(
            new TextDecoder().decode(files.get('index.html'))
          ).not.toContain('src="data:')
      }
      if (format === 'csv')
        expect(new TextDecoder().decode(result.bytes)).toContain('seed')
      const output = process.env.NOVERA_SHARE_FIXTURES
      if (output && format !== 'pdf') {
        mkdirSync(output, { recursive: true })
        writeFileSync(join(output, `fixture.${format}`), result.bytes!)
      }
    }
  )
  it('does not read media for plain text and CSV exports', async () => {
    await prepareShare({ title: 'Text', entries, format: 'txt', labels, core })
    expect(fetch).not.toHaveBeenCalled()
  })
  it('never executes HTML or unsafe links in a message', () => {
    const html = renderShareHtml(
      'Title',
      [
        {
          id: 'a',
          role: 'assistant',
          assets: [],
          text: '<script>alert(1)</script>\n\n[bad](javascript:alert(1))',
        },
      ],
      new Map(),
      labels,
      [],
      []
    )
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('href="javascript:')
  })
  it('uses an audio element for music only when a rich HTML export is explicitly selected', () => {
    const html = renderShareHtml('Music', [{ id: 'a', role: 'assistant', text: '', assets: [
      { id: 'song', url: 'data:audio/mpeg;base64,AQID', mime: 'audio/mpeg', name: 'Song.mp3', messageId: 'a' },
    ] }], new Map([['song', 'data:audio/mpeg;base64,AQID']]), labels, [], [])
    expect(html).toContain('<audio controls')
    expect(html).not.toContain('<video')
    expect(html).not.toContain('novera-media-player')
  })
  it('rejects traversal and duplicate archive entries', () => {
    expect(() =>
      zipFiles([{ name: '../secret', bytes: new Uint8Array() }])
    ).toThrow()
    expect(() =>
      zipFiles([
        { name: 'a', bytes: new Uint8Array() },
        { name: 'a', bytes: new Uint8Array() },
      ])
    ).toThrow()
  })
})
