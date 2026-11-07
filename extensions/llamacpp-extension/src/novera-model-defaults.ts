/** Initial settings only: later user edits to model.yml remain authoritative. */
export function noveraModelDefaults(modelId: string, source: string, mobile = false) {
  modelId = modelId.replace(/\.gguf$/, '')
  const omni = modelId === 'LFM3-Omni-2B-Q4_K_M'
  const nemotron = modelId === 'Nemotron-3.5-Bolt-E4B-Q4_K_M'
  if (!omni && !nemotron && modelId !== 'LFM3-1.7B-Q8_0' && modelId !== 'LFM3-1.7B-Q6_K') return {}
  const filename = `${modelId}.gguf`
  const repo = omni ? 'LiquidAI/LFM3-Omni-2B-GGUF' : nemotron ? 'nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB' : 'LiquidAI/LFM3-1.7B-GGUF'
  const local = /^[A-Za-z]:[\\/]/.test(source) || !/^[A-Za-z][A-Za-z0-9+.-]*:/.test(source)
  if (local) {
    if (source.split(/[\\/]/).pop() !== filename) return {}
  } else {
    try {
      const url = new URL(source)
      const parts=url.pathname.split('/')
      if (url.protocol !== 'https:' || url.hostname !== 'huggingface.co' ||
        parts.slice(1,3).join('/')!==repo || parts[3]!=='resolve' ||
        !(parts[4]==='main'||/^[a-f0-9]{40}$/.test(parts[4])) || parts.slice(5).join('/')!==filename) return {}
    } catch {
      return {}
    }
  }
  const context = mobile ? 2048 : 32768
  if (omni) return {ctx_size:context,temperature:0,top_k:1,repeat_penalty:1}
  if (nemotron) return {
    ctx_size: context, temperature: 1, top_p: 0.95, top_k: 0, min_p: 0,
    repeat_penalty: 1, presence_penalty: 0, frequency_penalty: 0,
  }
  return { ctx_size: context, temperature: 0.1, top_k: 50, repeat_penalty: 1.1 }
}
