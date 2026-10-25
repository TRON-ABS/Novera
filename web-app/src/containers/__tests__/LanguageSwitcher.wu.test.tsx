import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, expect, it, vi } from 'vitest'
import LanguageSwitcher from '../LanguageSwitcher'
import { TranslationProvider } from '@/i18n/TranslationContext'
import { useAppTranslation } from '@/i18n/hooks'
import i18n from '@/i18n/setup'
import { localStorageKey } from '@/constants/localStorage'

const settings = vi.hoisted(() => ({ currentLanguage: 'en', setCurrentLanguage: vi.fn() }))
vi.mock('@/hooks/useGeneralSetting', () => ({ useGeneralSetting: () => settings }))

function Label() {
  const { t } = useAppTranslation()
  return <span data-testid="translated-label">{t('chat:description')}</span>
}

afterEach(() => {
  cleanup()
  i18n.changeLanguage('en')
  localStorage.clear()
  settings.currentLanguage = 'en'
  vi.clearAllMocks()
})

it('selects 吴语（上海话） by its native label and persists wuu', async () => {
  const user = userEvent.setup()
  const view = render(<TranslationProvider><LanguageSwitcher /><Label /></TranslationProvider>)
  await user.click(screen.getByRole('button', { name: 'English' }))
  await user.click(await screen.findByRole('menuitem', { name: '吴语（上海话）' }))
  expect(settings.setCurrentLanguage).toHaveBeenCalledWith('wuu')
  expect(i18n.language).toBe('wuu')
  expect(JSON.parse(localStorage.getItem(localStorageKey.settingGeneral)!)).toMatchObject({ state: { currentLanguage: 'wuu' } })
  settings.currentLanguage = 'wuu'
  view.rerender(<TranslationProvider><LanguageSwitcher /><Label /></TranslationProvider>)
  await waitFor(() => expect(screen.getByTestId('translated-label')).toHaveTextContent('今朝我哪能帮侬？'))
  expect(screen.getByRole('button', { name: '吴语（上海话）' })).toBeInTheDocument()
})

it('refreshes visible copy when settings restore wuu after English initialization and when switching back', async () => {
  settings.currentLanguage = 'wuu'
  const view = render(<TranslationProvider><Label /></TranslationProvider>)
  await waitFor(() => expect(screen.getByTestId('translated-label')).toHaveTextContent('今朝我哪能帮侬？'))
  settings.currentLanguage = 'en'
  view.rerender(<TranslationProvider><Label /></TranslationProvider>)
  await waitFor(() => expect(screen.getByTestId('translated-label')).toHaveTextContent('How can I help you today?'))
})

it('restores the saved wuu preference on initialization', async () => {
  localStorage.setItem(localStorageKey.settingGeneral, JSON.stringify({ state: { currentLanguage: 'wuu' } }))
  vi.resetModules()
  const fresh = (await import('@/i18n/setup')).default
  expect(fresh.language).toBe('wuu')
  expect(fresh.t('chat:welcome')).toBe('侬好，近来哪能？')
  fresh.changeLanguage('en')
})

it('preserves interpolation in tool approvals and count messages', () => {
  i18n.changeLanguage('wuu')
  expect(i18n.t('tools:toolApproval.allowServerAlways', { server: 'fixture-server' })).toBe('一直允许 fixture-server')
  for (const count of [0, 1, 2, 3, 11, 102]) {
    const result = i18n.t('subagentsRunning', { count })
    expect(result).toBe(`运行当中个子代理数目：${count}`)
  }
})

it('uses Wu for previously missing agent, setup and error messages', () => {
  i18n.changeLanguage('wuu')
  expect(i18n.t('common:coworkEmpty.subtitleSandbox')).toBe('拨 Novera 一个任务。伊会自家读写文件、运行命令，一步步做好。')
  expect(i18n.t('setup:stepCounter', { current: 2, total: 4 })).toBe('第 2 步，总共 4 步')
  expect(i18n.t('model-errors:contextOverflowDetail', { request: 4096, context: 2048 })).toBe('搿趟请求需要 4096 个词元，不过模型个上下文窗口只放得落 2048 个。')
})
