import { describe, expect, it } from 'vitest'
import { HUB_CATEGORIES, categoryMatches, diagnoseHubModel, modelCategories, modelEngine } from './hub-catalog'

const GiB = 1024 ** 3
const hardware = { platform: 'windows', ramBytes: 32 * GiB, gpus: [{ name: 'NVIDIA RTX', vendor: 'NVIDIA', totalBytes: 8 * GiB }] }
const gguf = { pipeline_tag: 'text-generation', quants: [{ model_id: 'model', path: 'model.gguf' }] }
const sf = { pipeline_tag: 'text-generation', safetensors_files: [{ path: 'model.safetensors' }], model_config: { dtype: 'float16' } }

describe('Hub taxonomy and hardware checks', () => {
  it('separates medical/scientific domains from the model task', () => {
    expect(modelCategories({ ...sf, tags: ['medical', 'science'] })).toEqual(expect.arrayContaining(['text', 'medical', 'science']))
    expect(categoryMatches({ ...sf, tags: ['medical'] }, 'medical')).toBe(true)
    expect(modelCategories({ pipeline_tag: 'new-future-task' })).toEqual(['other'])
    expect(HUB_CATEGORIES.some(category => category.id === 'video')).toBe(true)
    expect(HUB_CATEGORIES.some(category => category.id === 'threeD')).toBe(true)
  })
  it('never mistakes image/video/audio weights for a chat engine', () => {
    for (const pipeline_tag of ['text-to-image', 'text-to-video', 'text-to-speech']) {
      const model = { ...gguf, ...sf, pipeline_tag }
      expect(modelEngine(model)).toBe('future')
      const result = diagnoseHubModel(model, hardware, { weightsBytes: GiB })
      expect(result.canDownload).toBe(false)
      expect(result.memory).toBe('unknown')
    }
  })
  it('requires native runtime verification for Safetensors', () => {
    const unverified = diagnoseHubModel(sf, hardware, { weightsBytes: GiB })
    expect(unverified.engineState).toBe('runtime')
    expect(unverified.memory).toBe('tight')
    expect(unverified.gpuBudgetBytes).toBe(null)
    const verified = diagnoseHubModel(sf, hardware, { weightsBytes: GiB, runtime: { ready: true, cudaAvailable: true, gpu: { name: 'NVIDIA RTX', totalBytes: 8 * GiB, freeBytes: 7 * GiB } } })
    expect(verified.engineState).toBe('check')
    expect(verified.memory).toBe('fits')
    expect(verified.gpuBudgetBytes).toBe(6 * GiB)
  })
  it('does not add VRAM from unrelated GPUs or offload Safetensors across CPU and GPU', () => {
    const many = { ...hardware, ramBytes: 8 * GiB, gpus: [...hardware.gpus, ...hardware.gpus] }
    const result = diagnoseHubModel(sf, many, { weightsBytes: 7 * GiB, runtime: { ready: true, cudaAvailable: true, gpu: { name: 'NVIDIA RTX', totalBytes: 8 * GiB, freeBytes: 8 * GiB } } })
    expect(result.memory).toBe('insufficient')
    expect(result.gpuBudgetBytes).toBe(7 * GiB)
    expect(result.requiredBytes).toBeGreaterThan(14 * GiB)
  })
  it('uses free memory and reports unknown sidecar sizes honestly', () => {
    expect(diagnoseHubModel(gguf, { ...hardware, availableRamBytes: 0, gpus: [] }, { weightsBytes: GiB }).memory).toBe('insufficient')
    expect(diagnoseHubModel(gguf, hardware, { weightsBytes: null }).memory).toBe('unknown')
    const unknownProjector = diagnoseHubModel(gguf, hardware, { weightsBytes: GiB, projectorBytes: null })
    expect(unknownProjector.downloadBytes).toBe(null)
    expect(unknownProjector.memory).toBe('unknown')
  })
  it('checks the platform and never equates medical tags with validation', () => {
    const mlx = diagnoseHubModel({ ...sf, is_mlx: true }, hardware, { weightsBytes: GiB })
    expect(mlx.engineState).toBe('platform')
    expect(mlx.canDownload).toBe(false)
    expect(diagnoseHubModel({ ...sf, tags: ['medical'] }, hardware, { weightsBytes: GiB }).medical).toBe(true)
    expect(diagnoseHubModel(gguf, { ...hardware, platform: 'web' }, { weightsBytes: GiB }).canDownload).toBe(false)
  })
})
