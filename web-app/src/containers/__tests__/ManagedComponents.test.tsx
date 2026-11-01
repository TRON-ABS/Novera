import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { ManagedComponents } from '../ManagedComponents'
import { componentAction, componentStatus, type ComponentStatus } from '@/services/components'
vi.mock('@/services/components', async importOriginal => ({ ...await importOriginal<typeof import('@/services/components')>(), componentAction: vi.fn(), componentStatus: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }) }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
const initial: ComponentStatus = { freeBytes: 10e9, profiles: [{ profile: { id: 'video-export', family: 'video', backend: 'cpu', python: '3.12.12', downloadBytes: 1e9, requiredBytes: 5e9, supported: true }, state: 'absent', selected: false }] }
beforeEach(() => { vi.mocked(componentAction).mockReset().mockResolvedValue('job'); vi.mocked(componentStatus).mockReset().mockResolvedValue(structuredClone(initial)) })
it('checks status on mount and downloads nothing without confirmation', async () => {
  render(<ManagedComponents />)
  await screen.findByText(/FFmpeg · CPU/)
  expect(componentAction).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'chat:creationInstall.install' }))
  expect(componentAction).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'common:confirm' }))
  await waitFor(() => expect(componentAction).toHaveBeenCalledWith('video-export', 'install'))
})
it('blocks installation while generating or when disk space is insufficient', async () => {
  render(<ManagedComponents disabled />)
  expect(await screen.findByRole('button', { name: 'chat:creationInstall.install' })).toBeDisabled()
  expect(componentAction).not.toHaveBeenCalled()
})
it('confirms uninstallation and preserves the native action boundary', async () => {
  vi.mocked(componentStatus).mockResolvedValue({ ...initial, profiles: [{ ...initial.profiles[0], state: 'ready' }] })
  render(<ManagedComponents />)
  fireEvent.click(await screen.findByRole('button', { name: 'common:components.uninstall' }))
  expect(screen.getByText('common:components.removeConfirm')).toBeInTheDocument()
  expect(componentAction).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
  expect(componentAction).not.toHaveBeenCalled()
})
it('retains operations that were started before opening the screen', async () => {
  vi.mocked(componentStatus).mockResolvedValue({ ...initial, operation: { id: 'running', profile: 'video-export', action: 'install', phase: 'installing', running: true } })
  render(<ManagedComponents />)
  await screen.findByRole('progressbar')
  expect(screen.getByRole('button', { name: 'chat:creationInstall.install' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
  await waitFor(() => expect(componentAction).toHaveBeenCalledWith('', 'cancel'))
})
