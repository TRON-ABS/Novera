import { act, render } from '@testing-library/react'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { GlobalEventHandler } from '../GlobalEventHandler'

const h = vi.hoisted(() => ({ info: vi.fn(), usage: vi.fn(), refresh: vi.fn(), setHardware: vi.fn(), setUsage: vi.fn(), setProviders: vi.fn() }))
vi.mock('@/hooks/useMcpToolProgress', () => ({ useMcpToolProgress: () => {} }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useModelProvider', () => ({ useModelProvider: () => ({ setProviders: h.setProviders }) }))
vi.mock('@janhq/core', () => ({ events: { on: vi.fn(), off: vi.fn() } }))
vi.mock('@/hooks/useHardware', () => ({ useHardware: (select: (state: unknown) => unknown) => select({ setHardwareData: h.setHardware, updateSystemUsage: h.setUsage }) }))
vi.mock('@/hooks/useServiceHub', () => {
  const hub = { hardware: () => ({ getHardwareInfo: h.info, getSystemUsage: h.usage, refreshHardwareInfo: h.refresh }) }
  return { useServiceHub: () => hub }
})

beforeEach(() => {
  vi.useFakeTimers()
  vi.clearAllMocks()
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  h.info.mockResolvedValue({ total_memory: 16000, gpus: [] })
  h.usage.mockResolvedValue({ total_memory: 16000, used_memory: 12000, gpus: [] })
  h.refresh.mockResolvedValue(undefined)
})
afterEach(() => { vi.useRealTimers() })

it('refreshes live usage on startup and while the Hub is visible without opening settings', async () => {
  const view = render(<GlobalEventHandler />)
  await act(async () => {})
  expect(h.setHardware).toHaveBeenCalledTimes(1)
  expect(h.setUsage).toHaveBeenCalledWith({ total_memory: 16000, used_memory: 12000, gpus: [] })
  await act(async () => { await vi.advanceTimersByTimeAsync(5000) })
  expect(h.usage).toHaveBeenCalledTimes(2)
  view.unmount()
  await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
  expect(h.usage).toHaveBeenCalledTimes(2)
})

it('pauses hidden-window polling and refreshes on return', async () => {
  const view = render(<GlobalEventHandler />)
  await act(async () => {})
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' })
  await act(async () => { await vi.advanceTimersByTimeAsync(10000) })
  expect(h.usage).toHaveBeenCalledTimes(1)
  Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'visible' })
  await act(async () => { document.dispatchEvent(new Event('visibilitychange')) })
  expect(h.refresh).toHaveBeenCalledTimes(1)
  expect(h.usage).toHaveBeenCalledTimes(2)
  view.unmount()
})

it('does not overlap samples or publish a sample after unmount', async () => {
  let resolve: (value: unknown) => void = () => {}
  h.usage.mockImplementation(() => new Promise(done => { resolve = done }))
  const view = render(<GlobalEventHandler />)
  await act(async () => {})
  await act(async () => { await vi.advanceTimersByTimeAsync(15000) })
  expect(h.usage).toHaveBeenCalledTimes(1)
  view.unmount()
  await act(async () => { resolve({ total_memory: 16000, used_memory: 8000, gpus: [] }) })
  expect(h.setUsage).not.toHaveBeenCalled()
})
