import { beforeEach, it, expect, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { creationStream } from './stream'
import { generateCloudMedia } from './cloud'
import { useCreation } from '@/hooks/useCreation'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('./cloud', async (original) => ({
  ...(await original<typeof import('./cloud')>()),
  generateCloudMedia: vi.fn(),
}))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useServiceHub', () => ({
  getServiceHub: () => ({ providers: () => ({ fetch: () => vi.fn() }) }),
}))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const messages = [
  {
    id: 'u',
    role: 'user' as const,
    parts: [{ type: 'text' as const, text: 'Compose music' }],
  },
]
async function read(stream: ReturnType<typeof creationStream>) {
  const reader = stream.getReader()
  const chunks = []
  for (;;) {
    const next = await reader.read()
    if (next.done) return chunks
    chunks.push(next.value)
  }
}
beforeEach(() => {
  vi.mocked(invoke).mockReset()
  vi.mocked(generateCloudMedia).mockReset()
  useCreation.setState({
    selections: {
      cloud: { music: { provider: 'elevenlabs', id: 'music_v2_5' } },
    },
    modes: {},
    progress: {},
  })
  useMusicCreation.setState({
    settings: { ...musicDefaults },
    profiles: [],
    selections: {},
  })
  useModelProvider.setState({
    providers: [
      {
        provider: 'elevenlabs',
        active: true,
        api_key: 'test-secret',
        base_url: 'https://api.elevenlabs.io/v1',
        models: [],
      },
    ] as ModelProvider[],
  })
  vi.mocked(generateCloudMedia).mockResolvedValue({ base64: 'SUQzAQID' })
  vi.mocked(invoke).mockImplementation(async (command) =>
    command === 'creation_cloud_save'
      ? {
          name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp3',
          mediaType: 'audio/mpeg',
        }
      : undefined
  )
})
it('releases each cloud job before preparing the next song in a series', async () => {
  useMusicCreation.getState().setSettings({ generationCount: 3 })
  let active = false, saved = 0
  vi.mocked(invoke).mockImplementation(async command => {
    if (command === 'creation_cloud_prepare') { expect(active).toBe(false); active = true }
    if (command === 'creation_cloud_save') {
      expect(active).toBe(true)
      return { name: `Novera-00000000-0000-0000-0000-00000000000${++saved}.mp3`, mediaType: 'audio/mpeg' }
    }
    if (command === 'creation_cloud_release') active = false
  })
  const finish = vi.fn()
  const chunks = await read(creationStream('music', 'Compose music', messages, 'cloud', undefined, finish))
  expect(generateCloudMedia).toHaveBeenCalledTimes(3)
  expect(chunks.filter(chunk => chunk.type === 'file')).toHaveLength(3)
  expect(chunks.filter(chunk => chunk.type === 'start')).toHaveLength(1)
  expect(chunks.filter(chunk => chunk.type === 'finish')).toHaveLength(1)
  expect(active).toBe(false)
  expect(finish).toHaveBeenCalledTimes(1)
})

it('saves a playable cloud song without local weights and keeps credentials out of native save metadata', async () => {
  const chunks = await read(
    creationStream(
      'music',
      'Compose music lasting 3 minutes',
      messages,
      'cloud',
      undefined,
      vi.fn()
    )
  )
  expect(generateCloudMedia).toHaveBeenCalledWith(
    expect.objectContaining({
      music: expect.objectContaining({ duration: 180 }),
    })
  )
  const save = vi
    .mocked(invoke)
    .mock.calls.find(([command]) => command === 'creation_cloud_save')
  expect(JSON.stringify(save)).not.toContain('test-secret')
  expect(save?.[1]).toMatchObject({
    result: { task: 'music', provider: 'elevenlabs' },
  })
  expect(chunks.find((chunk) => chunk.type === 'file')).toMatchObject({
    mediaType: 'audio/mpeg',
    url: expect.stringContaining('novera-creation:music/'),
  })
  expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
  expect(useCreation.getState().modes.cloud).toBeUndefined()
})
it('honors manual music duration for cloud generation when Auto is disabled', async () => {
  useMusicCreation.getState().setSettings({ durationAuto: false, durationSeconds: 45 })
  await read(creationStream('music', 'Compose music lasting 3 minutes', messages, 'cloud', undefined, vi.fn()))
  expect(generateCloudMedia).toHaveBeenCalledWith(expect.objectContaining({
    music: expect.objectContaining({ duration: 45 }),
  }))
})
it('uses a pasted song sheet as lyrics without putting its title/instructions into the vocal text', async () => {
  useMusicCreation.getState().setSettings({ instrumental: false })
  const lyrics = '[Intro]\nPremière ligne\nDeuxième ligne\n[Chorus]\nTroisième ligne\nQuatrième ligne'
  await read(creationStream('music', `Titre : Une chanson\nÀ coller dans Paroles :\n${lyrics}`, messages, 'cloud', undefined, vi.fn()))
  expect(generateCloudMedia).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'Une chanson',
    music: expect.objectContaining({ instrumental: false, lyrics }),
  }))
})
it('passes 360 manual seconds to ElevenLabs without applying the old 240-second cap', async () => {
  useMusicCreation.getState().setSettings({ durationAuto: false, durationSeconds: 360 })
  await read(creationStream('music', 'Compose music lasting 3 minutes', messages, 'cloud', undefined, vi.fn()))
  expect(generateCloudMedia).toHaveBeenCalledWith(expect.objectContaining({
    music: expect.objectContaining({ duration: 360 }),
  }))
})
it('does not publish fabricated audio after a save failure and releases its native handle', async () => {
  vi.mocked(invoke).mockImplementation(async (command) => {
    if (command === 'creation_cloud_save') throw new Error('Disk full')
  })
  await expect(
    read(
      creationStream(
        'music',
        'Compose music',
        messages,
        'cloud',
        undefined,
        vi.fn()
      )
    )
  ).rejects.toThrow('Disk full')
  expect(invoke).toHaveBeenCalledWith('creation_cancel', expect.anything())
  expect(invoke).toHaveBeenCalledWith(
    'creation_cloud_release',
    expect.anything()
  )
})
it('cancels preparation that finishes after Stop, before any paid request', async () => {
  let ready: () => void = () => {}
  const barrier = new Promise<void>((resolve) => {
    ready = resolve
  })
  vi.mocked(invoke).mockImplementation(async (command) => {
    if (command === 'creation_cloud_prepare') await barrier
  })
  const abort = new AbortController()
  const pending = read(
    creationStream(
      'music',
      'Compose music',
      messages,
      'cloud',
      abort.signal,
      vi.fn()
    )
  )
  abort.abort()
  ready()
  await expect(pending).rejects.toThrow()
  expect(generateCloudMedia).not.toHaveBeenCalled()
  expect(invoke).toHaveBeenCalledWith('creation_cancel', expect.anything())
})
