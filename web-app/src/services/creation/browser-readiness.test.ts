import { expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { creationStream } from './stream'
import { generateCloudMedia } from './cloud'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => false }))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('./cloud', async original => ({ ...(await original<typeof import('./cloud')>()), generateCloudMedia: vi.fn() }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
vi.mock('@/hooks/useServiceHub', () => ({ getServiceHub: () => ({ providers: () => ({ fetch: () => vi.fn() }) }) }))

it.each(['image', 'music', 'video'] as const)('reports that browser %s generation has no connected engine', async task => {
  const done = vi.fn()
  const stream = creationStream(task, 'Synthetic test', [{ id: 'test', role: 'user', parts: [{ type: 'text', text: 'Synthetic test' }] }], 'browser-test', undefined, done)
  const reader = stream.getReader()
  await expect(reader.read()).rejects.toThrow('chat:creation.desktopOnly')
  expect(generateCloudMedia).not.toHaveBeenCalled()
  expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
  expect(done).toHaveBeenCalledOnce()
})
