import {
  AIEngine,
  type ImportOptions,
  type SessionInfo,
  type SettingComponentProps,
  type modelInfo,
  type chatCompletionRequest,
  type chatCompletion,
} from '@janhq/core'
import { invoke } from '@tauri-apps/api/core'

const defaults: SettingComponentProps[] = [{
  key: 'python_path', title: 'Python',
  description: 'Python 3.15.1 · PyTorch · Transformers · Safetensors',
  controllerType: 'input',
  controllerProps: { value: 'python', placeholder: 'python.exe / bin/python', type: 'text' },
}, {
  key: 'execution_device', title: 'CPU / GPU', description: 'PyTorch · CPU / CUDA',
  controllerType: 'dropdown', controllerProps: {
    value: 'auto', options: [{ name: 'Auto', value: 'auto' }, { name: 'CPU', value: 'cpu' }, { name: 'CUDA', value: 'cuda' }],
  },
}]

/** Uses the same local engine contract as llama.cpp and MLX. Weights stay in place. */
export default class TransformersEngine extends AIEngine {
  readonly provider = 'transformers'
  private probeCache?: { python: string; expires: number; value: Promise<unknown> }

  async probe(): Promise<unknown> {
    const python = String((await this.getSettings()).find(setting => setting.key === 'python_path')?.controllerProps.value ?? 'python')
    if (this.probeCache?.python === python && this.probeCache.expires > Date.now()) return this.probeCache.value
    const value = invoke('transformers_probe', { pythonPath: python })
    this.probeCache = { python, expires: Date.now() + 30000, value }
    void value.catch(() => { this.probeCache = undefined })
    return value
  }

  override async getSettings(): Promise<SettingComponentProps[]> {
    const raw = await invoke<string | null>('settings_get', { key: this.name })
    const saved = raw ? JSON.parse(raw) as SettingComponentProps[] : []
    return structuredClone(defaults).map(setting => ({
      ...setting,
      controllerProps: { ...setting.controllerProps, ...saved.find(item => item.key === setting.key)?.controllerProps },
    }))
  }

  override async updateSettings(updates: Partial<SettingComponentProps>[]): Promise<void> {
    const settings = (await this.getSettings()).map(setting => {
      const update = updates.find(item => item.key === setting.key)
      return update ? { ...setting, ...update } : setting
    })
    await invoke('settings_set', { key: this.name, value: JSON.stringify(settings) })
  }

  async list(): Promise<modelInfo[]> { return invoke('transformers_list') }
  async get(id: string) { return (await this.list()).find(model => model.id === id) }
  async import(modelId: string, options: ImportOptions): Promise<void> {
    await invoke('transformers_import', { modelId, modelPath: options.modelPath })
  }
  async delete(modelId: string): Promise<void> { await invoke('transformers_delete', { modelId }) }
  async update(): Promise<void> { throw new Error('Reimport the folder to change model metadata') }
  async abortImport(): Promise<void> { /* Local registration has no download to cancel. */ }
  async isToolSupported(): Promise<boolean> { return false }
  async getLoadedModels(): Promise<string[]> {
    const session = await invoke<SessionInfo | null>('transformers_session', { modelId: '' })
    return session ? [session.model_id] : []
  }
  async load(modelId: string, settings?: Record<string, unknown>): Promise<SessionInfo> {
    const config = await this.getSettings()
    const pythonPath = config.find(s => s.key === 'python_path')?.controllerProps.value
    const device = config.find(s => s.key === 'execution_device')?.controllerProps.value ?? 'auto'
    const raw = Number(settings?.ctx_size)
    return invoke('transformers_load', {
      modelId, pythonPath: String(pythonPath ?? 'python'),
      device,
      ctxSize: Number.isFinite(raw) && raw >= 16 ? Math.floor(raw) : 2048,
    })
  }
  async unload(modelId: string) {
    await invoke('transformers_unload', { modelId })
    return { success: true }
  }
  async chat(_options: chatCompletionRequest): Promise<chatCompletion> {
    // Chat is streamed through ModelFactory, which owns cancellation and transport.
    throw new Error('Use the Novera chat transport for this engine')
  }
  override async onUnload() {
    for (const modelId of await this.getLoadedModels()) await this.unload(modelId)
  }
}
