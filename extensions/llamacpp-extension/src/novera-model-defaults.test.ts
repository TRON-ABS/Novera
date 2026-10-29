import { describe, expect, it } from 'vitest'
import { noveraModelDefaults } from './novera-model-defaults'

describe('recommended model import defaults', () => {
  const id = 'Nemotron-3.5-Bolt-E4B-Q4_K_M'
  const source = `https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/resolve/main/${id}.gguf?download=true`

  it('uses the NVIDIA sampler and conservative context for official and local imports', () => {
    const profile = {
      ctx_size: 16384, temperature: 1, top_p: 0.95, top_k: 0, min_p: 0,
      repeat_penalty: 1, presence_penalty: 0, frequency_penalty: 0,
    }
    expect(noveraModelDefaults(id, source)).toEqual(profile)
    expect(noveraModelDefaults(id, `C:\\Models\\${id}.gguf`)).toEqual(profile)
  })

  it('does not apply the profile to a different source or unrelated model', () => {
    expect(noveraModelDefaults(id, source.replace('huggingface.co', 'example.com'))).toEqual({})
    expect(noveraModelDefaults(id, 'C:/Models/other.gguf')).toEqual({})
    expect(noveraModelDefaults('other-model', source)).toEqual({})
  })

  it('keeps the original LFM3 preset for explicit legacy imports', () => {
    expect(noveraModelDefaults('LFM3-1.7B-Q8_0', 'C:/Models/LFM3-1.7B-Q8_0.gguf'))
      .toEqual({ ctx_size: 32768, temperature: 0.1, top_k: 50, repeat_penalty: 1.1 })
  })
})
