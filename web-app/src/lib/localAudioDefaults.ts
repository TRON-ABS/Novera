// LiquidAI's text-generation recommendation, distinct from GGUF audio sampling.
export function localAudioDefaults(provider: string, id = '', name = '') {
  const family = provider === 'llamacpp' && /lfm3[-_\s]*(omni|audio)/i.exec(`${id} ${name}`)?.[1].toLowerCase()
  return family ? { temperature: 0, maxOutputTokens: 2048,
    reasoning: family === 'omni' ? 'off' as const : undefined } : undefined
}
