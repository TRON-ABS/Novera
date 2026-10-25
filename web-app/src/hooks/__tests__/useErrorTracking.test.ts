import { beforeEach, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: vi.fn().mockResolvedValue(null), setItem: vi.fn().mockResolvedValue(undefined), removeItem: vi.fn() } }))
vi.mock('@/lib/noveraTelemetry', () => ({ analyticsConsentScope: 'eu-project-test' }))
import { useErrorTracking } from '../useErrorTracking'
import { backendStorage } from '@/lib/backendStorage'

beforeEach(() => useErrorTracking.setState({ enabled: false, promptPending: true }))
it('defaults off and binds persisted permission to the destination and schema', () => {
  expect(useErrorTracking.getState().enabled).toBe(false)
  expect(useErrorTracking.getState().promptPending).toBe(true)
  expect(useErrorTracking.persist.getOptions().name).toBe('novera-error-tracking-v1:eu-project-test')
  expect(useErrorTracking.persist.getOptions().skipHydration).toBe(true)
})
it('records and withdraws permission independently', () => {
  useErrorTracking.getState().setEnabled(true)
  expect(useErrorTracking.getState().enabled).toBe(true)
  expect(useErrorTracking.getState().promptPending).toBe(false)
  useErrorTracking.getState().setEnabled(false)
  expect(useErrorTracking.getState().enabled).toBe(false)
})

it('remembers a first-run refusal after rehydration without enabling error reports', async () => {
  vi.mocked(backendStorage.getItem).mockResolvedValueOnce(JSON.stringify({
    state: { enabled: false, promptPending: false }, version: 0,
  }))
  await useErrorTracking.persist.rehydrate()
  expect(useErrorTracking.getState().enabled).toBe(false)
  expect(useErrorTracking.getState().promptPending).toBe(false)
})
