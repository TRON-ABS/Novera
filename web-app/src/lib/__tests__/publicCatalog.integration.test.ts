import { describe, expect, it } from 'vitest'
import { cloudModelPresets } from '@/constants/cloudModels'
import { fetchTopRemoteModels } from '../remoteModelCatalog'

// Explicit public GETs only: no keyring, account, prompts or paid inference.
// Opt in with NOVERA_LIVE_CATALOG_TEST=1; ordinary tests stay offline.
describe('public provider catalog integration', () => {
  it.runIf(process.env.NOVERA_LIVE_CATALOG_TEST === '1').each([
    ['openrouter', 'https://openrouter.ai/api/v1'],
    ['huggingface', 'https://router.huggingface.co/v1'],
    ['nvidia', 'https://integrate.api.nvidia.com/v1'],
  ] as const)('keeps the current %s shortlist available through the real parser', async (provider, base_url) => {
    const request: typeof fetch = (input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(20_000) })
    const models = await fetchTopRemoteModels({ provider, base_url }, request)
    for (const preset of cloudModelPresets[provider]) {
      expect(models.some(model => model.id === preset.id), `${provider}/${preset.id}`).toBe(true)
    }
    expect(new Set(models.map(model => model.id)).size).toBe(models.length)
    console.info(`${provider}: ${models.length} selectable models; shortlist present`)
  }, 25_000)
})
