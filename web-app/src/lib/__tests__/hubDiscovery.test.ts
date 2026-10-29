import { describe, it, expect } from 'vitest'
import { NOVERA_HUB_MODELS, mergeHubCatalog, hubSizeMatches, hubWeight, sortHubModels, hubMemory, HUB_SIZE_BANDS, hubHardwareSnapshot, hubMemoryOptions } from '../hubDiscovery'
import type { CatalogModel } from '@/services/models/types'
import type { HardwareData } from '@/hooks/useHardware'
import { diagnoseHubModel } from '@/modules/engines/hub-catalog'
const hardware = { total_memory: 16384, cpu: { arch: 'x86_64' }, gpus: [], os_type: 'windows' } as unknown as HardwareData
const model = (size?: string): CatalogModel => ({ model_name: 'Other', developer: 'Other', downloads: 1, description: '', quants: size ? [{ model_id: 'Other-Q4_K_M', file_size: size, path: '' }] : [] })
describe('Novera Hub discovery', () => {
  it('does not report the screenshot 731 MB model or LFM3 as insufficient when RTX VRAM is available', () => {
    const pc = { ...hardware, total_memory: 15789, gpus: [{ name: 'NVIDIA GeForce RTX 5070 Laptop GPU', vendor: 'NVIDIA', uuid: 'rtx', total_memory: 8151 }] } as HardwareData
    const usage = { cpu: 0, total_memory: 15789, used_memory: 13778, gpus: [{ uuid: 'rtx', total_memory: 8151, used_memory: 4769 }] }
    const snapshot = hubHardwareSnapshot(pc, usage)
    for (const candidate of [model('730.9 MB'), NOVERA_HUB_MODELS.find(m => m.model_name === 'LFM3-1.7B')!]) {
      expect(diagnoseHubModel(candidate, snapshot, hubMemoryOptions(candidate)).memory).toBe('fits')
    }
  })
  it('changes hardware ranking when live free memory drops and includes projector sizes', () => {
    const official = { ...model('6 GB'), developer: 'Qwen' }
    const tiny = { ...model('800 MB'), developer: 'community' }
    expect(sortHubModels([official, tiny], 'adapted', hardware)[0]).toBe(official)
    const usage = { cpu: 0, total_memory: 16384, used_memory: 12000, gpus: [] }
    expect(sortHubModels([official, tiny], 'adapted', hardware, usage)[0]).toBe(tiny)
    const vision = { ...tiny, mmproj_models: [{ model_id: 'mmproj-f16', path: 'mmproj.gguf', file_size: '2 GB' }] }
    expect(hubMemoryOptions(vision).projectorBytes).toBe(2e9)
    expect(hubMemory(vision)! - hubMemory(tiny)!).toBe(2e9)
    expect(hubMemory({ ...vision, mmproj_models: [{ ...vision.mmproj_models[0], file_size: 'unknown' }] })).toBeNull()
  })
  it('omits disabled GPUs and marks integrated memory as shared', () => {
    const gpu = { name: 'GPU', vendor: 'AMD', total_memory: 8192, uuid: 'enabled', vulkan_info: { device_type: 'IntegratedGpu' } }
    const pc = { ...hardware, gpus: [gpu, { ...gpu, uuid: 'disabled', activated: false }] } as HardwareData
    const snapshot = hubHardwareSnapshot(pc, { cpu: 0, total_memory: 16384, used_memory: 4000, gpus: [{ uuid: 'enabled', total_memory: 8192, used_memory: 6000 }] })
    expect(snapshot.gpus).toHaveLength(1)
    expect(snapshot.gpus[0]).toMatchObject({ sharedMemory: true, availableBytes: 2192 * 1024 ** 2 })
    expect(snapshot.availableRamBytes).toBe(12384 * 1024 ** 2)
  })
  it('covers every size once from sub-GB to multi-TB including exact boundaries', () => {
    for (const size of [1, 999999999, ...HUB_SIZE_BANDS.slice(1).map(b => b.min * 1e9), 501e9, 2e12]) {
      expect(HUB_SIZE_BANDS.filter(b => hubSizeMatches(model(`${size} B`), b.id))).toHaveLength(1)
    }
    expect(hubSizeMatches(model('501 GB'), 'over500')).toBe(true)
    expect(hubSizeMatches(model('1 GB'), 'invalid')).toBe(false)
  })
  it('honors size and download order across publishers', () => {
    const official = { ...model('8 GB'), developer: 'Qwen', downloads: 10 }
    const community = { ...model('800 MB'), developer: 'community', downloads: 5000 }
    for (const sort of ['smallest', 'most-downloaded']) {
      expect(sortHubModels([official, community], sort, hardware)).toEqual([community, official])
    }
  })
  it('ranks new releases above recently edited old repositories and invalid dates last', () => {
    const old = { ...model('1 GB'), created_at: '2020-01-01', updated_at: '2026-10-29' }
    const recent = { ...model('1 GB'), developer: 'community', created_at: '2026-10-28' }
    const unknown = { ...model('1 GB'), created_at: 'invalid' }
    expect(sortHubModels([old, unknown, recent], 'newest', hardware)).toEqual([recent, old, unknown])
  })
  it('keeps oversized and platform-incompatible models behind models that fit', () => {
    const fit = model('2 GB')
    const huge = model('600 GB')
    const mlx = { ...model('1 GB'), is_mlx: true }
    expect(sortHubModels([huge, mlx, fit], 'adapted', hardware)).toEqual([fit, huge, mlx])
  })
  it('makes seven pinned, usable text GGUF models available without a network feed', () => {
    expect(mergeHubCatalog([])).toHaveLength(7)
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
    expect(merged).toHaveLength(9)
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
    expect(sorted[0].model_name).toBe('LFM3-1.7B')
    expect(sorted.at(-1)?.developer).toBe('Jan')
    const tinyPC = { ...hardware, total_memory: 2500 }
    expect(sortHubModels(mergeHubCatalog([]),'adapted',tinyPC)[0].model_name).toBe('LFM2.5-230M')
  })
  it('labels a memory heuristic rather than inventing hardware throughput', () => {
    expect(hubMemory(model('1 GB'))).toBe(1.2e9 + 256 * 1024 ** 2)
    expect(hubMemory(model())).toBeNull()
    expect(NOVERA_HUB_MODELS.every(m => !('tokensPerSecond' in m.hub!))).toBe(true)
  })
})
