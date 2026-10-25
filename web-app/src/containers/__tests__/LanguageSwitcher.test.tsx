import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import LanguageSwitcher, { NATIVE_LANGUAGES } from '../LanguageSwitcher'
import { supportedLanguages } from '@/modules/interface/languages'
import { TranslationProvider } from '@/i18n/TranslationContext'
import i18n from '@/i18n/setup'
import { localStorageKey } from '@/constants/localStorage'

const settings = vi.hoisted(() => ({ currentLanguage: 'en', setCurrentLanguage: vi.fn() }))
vi.mock('@/hooks/useGeneralSetting', () => ({ useGeneralSetting: () => settings }))
afterEach(() => {
  cleanup()
  i18n.changeLanguage('en')
  localStorage.clear()
  settings.currentLanguage = 'en'
  vi.clearAllMocks()
})

it('selects Bengali by its native label, translates text, and persists bn', async () => {
  const user = userEvent.setup()
  const view = render(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await user.click(screen.getByRole('button', { name: 'English' }))
  await user.click(await screen.findByRole('menuitem', { name: 'বাংলা' }))
  expect(settings.setCurrentLanguage).toHaveBeenCalledWith('bn')
  expect(i18n.language).toBe('bn')
  expect(i18n.t('common:close')).toBe('বন্ধ করুন')
  const interpolated = i18n.t('tools:toolApproval.allowServerAlways', { server: 'fixture-server' })
  expect(interpolated).toContain('fixture-server')
  expect(interpolated).not.toContain('{{')
  expect(JSON.parse(localStorage.getItem(localStorageKey.settingGeneral)!)).toMatchObject({ state: { currentLanguage: 'bn' } })
  settings.currentLanguage = 'bn'
  view.rerender(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await waitFor(() => expect(screen.getByRole('button', { name: 'বাংলা' })).toBeInTheDocument())
})

it('shows all 70 native names with language and automatic reading direction', async () => {
  expect(NATIVE_LANGUAGES).toHaveLength(70)
  expect(new Set(NATIVE_LANGUAGES.map((l) => l.value))).toEqual(new Set(supportedLanguages))
  const user = userEvent.setup()
  render(<TranslationProvider><LanguageSwitcher /></TranslationProvider>)
  await user.click(screen.getByRole('button', { name: 'English' }))
  for (const language of NATIVE_LANGUAGES) {
    const item = await screen.findByRole('menuitem', { name: language.label })
    expect(item).toHaveAttribute('lang', language.value === 'vn' ? 'vi' : language.value)
    expect(item).toHaveAttribute('dir', 'auto')
  }
  expect(screen.getByRole('menuitem', { name: 'Bahasa Indonesia' })).toBeInTheDocument()
})
