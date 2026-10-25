import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'
import { TranslationProvider } from '@/i18n/TranslationContext'
import i18n from '@/i18n/setup'
import { localStorageKey } from '@/constants/localStorage'
import { intlLocale } from '@/utils/intlLocale'

const settings = vi.hoisted(() => ({ currentLanguage: 'en', setCurrentLanguage: vi.fn() }))
vi.mock('@/hooks/useGeneralSetting', () => ({ useGeneralSetting: () => settings }))

afterEach(() => {
  cleanup()
  i18n.changeLanguage('en')
  localStorage.clear()
  settings.currentLanguage = 'en'
  vi.clearAllMocks()
})

it.each([
  ['gu', 'ગુજરાતી', 'બંધ કરો', 'ltr'],
  ['kn', 'ಕನ್ನಡ', 'ಮುಚ್ಚಿ', 'ltr'],
  ['apc', 'عربي شامي', 'سكّر', 'rtl'],
  ['apd', 'عربي سوداني', 'اقفل', 'rtl'],
  ['yo', 'Yorùbá', 'Pa', 'ltr'],
  ['bho', 'भोजपुरी', 'बंद करीं', 'ltr'],
  ['cjy', '晋语', '关上', 'ltr'],
  ['nan', '閩南語', '關起來', 'ltr'],
  ['my', 'မြန်မာ', 'ပိတ်ရန်', 'ltr'],
  ['arq', 'دارجة جزائرية', 'سدّ', 'rtl'],
  ['hak', '客家話', '關忒', 'ltr'],
  ['ln', 'Lingála', 'Kanga', 'ltr'],
  ['ary', 'الدارجة المغربية', 'سدّ', 'rtl'],
  ['or', 'ଓଡ଼ିଆ', 'ବନ୍ଦ କରନ୍ତୁ', 'ltr'],
  ['uk', 'Українська', 'Закрити', 'ltr'],
  ['hsn', '湘语', '关起', 'ltr'],
  ['ml', 'മലയാളം', 'അടയ്ക്കുക', 'ltr'],
  ['sd', 'سنڌي', 'بند ڪريو', 'rtl'],
  ['pa', 'ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)', 'ਬੰਦ ਕਰੋ', 'ltr'],
  ['su', 'Basa Sunda', 'Tutup', 'ltr'],
  ['ig', 'Ìgbò', 'Mechie', 'ltr'],
  ['prs', 'دری', 'بسته کنید', 'rtl'],
  ['ne', 'नेपाली', 'बन्द गर्नुहोस्', 'ltr'],
  ['ms', 'Bahasa Melayu', 'Tutup', 'ltr'],
])('selects %s, loads its text, persists the choice and restores menu direction', async (locale, label, close, direction) => {
  const user = userEvent.setup()
  const view = render(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await user.click(screen.getByRole('button', { name: 'English' }))
  await user.click(await screen.findByRole('menuitem', { name: label }))
  expect(settings.setCurrentLanguage).toHaveBeenCalledWith(locale)
  expect(i18n.language).toBe(locale)
  expect(i18n.t('common:close')).toBe(close)
  expect(document.documentElement).toHaveAttribute('lang', locale === 'prs' ? 'fa-AF' : locale)
  expect(document.documentElement).toHaveAttribute('dir', direction)
  expect(JSON.parse(localStorage.getItem(localStorageKey.settingGeneral)!)).toMatchObject({
    state: { currentLanguage: locale },
  })
  const steps = i18n.t('setup:stepCounter', { current: 2, total: 4 })
  expect(steps).toContain('2')
  expect(steps).toContain('4')
  expect(steps).not.toContain('{{')
  const disclosure = i18n.t('common:errorTracking.summary', { host: 'fixture.example' })
  expect(disclosure).toContain('fixture.example')
  expect(disclosure).not.toContain('{{')

  // The settings store can hydrate asynchronously after i18n initialization.
  settings.currentLanguage = locale
  view.rerender(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await waitFor(() => expect(screen.getByRole('button', { name: label })).toBeInTheDocument())
  await user.click(screen.getByRole('button', { name: label }))
  expect(screen.getByRole('menu')).toHaveAttribute('dir', direction)
  await user.click(screen.getByRole('menuitem', { name: 'English' }))
  settings.currentLanguage = 'en'
  view.rerender(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await waitFor(() => expect(document.documentElement).toHaveAttribute('dir', 'ltr'))
  await user.click(screen.getByRole('button', { name: 'English' }))
  expect(screen.getByRole('menu')).toHaveAttribute('dir', 'ltr')
})

it.each([['apc', 'ar-LB'], ['apd', 'ar-SD'], ['arq', 'ar-DZ'], ['ary', 'ar-MA'],
  ['cjy', 'zh-CN'], ['nan', 'zh-TW'], ['hak', 'zh-TW'], ['hsn', 'zh-CN'], ['prs', 'fa-AF'],
  ['sd', 'sd-Arab-PK'], ['pa', 'pa-Guru-IN']])('formats %s using a supported regional locale rather than English fallback', (locale, regional) => {
  expect(intlLocale(locale)).toBe(regional)
  expect(new Intl.NumberFormat(intlLocale(locale)).format(1234)).toBe(
    new Intl.NumberFormat(regional).format(1234),
  )
})
