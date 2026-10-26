import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { creationStream } from './stream'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { generateCloudMedia } from './cloud'
import { useNoveraInstructions } from '@/hooks/useNoveraInstructions'
import type { UIMessage } from 'ai'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
vi.mock('@/hooks/useModelProvider', () => ({
  useModelProvider: {
    getState: () => ({
      providers: [
        { provider: 'openai', active: true, api_key: 'test-only-key' },
      ],
    }),
  },
}))
vi.mock('@/hooks/useServiceHub', () => ({
  getServiceHub: () => ({ providers: () => ({ fetch: () => vi.fn() }) }),
}))
vi.mock('./cloud', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./cloud')>()),
  generateCloudMedia: vi.fn(),
}))
const messages: UIMessage[] = [
  { id: 'u', role: 'user', parts: [{ type: 'text', text: 'create' }] },
]
async function read(stream: ReturnType<typeof creationStream>) {
  const values = []
  for await (const chunk of stream as unknown as AsyncIterable<unknown>)
    values.push(chunk)
  return values
}
describe('cloud conversation lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNoveraInstructions.setState({ instructions: { text: 'TEXT ONLY', image: 'IMAGE ONLY', video: 'VIDEO ONLY' } })
    useCreation.setState({
      settings: { ...creationDefaults },
      selections: {
        thread: { image: { provider: 'openai', id: 'gpt-image-2.5-sunburst' } },
      },
      modes: {},
      sources: {},
      progress: {},
    })
  })
  it('emits only a saved reference, passes no credentials to native saving, and releases the job', async () => {
    vi.mocked(generateCloudMedia).mockResolvedValue({ base64: 'AAAA' })
    vi.mocked(invoke).mockImplementation(async (command) =>
      command === 'creation_cloud_save'
        ? {
            name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.webp',
            mediaType: 'image/webp',
          }
        : undefined
    )
    const finish = vi.fn()
    const chunks = await read(
      creationStream('image', 'create', messages, 'thread', undefined, finish)
    )
    const save = vi
      .mocked(invoke)
      .mock.calls.find(([command]) => command === 'creation_cloud_save')!
    expect(generateCloudMedia).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'IMAGE ONLY\n\ncreate' }))
    expect(save[1]).toEqual(expect.objectContaining({ request: expect.objectContaining({ prompt: 'IMAGE ONLY\n\ncreate' }) }))
    expect(JSON.stringify(save)).not.toContain('test-only-key')
    expect(chunks).toContainEqual(
      expect.objectContaining({
        type: 'file',
        mediaType: 'image/webp',
        providerMetadata: { novera: { totalMs: expect.any(Number) } },
        url: expect.stringContaining('novera-creation:image/'),
      })
    )
    expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
    expect(invoke).toHaveBeenCalledWith(
      'creation_cloud_release',
      expect.anything()
    )
    expect(finish).toHaveBeenCalledTimes(1)
  })
  it('keeps a failed native save out of the conversation and cancels before release', async () => {
    vi.mocked(generateCloudMedia).mockResolvedValue({
      url: 'https://cdn.example.test/output.png',
    })
    vi.mocked(invoke).mockImplementation(async (command) => {
      if (command === 'creation_cloud_save') throw new Error('Disk full')
      return undefined
    })
    const stream = creationStream(
      'image',
      'create',
      messages,
      'thread',
      undefined,
      vi.fn()
    )
    const reader = stream.getReader()
    expect((await reader.read()).value?.type).toBe('start')
    await expect(reader.read()).rejects.toThrow('chat:creation.failed')
    await vi.waitFor(() =>
      expect(invoke).toHaveBeenCalledWith(
        'creation_cloud_release',
        expect.anything()
      )
    )
    const calls = vi.mocked(invoke).mock.calls.map(([command]) => command)
    expect(calls.indexOf('creation_cancel')).toBeLessThan(
      calls.indexOf('creation_cloud_release')
    )
  })
  it('does not submit when Stop arrives during native preparation', async () => {
    const abort = new AbortController()
    vi.mocked(invoke).mockImplementation(async (command) => {
      if (command === 'creation_cloud_prepare') abort.abort()
      return undefined
    })
    await expect(
      read(
        creationStream(
          'image',
          'create',
          messages,
          'thread',
          abort.signal,
          vi.fn()
        )
      )
    ).rejects.toMatchObject({ name: 'AbortError' })
    expect(generateCloudMedia).not.toHaveBeenCalled()
    await vi.waitFor(() =>
      expect(invoke).toHaveBeenCalledWith(
        'creation_cloud_release',
        expect.anything()
      )
    )
  })
})
