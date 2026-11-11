import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
let top = 400
function Fixture({ stack = false }: { stack?: boolean }) {
  const panels = useDashboardPanel(state => state.panels)
  return <>
    <div data-dashboard-composer>
      {stack && <div data-dashboard-stack><section data-auto-tune-dashboard>Auto Tune</section></div>}
      <textarea aria-label="Draft" defaultValue="Keep this draft" />
      <button onClick={() => useDashboardPanel.getState().openPanel('models')}>Models</button>
    </div>
    {panels.filter(panel => panel !== 'auto-tune').map(panel => (
      <Dialog key={panel} open modal={false}
        onOpenChange={open => { if (!open) useDashboardPanel.getState().closePanel(panel) }}>
        <DialogContent docked><DialogTitle>{panel}</DialogTitle><button>Panel action</button></DialogContent>
      </Dialog>
    ))}
  </>
}
beforeEach(() => {
  top = 400
  useDashboardPanel.setState({ panels: ['settings'], anchor: null })
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => (
    { top, left: 20, width: 700, height: 180, bottom: top + 180, right: 720, x: 20, y: top, toJSON() {} }
  ))
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); useDashboardPanel.setState({ panels: [], anchor: null }) })

it('keeps the fallback dock above the composer while its draft remains usable', async () => {
  const user = userEvent.setup()
  render(<Fixture />)
  const dialog = screen.getByRole('dialog')
  expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull()
  expect(dialog).toHaveStyle({ bottom: `${window.innerHeight - top + 8}px`, maxHeight: '384px' })
  await user.click(screen.getByRole('textbox', { name: 'Draft' }))
  await user.keyboard(' intact')
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft intact')
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  act(() => { top = 300; window.dispatchEvent(new Event('resize')) })
  expect(dialog).toHaveStyle({ bottom: `${window.innerHeight - top + 8}px`, maxHeight: '284px' })
  await user.click(screen.getByRole('button', { name: 'Panel action' }))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft intact')
})

it('keeps four independent windows in the composer stack and refuses a fifth', async () => {
  const user = userEvent.setup()
  useDashboardPanel.setState({ panels: ['auto-tune', 'settings'] })
  const { container } = render(<Fixture stack />)
  await user.click(screen.getByRole('button', { name: 'Models' }))
  act(() => { expect(useDashboardPanel.getState().openPanel('search')).toBe(true) })
  act(() => { expect(useDashboardPanel.getState().openPanel('thread-project')).toBe(false) })
  const host = container.querySelector('[data-dashboard-stack]')
  expect(host?.children).toHaveLength(4)
  for (const dialog of screen.getAllByRole('dialog')) expect(dialog.parentElement).toBe(host)
  const settings = screen.getByRole('dialog', { name: 'settings' })
  await user.click(settings.querySelector<HTMLButtonElement>('[data-slot="dialog-close"]')!)
  expect(screen.getAllByRole('dialog')).toHaveLength(2)
  expect(screen.getByRole('dialog', { name: 'models' })).toBeInTheDocument()
  expect(screen.getByRole('dialog', { name: 'search' })).toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft')
})
