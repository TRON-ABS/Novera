import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
import { NativeAccessDialog } from '../NativeAccessDialog'
import { FolderAccessDialog } from '../FolderAccessDialog'
import { useNativeAccess } from '@/hooks/useNativeAccess'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'
import { ResetWorkspacePermissions } from '@/containers/NativeAccessControl'
beforeEach(() => {
  useNativeAccess.setState({ pending: [], grants: {}, generation: {} })
  useCoworkSessions.setState({ sessions: [], currentId: null })
})
it('displays the command, initially focuses refusal, and treats Escape as denial', async () => {
  let result!: Promise<boolean>
  act(() => { result = useNativeAccess.getState().request('chat', 'shell', 'echo hello') })
  render(<NativeAccessDialog />)
  expect(screen.getByText('echo hello')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'tools:toolApproval.deny' })).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  expect(await result).toBe(false)
})
it('requires an explicit confirmation and defaults a folder to read-only', async () => {
  const confirm = vi.fn(), cancel = vi.fn()
  render(<FolderAccessDialog path="C:/project" onConfirm={confirm} onCancel={cancel} />)
  expect(screen.getByRole('radio', { name: 'common:access.read' })).toBeChecked()
  expect(confirm).not.toHaveBeenCalled()
  await userEvent.click(screen.getByRole('button', { name: 'common:workspace.open' }))
  expect(confirm).toHaveBeenCalledWith('read')
})
it('lets the user choose approval before edits and cancel without attaching', async () => {
  const confirm = vi.fn(), cancel = vi.fn()
  render(<FolderAccessDialog path="C:/project" onConfirm={confirm} onCancel={cancel} />)
  await userEvent.click(screen.getByRole('radio', { name: 'common:access.ask' }))
  await userEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
  expect(confirm).not.toHaveBeenCalled()
  expect(cancel).toHaveBeenCalledOnce()
})
it('focuses refusal again for the next queued command', async () => {
  const one = useNativeAccess.getState().request('one', 'shell', 'first')
  const two = useNativeAccess.getState().request('two', 'shell', 'second')
  render(<NativeAccessDialog />)
  await userEvent.click(screen.getByRole('button', { name: 'tools:toolApproval.allowOnce' }))
  expect(await one).toBe(true)
  expect(screen.getByText('second')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'tools:toolApproval.deny' })).toHaveFocus()
  await userEvent.keyboard('{Escape}')
  expect(await two).toBe(false)
})
it('resets explicit folder and shell grants through the permission control', async () => {
  const id = useCoworkSessions.getState().createSession()
  useCoworkSessions.getState().setFolder(id, 'C:/project', 'allow')
  useNativeAccess.setState({ grants: { [JSON.stringify([id, 'shell'])]: true } })
  render(<ResetWorkspacePermissions owner={id} />)
  await userEvent.click(screen.getByRole('button', { name: 'tools:toolApproval.title' }))
  expect(screen.getByText('common:access.allow')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'common:reset' }))
  expect(useNativeAccess.getState().grants).toEqual({})
  expect(useCoworkSessions.getState().sessions[0].folderAccess).toBe('read')
})
