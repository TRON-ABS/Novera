import { AIEngine, type modelInfo, type SessionInfo, type ImportOptions, type chatCompletionRequest } from '@janhq/core'
import { DefaultCoreService } from '../core/default'
import { DefaultProvidersService } from '../providers/default'
import type { InvokeArgs } from '../core/types'
import { browserCatalog, browserModel } from './config'
import { browserRuntime, BROWSER_CONTEXT_TOKENS } from './runtime'
import { predefinedProviders } from '@/constants/providers'
import { mediaModels } from '@/constants/mediaProviders'
import { browserMediaCommand } from './media'

const info = (spec: typeof browserCatalog[number]): modelInfo => ({
  id: spec.id, name: spec.name, providerId: 'llamacpp', port: 0, sizeBytes: spec.bytes,
  quant_type: 'Q4_K_M', capabilities: ['completion'], tags: ['browser', 'WebGPU'],
  description: 'Calcul sur cet appareil. Téléchargement au premier chargement ; texte dans cette préparation.',
})

export class BrowserEngine extends AIEngine {
  readonly provider = 'llamacpp'
  constructor() { super('browser:local', 'novera-browser-engine', 'Novera WebGPU', true, 'Inférence locale dans le navigateur', '1.0.1') }
  onUnload() { void browserRuntime.unload().catch(() => {}) }
  async get(id: string) { return browserCatalog.find(model => model.id === id) ? info(browserModel(id)) : undefined }
  async list() { return browserCatalog.map(info) }
  async load(id: string, _settings?: unknown, embedding = false): Promise<SessionInfo> {
    if (embedding) throw new Error('Les embeddings locaux ne sont pas encore disponibles dans cette préparation Web.')
    await browserRuntime.load(id)
    return { pid: 1, port: 0, model_id: id, is_embedding: false, api_key: '' }
  }
  async unload() { await browserRuntime.unload(); return { success: true } }
  async getLoadedModels() { const id = browserRuntime.loadedId(); return id ? [id] : [] }
  async getModelContextLimit(id: string) { browserModel(id); return BROWSER_CONTEXT_TOKENS }
  async getSettings() { return [] }
  async updateSettings() { throw new Error('Les réglages natifs du moteur ne sont pas disponibles dans le navigateur.') }
  async isToolSupported() { return false }
  async chat(_request: chatCompletionRequest): Promise<never> { throw new Error('Utilisez le transport de conversation navigateur Novera.') }
  async delete(_id: string): Promise<void> { throw new Error('La gestion sélective du cache modèle reste à préparer ; aucune discussion n’est supprimée.') }
  async update(_id: string, _model: Partial<modelInfo>) { throw new Error('La modification des modèles navigateur reste à préparer.') }
  async import(id: string, _options: ImportOptions) { browserModel(id) }
  async abortImport() { browserRuntime.cancelLoad() }
}

export class BrowserCoreService extends DefaultCoreService {
  private engine = new BrowserEngine()
  async getActiveExtensions() {
    return [{ name: this.engine.name, url: 'browser:local', active: true, version: '1.0.1', extensionInstance: this.engine }]
  }
  async invoke<T = unknown>(command: string, args?: InvokeArgs): Promise<T> {
    if (['sharing_metadata', 'creation_info', 'creation_image_input'].includes(command)) return await browserMediaCommand(command, args) as T
    if (command === 'settings_get') return localStorage.getItem(String(args?.key)) as T
    if (command === 'settings_set' && typeof args?.key === 'string' && typeof args.value === 'string') { localStorage.setItem(args.key, args.value); return undefined as T }
    if (command === 'settings_delete' && typeof args?.key === 'string') { localStorage.removeItem(args.key); return undefined as T }
    throw new Error(`Cette fonction nécessite Novera Desktop : ${command}`)
  }
}

export class BrowserProvidersService extends DefaultProvidersService {
  async getProviders(): Promise<ModelProvider[]> {
    const fal = structuredClone(predefinedProviders.find(provider => provider.provider === 'fal')!) as unknown as ModelProvider
    return [{ ...fal, persist: true, models: mediaModels('fal') }, { provider: 'llamacpp', active: true, persist: true, settings: [], models: browserCatalog.map(spec => ({ id: spec.id, name: spec.name, displayName: spec.name, capabilities: ['completion'], input_modalities: ['text'], output_modalities: ['text'], settings: {} })) }]
  }
  async fetchModelsFromProvider(provider: ModelProvider) {
    if (provider.provider === 'llamacpp') return browserCatalog.map(model => model.id)
    if (provider.provider === 'fal') return mediaModels('fal').map(model => model.id)
    throw new Error('Le catalogue distant de ce fournisseur reste à vérifier dans le navigateur.')
  }
  async updateSettings() { /* Provider values remain in the existing in-memory store; no browser keyring. */ }
  async deleteProviderKeys() { /* No provider secret is persisted by this browser backend. */ }
}
