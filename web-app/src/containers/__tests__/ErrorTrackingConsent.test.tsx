import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { ErrorTrackingConsent } from '../analytics/ErrorTrackingConsent'

const state = vi.hoisted(() => ({ available: false, setEnabled: vi.fn(), setStatistics: vi.fn() }))
vi.mock('@/hooks/useAnalytic', () => ({ useAnalytic: () => ({
  analyticsAvailable: state.available, analyticsHost: 'stats.example.com', setProductAnalytic: state.setStatistics,
}) }))
vi.mock('@/hooks/useErrorTracking', () => ({ useErrorTracking: (selector: (value: {setEnabled: typeof state.setEnabled}) => unknown) => selector(state) }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({
  t: (key: string, options?: {host?: string}) => `${key} ${options?.host ?? ''}`.trim(),
}) }))
beforeEach(() => { vi.clearAllMocks(); state.available = false })

it('cannot grant error-reporting permission when no destination is configured', () => {
  render(<ErrorTrackingConsent />)
  expect(screen.getByRole('button', { name: 'common:allow' })).toBeDisabled()
  expect(screen.getByText('common:errorTracking.unavailable stats.example.com')).toBeInTheDocument()
  expect(state.setEnabled).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'common:deny' }))
  expect(state.setEnabled).toHaveBeenCalledWith(false)
})

it('shows the recipient and requires its own explicit choice without changing statistics', () => {
  state.available = true
  render(<ErrorTrackingConsent />)
  expect(screen.getByText('common:errorTracking.summary stats.example.com')).toBeInTheDocument()
  expect(state.setEnabled).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'common:allow' }))
  expect(state.setEnabled).toHaveBeenCalledWith(true)
  expect(state.setStatistics).not.toHaveBeenCalled()
})
