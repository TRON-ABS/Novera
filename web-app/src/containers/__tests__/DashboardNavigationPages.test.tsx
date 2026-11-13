import { render, waitFor } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import DashboardNavigationPages from '../DashboardNavigationPages'
import { createDashboardRouter } from '@/lib/dashboard-navigation-router'

vi.mock('@/lib/dashboard-navigation-router', () => ({
  createDashboardRouter: vi.fn(async () => ({})),
}))
vi.mock('@tanstack/react-router', () => ({ RouterProvider: () => null }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))

it('preserves settings navigation when the parent supplies a new exit callback', async () => {
  const first = vi.fn()
  const latest = vi.fn()
  const { rerender } = render(<DashboardNavigationPages panel="settings" onExit={first} />)
  await waitFor(() => expect(createDashboardRouter).toHaveBeenCalledTimes(1))
  rerender(<DashboardNavigationPages panel="settings" onExit={latest} />)
  expect(createDashboardRouter).toHaveBeenCalledTimes(1)
  vi.mocked(createDashboardRouter).mock.calls[0][1]()
  expect(latest).toHaveBeenCalledTimes(1)
  expect(first).not.toHaveBeenCalled()
})
