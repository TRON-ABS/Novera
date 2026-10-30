import { clearHuggingFaceCatalogCache } from '@/services/models/huggingfaceCatalog'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DefaultModelsService } from '../default'
import { parseFileSize } from '@/lib/modelCompatibility'
import { EngineManager, events, DownloadEvent, ContentType } from '@janhq/core'

const { mockEvents } = vi.hoisted(() => ({
  mockEvents: { emit: vi.fn() },
}))

vi.mock('@janhq/core', () => ({
  EngineManager: { instance: vi.fn() },
  events: mockEvents,
  DownloadEvent: {
    onFileDownloadStopped: 'onFileDownloadStopped',
    onFileDownloadError: 'onFileDownloadError',
  },
  ContentType: { Text: 'text', Image: 'image_url' },
}))

vi.mock('@/lib/utils', () => ({
  sanitizeModelId: (id: string) => id.replace(/[^a-zA-Z0-9._-]/g, '_'),
}))

vi.mock('../tokenCountToolContext', () => ({
  extractToolContextFromContent: vi.fn().mockReturnValue(''),
  extractToolContextFromMetadata: vi.fn().mockReturnValue(''),
}))

global.fetch = vi.fn()


describe('DefaultModelsService - coverage supplement', () => {
  let svc: DefaultModelsService

  const mockEngine = {
    get: vi.fn(),
    list: vi.fn(),
    updateSettings: vi.fn(),
    import: vi.fn(),
    abortImport: vi.fn(),
    delete: vi.fn(),
    getLoadedModels: vi.fn(),
    unload: vi.fn(),
    load: vi.fn(),
    isModelSupported: vi.fn(),
    isToolSupported: vi.fn(),
    checkMmprojExists: vi.fn(),
    validateGgufFile: vi.fn(),
    getTokensCount: vi.fn(),
  }

  const mockEngineManager = {
    get: vi.fn().mockReturnValue(mockEngine),
  }

  beforeEach(() => {
    clearHuggingFaceCatalogCache()
    svc = new DefaultModelsService()
    vi.clearAllMocks()
    ;(EngineManager.instance as any).mockReturnValue(mockEngineManager)
    mockEngineManager.get.mockReturnValue(mockEngine)
  })

  describe('split GGUF downloads', () => {
    const filename = (index: number) => `nested/model-Q4_K_M-${String(index).padStart(5, '0')}-of-00002.gguf`
    const makeRepo = () => ({
      id: 'publisher/model', modelId: 'publisher/model', author: 'publisher', sha: 'pinned',
      siblings: [2, 1].map((index) => ({ rfilename: filename(index), lfs: { sha256: String(index).repeat(64), size: index * 100, pointerSize: 0 } })),
    })
    const url = `https://huggingface.co/publisher/model/resolve/main/${filename(2)}?download=true`

    it('groups sorted shards with total weight and one stable variant ID', () => {
      const model = svc.convertHfRepoToCatalogModel(makeRepo() as any)
      expect(model.quants).toEqual([{
        model_id: 'publisher/nested_model-Q4_K_M-split-00002',
        path: `https://huggingface.co/publisher/model/resolve/pinned/${filename(1)}`,
        file_size: '300 B', shard_count: 2,
      }])
    })

    it('resolves every verified shard at one revision even with verification skipped', async () => {
      const fetchRepo = vi.spyOn(svc, 'fetchHuggingFaceRepo').mockResolvedValue(makeRepo() as any)
      await svc.pullModelWithMetadata('m1', url, undefined, 'token')
      expect(fetchRepo).toHaveBeenCalledWith('publisher/model', 'token', 'main')
      expect(mockEngine.import).toHaveBeenCalledWith('m1', expect.objectContaining({
        modelPath: `https://huggingface.co/publisher/model/resolve/pinned/${filename(1)}`,
        modelShards: [1, 2].map((index) => ({
          url: `https://huggingface.co/publisher/model/resolve/pinned/${filename(index)}`,
          filename: filename(index).split('/').pop(), size: index * 100, sha256: String(index).repeat(64),
        })),
      }))
    })

    it('normalizes numbered local names for uppercase repository extensions', async () => {
      const repo = makeRepo()
      repo.siblings.forEach((file) => { file.rfilename = file.rfilename.toUpperCase() })
      vi.spyOn(svc, 'fetchHuggingFaceRepo').mockResolvedValue(repo as any)
      await svc.pullModelWithMetadata('m1', url.replace(filename(2), filename(2).toUpperCase()))
      expect(mockEngine.import).toHaveBeenCalledWith('m1', expect.objectContaining({
        modelShards: expect.arrayContaining([expect.objectContaining({ filename: 'MODEL-Q4_K_M-00001-of-00002.gguf' })]),
      }))
    })

    it.each(['missing', 'duplicate', 'hash', 'size', 'revision', 'network'])('rejects %s metadata before importing and clears UI state', async (defect) => {
      const repo = makeRepo()
      if (defect === 'missing') repo.siblings.pop()
      if (defect === 'duplicate') repo.siblings[1] = repo.siblings[0]
      if (defect === 'hash') repo.siblings[0].lfs.sha256 = 'bad'
      if (defect === 'size') repo.siblings[0].lfs.size = 0
      if (defect === 'revision') repo.sha = ''
      vi.spyOn(svc, 'fetchHuggingFaceRepo').mockResolvedValue(defect === 'network' ? null : repo as any)
      await expect(svc.pullModelWithMetadata('m1', url)).rejects.toThrow()
      expect(mockEngine.import).not.toHaveBeenCalled()
      expect(mockEvents.emit).toHaveBeenCalledWith('onFileDownloadError', expect.objectContaining({ modelId: 'm1' }))
    })

    it('counts all 500 GB for memory estimates instead of the first shard alone', () => {
      const repo = makeRepo()
      repo.siblings.forEach((file) => { file.lfs.size = 250_000_000_000 })
      const quant = svc.convertHfRepoToCatalogModel(repo as any).quants![0]
      expect(parseFileSize(quant.file_size)).toBe(500_000_000_000)
    })

    it('keeps the total unknown if any shard has no measured size', () => {
      const repo = makeRepo()
      repo.siblings[0].lfs.size = 0
      expect(svc.convertHfRepoToCatalogModel(repo as any).quants?.[0].file_size).toBe('Unknown size')
    })
  })

  describe('model removal options', () => {
    it.each([false, true])('forwards deleteFiles=%s to llama.cpp', async (deleteFiles) => {
      await svc.deleteModel('m1', 'llamacpp', { deleteFiles })
      expect(mockEngine.delete).toHaveBeenCalledWith('m1', { deleteFiles })
    })
    it('rejects unsupported providers instead of ignoring the keep-files choice', async () => {
      await expect(svc.deleteModel('m1', 'mlx', { deleteFiles: false })).rejects.toThrow('only supported by llama.cpp')
      expect(mockEngine.delete).not.toHaveBeenCalled()
    })
    it('reports a missing engine without claiming removal succeeded', async () => {
      mockEngineManager.get.mockReturnValue(undefined)
      await expect(svc.deleteModel('m1', 'llamacpp', { deleteFiles: false })).rejects.toThrow('only supported by llama.cpp')
      expect(mockEngine.delete).not.toHaveBeenCalled()
    })
  })

  // ── fetchModelCatalog ──
  describe('fetchModelCatalog', () => {
    it('returns catalog on success', async () => {
      const catalog: unknown[] = []
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(catalog),
      })
      const result = await svc.fetchModelCatalog()
      expect(result).toEqual(catalog)
    })

    it('throws on non-ok response', async () => {
      ;(fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Server Error' })
      await expect(svc.fetchModelCatalog()).rejects.toThrow('Failed to fetch model catalog')
    })

    it('throws on network error', async () => {
      ;(fetch as any).mockRejectedValue(new Error('network down'))
      await expect(svc.fetchModelCatalog()).rejects.toThrow('Failed to fetch model catalog: network down')
    })

    it('throws with Unknown error for non-Error', async () => {
      ;(fetch as any).mockRejectedValue('string error')
      await expect(svc.fetchModelCatalog()).rejects.toThrow('Unknown error')
    })
  })

  // ── fetchHuggingFaceRepo ──
  describe('fetchHuggingFaceRepo', () => {
    it('fetches repo with clean ID', async () => {
      const repoData = { modelId: 'org/repo' }
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(repoData),
      })
      const result = await svc.fetchHuggingFaceRepo('org/repo')
      expect(result).toEqual(repoData)
    })

    it('cleans URL-format repoId', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
      await svc.fetchHuggingFaceRepo('https://huggingface.co/org/repo/')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('org/repo'),
        expect.any(Object)
      )
    })

    it('passes hfToken as Bearer header', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
      await svc.fetchHuggingFaceRepo('org/repo', 'hf_token123')
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: { Authorization: 'Bearer hf_token123' },
        })
      )
    })

    it('returns null for invalid repo ID (no slash)', async () => {
      const result = await svc.fetchHuggingFaceRepo('invalidrepo')
      expect(result).toBeNull()
    })

    it('returns null for empty repo ID', async () => {
      const result = await svc.fetchHuggingFaceRepo('')
      expect(result).toBeNull()
    })

    it('returns null on 404', async () => {
      ;(fetch as any).mockResolvedValue({ ok: false, status: 404 })
      const result = await svc.fetchHuggingFaceRepo('org/repo')
      expect(result).toBeNull()
    })

    it('returns null on non-404 error', async () => {
      ;(fetch as any).mockResolvedValue({ ok: false, status: 500, statusText: 'Error' })
      const result = await svc.fetchHuggingFaceRepo('org/repo')
      expect(result).toBeNull()
    })

    it('returns null on network error', async () => {
      ;(fetch as any).mockRejectedValue(new Error('network'))
      const result = await svc.fetchHuggingFaceRepo('org/repo')
      expect(result).toBeNull()
    })

    it('cleans huggingface.co prefix without protocol', async () => {
      ;(fetch as any).mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue({}),
      })
      await svc.fetchHuggingFaceRepo('huggingface.co/org/repo')
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('org/repo'),
        expect.any(Object)
      )
    })
  })

  // ── convertHfRepoToCatalogModel ──
  describe('convertHfRepoToCatalogModel', () => {
    it('converts repo with GGUF files', () => {
      const repo = {
        modelId: 'org/repo',
        author: 'org',
        downloads: 1000,
        createdAt: '2024-01-01',
        tags: ['llama'],
        siblings: [
          { rfilename: 'model-q4.gguf', size: 4 * 1024 ** 3 },
          { rfilename: 'model-mmproj.gguf', size: 500 * 1024 ** 2 },
        ],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(result.model_name).toBe('org/repo')
      expect(result.developer).toBe('org')
      expect(result.downloads).toBe(1000)
      expect(result.num_quants).toBe(1)
      expect(result.num_mmproj).toBe(1)
      expect(parseFileSize(result.quants[0].file_size)).toBe(4 * 1024 ** 3)
      expect(parseFileSize(result.mmproj_models[0].file_size)).toBe(500 * 1024 ** 2)
    })

    it('handles repo with no siblings', () => {
      const repo = {
        modelId: 'org/repo',
        author: 'org',
        siblings: undefined,
        tags: [],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(result.num_quants).toBe(0)
      expect(result.quants).toEqual([])
    })

    it('handles MLX repo with safetensors', () => {
      const repo = {
        modelId: 'org/mlx-model',
        author: 'org',
        library_name: 'mlx',
        tags: ['mlx'],
        siblings: [
          { rfilename: 'model.safetensors', size: 2 * 1024 ** 3, lfs: { sha256: 'abc' } },
        ],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(result.is_mlx).toBe(true)
      expect(result.num_safetensors).toBe(1)
      expect(result.safetensors_files[0].sha256).toBe('abc')
    })

    it('handles file with no size', () => {
      const repo = {
        modelId: 'org/repo',
        author: 'org',
        siblings: [{ rfilename: 'model.gguf' }],
        tags: [],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(result.quants[0].file_size).toBe('Unknown size')
    })

    it('preserves exact byte size for small files', () => {
      const repo = {
        modelId: 'org/repo',
        author: 'org',
        siblings: [{ rfilename: 'model.gguf', size: 500 * 1024 ** 2 }],
        tags: [],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(parseFileSize(result.quants[0].file_size)).toBe(500 * 1024 ** 2)
    })

    it('downloads defaults to 0', () => {
      const repo = {
        modelId: 'org/repo',
        author: 'org',
        siblings: [],
        tags: [],
      } as any

      const result = svc.convertHfRepoToCatalogModel(repo)
      expect(result.downloads).toBe(0)
    })
  })

  // ── updateModel ──
  describe('updateModel', () => {
    it('calls engine updateSettings when model has settings', async () => {
      await svc.updateModel('m1', { settings: [{ key: 'ctx_len' }] } as any)
      expect(mockEngine.updateSettings).toHaveBeenCalled()
    })

    it('does not call updateSettings when no settings', async () => {
      await svc.updateModel('m1', { name: 'new-name' } as any)
      expect(mockEngine.updateSettings).not.toHaveBeenCalled()
    })
  })

  // ── fetchModels ──
  describe('fetchModels', () => {
    it('returns list from engine', async () => {
      mockEngine.list.mockReturnValue([{ id: 'm1' }])
      const result = await svc.fetchModels()
      expect(result).toEqual([{ id: 'm1' }])
    })
  })

  // ── stopAllModels ──
  describe('stopAllModels', () => {
    it('stops all llamacpp and mlx models', async () => {
      mockEngineManager.get.mockImplementation((provider: string) => {
        if (provider === 'llamacpp') return { ...mockEngine, getLoadedModels: vi.fn().mockResolvedValue(['m1']), unload: vi.fn() }
        if (provider === 'mlx') return { ...mockEngine, getLoadedModels: vi.fn().mockResolvedValue(['m2']), unload: vi.fn() }
        return mockEngine
      })

      await svc.stopAllModels()
      // Just verify it doesn't throw
    })

    it('handles empty model lists', async () => {
      mockEngine.getLoadedModels.mockResolvedValue([])
      await svc.stopAllModels()
    })
  })

  // ── isModelSupported ──
  describe('isModelSupported', () => {
    it('returns result from engine', async () => {
      mockEngine.isModelSupported.mockResolvedValue('GREEN')
      const result = await svc.isModelSupported('/path/model.gguf', 4096)
      expect(result).toBe('GREEN')
    })

    it('returns YELLOW when method not available', async () => {
      mockEngineManager.get.mockReturnValueOnce({})
      const result = await svc.isModelSupported('/path/model.gguf')
      expect(result).toBe('YELLOW')
    })

    it('returns GREY on error', async () => {
      mockEngine.isModelSupported.mockRejectedValue(new Error('fail'))
      const result = await svc.isModelSupported('/path/model.gguf')
      expect(result).toBe('GREY')
    })
  })

  // ── startModel with settings mapping ──
  describe('startModel with settings', () => {
    it('maps ctx_len to ctx_size and ngl to n_gpu_layers', async () => {
      mockEngine.getLoadedModels.mockResolvedValue([])
      mockEngine.load.mockResolvedValue({ id: 'session' })

      const provider = {
        provider: 'llamacpp',
        models: [{
          id: 'm1',
          settings: {
            ctx_len: { key: 'ctx_len', controller_props: { value: 4096 } },
            ngl: { key: 'ngl', controller_props: { value: 33 } },
            custom: { key: 'custom', controller_props: { value: 'val' } },
          },
        }],
      } as any

      await svc.startModel(provider, 'm1')
      expect(mockEngine.load).toHaveBeenCalledWith(
        'm1',
        { ctx_size: 4096, n_gpu_layers: 33, custom: 'val' },
        false,
        false
      )
    })

    it('returns undefined when model already loaded', async () => {
      mockEngine.getLoadedModels.mockResolvedValue(['m1'])
      const result = await svc.startModel(
        { provider: 'llamacpp', models: [] } as any,
        'm1'
      )
      expect(result).toBeUndefined()
      expect(mockEngine.load).not.toHaveBeenCalled()
    })

    it('throws on load failure', async () => {
      mockEngine.getLoadedModels.mockResolvedValue([])
      mockEngine.load.mockRejectedValue(new Error('load fail'))

      await expect(
        svc.startModel({ provider: 'llamacpp', models: [] } as any, 'm1')
      ).rejects.toThrow('load fail')
    })
  })

  // ── abortDownload ──
  describe('abortDownload', () => {
    it('calls abort on both engines', async () => {
      mockEngine.abortImport.mockResolvedValue(undefined)
      await svc.abortDownload('m1')
      expect(mockEvents.emit).toHaveBeenCalledWith(
        'onFileDownloadStopped',
        expect.objectContaining({ modelId: 'm1' })
      )
    })
  })

  // ── getActiveModels ──
  describe('getActiveModels', () => {
    it('returns loaded models', async () => {
      mockEngine.getLoadedModels.mockResolvedValue(['m1', 'm2'])
      const result = await svc.getActiveModels('llamacpp')
      expect(result).toEqual(['m1', 'm2'])
    })

    it('returns empty when no engine', async () => {
      mockEngineManager.get.mockReturnValueOnce(undefined)
      const result = await svc.getActiveModels('unknown')
      expect(result).toEqual([])
    })
  })

  // ── stopModel ──
  describe('stopModel', () => {
    it('calls engine unload', async () => {
      mockEngine.unload.mockResolvedValue({ ok: true })
      const result = await svc.stopModel('m1', 'llamacpp')
      expect(result).toEqual({ ok: true })
    })
  })

  // ── pullModel with no engine ──
  describe('pullModel', () => {
    it('returns undefined when no engine', async () => {
      mockEngineManager.get.mockReturnValueOnce(undefined)
      const result = await svc.pullModel('id1', '/path')
      expect(result).toBeUndefined()
    })
  })
})
