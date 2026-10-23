/** Initial settings only: later user edits to model.yml remain authoritative. */
export function noveraModelDefaults(modelId: string, source: string) {
  if (modelId !== 'LFM2.5-2.6B-Q6_K') return {}
  const officialPath = '/LiquidAI/LFM2.5-2.6B-GGUF/resolve/main/LFM2.5-2.6B-Q6_K.gguf'
  try {
    const url = new URL(source)
    if (url.protocol !== 'https:' || url.hostname !== 'huggingface.co' || url.pathname !== officialPath) return {}
  } catch {
    // Explicit local imports of the same quantization may use this preset too.
    if (source.split(/[\\/]/).pop() !== 'LFM2.5-2.6B-Q6_K.gguf') return {}
  }
  return { ctx_size: 32768, temperature: 0.1, top_k: 50, repeat_penalty: 1.1 }
}
