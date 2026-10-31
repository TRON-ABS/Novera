import { describe, expect, it, vi } from 'vitest'
import { hydrateModeloptMetadata } from '../modeloptMetadata'
import type { HuggingFaceRepo } from '../types'
import { hubQuantization } from '@/modules/engines/hub-catalog'

const repo = {
  modelId: 'publisher/packed', id: 'publisher/packed', sha: 'a'.repeat(40),
  siblings: [{ rfilename: 'hf_quant_config.json' }],
} as HuggingFaceRepo
const config = { model_type: 'llama', architectures: ['LlamaForCausalLM'] }
const quant = { quant_algo: 'NVFP4', group_size: 16, kv_cache_quant_algo: null, exclude_modules: ['lm_head'] }

describe('ModelOpt metadata', () => {
  it('reads pinned public JSON and exposes the validated method', async () => {
    const fetch = vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('/hf_quant_config.json') ? { quantization: quant } : config)))
    const result = await hydrateModeloptMetadata(fetch, repo)
    expect(hubQuantization({ model_config: result.config })).toBe('modelopt-nvfp4')
    expect(fetch).toHaveBeenCalledTimes(2)
    for (const [url, options] of fetch.mock.calls as unknown as [string, RequestInit][]) {
      expect(url).toContain(`/resolve/${repo.sha}/`)
      expect(options).toMatchObject({ credentials: 'omit', redirect: 'error' })
      expect(options).not.toHaveProperty('headers')
    }
    expect(repo.config).toBeUndefined()
  })
  it('keeps inaccessible, oversized and conflicting layouts blocked', async () => {
    for (const fetch of [
      vi.fn(async () => new Response('', { status: 403 })),
      vi.fn(async () => new Response('{}', { headers: { 'Content-Length': '999999' } })),
      vi.fn(async () => new Response(' '.repeat(300000))),
      vi.fn(async (url: string) => new Response(JSON.stringify(url.endsWith('/hf_quant_config.json')
        ? { quantization: quant } : { ...config, quantization_config: { quant_method: 'modelopt', quant_algo: 'FP8' } }))),
    ]) {
      const result = await hydrateModeloptMetadata(fetch as typeof globalThis.fetch, repo)
      expect(hubQuantization({ model_config: result.config })).toBe('unsupported')
    }
  })
  it('never follows unpinned revisions or forged repository IDs', async () => {
    const fetch = vi.fn()
    for (const input of [{ ...repo, sha: 'main' }, { ...repo, modelId: '../outside/path' }]) {
      expect(hubQuantization({ model_config: (await hydrateModeloptMetadata(fetch, input)).config })).toBe('unsupported')
    }
    expect(fetch).not.toHaveBeenCalled()
    expect(await hydrateModeloptMetadata(fetch, { ...repo, siblings: [] })).toMatchObject({ siblings: [] })
  })
})
