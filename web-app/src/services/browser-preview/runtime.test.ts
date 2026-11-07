import { describe, expect, it, vi } from 'vitest'
import { BrowserRuntime } from './runtime'
import { browserCatalog } from './config'

const id = browserCatalog[0].id
function fixture() {
  const session = { reset: vi.fn(), dispose: vi.fn().mockResolvedValue(undefined), generate: vi.fn() }
  const model = { create_session: vi.fn(() => session), dispose: vi.fn().mockResolvedValue(undefined) }
  const sdk = { from_pretrained: vi.fn().mockResolvedValue(model) }
  const loader = vi.fn().mockResolvedValue(sdk)
  return { session, model, sdk, loader, runtime: new BrowserRuntime(loader, async () => true) }
}

describe('browser runtime ownership', () => {
  it('shares a concurrent load and pins the compatible projector', async () => {
    const f = fixture()
    await Promise.all([f.runtime.load(id), f.runtime.load(id)])
    expect(f.sdk.from_pretrained).toHaveBeenCalledTimes(1)
    expect(f.sdk.from_pretrained.mock.calls[0][1]).toMatchObject({ revision: browserCatalog[0].revision, mmproj: 'mmproj-LFM3-Omni-2B-Q8_0.gguf', maxLength: 32768 })
    expect(f.runtime.loadedId()).toBe(id)
  })

  it('does not leave a ready model after cancellation during download', async () => {
    const f = fixture()
    let complete!: (value: typeof f.model) => void
    f.sdk.from_pretrained.mockImplementation(() => new Promise(resolve => { complete = resolve }))
    const loading = f.runtime.load(id)
    await vi.waitFor(() => expect(f.sdk.from_pretrained).toHaveBeenCalled())
    f.runtime.cancelLoad()
    complete(f.model)
    await expect(loading).rejects.toThrow()
    expect(f.model.dispose).toHaveBeenCalledOnce()
    expect(f.runtime.loadedId()).toBe('')
    expect(f.runtime.snapshot().phase).toBe('idle')
  })

  it('releases an SDK model that silently allocates a smaller context than requested', async () => {
    const f = fixture()
    Object.assign(f.model, { contextLength: 4096 })
    await expect(f.runtime.load(id)).rejects.toThrow('32 768')
    expect(f.model.dispose).toHaveBeenCalledOnce()
    expect(f.model.create_session).not.toHaveBeenCalled()
    expect(f.runtime.loadedId()).toBe('')
  })

  it('resets context between conversations and releases GPU resources', async () => {
    const f = fixture()
    f.session.generate.mockImplementation(() => ({
      async *[Symbol.asyncIterator]() { yield { type: 'text', text: 'Bonjour' } },
      result: Promise.resolve({ message: { role: 'assistant', content: 'Bonjour' }, finish_reason: 'stop' }),
      cancel: vi.fn(),
    }))
    for (const content of ['première discussion', 'autre discussion']) {
      const chunks = []
      for await (const part of f.runtime.generate(id, [{ role: 'user', content }])) chunks.push(part)
      expect(chunks[0].text).toBe('Bonjour')
    }
    expect(f.session.reset).toHaveBeenCalledTimes(2)
    await f.runtime.unload()
    expect(f.session.dispose).toHaveBeenCalledOnce()
    expect(f.model.dispose).toHaveBeenCalledOnce()
    expect(f.runtime.loadedId()).toBe('')
  })

  it('refuses unsupported models and unavailable WebGPU', async () => {
    const f = fixture()
    await expect(f.runtime.load('arbitrary.gguf')).rejects.toThrow('moteur navigateur')
    const unavailable = new BrowserRuntime(f.loader, async () => false)
    await expect(unavailable.load(id)).rejects.toThrow('WebGPU')
    expect(f.loader).not.toHaveBeenCalled()
  })

  it('reports observed text timings and SDK token counts without retaining conversation text', async () => {
    const f = fixture()
    f.session.generate.mockImplementation(() => ({
      async *[Symbol.asyncIterator]() { yield { type: 'text', text: 'Private response' } },
      result: Promise.resolve({ message: { role: 'assistant', content: 'Private response' }, finish_reason: 'stop', usage: { completion_tokens: 12 }, timings: { tokens_per_second: 45.5 } }),
      cancel: vi.fn(),
    }))
    for await (const _part of f.runtime.generate(id, [{ role: 'user', content: 'Private request' }])) { /* Consume the real runtime lifecycle. */ }
    expect(f.runtime.snapshot().lastGeneration).toMatchObject({ completionTokens: 12, tokensPerSecond: 45.5, firstTextMs: expect.any(Number), totalMs: expect.any(Number) })
    expect(JSON.stringify(f.runtime.snapshot())).not.toContain('Private')
  })

  it('reuses an exact conversation prefix and resets it when an earlier message changes', async () => {
    const f = fixture()
    f.session.generate.mockImplementation(() => ({
      async *[Symbol.asyncIterator]() { yield { type: 'text', text: '42' } },
      result: Promise.resolve({ message: { role: 'assistant', content: '42' }, finish_reason: 'stop' }),
      cancel: vi.fn(),
    }))
    const first = [{ role: 'user', content: '6 × 7 ?' }]
    for await (const _part of f.runtime.generate(id, first)) { /* Consume. */ }
    const continued = [...first, { role: 'assistant', content: '42' }, { role: 'user', content: 'Répète.' }]
    for await (const _part of f.runtime.generate(id, continued)) { /* Consume. */ }
    expect(f.session.reset).toHaveBeenCalledTimes(1)
    const edited = [{ role: 'user', content: 'Independent conversation' }, ...continued.slice(1)]
    for await (const _part of f.runtime.generate(id, edited)) { /* Consume. */ }
    expect(f.session.reset).toHaveBeenCalledTimes(2)
    await f.runtime.unload()
  })
})
