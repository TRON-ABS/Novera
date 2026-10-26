import { describe, expect, it } from 'vitest'
import { attachmentFilename } from './filename'

describe('attachment name interoperability', () => {
  it('avoids the observed UTF-8/legacy-codepage and percent-decoding failure', () => {
    const name = attachmentFilename(
      "un beau cœur d'amour sur fond de nuit étoilé.html"
    )
    expect(name).toBe('un-beau-coeur-d-amour-sur-fond-de-nuit-etoile.html')
    const legacyDecoded = Array.from(new TextEncoder().encode(name), (c) =>
      String.fromCharCode(c)
    ).join('')
    expect(decodeURIComponent(encodeURI(legacyDecoded))).toBe(name)
  })
  it.each([
    '中文',
    'العربية',
    'हिन्दी',
    '日本語',
    '한국어',
    'Русский',
    'Ελληνικά',
    'עברית',
    'ไทย',
    '😀',
    'école',
    'œuvre',
    'a%20b',
    '../CON',
    'NUL',
    'COM1',
    'a'.repeat(300),
  ])('produces a bounded portable attachment for %s', (title) => {
    const name = attachmentFilename(`${title}.html`)
    expect(name).toMatch(/^[a-z0-9_-]+\.html$/i)
    expect(name.length).toBeLessThanOrEqual(125)
    expect(name).not.toMatch(/^(con|prn|aux|nul|com[1-9]|lpt[1-9])\./i)
    expect(attachmentFilename(name)).toBe(name)
  })
  it.each([
    'txt',
    'md',
    'html',
    'docx',
    'odt',
    'rtf',
    'epub',
    'json',
    'csv',
    'zip',
    'png',
    'jpg',
    'webp',
    'gif',
    'bmp',
    'tiff',
    'ico',
    'tga',
    'ppm',
    'qoi',
    'avif',
    'svg',
    'mp4',
    'webm',
  ])('retains the real %s extension', (extension) => {
    expect(attachmentFilename(`École 世界.${extension}`)).toBe(
      `Ecole.${extension}`
    )
  })
})
