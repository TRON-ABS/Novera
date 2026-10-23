import { afterEach, describe, expect, it, vi } from 'vitest'
import { readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { matchSystemLanguage, supportedLanguages, detectSystemLanguage } from '../systemLanguage'

const h = vi.hoisted(() => ({ locale: vi.fn(), native: false }))
vi.mock('@tauri-apps/plugin-os', () => ({ locale: h.locale }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => h.native }))
afterEach(() => { vi.restoreAllMocks(); h.native = false; h.locale.mockReset() })

describe('system language matching', () => {
  it.each([
    ['fr-FR', 'fr'], ['fr_CA.UTF-8', 'fr'], ['de-AT', 'de-DE'],
    ['pt-PT', 'pt-PT'], ['pt-BR', 'pt-BR'], ['pt-AO', 'pt-PT'],
    ['zh-Hans-HK', 'zh-CN'], ['zh-Hant', 'zh-TW'], ['zh-HK', 'zh-TW'],
    ['vi-VN', 'vn'], ['fa-AF', 'fa-IR'], ['fil-PH', 'tl'],
    ['pa-Arab-PK', 'pnb'], ['pa-IN', 'en'], ['yue-Hant-HK', 'yue'],
    ['ar-EG', 'ar'], ['arz-EG', 'arz'], ['en-US', 'en'], ['sv-SE', 'en'],
  ])('matches %s to %s', (tag, language) => {
    expect(matchSystemLanguage([tag])).toBe(language)
  })
  it('tries later preferred languages and falls back safely on invalid or absent tags', () => {
    expect(matchSystemLanguage(['bad tag', 'sv-SE', 'ja-JP', 'fr-FR'])).toBe('ja')
    expect(matchSystemLanguage([])).toBe('en')
    expect(matchSystemLanguage(['C', ''])).toBe('en')
  })
  it('matches the supported catalogs without inventing locales', () => {
    const catalogs = readdirSync(resolve(import.meta.dirname, '../../locales'), { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name !== '__tests__').map((entry) => entry.name)
    expect([...supportedLanguages].sort()).toEqual(catalogs.sort())
  })
  it('prefers the native system locale over the webview language', async () => {
    h.native = true
    h.locale.mockResolvedValue('fr-CA')
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US'])
    expect(await detectSystemLanguage()).toBe('fr')
  })
  it('falls back to browser preferences when OS detection fails', async () => {
    h.native = true
    h.locale.mockRejectedValue(new Error('OS IPC unavailable'))
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['de-AT'])
    expect(await detectSystemLanguage()).toBe('de-DE')
  })
})
