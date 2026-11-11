import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { AutoTuneControl, useDesktopAutoTuneEnabled } from './AutoTuneControl'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
const { progress, setAutoTuneActivity, startAutoTune } = vi.hoisted(() => ({
  progress: { active: null, remaining: null as number | null, total: 0, completed: 0,
    pass: 0, failed: 0, models: [{ id: 'lfm3', task: 'text', model: 'LFM3', provider: 'llamacpp', profiles: 1 }],
    excluded: [], taskCounts: null,
  },
  startAutoTune: vi.fn(async () => {}),
  setAutoTuneActivity: vi.fn(),
}))
vi.mock('@/services/creation/auto-tune', () => ({
  startAutoTune,
  readAutoTuneEnabled: () => invoke('desktop_calibration'),
  autoTuneTasks: ['text', 'image', 'music', 'video'],
  refreshAutoTuneModels: vi.fn(async () => {}),
  selectAutoTuneModel: vi.fn(),
  selectAllAutoTuneModels: vi.fn(),
  setAutoTuneActivity,
  getAutoTuneProgress: () => progress,
  getInitialAutoTuneProgress: () => progress,
  subscribeAutoTuneProgress: () => () => {},
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ i18n: { language: 'en' }, t: (key: string) => key }),
}))

afterEach(() => {
  cleanup()
  progress.remaining = null
  setAutoTuneActivity.mockClear()
  startAutoTune.mockClear()
  vi.mocked(invoke).mockClear()
  vi.unstubAllGlobals()
})

describe('Auto Tune dashboard', () => {
  it('uses the activity reported by the native engine independently of the queue count', async () => {
    vi.stubGlobal('IS_TAURI', true)
    const active = { task: 'text', model: 'Qwen3', provider: 'llamacpp' }
    vi.mocked(invoke).mockImplementation(async command => {
      if (command === 'desktop_calibration') return true
      if (command === 'desktop_auto_tune_activity') return active
      return []
    })
    render(<AutoTuneControl />)
    await waitFor(() => expect(setAutoTuneActivity).toHaveBeenCalledWith(active))
  })
  it('keeps gains and remaining profiles inside the dashboard', async () => {
    vi.stubGlobal('IS_TAURI', true)
    progress.remaining = 4
    vi.mocked(invoke).mockImplementation(async command => {
      if (command === 'desktop_calibration') return true
      if (command === 'desktop_auto_tune_gains') return [{ task: 'text', model: 'LFM3', metric: 'load', percent: 3.5 }]
      return null
    })
    render(
      <div data-dashboard-composer>
        <div data-auto-tune-panel />
        <div data-testid="composer-footer"><AutoTuneControl /></div>
      </div>
    )
    const dashboard = within(await screen.findByRole('region', { name: 'ui:autoTuneDashboard' }))
    expect(await dashboard.findByText(/4 ui:autoTuneRemaining/)).toBeInTheDocument()
    expect(await dashboard.findByText('+3.5% · ui:autoTuneGainLoad')).toBeInTheDocument()
    const footer = screen.getByTestId('composer-footer')
    expect(footer).not.toHaveTextContent('ui:autoTuneRemaining')
    expect(footer).not.toHaveTextContent('+3.5%')
  })
})


it('opens without starting, locks the composer when on, and turns off when the dashboard closes', async () => {
  vi.stubGlobal('IS_TAURI', true)
  let enabled = false
  vi.mocked(invoke).mockImplementation(async (command, args) => {
    if (command === 'desktop_calibration') {
      if (typeof args?.enabled === 'boolean') enabled = args.enabled
      return enabled
    }
    return command === 'desktop_auto_tune_gains' ? [] : null
  })
  function Draft() {
    return <textarea aria-label="Draft" disabled={useDesktopAutoTuneEnabled() === true} defaultValue="draft" />
  }
  render(<div data-dashboard-composer><div data-auto-tune-panel /><Draft /><AutoTuneControl /></div>)
  const opener = await screen.findByRole('button', { name: 'Auto Tune' })
  fireEvent.click(opener)
  expect(startAutoTune).not.toHaveBeenCalled()
  expect((screen.getByRole('checkbox', { name: /LFM3/ }) as HTMLInputElement).checked).toBe(true)
  const draft = screen.getByRole('textbox', { name: 'Draft' }) as HTMLTextAreaElement
  expect(draft.disabled).toBe(false)
  const powerSwitch = screen.getByRole('switch', { name: 'Auto Tune' })
  expect(powerSwitch).toHaveClass('composer-tool')
  expect(powerSwitch).toHaveAttribute('data-state', 'off')
  fireEvent.click(powerSwitch)
  await waitFor(() => expect(draft.disabled).toBe(true))
  expect(startAutoTune).toHaveBeenCalledTimes(1)
  expect(powerSwitch).toHaveAttribute('data-state', 'on')
  fireEvent.click(screen.getByRole('button', { name: 'ui:autoTuneDashboard' }))
  expect(draft.disabled).toBe(true)
  expect(enabled).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'ui:autoTuneCloseDashboard' }))
  await waitFor(() => expect(draft.disabled).toBe(false))
  expect(draft.value).toBe('draft')
  expect(enabled).toBe(false)
  expect(opener.getAttribute('aria-expanded')).toBe('false')
})

it('shows every confirmed result inside its model history', async () => {
  vi.stubGlobal('IS_TAURI', true)
  const recent = { task: 'text', model: 'LFM3', metric: 'rate', percent: 4.2, recordedAt: 1800000000000 }
  const older = { task: 'text', model: 'LFM3', metric: 'load', percent: 3.5, recordedAt: 1700000000000 }
  vi.mocked(invoke).mockImplementation(async (command, args) => {
    if (command === 'desktop_calibration') return false
    if (command === 'desktop_auto_tune_gains') return args?.includeHistory ? [recent, older] : [recent]
    return null
  })
  const { container } = render(<div data-dashboard-composer><div data-auto-tune-panel /><AutoTuneControl /></div>)
  fireEvent.click(await screen.findByRole('button', { name: 'Auto Tune' }))
  await waitFor(() => {
    const rows = container.querySelectorAll('details li')
    expect(rows).toHaveLength(2)
    expect(rows[0].textContent).toContain('+4.2%')
    expect(rows[1].textContent).toContain('+3.5%')
    expect(container.querySelectorAll('details')).toHaveLength(1)
  })
})
