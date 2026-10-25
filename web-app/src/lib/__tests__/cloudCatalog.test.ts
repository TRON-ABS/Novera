import { describe, expect, it, vi } from 'vitest'
import { predefinedProviders } from '@/constants/providers'
import { cloudModelPresets } from '@/constants/cloudModels'
import { providerModels } from '@/constants/models'
import { fetchTopRemoteModels, supportsRemoteCatalog } from '../remoteModelCatalog'
import { buildsOwnToolImageRequest, isPredefinedRemoteProvider } from '../providerCaps'

describe('maintained cloud catalog', () => {
  it('offers 27 distinct providers, with chat shortlists except account-specific gateways', () => {
    expect(predefinedProviders).toHaveLength(27)
    expect(new Set(predefinedProviders.map((p) => p.provider)).size).toBe(27)
    for (const provider of predefinedProviders) {
      expect(isPredefinedRemoteProvider(provider.provider)).toBe(true)
      if (['azure', 'watsonx'].includes(provider.provider)) continue
      expect(supportsRemoteCatalog(provider.provider)).toBe(true)
      const config = providerModels[provider.provider as keyof typeof cloudModelPresets]
      expect(config.models.length).toBeGreaterThan(0)
      expect(new Set(config.models).size).toBe(config.models.length)
    }
  })

  it('keeps the Perplexity Responses adapter on structured tool-image output', () => {
    expect(buildsOwnToolImageRequest({ provider: 'perplexity' })).toBe(true)
  })

  it('includes GPT-6 chat models while excluding unrelated OpenAI endpoints', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'gpt-6.1-sol', created: 2 }, { id: 'gpt-6-astra', created: 1 },
      { id: 'gpt-image-2.5', created: 3 }, { id: 'text-embedding-3-small', created: 4 },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'openai', base_url: 'https://example.test/v1' }, fetchImpl)
    expect(models.map((m) => m.id)).toEqual(['gpt-6.1-sol', 'gpt-6-astra'])
    expect(models[0].capabilities).toEqual(['completion', 'tools', 'vision'])
  })

  it('filters non-chat Gemini variants even when their name shares the newest version', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'gemini-4-argon' }, { id: 'gemini-3.8-live' }, { id: 'gemini-3.8-flash-tts' },
      { id: 'gemini-3.8-flash' }, { id: 'gemini-nano-banana-2.1' },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'gemini', base_url: 'https://example.test/v1' }, fetchImpl)
    expect(models.map((m) => m.id)).toEqual(['gemini-4-argon', 'gemini-3.8-flash'])
  })

  it('reads OpenRouter metadata, deduplicates and orders new chat models ahead of older ones', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'vendor/old-chat', created: 1 },
      { id: 'vendor/new-chat', created: 3, architecture: { input_modalities: ['text', 'image'], output_modalities: ['text'] }, supported_parameters: ['tools'] },
      { id: 'vendor/new-chat', created: 3 },
      { id: 'vendor/picture', created: 8, architecture: { output_modalities: ['image'] } },
      { id: 'vendor/embedding', created: 9 },
      { id: 'canopylabs/orpheus-v1-english', created: 10 },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'openrouter', base_url: 'https://example.test/v1/' }, fetchImpl)
    expect(fetchImpl.mock.calls[0][0]).toBe('https://example.test/v1/models')
    expect(models.map((m) => m.id)).toEqual(['vendor/new-chat', 'vendor/old-chat'])
    expect(models[0].capabilities).toEqual(['completion', 'vision', 'tools'])
    expect(models[1].capabilities).toEqual(['completion'])
  })

  it('uses curated order when a provider supplies no meaningful creation dates', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ data: [
      { id: 'old/chat' }, { id: 'nvidia/nemotron-3.5-super-vl-120b-a12b' },
      { id: 'minimaxai/minimax-m3.1-flash' },
    ] })))
    const models = await fetchTopRemoteModels({ provider: 'nvidia', base_url: 'https://example.test/v1' }, fetchImpl)
    expect(models[0].id).toBe('minimaxai/minimax-m3.1-flash')
  })

  it('rejects malformed catalogs so refreshing cannot replace the current list', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(JSON.stringify({ models: 'invalid' })))
    await expect(fetchTopRemoteModels({ provider: 'deepseek', base_url: 'https://example.test/v1' }, fetchImpl)).rejects.toThrow('Invalid model catalog')
  })
})
