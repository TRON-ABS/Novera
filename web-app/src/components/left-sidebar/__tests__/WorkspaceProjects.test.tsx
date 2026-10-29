import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
const { open, navigate } = vi.hoisted(() => ({ open: vi.fn(), navigate: vi.fn() }))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => navigate }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/hooks/useServiceHub', () => ({ useServiceHub: () => ({ dialog: () => ({ open }) }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
import { NewWorkspaceProject } from '../WorkspaceProjects'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'
beforeEach(() => { vi.clearAllMocks(); open.mockResolvedValue('C:/project'); useCoworkSessions.setState({ sessions: [], currentId: null }); useDashboardPanel.setState({ panel: null, anchor: null }) })
it('does not attach a selected folder before confirmation and opens a readonly project by default', async () => {
  render(<NewWorkspaceProject />)
  await userEvent.click(screen.getByRole('button', { name: 'settings:shortcuts.newProject' }))
  await screen.findByText('C:/project')
  expect(useCoworkSessions.getState().sessions).toHaveLength(0)
  expect(navigate).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'common:workspace.open' }))
  expect(useCoworkSessions.getState().sessions[0]).toMatchObject({ folder: 'C:/project', folderAccess: 'read', title: 'project' })
  expect(navigate).toHaveBeenCalledWith({ to: '/cowork' })
})
it('abandons folder selection when the access dialog is cancelled', async () => {
  render(<NewWorkspaceProject />)
  await userEvent.click(screen.getByRole('button', { name: 'settings:shortcuts.newProject' }))
  await screen.findByText('C:/project')
  await userEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  expect(useCoworkSessions.getState().sessions).toHaveLength(0)
  expect(navigate).not.toHaveBeenCalled()
})

it('handles the dashboard and keyboard event once without a sidebar trigger', async () => {
  let resolvePicker!: (path: string) => void
  open.mockImplementationOnce(() => new Promise<string>(resolve => { resolvePicker = resolve }))
  const view = render(<NewWorkspaceProject controllerOnly />)
  expect(screen.queryByRole('button', { name: 'settings:shortcuts.newProject' })).not.toBeInTheDocument()
  act(() => {
    window.dispatchEvent(new Event('novera-new-workspace-project'))
    window.dispatchEvent(new Event('novera-new-workspace-project'))
  })
  expect(open).toHaveBeenCalledTimes(1)
  await act(async () => { resolvePicker('C:/project') })
  await screen.findByText('C:/project')
  expect(useCoworkSessions.getState().sessions).toHaveLength(0)
  await userEvent.click(screen.getByRole('button', { name: 'common:workspace.open' }))
  expect(useCoworkSessions.getState().sessions[0]).toMatchObject({ folderAccess: 'read' })
  view.unmount()
  act(() => { window.dispatchEvent(new Event('novera-new-workspace-project')) })
  expect(open).toHaveBeenCalledTimes(1)
})

it('does not reopen or attach a pending project after switching to another panel', async () => {
  let resolvePicker!: (path: string) => void
  open.mockImplementationOnce(() => new Promise<string>(resolve => { resolvePicker = resolve }))
  render(<NewWorkspaceProject controllerOnly />)
  act(() => { window.dispatchEvent(new Event('novera-new-workspace-project')) })
  expect(useDashboardPanel.getState().panel).toBe('project')
  act(() => { useDashboardPanel.getState().openPanel('models') })
  await act(async () => { resolvePicker('C:/project') })
  expect(useDashboardPanel.getState().panel).toBe('models')
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(useCoworkSessions.getState().sessions).toHaveLength(0)
  expect(navigate).not.toHaveBeenCalled()
})
