/** Initial settings only: later user edits to model.yml remain authoritative. */
export function noveraModelDefaults(modelId: string, source: string) {
  const nemotron = modelId === 'Nemotron-3.5-Bolt-E4B-Q4_K_M'
  if (!nemotron && modelId !== 'LFM3-1.7B-Q8_0' && modelId !== 'LFM3-1.7B-Q6_K') return {}
  const filename = `${modelId}.gguf`
  const repo = nemotron ? 'nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB' : 'LiquidAI/LFM3-1.7B-GGUF'
  const officialPath = `/${repo}/resolve/main/${filename}`
  const local = /^[A-Za-z]:[\\/]/.test(source) || !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)
  if (local) {
    if (source.split(/[\\/]/).pop() !== filename) return {}
  } else {
    try {
      const url = new URL(source)
      if (url.protocol !== 'https:' || url.hostname !== 'huggingface.co' || url.pathname !== officialPath) return {}
    } catch {
      return {}
    }
  }
  if (nemotron) return {
    ctx_size: 16384, temperature: 1, top_p: 0.95, top_k: 0, min_p: 0,
    repeat_penalty: 1, presence_penalty: 0, frequency_penalty: 0,
  }
  return { ctx_size: 32768, temperature: 0.1, top_k: 50, repeat_penalty: 1.1 }
}
