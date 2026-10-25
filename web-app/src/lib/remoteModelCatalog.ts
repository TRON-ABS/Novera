import { CURATED_ONLY_PROVIDERS, providerCatalogUrl } from './providerEndpoints'
import { providerRemoteApiKeyChain } from './provider-api-keys'
import { cloudModelCapabilities, cloudModelPresets } from '@/constants/cloudModels'

export type RemoteCatalogModel = {
  id: string
  capabilities: string[]
  createdMs: number
}

type ProviderLike = {
  provider: string
  base_url?: string
  api_key?: string
  api_key_fallbacks?: string[]
  api_type?: string
  custom_header?: { header: string; value: string }[] | null
}

type FetchImpl = typeof fetch

const TOP_N = 10

const ANTHROPIC_VERSION_HEADER = 'anthropic-version'
const ANTHROPIC_VERSION = '2023-06-01'
const ANTHROPIC_BROWSER_ACCESS_HEADER =
  'anthropic-dangerous-direct-browser-access'

/// Whether a provider fronts Anthropic's API. The `api_type` discriminant is
/// authoritative (matches the inference dispatch in model-factory); provider
/// name and host are fallbacks for configs predating that field.
function isAnthropicProvider(provider: {
  provider?: string
  base_url?: string
  api_type?: string
}): boolean {
  return (
    provider.api_type === 'anthropic' ||
    (provider.provider ?? '').toLowerCase().includes('anthropic') ||
    (provider.base_url ?? '').toLowerCase().includes('anthropic')
  )
}

function setDefaultHeader(
  headers: Record<string, string>,
  name: string,
  value: string
): void {
  const present = Object.keys(headers).some(
    (h) => h.toLowerCase() === name.toLowerCase()
  )
  if (!present) headers[name] = value
}

/// Anthropic rejects `/v1/models` (and any Anthropic-shaped proxy) without
/// `anthropic-version`, and rejects requests carrying an `Origin` (Jan's
/// webview is a browser context) without the browser-access opt-in header.
/// Add both defaults for Anthropic providers when the caller hasn't set them;
/// other providers are left untouched.
export function ensureAnthropicHeaders(
  provider: { provider?: string; base_url?: string; api_type?: string },
  headers: Record<string, string>
): void {
  if (!isAnthropicProvider(provider)) return
  setDefaultHeader(headers, ANTHROPIC_VERSION_HEADER, ANTHROPIC_VERSION)
  setDefaultHeader(headers, ANTHROPIC_BROWSER_ACCESS_HEADER, 'true')
}

type CatalogKind = 'openai' | 'anthropic' | 'gemini' | 'compatible'

/// Resolve which catalog shape a provider speaks. `api_type` is authoritative
/// (a custom-named Anthropic gateway still lists Claude models), falling back
/// to the built-in provider name.
function resolveCatalogKind(
  provider: string | { provider: string; api_type?: string }
): CatalogKind | null {
  const name = typeof provider === 'string' ? provider : provider.provider
  const apiType = typeof provider === 'string' ? undefined : provider.api_type
  if (apiType === 'anthropic') return 'anthropic'
  if (name === 'openai' || name === 'anthropic' || name === 'gemini') {
    return name
  }
  if (Object.prototype.hasOwnProperty.call(cloudModelPresets, name)) return 'compatible'
  return null
}

export function supportsRemoteCatalog(
  provider: string | { provider: string; api_type?: string }
): boolean {
  return resolveCatalogKind(provider) !== null
}

function inferOpenAICapabilities(id: string): string[] | null {
  if (
    id.startsWith('text-embedding-') ||
    id.startsWith('whisper-') ||
    id.startsWith('tts-') ||
    id.startsWith('dall-e-') ||
    id.startsWith('gpt-image-') ||
    id.startsWith('omni-moderation-') ||
    id.startsWith('davinci-') ||
    id.startsWith('babbage-')
  ) {
    return null
  }
  if (
    /^gpt-[5-9]/.test(id) ||
    id.startsWith('gpt-4o') ||
    id.startsWith('gpt-4.1') ||
    id.startsWith('gpt-4.5') ||
    id.startsWith('gpt-4-turbo') ||
    id.startsWith('gpt-4-vision') ||
    id.startsWith('chatgpt-4o')
  ) {
    return ['completion', 'tools', 'vision']
  }
  if (id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) {
    return ['completion', 'tools', 'vision']
  }
  if (id.startsWith('gpt-4') || id.startsWith('gpt-3.5')) {
    return ['completion', 'tools']
  }
  return null
}

function stripModelsPrefix(id: string): string {
  return id.toLowerCase().replace(/^models\//, '')
}

function inferGeminiCapabilities(id: string): string[] | null {
  const lower = stripModelsPrefix(id)
  if (
    lower.startsWith('text-embedding-') ||
    lower.startsWith('embedding-') ||
    lower.startsWith('gemini-embedding') ||
    lower.includes('nano-banana') ||
    /(?:image|tts|audio|live|transcribe|translate|omni)/.test(lower) ||
    lower.startsWith('imagen-') ||
    lower.startsWith('veo-') ||
    lower.startsWith('aqa')
  ) {
    return null
  }
  if (!lower.startsWith('gemini-') && !lower.startsWith('gemma-')) return null
  return ['completion', 'tools', 'vision']
}

// Score Gemini/Gemma ids by version so the catalog sorts newest-first
// regardless of the `created` field (which is missing on Google's
// OpenAI-compat /models response).
export function geminiVersionScore(id: string): number {
  const lower = stripModelsPrefix(id)
  const match = lower.match(/^(?:gemini|gemma)-(\d+)(?:\.(\d+))?/)
  if (!match) return 0
  const major = Number(match[1])
  const minor = match[2] ? Number(match[2]) : 0
  return major * 100 + minor
}

function inferAnthropicCapabilities(id: string): string[] | null {
  if (!id.startsWith('claude-')) return null
  if (id.startsWith('claude-instant') || id.startsWith('claude-2')) {
    return ['completion', 'tools']
  }
  return ['completion', 'tools', 'vision']
}

function buildHeaders(p: ProviderLike, key: string | undefined): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (key) {
    headers['x-api-key'] = key
    headers['Authorization'] = `Bearer ${key}`
  }
  if (p.custom_header) {
    for (const h of p.custom_header) headers[h.header] = h.value
  }
  ensureAnthropicHeaders(p, headers)
  return headers
}

async function getJson(
  fetchImpl: FetchImpl,
  url: string,
  headers: Record<string, string>
): Promise<{ ok: boolean; status: number; statusText: string; body: unknown }> {
  const response = await fetchImpl(url, { method: 'GET', headers })
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    body = null
  }
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
  }
}

export async function fetchTopRemoteModels(
  provider: ProviderLike,
  fetchImpl: FetchImpl
): Promise<RemoteCatalogModel[]> {
  const kind = resolveCatalogKind(provider)
  if (!kind) {
    throw new Error(`Catalog not supported for ${provider.provider}`)
  }
  if (CURATED_ONLY_PROVIDERS.has(provider.provider)) {
    const presets = (cloudModelPresets as Record<string, readonly { id: string }[]>)[provider.provider] ?? []
    return presets.map(({ id }) => ({ id, capabilities: cloudModelCapabilities(provider.provider, id) ?? ['completion'], createdMs: 0 }))
  }
  if (!provider.base_url) {
    throw new Error('Provider must have base_url configured')
  }

  const keyChain = providerRemoteApiKeyChain(provider)
  const attempts: (string | undefined)[] = keyChain.length > 0 ? keyChain : [undefined]

  let lastStatus = 0
  let lastStatusText = ''
  for (let i = 0; i < attempts.length; i++) {
    const result = await getJson(
      fetchImpl,
      providerCatalogUrl(provider),
      buildHeaders(provider, attempts[i])
    )
    lastStatus = result.status
    lastStatusText = result.statusText
    if (!result.ok) {
      if ([401, 403, 429].includes(result.status) && i < attempts.length - 1) continue
      throw new Error(`Failed to fetch models from ${provider.provider}: ${result.status} ${result.statusText}`)
    }

    const body = result.body as { data?: unknown; models?: { name?: string; is_deprecated?: boolean; endpoints?: string[] }[] }
    if (provider.provider === 'cohere' && Array.isArray(body?.models)) {
      return normalizeCatalog(kind, body.models.filter((m) => !m.is_deprecated && m.endpoints?.includes('chat')).map((m) => ({ id: m.name })), provider.provider)
    }
    if (!Array.isArray(body?.data)) {
      throw new Error(`Invalid model catalog from ${provider.provider}`)
    }
    return normalizeCatalog(kind, body.data, provider.provider)
  }

  throw new Error(`Failed to fetch models from ${provider.provider}: ${lastStatus} ${lastStatusText}`)
}

function normalizeCatalog(kind: CatalogKind, rows: unknown[], provider: string): RemoteCatalogModel[] {
  const inferCaps =
    kind === 'openai'
      ? inferOpenAICapabilities
      : kind === 'gemini'
        ? inferGeminiCapabilities
        : kind === 'anthropic'
          ? inferAnthropicCapabilities
          : (id: string) => cloudModelCapabilities(provider, id) ?? ['completion']

  const parsed: RemoteCatalogModel[] = []
  for (const raw of rows) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as Record<string, unknown>
    const id = typeof row.id === 'string' ? row.id : null
    if (!id) continue
    // Mantle also lists models that require a different inference protocol.
    if (provider === 'bedrock' && !/^openai\.gpt-(?:[6-9]|oss-)/.test(id)) continue
    if (kind === 'compatible' && !isCompatibleChatModel(id, row)) continue
    const caps = inferCaps(id)
    if (!caps) continue
    if (kind === 'compatible') {
      const architecture = row.architecture as { input_modalities?: string[] } | undefined
      const parameters = Array.isArray(row.supported_parameters) ? row.supported_parameters : []
      const routes = Array.isArray(row.providers) ? row.providers as { supports_tools?: boolean }[] : []
      if (architecture?.input_modalities?.includes('image') && !caps.includes('vision')) caps.push('vision')
      if ((parameters.includes('tools') || routes.some((route) => route.supports_tools)) && !caps.includes('tools')) caps.push('tools')
    }
    const createdMs = parseCreated(row.created, row.created_at)
    parsed.push({ id, capabilities: caps, createdMs })
  }

  if (kind === 'gemini') {
    parsed.sort((a, b) => {
      const va = geminiVersionScore(a.id)
      const vb = geminiVersionScore(b.id)
      if (vb !== va) return vb - va
      return a.id.localeCompare(b.id)
    })
  } else {
    const presets = (cloudModelPresets as Record<string, readonly { id: string }[]>)[provider] ?? []
    const rank = (id: string) => {
      const index = presets.findIndex((model) => model.id === id)
      return index < 0 ? Number.MAX_SAFE_INTEGER : index
    }
    parsed.sort((a, b) => b.createdMs - a.createdMs || rank(a.id) - rank(b.id) || a.id.localeCompare(b.id))
  }
  return parsed.filter((model, index, all) => all.findIndex((m) => m.id === model.id) === index).slice(0, TOP_N)
}

// Catalogs can also expose speech, embeddings, moderation and image generation.
// Unknown chat models remain text-only until their capabilities are verified.
function isCompatibleChatModel(id: string, row: Record<string, unknown>): boolean {
  const architecture = row.architecture as { output_modalities?: string[] } | undefined
  if (architecture?.output_modalities && !architecture.output_modalities.includes('text')) return false
  const capabilities = row.capabilities as { completion_chat?: boolean } | undefined
  if (capabilities?.completion_chat === false) return false
  return !/(embed|rerank|whisper|tts|orpheus|speech|transcribe|moderation|content[-_]safety|safety[-_]guard|image[-_]gen|grok-imagine|flux|stable-diffusion|dall-e|nemoguard|cosmos|parse|riva-|nvclip|ising)/i.test(id)
}

function parseCreated(created: unknown, createdAt: unknown): number {
  if (typeof created === 'number' && Number.isFinite(created)) {
    return created < 1e12 ? created * 1000 : created
  }
  if (typeof createdAt === 'string') {
    const t = Date.parse(createdAt)
    if (!Number.isNaN(t)) return t
  }
  return 0
}
