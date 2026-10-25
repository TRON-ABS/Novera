import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { AnalyticProvider } from '../AnalyticProvider'

const state = vi.hoisted(() => ({ consent: false, errors: false, available: false, send: vi.fn(), track: vi.fn(), stop: vi.fn() }))
vi.mock('@/hooks/useErrorTracking', () => ({ useErrorTracking: (selector: (value: { enabled: boolean }) => boolean) => selector({ enabled: state.errors }) }))
vi.mock('@/lib/noveraErrorTracking', () => ({ startErrorTracking: state.track }))
vi.mock('@/hooks/useAnalytic', () => ({ useAnalytic: () => ({ productAnalytic: state.consent, analyticsAvailable: state.available }) }))
vi.mock('@/lib/noveraTelemetry', () => ({ sendStartupStatistic: state.send }))
beforeEach(() => { vi.useFakeTimers(); state.consent = false; state.errors = false; state.available = false; state.send.mockReset().mockResolvedValue(undefined); state.stop.mockReset(); state.track.mockReset().mockReturnValue(state.stop) })
afterEach(() => vi.useRealTimers())
it('requires separate error consent and stops tracking immediately on withdrawal', () => {
  state.available = true; state.consent = true
  const view = render(<AnalyticProvider />)
  expect(state.track).not.toHaveBeenCalled()
  state.errors = true; state.consent = false; view.rerender(<AnalyticProvider />)
  expect(state.track).toHaveBeenCalledOnce()
  state.errors = false; view.rerender(<AnalyticProvider />)
  expect(state.stop).toHaveBeenCalledOnce()
})
it('does not install error listeners without a destination', () => {
  state.errors = true
  render(<AnalyticProvider />)
  expect(state.track).not.toHaveBeenCalled()
})
it('never sends before consent or when no destination is configured', async () => {
  const view = render(<AnalyticProvider />)
  await act(() => vi.runAllTimersAsync())
  state.consent = true; view.rerender(<AnalyticProvider />)
  await act(() => vi.runAllTimersAsync())
  expect(state.send).not.toHaveBeenCalled()
})
it('sends only after consent and aborts pending requests when consent is withdrawn', async () => {
  state.available = true
  const view = render(<AnalyticProvider />)
  await act(() => vi.runAllTimersAsync())
  expect(state.send).not.toHaveBeenCalled()
  state.consent = true; view.rerender(<AnalyticProvider />)
  await act(() => vi.runAllTimersAsync())
  expect(state.send).toHaveBeenCalledOnce()
  const signal = state.send.mock.calls[0][0] as AbortSignal
  state.consent = false; view.rerender(<AnalyticProvider />)
  expect(signal.aborted).toBe(true)
  await act(() => vi.runAllTimersAsync())
  expect(state.send).toHaveBeenCalledOnce()
})
