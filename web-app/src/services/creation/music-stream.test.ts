import { beforeEach, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { creationStream } from './stream'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import type { UIMessage } from 'ai'
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('./memory', () => ({
  beginLocalMemory: async () => () => {},
  releaseFinishedMedia: async () => {},
}))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const messages: UIMessage[] = [
  { id: 'user', role: 'user', parts: [{ type: 'text', text: 'calm piano' }] },
]
async function read(stream: ReturnType<typeof creationStream>) {
  const reader = stream.getReader()
  const chunks = []
  for (;;) {
    const value = await reader.read()
    if (value.done) return chunks
    chunks.push(value.value)
  }
}
beforeEach(() => {
  vi.restoreAllMocks()
  vi.mocked(invoke).mockReset()
  useCreation.setState({
    settings: { ...creationDefaults },
    progress: {},
    modes: {},
  })
  useMusicCreation.setState({
    settings: {
      ...musicDefaults,
      directory: 'D:/music',
      generator: 'dit.gguf',
      planner: 'lm.gguf',
      encoder: 'encoder.gguf',
      vae: 'vae.gguf',
    },
    profiles: [],
    selections: {},
    installed: [],
  })
  useMemoryPolicy.setState({ policy: 'auto', waiting: {} })
  vi.mocked(invoke).mockImplementation(async (command) =>
    command === 'creation_start'
      ? 'music-job'
      : {
          stage: 'done',
          name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp3',
        }
  )
})
it('generates three music files sequentially with independent seeds and one finish callback', async () => {
  useMusicCreation.getState().setSettings({ generationCount: 3, seedMode: 'increment', seed: 40, instrumental: true })
  let started = 0
  vi.mocked(invoke).mockImplementation(async command => {
    if (command === 'creation_start') return `music-${++started}`
    return { stage: 'done', name: `Novera-00000000-0000-0000-0000-00000000000${started}.mp3` }
  })
  const finish = vi.fn()
  const chunks = await read(creationStream('music', 'calm piano', messages, 'three', undefined, finish))
  const requests = vi.mocked(invoke).mock.calls.filter(([command]) => command === 'creation_start').map(([, args]) => (args as { request: { seed: number } }).request)
  expect(requests.map(request => request.seed)).toEqual([40, 41, 42])
  expect(chunks.filter(chunk => chunk.type === 'file')).toHaveLength(3)
  expect(chunks.filter(chunk => chunk.type === 'start')).toHaveLength(1)
  expect(chunks.filter(chunk => chunk.type === 'finish')).toHaveLength(1)
  expect(finish).toHaveBeenCalledTimes(1)
  expect(useMusicCreation.getState().settings.lastSeed).toBe(42)
})

it('routes music through its native model, reserves a random seed and publishes a playable MP3 without a model footer', async () => {
  vi.spyOn(crypto, 'getRandomValues').mockImplementation((array) => {
    ;(array as Uint32Array)[0] = 123
    return array
  })
  const chunks = await read(
    creationStream(
      'music',
      '/music calm piano',
      messages,
      'new',
      undefined,
      vi.fn()
    )
  )
  expect(invoke).toHaveBeenCalledWith('creation_start', {
    request: expect.objectContaining({
      task: 'music',
      backend: 'acestep',
      prompt: 'calm piano',
      model: 'D:/music/dit.gguf',
      music_lm: 'D:/music/lm.gguf',
      cpp_llm: 'D:/music/encoder.gguf',
      music_lyrics: '[Instrumental]',
      music_language: 'unknown',
      duration_seconds: 30,
      music_format: 'mp3',
      music_bitrate: 320,
      steps: 8,
      seed: 123,
    }),
  })
  expect(chunks.find((c) => c.type === 'file')).toMatchObject({
    mediaType: 'audio/mpeg',
    url: expect.stringContaining('novera-creation:music/'),
    providerMetadata: { novera: { seed: 123 } },
  })
  expect(chunks.some((c) => c.type === 'text-delta')).toBe(false)
  expect(useMusicCreation.getState().settings.lastSeed).toBe(123)
  expect(useCreation.getState().settings.seed).toBe(42)
})
it('honors an explicit three-minute soundtrack without overwriting the saved duration preset', async () => {
  await read(creationStream('music', "Crée une bande originale épique de 3 minutes pour le film La Communauté de l'Anneau", messages, 'new', undefined, vi.fn()))
  expect(invoke).toHaveBeenCalledWith('creation_start', { request: expect.objectContaining({ task: 'music', duration_seconds: 180 }) })
  expect(useMusicCreation.getState().settings.durationSeconds).toBe(30)
})
it('sends pasted song sections as lyrics and the musical description as the caption', async () => {
  useMusicCreation.getState().setSettings({ instrumental: false })
  const prompt = `Titre : Ma chanson\nStyle & ambiance\nDance-pop, 128 BPM.\nParoles\n[Intro]\nUne première ligne\nUne deuxième ligne\n[Chorus]\nUne troisième ligne\nUne quatrième ligne`
  await read(creationStream('music', prompt, messages, 'new', undefined, vi.fn()))
  expect(invoke).toHaveBeenCalledWith('creation_start', expect.objectContaining({ request: expect.objectContaining({
    prompt: 'Dance-pop, 128 BPM.', music_bpm: 128,
    music_lyrics: '[Intro]\nUne première ligne\nUne deuxième ligne\n[Chorus]\nUne troisième ligne\nUne quatrième ligne',
  }) }))
  expect(useMusicCreation.getState().settings.lyrics).toBe('')
})
it('rejects an explicit unsupported duration instead of silently producing a shorter track', async () => {
  await expect(read(creationStream('music', 'Compose music lasting 11 minutes', messages, 'new', undefined, vi.fn()))).rejects.toThrow('10–600 s')
  expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
})
it.each([true, false])('uses the requested music duration only when Auto is %s', async (durationAuto) => {
  useMusicCreation.getState().setSettings({ durationAuto, durationSeconds: 45 })
  await read(creationStream('music', 'Compose 3 minutes de musique', messages, 'new', undefined, vi.fn()))
  expect(invoke).toHaveBeenCalledWith('creation_start', expect.objectContaining({
    request: expect.objectContaining({ duration_seconds: durationAuto ? 180 : 45 }),
  }))
})
it.each([10, 360, 600])('passes a manual %s seconds unchanged to the native engine', async (durationSeconds) => {
  useMusicCreation.getState().setSettings({ durationAuto: false, durationSeconds })
  await read(creationStream('music', 'Compose 3 minutes de musique', messages, 'new', undefined, vi.fn()))
  expect(invoke).toHaveBeenCalledWith('creation_start', expect.objectContaining({
    request: expect.objectContaining({ duration_seconds: durationSeconds }),
  }))
})
it.each([0, 3, 9, 601, 3600, 30.5])('rejects invalid manual duration %s without shortening it', async (durationSeconds) => {
  useMusicCreation.getState().setSettings({ durationAuto: false, durationSeconds })
  await expect(read(creationStream('music', 'Compose music', messages, 'new', undefined, vi.fn()))).rejects.toThrow('10–600 s')
  expect(invoke).not.toHaveBeenCalledWith('creation_start', expect.anything())
})
it('keeps the same seed during busy retries and passes lyrics, tempo, duration and MP3 quality', async () => {
  useMusicCreation
    .getState()
    .setSettings({
      seedMode: 'increment',
      seed: 30,
      instrumental: false,
      lyrics: '[Verse]\nBonjour',
      language: 'fr',
      bpm: 100,
      durationSeconds: 60,
      quality: 'mp3-320',
    })
  let starts = 0
  vi.mocked(invoke).mockImplementation(async (command) => {
    if (command === 'creation_start') {
      if (starts++ === 0) throw 'CREATION_BUSY'
      return 'music-job'
    }
    return {
      stage: 'done',
      name: 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp3',
    }
  })
  const chunks = await read(
    creationStream('music', 'song', messages, 'new', undefined, vi.fn())
  )
  const requests = vi
    .mocked(invoke)
    .mock.calls.filter(([cmd]) => cmd === 'creation_start')
  expect(requests).toHaveLength(2)
  for (const [, args] of requests)
    expect(args).toMatchObject({
      request: {
        seed: 30,
        music_lyrics: '[Verse]\nBonjour',
        music_language: 'fr',
        music_bpm: 100,
        music_format: 'mp3',
        music_bitrate: 320,
        duration_seconds: 60,
      },
    })
  expect(useMusicCreation.getState().settings.seed).toBe(31)
  expect(chunks.find((c) => c.type === 'file')).toMatchObject({
    mediaType: 'audio/mpeg',
  })
})
it('reserves only the selected music profile and leaves other profiles intact', async () => {
  const settings = useMusicCreation.getState().settings
  useMusicCreation.setState({
    profiles: [
      {
        id: 'a',
        name: 'a',
        settings: { ...settings, seedMode: 'decrement', seed: 9 },
      },
      {
        id: 'b',
        name: 'b',
        settings: { ...settings, seedMode: 'fixed', seed: 80 },
      },
    ],
    selections: { song: 'a' },
  })
  await read(
    creationStream('music', 'music', messages, 'song', undefined, vi.fn())
  )
  expect(useMusicCreation.getState().profiles[0].settings).toMatchObject({
    seed: 8,
    lastSeed: 9,
  })
  expect(useMusicCreation.getState().profiles[1].settings.seed).toBe(80)
})
it('reports engine failures without a fabricated audio file and finishes the UI state', async () => {
  const finish = vi.fn()
  vi.mocked(invoke).mockImplementation(async (command) =>
    command === 'creation_start'
      ? 'music-job'
      : { stage: 'error', error: 'MUSIC_OUTPUT_FORMAT' }
  )
  await expect(
    read(creationStream('music', 'music', messages, 'song', undefined, finish))
  ).rejects.toThrow('MUSIC_OUTPUT_FORMAT')
  expect(invoke).toHaveBeenCalledWith('creation_cancel', { id: 'music-job' })
  expect(useCreation.getState().progress.song).toBeUndefined()
  expect(finish).toHaveBeenCalledOnce()
})
it('cancels a native start that completes after Stop', async () => {
  let resolveStart!: (value: string) => void
  vi.mocked(invoke).mockImplementation(async (command) =>
    command === 'creation_start'
      ? new Promise<string>((resolve) => {
          resolveStart = resolve
        })
      : undefined
  )
  const abort = new AbortController()
  const reading = read(
    creationStream('music', 'music', messages, 'song', abort.signal, vi.fn())
  ).catch((e) => e)
  await vi.waitFor(() => expect(resolveStart).toBeDefined())
  abort.abort()
  resolveStart('late-music')
  expect((await reading).name).toBe('AbortError')
  expect(invoke).toHaveBeenCalledWith('creation_cancel', { id: 'late-music' })
  expect(
    vi.mocked(invoke).mock.calls.some(([cmd]) => cmd === 'creation_status')
  ).toBe(false)
})
