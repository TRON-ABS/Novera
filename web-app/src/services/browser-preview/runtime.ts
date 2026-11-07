import { browserModel, type BrowserModelSpec } from './config'

export type BrowserMessage = { role: string; content: string }
type SdkEvent = { type: string; text?: string }
type SdkResult = { message: { role: string; content: string }; finish_reason: string; usage?: { prompt_tokens?: number; completion_tokens?: number; cached_tokens?: number }; timings?: { tokens_per_second?: number } }
type Turn = AsyncIterable<SdkEvent> & { result: Promise<SdkResult>; cancel(): void }
type Session = { generate(messages: BrowserMessage[], options: Record<string, unknown>): Turn; reset(): void; dispose(): Promise<void> }
type Model = { contextLength?: number; create_session(): Session; dispose(): Promise<void> }
type Sdk = { from_pretrained(repo: string, options: Record<string, unknown>): Promise<Model> }
export const BROWSER_CONTEXT_TOKENS = 32768
export type BrowserRuntimeStatus = {
  phase: 'idle' | 'loading' | 'ready' | 'generating' | 'error'
  modelId: string
  progress?: number
  error?: string
  lastGeneration?: { firstTextMs?: number; totalMs: number; tokensPerSecond?: number; completionTokens?: number; cachedTokens?: number }
}

async function loadPinnedSdk(spec: BrowserModelSpec): Promise<Sdk> {
  const response = await fetch(spec.sdk.url, { credentials: 'omit' })
  if (!response.ok) throw new Error('Le moteur navigateur ne peut pas être téléchargé.')
  const bytes = await response.arrayBuffer()
  const digest = [...new Uint8Array(await crypto.subtle.digest('SHA-256', bytes))].map(byte => byte.toString(16).padStart(2, '0')).join('')
  if (digest !== spec.sdk.sha256) throw new Error('Le moteur téléchargé ne correspond pas à la révision vérifiée.')
  const url = URL.createObjectURL(new Blob([bytes], { type: 'text/javascript' }))
  try {
    const module = await import(/* @vite-ignore */ url)
    const sdk = module[spec.sdk.export] as Sdk | undefined
    if (!sdk?.from_pretrained) throw new Error('Moteur navigateur incompatible.')
    return sdk
  } finally { URL.revokeObjectURL(url) }
}

export class BrowserRuntime {
  private status: BrowserRuntimeStatus = { phase: 'idle', modelId: '' }
  private listeners = new Set<() => void>()
  private model?: Model
  private session?: Session
  private loadJob?: Promise<void>
  private loadController?: AbortController
  private turn?: Turn
  private activeId = ''
  private previousHistory?: BrowserMessage[]

  constructor(private sdkLoader = loadPinnedSdk, private gpuAvailable = async () => {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
    return Boolean(await gpu?.requestAdapter())
  }) {}

  snapshot = () => this.status
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(status: BrowserRuntimeStatus) { this.status = status; this.listeners.forEach(listener => listener()) }
  loadedId() { return this.model ? this.activeId : '' }
  cancelLoad() { this.loadController?.abort() }

  async load(id: string): Promise<void> {
    browserModel(id)
    if (this.model && this.activeId === id) return
    if (this.loadJob) {
      if (this.status.modelId === id) return this.loadJob
      this.cancelLoad()
      await this.loadJob.catch(() => {})
    }
    if (this.turn) throw new Error('Arrêtez la réponse en cours avant de changer de modèle.')
    const spec = browserModel(id)
    const controller = new AbortController()
    this.loadController = controller
    this.publish({ phase: 'loading', modelId: id, progress: 0 })
    const job = (async () => {
      await this.session?.dispose()
      await this.model?.dispose()
      this.previousHistory = undefined
      this.session = undefined; this.model = undefined; this.activeId = ''
      controller.signal.throwIfAborted()
      if (!(await this.gpuAvailable())) throw new Error('WebGPU est nécessaire. Essayez Edge ou Chrome sur un appareil compatible, ou utilisez Novera Desktop.')
      const sdk = await this.sdkLoader(spec)
      controller.signal.throwIfAborted()
      const model = await sdk.from_pretrained(spec.repo, {
        revision: spec.revision, file: spec.file,
        ...(spec.projector ? { mmproj: spec.projector } : {}),
        maxLength: BROWSER_CONTEXT_TOKENS, cache: true,
        cacheName: `novera-web-${spec.id}-${spec.revision}`,
        prefixSnapshotStore: null, signal: controller.signal,
        onProgress: (event: { fraction?: number }) => {
          if (typeof event.fraction === 'number') this.publish({ phase: 'loading', modelId: id, progress: Math.max(0, Math.min(1, event.fraction)) })
        },
      })
      if (controller.signal.aborted) { await model.dispose(); controller.signal.throwIfAborted() }
      if (typeof model.contextLength === 'number' && model.contextLength < BROWSER_CONTEXT_TOKENS) {
        await model.dispose()
        throw new Error(`Le moteur n’a alloué que ${model.contextLength} tokens de contexte au lieu des 32 768 demandés.`)
      }
      let session: Session
      try { session = model.create_session() }
      catch (error) { await model.dispose(); throw error }
      this.model = model
      this.session = session
      this.activeId = id
      if (this.model && this.activeId === id) this.publish({ phase: 'ready', modelId: id })
    })()
    this.loadJob = job
    try { await job }
    catch (error) {
      this.publish(controller.signal.aborted ? { phase: 'idle', modelId: '' } : { phase: 'error', modelId: id, error: error instanceof Error ? error.message : 'Chargement impossible.' })
      throw error
    } finally {
      if (this.loadJob === job) this.loadJob = undefined
      if (this.loadController === controller) this.loadController = undefined
    }
  }

  async *generate(id: string, messages: BrowserMessage[], signal?: AbortSignal, maxTokens = 512): AsyncGenerator<{ text?: string; result?: SdkResult }> {
    await this.load(id)
    signal?.throwIfAborted()
    if (this.turn || !this.session) throw new Error('Le moteur est occupé. Attendez la fin de la réponse.')
    // Both pinned SDKs reconcile token prefixes internally. Reuse their cache
    // only when the complete previous exchange is an exact prefix of this one.
    // Edited, independent, regenerated or cancelled conversations reset it.
    const continuesHistory = this.previousHistory && messages.length > this.previousHistory.length &&
      this.previousHistory.every((message, index) => message.role === messages[index].role && message.content === messages[index].content)
    if (!continuesHistory) this.session.reset()
    this.previousHistory = undefined
    const started = performance.now()
    const turn = this.session.generate(messages, { generation_mode: 'text', max_new_tokens: Math.min(1024, Math.max(1, maxTokens)), do_sample: false, signal })
    this.turn = turn
    const cancel = () => turn.cancel()
    signal?.addEventListener('abort', cancel, { once: true })
    this.publish({ phase: 'generating', modelId: id })
    let firstTextMs: number | undefined
    let result: SdkResult | undefined
    try {
      for await (const event of turn) if (event.type === 'text' && event.text) {
        firstTextMs ??= performance.now() - started
        yield { text: event.text }
      }
      result = await turn.result
      if (result.finish_reason === 'stop' && !signal?.aborted) this.previousHistory = [...messages.map(message => ({ ...message })), { ...result.message }]
      yield { result }
    } finally {
      signal?.removeEventListener('abort', cancel)
      if (this.turn === turn) this.turn = undefined
      if (this.model && this.activeId === id) this.publish({ phase: 'ready', modelId: id, ...(result?.finish_reason !== 'cancelled' && result ? { lastGeneration: {
        firstTextMs, totalMs: performance.now() - started,
        ...(Number.isFinite(result.timings?.tokens_per_second) && result.timings!.tokens_per_second! >= 0 ? { tokensPerSecond: result.timings!.tokens_per_second } : {}),
        ...(Number.isSafeInteger(result.usage?.completion_tokens) && result.usage!.completion_tokens! >= 0 ? { completionTokens: result.usage!.completion_tokens } : {}),
        ...(Number.isSafeInteger(result.usage?.cached_tokens) && result.usage!.cached_tokens! >= 0 ? { cachedTokens: result.usage!.cached_tokens } : {}),
      } } : {}) })
    }
  }

  async unload() {
    this.cancelLoad()
    const pending = this.loadJob
    if (pending) await pending.catch(() => {})
    const turn = this.turn
    if (turn) { turn.cancel(); await turn.result.catch(() => {}) }
    await this.session?.dispose()
    await this.model?.dispose()
    this.session = undefined; this.model = undefined; this.activeId = ''
    this.previousHistory = undefined
    this.publish({ phase: 'idle', modelId: '' })
  }
}

export const browserRuntime = new BrowserRuntime()
