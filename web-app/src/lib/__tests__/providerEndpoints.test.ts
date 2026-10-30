import { describe, expect, it, vi } from 'vitest'
import { providerCatalogUrl, providerInferenceUrl, CURATED_ONLY_PROVIDERS } from '../providerEndpoints'
import { predefinedProviders } from '@/constants/providers'
import { fetchTopRemoteModels } from '../remoteModelCatalog'

describe('provider-specific endpoint contracts', () => {
  it('keeps TabbyAPI opt-in and discovers models only from its authenticated local endpoint', async () => {
    const preset = predefinedProviders.find(provider => provider.provider === 'tabbyapi')!
    expect(preset.active).toBe(false)
    expect(preset.base_url).toBe('http://127.0.0.1:5000/v1')
    expect(preset.api_key).toBe('')
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [{ id: 'exl3-local' }] })))
    const models = await fetchTopRemoteModels({ ...preset, api_key: 'local-test-key' }, fetchImpl)
    expect(providerCatalogUrl(preset)).toBe('http://127.0.0.1:5000/v1/models')
    expect(String(fetchImpl.mock.calls[0][0])).toBe('http://127.0.0.1:5000/v1/models')
    expect(models[0].id).toBe('exl3-local')
  })

  it('uses the native Cohere chat catalog and excludes deprecated/non-chat models', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: [
      { name: 'command-a-plus-05-2026', endpoints: ['chat'] },
      { name: 'command-r', endpoints: ['chat'], is_deprecated: true },
      { name: 'embed-v4.0', endpoints: ['embed'] },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'cohere', base_url: 'https://api.cohere.ai/compatibility/v1', api_key: 'test-key' }, fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://api.cohere.ai/v1/models?endpoint=chat&page_size=1000')
    expect(models.map((m) => m.id)).toEqual(['command-a-plus-05-2026'])
    expect(models[0].capabilities).toEqual(['completion', 'tools', 'vision'])
  })

  it('keeps account keys on their configured host, including Cohere proxies', () => {
    expect(providerCatalogUrl({ provider: 'cohere', base_url: 'https://proxy.test/v1/' })).toBe('https://proxy.test/v1/models')
    expect(providerInferenceUrl({ provider: 'bedrock', base_url: 'https://proxy.test/v1' }, 'openai.gpt-6.1-sol')).toBe('https://proxy.test/v1')
  })

  it('separates Mantle catalog, GPT-6 and GPT-OSS routes while preserving the region', () => {
    const provider = { provider: 'bedrock', base_url: 'https://bedrock-mantle.eu-west-1.api.aws/openai/v1' }
    expect(providerCatalogUrl(provider)).toBe('https://bedrock-mantle.eu-west-1.api.aws/v1/models')
    expect(providerInferenceUrl(provider, 'openai.gpt-6.1-sol')).toBe(provider.base_url)
    expect(providerInferenceUrl(provider, 'openai.gpt-oss-120b')).toBe('https://bedrock-mantle.eu-west-1.api.aws/v1')
  })

  it('never substitutes OpenAI for an unconfigured IBM gateway', () => {
    expect(() => providerInferenceUrl({ provider: 'watsonx', base_url: '' }, 'account/alias')).toThrow('IBM_GATEWAY_URL_REQUIRED')
  })

  it('excludes Mantle models that require an unsupported inference protocol', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'anthropic.claude-opus-5-5' }, { id: 'openai.gpt-6.1-sol' },
      { id: 'openai.gpt-oss-120b' }, { id: 'amazon.titan-embed' },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'bedrock', base_url: 'https://bedrock-mantle.us-east-1.api.aws/openai/v1' }, fetchImpl)
    expect(models.map((m) => m.id)).toEqual(['openai.gpt-6.1-sol', 'openai.gpt-oss-120b'])
  })

  it.each([...CURATED_ONLY_PROVIDERS])('uses maintained chat IDs without inventing a list endpoint for %s', async (provider) => {
    const fetchImpl = vi.fn()
    const models = await fetchTopRemoteModels({ provider, base_url: 'https://example.test', api_key: 'test-key' }, fetchImpl)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(models.length).toBeGreaterThan(0)
  })
})
