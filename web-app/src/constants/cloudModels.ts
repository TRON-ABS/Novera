// Verified chat shortlists: 2026-10-25. Sources and limits: docs/CLOUD_PROVIDERS.md.
// Brand names / API identifiers are intentionally invariant across all locales.
export const CLOUD_CATALOG_VERIFIED_AT = '2026-10-25'

type ChatPreset = { id: string; tools: boolean; vision: boolean }
export const cloudModelPresets = {
  openai: [
    { id: 'gpt-6.1-sol', tools: true, vision: true },
    { id: 'gpt-6-astra', tools: true, vision: true },
    { id: 'gpt-6-luna', tools: true, vision: true },
    { id: 'gpt-6-sol', tools: true, vision: true },
  ],
  anthropic: [
    { id: 'claude-sonnet-5-5', tools: true, vision: true },
    { id: 'claude-opus-5-5', tools: true, vision: true },
    { id: 'claude-fable-5-1', tools: true, vision: true },
    { id: 'claude-haiku-5-5', tools: true, vision: true },
  ],
  gemini: [
    { id: 'gemini-4-argon', tools: true, vision: true },
    { id: 'gemini-3.8-flash', tools: true, vision: true },
    { id: 'gemini-3.6-flash', tools: true, vision: true },
    { id: 'gemini-3.5-flash-lite', tools: true, vision: true },
  ],
  mistral: [
    { id: 'mistral-large-4', tools: true, vision: true },
    { id: 'mistral-medium-3-5', tools: true, vision: true },
    { id: 'mistral-small-2603', tools: true, vision: true },
    { id: 'ministral-3b-2512', tools: true, vision: true },
  ],
  groq: [
    { id: 'openai/gpt-oss-120b', tools: true, vision: false },
    { id: 'openai/gpt-oss-20b', tools: true, vision: false },
    { id: 'llama-3.3-70b-versatile', tools: true, vision: false },
    { id: 'llama-3.1-8b-instant', tools: true, vision: false },
  ],
  xai: [
    { id: 'grok-4.7', tools: true, vision: true },
  ],
  minimax: [
    { id: 'MiniMax-M3.1-Flash', tools: true, vision: true },
    { id: 'MiniMax-M3', tools: true, vision: true },
  ],
  deepseek: [
    { id: 'deepseek-flash', tools: true, vision: true },
    { id: 'deepseek-v4-pro', tools: true, vision: false },
  ],
  moonshot: [
    { id: 'kimi-k3.1-pro', tools: true, vision: true },
    { id: 'kimi-k3.1-pro-highspeed', tools: true, vision: true },
    { id: 'kimi-k3', tools: true, vision: true },
  ],
  alibaba: [
    { id: 'qwen3.8-max', tools: true, vision: true },
    { id: 'qwen3.7-plus', tools: true, vision: true },
    { id: 'qwen3.8-flash', tools: true, vision: true },
  ],
  cerebras: [
    { id: 'qwen-3.8-27b', tools: true, vision: true },
    { id: 'gpt-oss-120b', tools: true, vision: false },
  ],
  together: [
    { id: 'deepseek-ai/DeepSeek-V4.1-Flash-1017', tools: true, vision: true },
    { id: 'moonshotai/Kimi-K3', tools: true, vision: true },
    { id: 'Qwen/Qwen3.8-Flash', tools: true, vision: true },
    { id: 'Qwen/Qwen3.8-2.4T-A95B', tools: true, vision: true },
  ],
  fireworks: [
    { id: 'accounts/fireworks/models/deepseek-v4p1-flash-1017', tools: true, vision: true },
    { id: 'accounts/fireworks/models/kimi-k3', tools: true, vision: true },
    { id: 'accounts/fireworks/models/minimax-m3', tools: true, vision: false },
  ],
  perplexity: [
    { id: 'perplexity/sonar', tools: false, vision: false },
    { id: 'openai/gpt-6.1-sol', tools: true, vision: true },
    { id: 'google/gemini-4-argon', tools: true, vision: true },
    { id: 'perplexity/kimi-k3', tools: true, vision: false },
  ],
  openrouter: [
    { id: 'moonshotai/kimi-k3.1-pro', tools: true, vision: true },
    { id: 'minimax/minimax-m3.1-flash', tools: true, vision: true },
    { id: 'deepseek/deepseek-v4.1-flash-1017', tools: true, vision: true },
    { id: 'nvidia/nemotron-3.5-super-vl:free', tools: true, vision: true },
  ],
  huggingface: [
    { id: 'deepseek-ai/DeepSeek-V4.1-Flash-1017', tools: true, vision: true },
    { id: 'Qwen/Qwen3.8-27B', tools: true, vision: true },
    { id: 'moonshotai/Kimi-K3', tools: true, vision: true },
    { id: 'zai-org/GLM-5.3', tools: true, vision: false },
  ],
  nvidia: [
    { id: 'minimaxai/minimax-m3.1-flash', tools: false, vision: false },
    { id: 'deepseek-ai/deepseek-v4.1-flash', tools: false, vision: false },
    { id: 'nvidia/nemotron-3.5-super-vl-120b-a12b', tools: false, vision: false },
    { id: 'nvidia/nemotron-3.5-lightning-30b-a3b', tools: false, vision: false },
    { id: 'z-ai/glm-5.3', tools: false, vision: false },
  ],
} satisfies Record<string, readonly ChatPreset[]>

export function cloudModelCapabilities(provider: string, id: string): string[] | undefined {
  const presets = (cloudModelPresets as Record<string, readonly ChatPreset[]>)[provider]
  const preset = presets?.find((model) => model.id === id)
  if (!preset) return undefined
  return ['completion', ...(preset.tools ? ['tools'] : []), ...(preset.vision ? ['vision'] : [])]
}
