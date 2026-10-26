import { describe, it, expect } from 'vitest'
import { NOVERA_HUB_MODELS, mergeHubCatalog, hubSizeMatches, hubWeight, sortHubModels, hubMemory } from '../hubDiscovery'
import type { CatalogModel } from '@/services/models/types'
import type { HardwareData } from '@/hooks/useHardware'
const hardware = { total_memory: 16384, cpu: { arch: 'x86_64' }, gpus: [], os_type: 'windows' } as unknown as HardwareData
const model = (size?: string): CatalogModel => ({ model_name: 'Other', developer: 'Other', downloads: 1, description: '', quants: size ? [{ model_id: 'Other-Q4_K_M', file_size: size, path: '' }] : [] })
describe('Novera Hub discovery', () => {
  it('makes six pinned, usable text GGUF models available without a network feed', () => {
    expect(mergeHubCatalog([])).toHaveLength(6)
    for (const m of NOVERA_HUB_MODELS) {
      expect(m.quants?.length).toBeGreaterThan(0)
      expect(hubWeight(m)).toBeGreaterThan(1e8)
      expect(m.quants?.[0].path).toContain(`/resolve/${m.hub!.revision}/`)
      expect(m.quants?.[0].path).toContain('Q4_K_M.gguf')
      expect(m.hub!.source).toMatch(/^https:\/\/huggingface.co\/(LiquidAI|Qwen)\//)
    }
  })
  it('replaces inherited duplicates without confusing publishers and formats', () => {
    const m = NOVERA_HUB_MODELS[0]
    const merged = mergeHubCatalog([{ ...m, hub: undefined, model_name: m.model_name + '-GGUF' }, { ...m, developer: 'Other', hub: { ...m.hub!, repo: `Other/${m.model_name}` } }, { ...m, is_mlx: true }])
    expect(merged).toHaveLength(8)
    expect(merged[0].hub).toBeDefined()
  })
  it('sorts actual selected downloads numerically and unknown sizes last', () => {
    const xs = [model('10 GB'), model(), model('800 MB'), model('1.5 GB')]
    expect(sortHubModels(xs, 'smallest', hardware).map(hubWeight)).toEqual([8e8, 1.5e9, 1e10, null])
    expect(xs[0].quants?.[0].file_size).toBe('10 GB')
  })
  it('uses exclusive size boundaries and excludes unknown weights from size filters', () => {
    for (const [size, band] of [['999 MB','under1'],['1 GB','from1to2'],['2 GB','from2to4'],['4 GB','over4']]) {
      expect(['under1','from1to2','from2to4','over4'].filter(b => hubSizeMatches(model(size),b))).toEqual([band])
    }
    expect(hubSizeMatches(model(), 'under1')).toBe(false)
    expect(hubSizeMatches(model(), 'all')).toBe(true)
  })
  it('does not promote Jan by brand or downloads and uses memory fit before curation', () => {
    const jan = { ...model('40 GB'), developer: 'Jan', model_name: 'Jan', downloads: 1e10 }
    const sorted = sortHubModels(mergeHubCatalog([jan]), 'adapted', hardware)
    expect(sorted[0].model_name).toBe('LFM2.5-1.2B-Instruct')
    expect(sorted.at(-1)?.developer).toBe('Jan')
    const tinyPC = { ...hardware, total_memory: 2500 }
    expect(sortHubModels(mergeHubCatalog([]),'adapted',tinyPC)[0].model_name).toBe('LFM2.5-230M')
  })
  it('labels a memory heuristic rather than inventing hardware throughput', () => {
    expect(hubMemory(model('1 GB'))).toBe(1.4e9)
    expect(hubMemory(model())).toBeNull()
    expect(NOVERA_HUB_MODELS.every(m => !('tokensPerSecond' in m.hub!))).toBe(true)
  })
})
