import { beforeEach, expect, it, vi } from 'vitest'
import { configureRecommendedBundle, splitRecommendedBundle } from './setup'
import type { InstallSnapshot } from '@/hooks/useCreationInstall'
import { useCreation, creationDefaults } from '@/hooks/useCreation'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { musicDefaults } from '@/modules/engines/music'
import { useModelProvider } from '@/hooks/useModelProvider'
import music from '@/constants/music-manifest.json'
import text from '@/constants/text-manifest.json'
import embedding from '@/constants/embedding-manifest.json'
import { useDefaultEmbeddingModel } from '@/hooks/useDefaultEmbeddingModel'
import { useImageUpscale } from '@/hooks/useImageUpscale'
const mocks = vi.hoisted(() => ({
  get: vi.fn(),
  pull: vi.fn(),
  invoke: vi.fn(),
  update: vi.fn(),
}))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
vi.mock('@/hooks/useServiceHub', () => ({
  getServiceHub: () => ({
    models: () => ({ getModel: mocks.get, pullModel: mocks.pull, updateModelSettings: mocks.update }),
  }),
}))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
function bundle(): InstallSnapshot {
  const files = [
    ...text.map((file) => ({ ...file })),
    ...embedding.map((file) => ({ ...file })),
    ...[2, 4].map((factor) => ({ role: `upscale.upscale${factor}`, name: `RealESRGAN_x${factor}plus.pth`, size: 1, sha256: '0'.repeat(64), url: 'https://example.com/upscale' })),
    ...['ggufImageModel', 'ggufTextEncoder', 'ggufVae'].map((role) => ({
      role: `image.${role}`,
      name: `image-${role}.gguf`,
      size: 1,
      sha256: '0'.repeat(64),
      url: 'https://huggingface.co/example',
    })),
    ...music.map((file) => ({ ...file, role: `music.${file.role}` })),
    ...['videoModel', 'ggufTextEncoder', 'ggufVae'].map((role) => ({
      role: `video.${role}`,
      name: `video-${role}.gguf`,
      size: 1,
      sha256: '0'.repeat(64),
      url: 'https://huggingface.co/example',
    })),
  ]
  return {
    plan: {
      variant: 'all-recommended',
      token: 'bulk',
      directory: 'D:/Novera models',
      files,
      total: files.reduce((sum, file) => sum + file.size, 0),
      available: 20e9,
      python: 'chosen-python',
    },
    phase: 'ready',
    running: false,
    acknowledged: false,
    bytes: files.map((file) => file.size),
    verified: files.map(() => true),
  }
}
beforeEach(() => {
  vi.clearAllMocks()
  mocks.get.mockResolvedValue({ id: 'Nemotron-3.5-Bolt-E4B-Q4_K_M' })
  mocks.pull.mockResolvedValue(undefined)
  mocks.invoke.mockResolvedValue(undefined)
  mocks.update.mockResolvedValue(undefined)
  useDefaultEmbeddingModel.setState({ defaultByProvider: {} })
  useImageUpscale.setState({ enabled: false, models: { 2: '', 4: '' }, installedModels: { 2: '', 4: '' } })
  useCreation.setState({
    settings: { ...creationDefaults },
    videoSettings: undefined,
    selections: {},
    modes: { new: 'music' },
  })
  useMediaLibrary.setState({ profiles: [], installed: [] })
  useMusicCreation.setState({
    profiles: [],
    settings: { ...musicDefaults },
    selections: {},
    installed: [],
  })
  useModelProvider.setState({
    providers: [
      {
        provider: 'llamacpp',
        models: [],
        active: true,
        settings: [],
      } as ModelProvider,
    ],
    selectedProvider: 'llamacpp',
    selectedModel: null,
  })
})
it('splits a verified shared-folder pack without losing names, checksums or runtime files', () => {
  const job = bundle()
  const parts = splitRecommendedBundle(job)
  expect(parts.map((part) => part.plan.variant)).toEqual([
    'gguf',
    'music-gguf',
    'video-gguf',
  ])
  expect(parts[1].plan.files).toHaveLength(14)
  expect(
    parts.every(
      (part) =>
        part.plan.directory.startsWith(job.plan.directory + '/') &&
        part.verified.every(Boolean)
    )
  ).toBe(true)
})
it('configures three independent media banks and imports text by reference with the separate Nemotron text model', async () => {
  mocks.get
    .mockResolvedValueOnce(undefined)
    .mockResolvedValue({ id: 'Nemotron-3.5-Bolt-E4B-Q4_K_M' })
  await configureRecommendedBundle(bundle(), 'new')
  expect(mocks.invoke).toHaveBeenCalledWith('creation_video_runtime_check', {
    python: 'chosen-python',
  })
  expect(mocks.pull).toHaveBeenCalledWith(
    'Nemotron-3.5-Bolt-E4B-Q4_K_M',
    'D:/Novera models/Nemotron-3.5-Bolt-E4B-Q4_K_M/Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf',
    text[0].sha256,
    text[0].size
  )
  expect(useCreation.getState().settings.ggufImageModel).toContain(
    'image-ggufImageModel'
  )
  expect(useCreation.getState().videoSettings).toMatchObject({
    durationSeconds: 5,
    videoEngine: 'sdcpp',
  })
  expect(useMusicCreation.getState().settings).toMatchObject({
    directory: 'D:/Novera models/ACE-Step 1.5 Turbo 2B Q4_K_M',
    durationSeconds: 30,
    seedMode: 'random',
    quality: 'mp3-320',
    instrumental: true,
  })
  expect(useCreation.getState().modes.new).toBe('music')
  expect(useModelProvider.getState().selectedModel?.id).toBe('Nemotron-3.5-Bolt-E4B-Q4_K_M')
  await configureRecommendedBundle(bundle(), 'new')
  expect(useMediaLibrary.getState().profiles).toHaveLength(2)
  expect(useMusicCreation.getState().profiles).toHaveLength(1)
  expect(mocks.pull).toHaveBeenCalledOnce()
})
it('registers the independent Qwen retrieval weights on CPU and both upscalers automatically', async () => {
  const installed = new Set<string>()
  mocks.get.mockImplementation(async (id) => installed.has(id) ? { id } : undefined)
  mocks.pull.mockImplementation(async (id) => { installed.add(id) })
  await configureRecommendedBundle(bundle(), 'new')
  expect(mocks.pull).toHaveBeenCalledWith('Qwen3-Embedding-0.6B-Q8_0',
    'D:/Novera models/Qwen3-Embedding-0.6B-Q8_0/Qwen3-Embedding-0.6B-Q8_0.gguf', embedding[0].sha256, embedding[0].size)
  expect(mocks.update).toHaveBeenCalledWith('Qwen3-Embedding-0.6B-Q8_0', { ngl: 0 })
  expect(useDefaultEmbeddingModel.getState().defaultByProvider.llamacpp).toBe('Qwen3-Embedding-0.6B-Q8_0')
  expect(useModelProvider.getState().selectedModel?.id).toBe('Nemotron-3.5-Bolt-E4B-Q4_K_M')
  expect(useImageUpscale.getState().installedModels).toEqual({
    2: 'D:/Novera models/upscale_models/RealESRGAN_x2plus.pth',
    4: 'D:/Novera models/upscale_models/RealESRGAN_x4plus.pth',
  })
})
it.each(['embedding.model', 'upscale.upscale2', 'upscale.upscale4'])('refuses to claim full setup when %s is missing', async (role) => {
  const job = bundle()
  job.plan.files = job.plan.files.filter((file) => file.role !== role)
  job.verified = job.plan.files.map(() => true)
  await expect(configureRecommendedBundle(job)).rejects.toThrow(role.startsWith('embedding') ? 'SETUP_EMBEDDING_MISSING' : 'SETUP_UPSCALE_MISSING')
  expect(mocks.pull).not.toHaveBeenCalled()
})
it('registers a resumed Q6_K bundle under its original model id and folder', async () => {
  const job = bundle()
  const legacy = job.plan.files.find((file) => file.role === 'text.model')!
  legacy.name = 'LFM3-1.7B-Q6_K.gguf'
  mocks.get.mockResolvedValueOnce(undefined).mockResolvedValue({ id: 'LFM3-1.7B-Q6_K' })
  await configureRecommendedBundle(job, 'new')
  expect(mocks.pull).toHaveBeenCalledWith(
    'LFM3-1.7B-Q6_K',
    'D:/Novera models/LFM3-1.7B-Q6_K/LFM3-1.7B-Q6_K.gguf',
    legacy.sha256,
    legacy.size
  )
  expect(useModelProvider.getState().selectedModel?.id).toBe('LFM3-1.7B-Q6_K')
})
it('rejects incomplete downloads and a missing video runtime before claiming automatic setup', async () => {
  const job = bundle()
  job.verified[0] = false
  await expect(configureRecommendedBundle(job, 'new')).rejects.toThrow(
    'SETUP_NOT_VERIFIED'
  )
  expect(mocks.pull).not.toHaveBeenCalled()
  mocks.invoke.mockRejectedValueOnce(
    new Error('CREATION_VIDEO_RUNTIME_REQUIRED')
  )
  await expect(configureRecommendedBundle(bundle(), 'new')).rejects.toThrow(
    'CREATION_VIDEO_RUNTIME_REQUIRED'
  )
  expect(useMediaLibrary.getState().profiles).toHaveLength(0)
})
it('keeps removed music profiles retired during sync and restores them only on explicit use', () => {
  const music = splitRecommendedBundle(bundle())[1]
  useMusicCreation.getState().importReady(music)
  useMusicCreation.getState().select(`music-${music.plan.token}`, 'new')
  useMusicCreation.getState().remove(`music-${music.plan.token}`)
  expect(useMusicCreation.getState().settings.directory).toBe('')
  useMusicCreation.getState().importReady(music)
  expect(useMusicCreation.getState().profiles).toHaveLength(0)
  useMusicCreation.getState().importReady(music, true)
  expect(useMusicCreation.getState().profiles).toHaveLength(1)
})

it('rejects an old bundle without the text model before changing media selections', async () => {
  const job = bundle()
  job.plan.files = job.plan.files.filter((file) => file.role !== 'text.model')
  job.verified = job.plan.files.map(() => true)
  await expect(configureRecommendedBundle(job, 'new')).rejects.toThrow('SETUP_TEXT_MISSING')
  expect(useMediaLibrary.getState().profiles).toHaveLength(0)
  expect(useMusicCreation.getState().profiles).toHaveLength(0)
  expect(mocks.invoke).not.toHaveBeenCalled()
})

it('preserves the flat layout of an older saved recommended bundle', () => {
  const job = bundle()
  job.plan.directory = 'D:/Novera models/Novera recommended'
  expect(splitRecommendedBundle(job).every((part) => part.plan.directory === job.plan.directory)).toBe(true)
})
