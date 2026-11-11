import { describe, expect, it, vi } from 'vitest'
import { webcrypto } from 'node:crypto'
import { MediaTextRegistration } from './media-text-registration'

const path = 'C:\\models\\Qwen3-4B-Q4_K_M.gguf'
const decoder = {
  'general.architecture': 'qwen3', 'general.name': 'Qwen3 4B',
  'qwen3.block_count': '36', 'tokenizer.chat_template': '{{ messages }}',
}

function fixture() {
  const models: { id: string; path: string }[] = []
  const host = {
    registered: vi.fn(async () => [...models]),
    deletedIds: vi.fn(async (): Promise<string[]> => []),
    metadata: vi.fn(async (_path: string) => ({ metadata: { ...decoder } as Record<string, unknown> })),
    importModel: vi.fn(async (id: string, file: string) => { models.push({ id, path: file }) }),
    busy: vi.fn(() => false),
    warn: vi.fn(),
  }
  return { models, host, registration: new MediaTextRegistration(host) }
}

describe('media encoder registration for independent text calibration', () => {
  it('imports the existing Qwen file by reference once across overlapping discoveries', async () => {
    const { host, registration } = fixture()
    await Promise.all([registration.sync([path, path]), registration.sync([path])])
    expect(host.importModel).toHaveBeenCalledExactlyOnceWith('Qwen3-4B-Q4_K_M', path)
    expect(host.metadata).toHaveBeenCalledOnce()
  })

  it('recognizes an existing registration under another name and Windows path spelling', async () => {
    const { models, host, registration } = fixture()
    models.push({ id: 'my-chat-model', path: '//?/C:/MODELS/Qwen3-4B-Q4_K_M.gguf' })
    await registration.sync([path, '\\\\?\\C:\\models\\Qwen3-4B-Q4_K_M.gguf'])
    expect(host.importModel).not.toHaveBeenCalled()
    expect(host.metadata).not.toHaveBeenCalled()
  })

  it('does not scan folders, download URLs, or treat non-GGUF components as text', async () => {
    const { host, registration } = fixture()
    await registration.sync(['C:\\models', 'https://example.com/model.gguf', 'relative/model.gguf', '/models/vae.safetensors'])
    expect(host.registered).not.toHaveBeenCalled()
    expect(host.metadata).not.toHaveBeenCalled()
    expect(host.importModel).not.toHaveBeenCalled()
  })

  it.each([
    { 'general.architecture': 't5' },
    { 'general.architecture': 'clip' },
    { 'qwen3.pooling_type': '3' },
    { 'general.name': 'Qwen3-Embedding-0.6B' },
    { 'tokenizer.chat_template': '' },
    { 'qwen3.block_count': '0' },
  ])('keeps incompatible or incomplete metadata as a pipeline component: %j', async metadata => {
    const { host, registration } = fixture()
    host.metadata.mockResolvedValue({ metadata: { ...decoder, ...metadata } })
    await registration.sync([path])
    expect(host.importModel).not.toHaveBeenCalled()
  })

  it('preserves an explicitly deleted registration', async () => {
    const { host, registration } = fixture()
    host.deletedIds.mockResolvedValue(['Qwen3-4B-Q4_K_M.gguf'])
    await registration.sync([path])
    expect(host.importModel).not.toHaveBeenCalled()
  })

  it('leaves a same-name model at another path intact', async () => {
    vi.stubGlobal('crypto', webcrypto)
    try {
      const { models, host, registration } = fixture()
      models.push({ id: 'Qwen3-4B-Q4_K_M', path: 'C:/other/model.gguf' })
      await registration.sync([path])
      expect(host.importModel).toHaveBeenCalledWith(expect.stringMatching(/^Qwen3-4B-Q4_K_M-[a-f0-9]{12}$/), path)
      expect(models[0]).toEqual({ id: 'Qwen3-4B-Q4_K_M', path: 'C:/other/model.gguf' })
    } finally { vi.unstubAllGlobals() }
  })

  it('does not duplicate a manual import that finishes during metadata inspection', async () => {
    const { models, host, registration } = fixture()
    host.metadata.mockImplementation(async () => {
      models.push({ id: 'manual-import', path })
      return { metadata: decoder }
    })
    await registration.sync([path])
    expect(host.importModel).not.toHaveBeenCalled()
  })

  it('defers registration if a calibration is active, including one starting during inspection', async () => {
    const { host, registration } = fixture()
    host.busy.mockReturnValue(true)
    await registration.sync([path])
    expect(host.registered).not.toHaveBeenCalled()
    host.busy.mockReturnValue(false)
    host.metadata.mockImplementation(async () => {
      host.busy.mockReturnValue(true)
      return { metadata: decoder }
    })
    await registration.sync([path])
    expect(host.importModel).not.toHaveBeenCalled()
  })

  it('isolates an unreadable file and retries it on a later discovery', async () => {
    const { host, registration } = fixture()
    host.metadata.mockRejectedValueOnce(new Error('File unavailable'))
    await registration.sync(['/models/unavailable.gguf', path])
    expect(host.warn).toHaveBeenCalledOnce()
    expect(host.importModel).toHaveBeenCalledWith('Qwen3-4B-Q4_K_M', path)
    await registration.sync(['/models/unavailable.gguf'])
    expect(host.importModel).toHaveBeenCalledWith('unavailable', '/models/unavailable.gguf')
  })
})
