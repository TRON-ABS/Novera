import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { ModelSetting, ModelSettingWindow } from '../ModelSetting'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'
import { useModelProvider } from '@/hooks/useModelProvider'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/hooks/useServiceHub', () => {
  const hub = { models: () => ({}), providers: () => ({}) }
  return { useServiceHub: () => hub, getServiceHub: () => hub }
})
const model = { id: 'model-a', settings: {} } as Model
const provider = { provider: 'test', models: [model], settings: [] } as unknown as ProviderObject
beforeEach(() => {
  useDashboardPanel.setState({ panel: null, anchor: null, modelSettings: null })
  useModelProvider.setState({ providers: [provider] })
  vi.stubGlobal('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
    top: 400, left: 20, width: 700, height: 160, right: 720, bottom: 560, x: 20, y: 400, toJSON() {},
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); useDashboardPanel.getState().closePanel() })

it('opens one Novera model-settings window above the composer and survives its trigger unmounting', async () => {
  const user = userEvent.setup()
  const content = (trigger: boolean) => <>
    <div data-dashboard-composer><textarea aria-label="Draft" defaultValue="Keep draft" /></div>
    {trigger && <ModelSetting model={model} provider={provider} />}
    <ModelSettingWindow />
  </>
  const view = render(content(true))
  const settingsButton = screen.getByRole('button', { name: 'common:modelSettings.label' })
  await user.hover(settingsButton)
  expect(await screen.findByRole('tooltip')).toHaveTextContent('common:modelSettings.label')
  await user.click(settingsButton)
  const window = screen.getByRole('dialog')
  expect(window).toHaveClass('novera-dashboard-window', 'novera-model-settings')
  expect(window).toHaveStyle({ maxHeight: '384px' })
  expect(document.querySelector('[data-slot="sheet-content"]')).toBeNull()
  expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull()
  view.rerender(content(false))
  expect(screen.getByRole('dialog')).toBe(window)
  await user.click(screen.getByRole('textbox', { name: 'Draft' }))
  await user.keyboard(' intact')
  expect(screen.getByRole('textbox')).toHaveValue('Keep draft intact')
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  act(() => { useDashboardPanel.getState().openModelSettings({ ...model, id: 'model-b' }, provider) })
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(useDashboardPanel.getState().modelSettings?.model.id).toBe('model-b')
  act(() => { useDashboardPanel.getState().openPanel('search') })
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(useDashboardPanel.getState().modelSettings).toBeNull()
  expect(screen.getByRole('textbox')).toHaveValue('Keep draft intact')
})
