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
const music = { kind: 'music' as const, provider: 'ace', model: 'music' }
const busyUnload = 'Router rejected unload (status 409 Conflict): {"error":{"code":409,"message":"the model has requests in flight; retry once they finish"}}'
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
  it.each([text, image, music, video])('waits for native text completion before $kind, including the second request', async (target) => {
    mocks.loaded.mockImplementation(async (provider: string) => provider === 'llamacpp' ? ['previous'] : [])
    for (let turn = 0; turn < 2; turn++) {
      mocks.stop.mockResolvedValueOnce({ success: false, error: busyUnload })
        .mockResolvedValueOnce({ success: true })
      const release = await beginLocalMemory(target, { scope: target.kind })
      expect(useMemoryPolicy.getState().waiting[target.kind]).toBeUndefined()
      release()
      await Promise.resolve()
    }
    expect(mocks.stop).toHaveBeenCalledTimes(4)
  })
  it('can cancel a busy unload wait and then prepare a fresh request', async () => {
    mocks.loaded.mockImplementation(async (provider: string) => provider === 'llamacpp' ? ['previous'] : [])
    mocks.stop.mockRejectedValue(busyUnload)
    const controller = new AbortController()
    const waiting = beginLocalMemory(image, { signal: controller.signal, scope: 'cancel-busy' })
    const rejected = waiting.then(() => undefined, error => error)
    await vi.waitFor(() => expect(mocks.stop).toHaveBeenCalled())
    expect(useMemoryPolicy.getState().waiting['cancel-busy']).toBe(1)
    controller.abort()
    expect(await rejected).toMatchObject({ name: 'AbortError' })
    expect(useMemoryPolicy.getState().waiting['cancel-busy']).toBeUndefined()
    mocks.stop.mockResolvedValue({ success: true })
    const release = await beginLocalMemory(music)
    release()
    await Promise.resolve()
  })
  it('accepts a model already released by another owner during the wait', async () => {
    let queries = 0
    mocks.loaded.mockImplementation(async (provider: string) => provider === 'llamacpp' && ++queries === 1 ? ['previous'] : [])
    mocks.stop.mockResolvedValue({ success: false, error: busyUnload })
    const release = await beginLocalMemory(image)
    expect(mocks.stop).toHaveBeenCalledTimes(1)
    release()
    await Promise.resolve()
  })
  it('does not retry an unrelated unload conflict or hide a real failure after busy', async () => {
    mocks.loaded.mockImplementation(async (provider: string) => provider === 'llamacpp' ? ['previous'] : [])
    mocks.stop.mockResolvedValueOnce({ success: false, error: 'Router rejected unload (status 409 Conflict): invalid configuration' })
    await expect(beginLocalMemory(video)).rejects.toThrow('chat:memory.failed')
    expect(mocks.stop).toHaveBeenCalledTimes(1)
    mocks.stop.mockResolvedValueOnce({ success: false, error: busyUnload })
      .mockRejectedValueOnce(new Error('connection lost'))
    await expect(beginLocalMemory(text)).rejects.toThrow('chat:memory.failed')
    expect(mocks.stop).toHaveBeenCalledTimes(3)
    const release = await beginLocalMemory(image, { policy: 'manual' })
    release()
    await Promise.resolve()
  })
  it.each([{ ...text, model: 'next' }, image, music, video])('protects an active text stream before $kind', async (target) => {
    const textLease = await beginLocalMemory(text)
    mocks.stop.mockClear()
    mocks.loaded.mockImplementation(async (provider: string) =>
      provider === 'llamacpp' ? ['a'] : []
    )
    let started = false
    const picture = beginLocalMemory(target).then((release) => {
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
  it('permits all four model categories without eviction or native waiting in manual mode', async () => {
    useMemoryPolicy.getState().setPolicy('manual')
    const leases = await Promise.all(
      [text, image, music, video].map((target) => beginLocalMemory(target))
    )
    expect(mocks.stop).not.toHaveBeenCalled()
    expect(mocks.invoke).not.toHaveBeenCalled()
    leases.forEach((release) => release())
  })
  it.each([text, image, music, video])('waits for media publication before $kind', async (target) => {
    mocks.invoke
      .mockResolvedValueOnce({ busy: true })
      .mockResolvedValue({ busy: false })
    const release = await beginLocalMemory(target)
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
