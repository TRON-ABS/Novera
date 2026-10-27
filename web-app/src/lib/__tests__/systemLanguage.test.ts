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
    ['ceb', 'ceb'], ['kk', 'kk'], ['si', 'si'], ['xh', 'xh'], ['km', 'km'],
    ['af', 'af'], ['mai', 'mai'], ['wo', 'wo'], ['kmr', 'kmr'], ['rw', 'rw'],
    ['ku-Latn-TR', 'kmr'], ['ku-Arab-IQ', 'en'],
    ['uzn', 'uzn'], ['uz-UZ', 'uzn'], ['uz-Latn-UZ', 'uzn'], ['uz-Cyrl-UZ', 'en'], ['uz-Arab-AF', 'en'],
    ['pbu-AF', 'pbu'], ['ps-PK', 'pbu'], ['ps-Arab-AF', 'pbu'], ['ps-Latn', 'en'], ['pbt-AF', 'en'],
    ['gaz-ET', 'gaz'], ['om-ET', 'gaz'], ['om-Latn-KE', 'gaz'], ['om-Ethi', 'en'],
    ['zu-ZA', 'zu'], ['aec-EG', 'aec'], ['skr-PK', 'skr'], ['nl-NL', 'nl'], ['nl-BE', 'nl'],
    ['so-SO', 'so'], ['ro-RO', 'ro'], ['as-IN', 'as'],
    ['fr-FR', 'fr'], ['fr_CA.UTF-8', 'fr'], ['de-AT', 'de-DE'],
    ['pt-PT', 'pt-PT'], ['pt-BR', 'pt-BR'], ['pt-AO', 'pt-PT'],
    ['zh-Hans-HK', 'zh-CN'], ['zh-Hant', 'zh-TW'], ['zh-HK', 'zh-TW'],
    ['vi-VN', 'vn'], ['fa-AF', 'prs'], ['fa-IR', 'fa-IR'], ['prs', 'prs'], ['prs-AF', 'prs'], ['fil-PH', 'tl'],
    ['pa-Arab-PK', 'pnb'], ['pa-IN', 'pa'], ['pa-Guru-PK', 'pa'], ['pa-PK', 'pnb'], ['yue-Hant-HK', 'yue'],
    ['gu-IN', 'gu'], ['kn-IN', 'kn'], ['apc-LB', 'apc'], ['apd-SD', 'apd'],
    ['ar-LB', 'apc'], ['ar-SY', 'apc'], ['ar-JO', 'apc'], ['ar-PS', 'apc'],
    ['ar-SD', 'apd'], ['ar-DZ', 'arq'], ['ar-MA', 'ary'],
    ['arq-DZ', 'arq'], ['ary-MA', 'ary'], ['yo-NG', 'yo'], ['bho-IN', 'bho'],
    ['cjy-CN', 'cjy'], ['nan-TW', 'nan'], ['my-MM', 'my'], ['hak-TW', 'hak'],
    ['ln-CD', 'ln'], ['or-IN', 'or'], ['uk-UA', 'uk'], ['hsn-CN', 'hsn'],
    ['ml-IN', 'ml'], ['sd-PK', 'sd'], ['sd-Arab-IN', 'sd'], ['sd-Deva-IN', 'en'],
    ['su-ID', 'su'], ['ig-NG', 'ig'], ['ne-NP', 'ne'], ['ms-MY', 'ms'], ['ar-SA', 'ar'], ['ar-EG', 'ar'], ['arz-EG', 'arz'], ['en-US', 'en'], ['sv-SE', 'en'],
  ])('matches %s to %s', (tag, language) => {
    expect(matchSystemLanguage([tag])).toBe(language)
  })
  it('tries later preferred languages and falls back safely on invalid or absent tags', () => {
    expect(matchSystemLanguage(['bad tag', 'sv-SE', 'ja-JP', 'fr-FR'])).toBe('ja')
    expect(matchSystemLanguage(['sd-Deva-IN', 'fr-FR'])).toBe('fr')
    expect(matchSystemLanguage(['uz-Cyrl-UZ', 'ps-Latn', 'om-Ethi', 'pbt-AF', 'nl-BE'])).toBe('nl')
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
