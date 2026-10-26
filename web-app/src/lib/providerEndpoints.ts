// Regional/account endpoints remain user-controlled; never move a key to another host.
import { mediaProviderDefinitions } from '@/constants/mediaProviders'
export const EDITABLE_PROVIDER_ENDPOINTS = new Set([
  'azure', 'alibaba', 'zai', 'byteplus', 'baidu', 'tencent', 'bedrock', 'watsonx',
])

// These services publish chat IDs but no verified OpenAI GET /models contract.
export const CURATED_ONLY_PROVIDERS = new Set(['zai', 'ai21', 'byteplus', 'baidu', 'tencent', ...mediaProviderDefinitions.map(item => item.id)])

export function providerCatalogUrl(provider: { provider: string; base_url?: string }): string {
  const base = (provider.base_url ?? '').replace(/\/+$/, '')
  if (provider.provider === 'cohere' && base === 'https://api.cohere.ai/compatibility/v1') {
    return 'https://api.cohere.ai/v1/models?endpoint=chat&page_size=1000'
  }
  if (provider.provider === 'bedrock' && /^https:\/\/bedrock-mantle\.[a-z0-9-]+\.api\.aws\/openai\/v1$/.test(base)) {
    return base.replace(/\/openai\/v1$/, '/v1/models')
  }
  return `${base}/models`
}

export function providerInferenceUrl(provider: { provider: string; base_url?: string }, modelId: string): string {
  const base = provider.base_url ?? ''
  if (provider.provider === 'watsonx' && !base) throw new Error('IBM_GATEWAY_URL_REQUIRED')
  if (provider.provider === 'bedrock' && /^https:\/\/bedrock-mantle\.[a-z0-9-]+\.api\.aws\/(?:openai\/)?v1\/?$/.test(base)) {
    const origin = new URL(base).origin
    return `${origin}/${/^openai\.gpt-[6-9]/.test(modelId) ? 'openai/v1' : 'v1'}`
  }
  return base || 'https://api.openai.com/v1'
}
