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
    expect(f.sdk.from_pretrained.mock.calls[0][1]).toMatchObject({ revision: browserCatalog[0].revision, mmproj: 'mmproj-LFM3-Omni-2B-Q8_0.gguf' })
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
})
