import { afterEach, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'

vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: vi.fn(async () => null), setItem: vi.fn(async () => {}), removeItem: vi.fn(async () => {}),
} }))
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({
  t: (key: string) => key,
}) }))
afterEach(() => { cleanup(); vi.unstubAllGlobals(); vi.resetModules() })

it.each([false, true])('uses the actual compiled destination configuration (configured=%s)', async (configured) => {
  vi.resetModules()
  vi.stubGlobal('POSTHOG_HOST', configured ? 'https://stats.example.com' : '')
  vi.stubGlobal('POSTHOG_KEY', configured ? 'phc_' + 'x'.repeat(30) : '')
  const { ErrorTrackingConsent } = await import('../analytics/ErrorTrackingConsent')
  const { useErrorTracking } = await import('@/hooks/useErrorTracking')
  const { useProductAnalytic } = await import('@/hooks/useAnalytic')
  render(<ErrorTrackingConsent />)
  const allow = screen.getByRole('button', { name: 'common:allow' })
  expect(useErrorTracking.getState().enabled).toBe(false)
  expect(useProductAnalytic.getState().productAnalytic).toBe(false)
  if (configured) {
    expect(allow).toBeEnabled()
    fireEvent.click(allow)
    expect(useErrorTracking.getState().enabled).toBe(true)
  } else {
    expect(allow).toBeDisabled()
    fireEvent.click(allow)
    expect(useErrorTracking.getState().enabled).toBe(false)
  }
  expect(useProductAnalytic.getState().productAnalytic).toBe(false)
})
