import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: vi.fn().mockResolvedValue(null), setItem: vi.fn().mockResolvedValue(undefined), removeItem: vi.fn() } }))
vi.mock('@/lib/noveraTelemetry', () => ({ analyticsConsentScope: 'eu-project-test' }))
import { useErrorTracking } from '../useErrorTracking'

beforeEach(() => useErrorTracking.setState({ enabled: false }))
it('defaults off and binds persisted permission to the destination and schema', () => {
  expect(useErrorTracking.getState().enabled).toBe(false)
  expect(useErrorTracking.persist.getOptions().name).toBe('novera-error-tracking-v1:eu-project-test')
  expect(useErrorTracking.persist.getOptions().skipHydration).toBe(true)
})
it('records and withdraws permission independently', () => {
  useErrorTracking.getState().setEnabled(true)
  expect(useErrorTracking.getState().enabled).toBe(true)
  useErrorTracking.getState().setEnabled(false)
  expect(useErrorTracking.getState().enabled).toBe(false)
})
