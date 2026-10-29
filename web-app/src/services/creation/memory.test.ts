import { beforeEach, describe, expect, it, vi } from 'vitest'
import { beginLocalMemory, streamWithMemory } from './memory'
import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
const mocks = vi.hoisted(() => ({
  invoke: vi.fn(),
  stop: vi.fn(),
  loaded: vi.fn(),
  models: {} as Record<string, unknown>,
}))
vi.mock('@tauri-apps/api/core', () => ({ invoke: mocks.invoke }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
vi.mock('@/hooks/useServiceHub', () => ({
  getServiceHub: () => ({ models: () => mocks.models }),
}))
vi.mock('@/i18n', () => ({ default: { t: (s: string) => s } }))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const text = { kind: 'text' as const, provider: 'llamacpp', model: 'a' }
const image = { kind: 'image' as const, provider: 'sdcpp', model: 'flux' }
const video = { kind: 'video' as const, provider: 'diffusers', model: 'video' }
describe('memory orchestration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useMemoryPolicy.setState({ policy: 'auto', waiting: {} })
    mocks.invoke.mockResolvedValue({ busy: false })
    mocks.loaded.mockResolvedValue([])
    mocks.stop.mockResolvedValue(undefined)
    mocks.models = { getActiveModels: mocks.loaded, stopModel: mocks.stop }
  })
  it('frees idle engines when a different text model needs loading', async () => {
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp'
        ? ['b']
        : provider === 'transformers'
          ? ['sft']
          : []
    )
    const release = await beginLocalMemory(text, { scope: 'text' })
    expect(mocks.stop.mock.calls).toEqual([
      ['b', 'llamacpp'],
      ['sft', 'transformers'],
    ])
    expect(useMemoryPolicy.getState().waiting.text).toBeUndefined()
    release()
    await Promise.resolve()
  })
  it('keeps a warm text model and its helpers across consecutive turns', async () => {
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp' ? ['a', 'embedding'] : ['helper']
    )
    for (let turn = 0; turn < 3; turn++) {
      const release = await beginLocalMemory(text)
      release()
      await Promise.resolve()
    }
    expect(mocks.stop).not.toHaveBeenCalled()
    // A warm turn only queries the selected engine, avoiding a full scan.
    expect(mocks.loaded.mock.calls).toEqual([
      ['llamacpp'], ['llamacpp'], ['llamacpp'],
    ])
  })
  it('makes room only when switching from a warm model to an unloaded one', async () => {
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp' ? ['a', 'embedding'] : []
    )
    const first = await beginLocalMemory(text)
    first()
    await Promise.resolve()
    expect(mocks.stop).not.toHaveBeenCalled()
    const next = await beginLocalMemory({ ...text, model: 'b' })
    expect(mocks.stop.mock.calls).toEqual([
      ['a', 'llamacpp'], ['embedding', 'llamacpp'],
    ])
    next()
    await Promise.resolve()
  })
  it('keeps an already loaded target when switching engines', async () => {
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'mlx' ? ['a'] : ['other']
    )
    const release = await beginLocalMemory({ ...text, provider: 'mlx' })
    expect(mocks.stop).not.toHaveBeenCalled()
    release()
    await Promise.resolve()
  })
  it('does not proceed when an engine reports an unsuccessful unload', async () => {
    mocks.loaded.mockResolvedValue(['b'])
    mocks.stop.mockResolvedValue({ success: false, error: 'Model is busy' })
    await expect(beginLocalMemory(image, { scope: 'failed' })).rejects.toThrow(
      'chat:memory.failed'
    )
    expect(mocks.stop).toHaveBeenCalledTimes(1)
    expect(useMemoryPolicy.getState().waiting.failed).toBeUndefined()
  })
  it('does not unload an active text stream before image generation', async () => {
    const textLease = await beginLocalMemory(text)
    mocks.stop.mockClear()
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp' ? ['a'] : []
    )
    let started = false
    const picture = beginLocalMemory(image).then((release) => {
      started = true
      return release
    })
    await Promise.resolve()
    expect(started).toBe(false)
    expect(mocks.stop).not.toHaveBeenCalled()
    textLease()
    const release = await picture
    expect(mocks.stop).toHaveBeenCalledWith('a', 'llamacpp')
    release()
    await Promise.resolve()
  })
  it('permits all three model categories without eviction or native waiting in manual mode', async () => {
    useMemoryPolicy.getState().setPolicy('manual')
    const leases = await Promise.all(
      [text, image, video].map((target) => beginLocalMemory(target))
    )
    expect(mocks.stop).not.toHaveBeenCalled()
    expect(mocks.invoke).not.toHaveBeenCalled()
    leases.forEach((release) => release())
  })
  it('waits for a previously started media process to finish and publish', async () => {
    mocks.invoke
      .mockResolvedValueOnce({ busy: true })
      .mockResolvedValue({ busy: false })
    const release = await beginLocalMemory(text)
    expect(mocks.invoke).toHaveBeenCalledTimes(2)
    release()
    await Promise.resolve()
  })
  it('fails visibly instead of loading another model when release fails', async () => {
    mocks.loaded.mockResolvedValue(['b'])
    mocks.stop.mockRejectedValue(new Error('locked'))
    await expect(beginLocalMemory(image, { scope: 'failed' })).rejects.toThrow(
      'chat:memory.failed'
    )
    expect(useMemoryPolicy.getState().waiting.failed).toBeUndefined()
    const release = await beginLocalMemory(video, { policy: 'manual' })
    release()
  })
  it('holds text ownership until stream end and releases it on cancellation', async () => {
    let source!: ReadableStreamDefaultController<string>
    const release = await beginLocalMemory(text)
    const stream = streamWithMemory(
      new ReadableStream<string>({
        start(controller) {
          source = controller
        },
      }),
      release
    )
    let started = false
    const next = beginLocalMemory(image).then((release) => {
      started = true
      return release
    })
    const reader = stream.getReader()
    source.enqueue('token')
    expect((await reader.read()).value).toBe('token')
    expect(started).toBe(false)
    await reader.cancel()
    ;(await next)()
    await Promise.resolve()
  })
  it('does not evict RAG helper models during an active text turn', async () => {
    const parent = await beginLocalMemory(text)
    mocks.loaded.mockResolvedValue(['a', 'embedding'])
    mocks.stop.mockClear()
    const child = await beginLocalMemory(
      { kind: 'text', provider: 'rag', model: 'embedding' },
      { auxiliary: true }
    )
    expect(mocks.stop).not.toHaveBeenCalled()
    child()
    parent()
    await Promise.resolve()
  })
  it('lets a different local router model load inside a protected text turn', async () => {
    const parent = await beginLocalMemory(text)
    const router = {
      kind: 'text' as const,
      provider: 'llamacpp',
      model: 'router',
    }
    const auxiliary = await beginLocalMemory(router, { auxiliary: true })
    mocks.stop.mockClear()
    const load = await beginLocalMemory(router, { load: true })
    expect(mocks.stop).not.toHaveBeenCalled()
    load()
    auxiliary()
    parent()
    await Promise.resolve()
  })
  it('does not cancel another owner when the first request aborts during shared preparation', async () => {
    let finish!: () => void
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp' ? ['b'] : []
    )
    mocks.stop.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          finish = resolve
        })
    )
    const controller = new AbortController()
    const first = beginLocalMemory(text, { signal: controller.signal })
    await vi.waitFor(() => expect(finish).toBeTypeOf('function'))
    const second = beginLocalMemory(text)
    await Promise.resolve()
    controller.abort()
    await expect(first).rejects.toMatchObject({ name: 'AbortError' })
    finish()
    const release = await second
    expect(mocks.stop).toHaveBeenCalledTimes(1)
    release()
    await Promise.resolve()
  })
})
