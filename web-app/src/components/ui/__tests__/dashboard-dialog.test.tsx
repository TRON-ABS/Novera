import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { act, cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Dialog, DialogContent, DialogTitle } from '../dialog'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
let top = 400
function Fixture() {
  const panel = useDashboardPanel(state => state.panel)
  return <>
    <div data-dashboard-composer>
      <textarea aria-label="Draft" defaultValue="Keep this draft" />
      <button onClick={() => useDashboardPanel.getState().openPanel('models')}>Models</button>
      <button onClick={() => useDashboardPanel.getState().openPanel('settings')}>Settings</button>
    </div>
    <Dialog open={panel !== null} modal={false}
      onOpenChange={open => { if (!open) useDashboardPanel.getState().closePanel() }}>
      <DialogContent docked><DialogTitle>{panel}</DialogTitle><button>Panel action</button></DialogContent>
    </Dialog>
  </>
}
beforeEach(() => {
  top = 400
  useDashboardPanel.setState({ panel: 'settings', anchor: null })
  vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} })
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => (
    { top, left: 20, width: 700, height: 180, bottom: top + 180, right: 720, x: 20, y: top, toJSON() {} }
  ))
})
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); useDashboardPanel.setState({ panel: null, anchor: null }) })

it('keeps a single non-modal window above the composer while its draft and controls remain usable', async () => {
  const user = userEvent.setup()
  render(<Fixture />)
  const dialog = screen.getByRole('dialog')
  expect(document.querySelector('[data-slot="dialog-overlay"]')).toBeNull()
  expect(dialog).toHaveStyle({ bottom: `${window.innerHeight - top + 8}px`, maxHeight: '384px' })
  await user.click(screen.getByRole('textbox', { name: 'Draft' }))
  await user.keyboard(' intact')
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft intact')
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Models' }))
  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(screen.getByRole('dialog')).toHaveTextContent('models')
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft intact')
  act(() => { top = 300; window.dispatchEvent(new Event('resize')) })
  expect(dialog).toHaveStyle({ bottom: `${window.innerHeight - top + 8}px`, maxHeight: '284px' })
  await user.click(screen.getByRole('button', { name: 'Panel action' }))
  await user.keyboard('{Escape}')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByRole('textbox')).toHaveValue('Keep this draft intact')
})
