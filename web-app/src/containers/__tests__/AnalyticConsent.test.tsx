import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { AnalyticConsent } from '../analytics/AnalyticConsent'
const state = vi.hoisted(() => ({ available: false, consent: vi.fn(), prompt: vi.fn() }))
vi.mock('@/hooks/useAnalytic', () => ({ useAnalytic: () => ({ analyticsAvailable: state.available, analyticsHost: 'stats.example.com', setProductAnalytic: state.consent, setProductAnalyticPrompt: state.prompt }) }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string, options?: {host?: string}) => `${key} ${options?.host ?? ''}`.trim() }) }))
beforeEach(() => { vi.clearAllMocks(); state.available = false })
it('cannot opt in when statistics are not configured', () => {
  render(<AnalyticConsent />)
  expect(screen.getByTestId('analytic-allow')).toBeDisabled()
  fireEvent.click(screen.getByTestId('analytic-deny'))
  expect(state.consent).toHaveBeenCalledWith(false)
})
it('shows the recipient and records a choice only after an explicit action', () => {
  state.available = true
  render(<AnalyticConsent />)
  expect(screen.getByText('common:telemetry.summary stats.example.com')).toBeInTheDocument()
  expect(state.consent).not.toHaveBeenCalled()
  fireEvent.click(screen.getByTestId('analytic-allow'))
  expect(state.consent).toHaveBeenCalledWith(true)
  expect(state.prompt).toHaveBeenCalledWith(false)
})
