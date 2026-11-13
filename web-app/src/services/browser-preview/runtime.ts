import { browserModel, nativeOmniQ8, type BrowserModelSpec } from './config'
import { loadWasmTextModel, wasmTextSupported, type BrowserTextProfile, type BrowserTextSource } from './wasm-text'

export type BrowserToolCall = { id: string; type: 'function'; function: { name: string; arguments: Record<string, unknown> }; errors?: string[] }
export type BrowserTool = { type: 'function'; function: { name: string; description?: string; parameters?: Record<string, unknown> } }
export type BrowserMessage = { role: string; content: string; tool_calls?: BrowserToolCall[]; tool_call_id?: string }
type SdkEvent = { type: string; text?: string }
type SpeechEvent = SdkEvent & { audio?: Float32Array }
export type SpeechMessage = { role: string; content: string | { type: 'audio'; audio: Float32Array }[] }
export type SdkResult = { message: BrowserMessage; tokenIds?: number[]; finish_reason: string; usage?: { prompt_tokens?: number; completion_tokens?: number; cached_tokens?: number }; timings?: { tokens_per_second?: number } }
export type Turn = AsyncIterable<SdkEvent> & { result: Promise<SdkResult>; cancel(): void }
type Session = { generate(messages: (BrowserMessage | SpeechMessage)[], options: Record<string, unknown>): Turn; reset(): void; dispose(): Promise<void> }
export type Model = { contextLength?: number; create_session(): Session; dispose(): Promise<void> }
type Sdk = { from_pretrained(repo: string, options: Record<string, unknown>): Promise<Model> }
export const BROWSER_CONTEXT_TOKENS = 32768
export type BrowserRuntimeStatus = {
  backend?: 'browser' | 'native'
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
  private engine?: 'wasm' | 'sdk'
  private loadingEngine?: 'wasm' | 'sdk'
  private previousHistory?: BrowserMessage[]
  private calibrating = false
  private native?: NativeConversationBackend
  private nativeSubscription?: () => void
  private activeNative = false

  constructor(private sdkLoader = loadPinnedSdk, private gpuAvailable = async () => {
    const gpu = (navigator as Navigator & { gpu?: { requestAdapter(): Promise<unknown> } }).gpu
    return Boolean(await gpu?.requestAdapter())
  }) {}

  snapshot = (): BrowserRuntimeStatus => this.activeNative && this.native ? this.native.snapshot() : this.status
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(status: BrowserRuntimeStatus) { this.status = status; this.listeners.forEach(listener => listener()) }
  loadedId(): string { return this.activeNative && this.native ? this.native.loadedId() : this.model ? this.activeId : '' }
  supportsNative(id: string) { return this.native?.supports(id) === true }
  cancelLoad() { if (this.activeNative) this.native?.cancelLoad(); else this.loadController?.abort() }

  async setNativeBackend(backend?: NativeConversationBackend) {
    if (['loading', 'generating'].includes(this.snapshot().phase)) throw new Error('Attendez la fin de l’opération en cours.')
    await this.unload()
    this.nativeSubscription?.()
    this.native = backend
    this.activeNative = Boolean(backend)
    this.nativeSubscription = backend?.subscribe(() => { if (this.activeNative) this.listeners.forEach(listener => listener()) })
    this.listeners.forEach(listener => listener())
  }

  async load(id: string, preferSdk = false): Promise<void> {
    if (this.calibrating) throw new Error('CALIBRATION_BUSY')
    if (this.native?.supports(id)) {
      if (!this.activeNative) {
        await this.unload()
        this.activeNative = true
      }
      return this.native.load(id)
    }
    if (id === nativeOmniQ8) throw new Error('Connectez la passerelle locale LFM3-Omni Q8_0.')
    if (this.activeNative) await this.unload()
    return this.loadModel(id, preferSdk)
  }

  private async loadModel(id: string, preferSdk = false): Promise<void> {
    const spec = browserModel(id)
    const engine = !preferSdk && wasmTextSupported() ? 'wasm' : 'sdk'
    if (this.model && this.activeId === id && this.engine === engine) return
    if (this.loadJob) {
      if (this.status.modelId === id && this.loadingEngine === engine) return this.loadJob
      this.cancelLoad()
      await this.loadJob.catch(() => {})
      return this.loadModel(id, preferSdk)
    }
    if (this.turn) throw new Error('Arrêtez la réponse en cours avant de changer de modèle.')
    const controller = new AbortController()
    this.loadController = controller
    this.loadingEngine = engine
    this.publish({ phase: 'loading', modelId: id, progress: 0 })
    const job = (async () => {
      await this.session?.dispose()
      await this.model?.dispose()
      this.previousHistory = undefined
      this.session = undefined; this.model = undefined; this.activeId = ''
      controller.signal.throwIfAborted()
      if (!(await this.gpuAvailable())) throw new Error('WebGPU est nécessaire. Essayez Edge ou Chrome sur un appareil compatible, ou utilisez Novera Desktop.')
      const progress = (fraction: number) =>
        this.publish({ phase: 'loading', modelId: id, progress: Math.max(0, Math.min(1, fraction)) })
      const loadSdk = async () => {
        const sdk = await this.sdkLoader(spec)
        controller.signal.throwIfAborted()
        return sdk.from_pretrained(spec.repo, {
          revision: spec.revision, file: spec.file,
          ...(spec.projector ? { mmproj: spec.projector } : {}),
          maxLength: BROWSER_CONTEXT_TOKENS, cache: true,
          cacheName: `novera-web-${spec.id}-${spec.revision}`,
          prefixSnapshotStore: null, signal: controller.signal,
          onProgress: (event: { fraction?: number }) => {
            if (typeof event.fraction === 'number') progress(event.fraction)
          },
        })
      }
      const model = await (engine === 'wasm' ? loadWasmTextModel(controller.signal, progress, undefined, spec) : loadSdk())
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
      this.engine = engine
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

  async *generate(id: string, messages: BrowserMessage[], signal?: AbortSignal, maxTokens = 512, tools?: BrowserTool[]): AsyncGenerator<{ text?: string; result?: SdkResult }> {
    if (this.calibrating) throw new Error("CALIBRATION_BUSY")
    const requiresSdk = messages.at(-1)?.role === 'assistant' ||
      messages.some(message => message.role === 'tool' || message.tool_calls?.length)
    signal?.throwIfAborted()
    await this.load(id, requiresSdk)
    if (this.activeNative && this.native) { yield* this.native.generate(id, messages, signal, maxTokens, tools); return }
    signal?.throwIfAborted()
    if (this.calibrating || this.turn || !this.session) throw new Error('Le moteur est occupé. Attendez la fin de la réponse.')
    // Both pinned SDKs reconcile token prefixes internally. Reuse their cache
    // only when the complete previous exchange is an exact prefix of this one.
    // Edited, independent, regenerated or cancelled conversations reset it.
    const continuesHistory = this.previousHistory && messages.length > this.previousHistory.length &&
      this.previousHistory.every((message, index) => JSON.stringify(message) === JSON.stringify(messages[index]))
    if (!continuesHistory) this.session.reset()
    this.previousHistory = undefined
    const started = performance.now()
    // On the pinned Omni SDK, short replies benefit from less speculative GPU
    // work queued beyond the stop token. Keep its sustained-decode default.
    const shortOmni = browserModel(id).kind === 'omni' && maxTokens <= 128
    const turn = this.session.generate(messages, { generation_mode: 'text', max_new_tokens: Math.min(1024, Math.max(1, maxTokens)), do_sample: false, signal, ...(shortOmni ? { decode_pipeline_depth: 2 } : {}), ...(this.engine !== 'wasm' && tools?.length ? { tools } : {}) })
    this.turn = turn
    const cancel = () => turn.cancel()
    signal?.addEventListener('abort', cancel, { once: true })
    this.publish({ phase: 'generating', modelId: id })
    let firstTextMs: number | undefined
    let result: SdkResult | undefined
    void turn.result.catch(() => {})
    try {
      for await (const event of turn) if (event.type === 'text' && event.text) {
        firstTextMs ??= performance.now() - started
        yield { text: event.text }
      }
      result = await turn.result
      if (result.finish_reason === 'stop' && !signal?.aborted) this.previousHistory = [...messages.map(message => ({ ...message })), { ...result.message }]
      yield { result }
    } finally {
      if (!result) { turn.cancel(); await turn.result.catch(() => {}) }
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

  // Keep the chat's KV prefix intact while using an ephemeral audio session.
  // Share the GPU turn lock and release this extra cache after each operation.
  async speech(id: string, messages: SpeechMessage[], mode: 'text' | 'audio', signal: AbortSignal,
    onAudio?: (samples: Float32Array) => void): Promise<string> {
    if (this.native?.supports(id)) { await this.load(id); return this.native.speech(id, messages, mode, signal, onAudio) }
    if (browserModel(id).kind !== 'omni') throw new Error('unavailable')
    signal.throwIfAborted()
    await this.load(id, true)
    signal.throwIfAborted()
    if (this.calibrating || this.turn || !this.model) throw new Error('unavailable')
    const session = this.model.create_session()
    let turn: Turn | undefined
    const cancel = () => turn?.cancel()
    let text = ''
    try {
      turn = session.generate(messages, { generation_mode: mode, max_new_tokens: mode === 'audio' ? 2048 : 512, do_sample: false, signal })
      this.turn = turn
      void turn.result.catch(() => {})
      signal.addEventListener('abort', cancel, { once: true })
      this.publish({ phase: 'generating', modelId: id })
      for await (const event of turn as AsyncIterable<SpeechEvent>) {
        signal.throwIfAborted()
        if (event.type === 'text' && event.text) text += event.text
        if (event.type === 'audio' && event.audio) onAudio?.(event.audio)
      }
      const result = await turn.result
      signal.throwIfAborted()
      if (result.finish_reason !== 'stop') throw new Error('unavailable')
      return typeof result.message.content === 'string' ? result.message.content : text
    } finally {
      signal.removeEventListener('abort', cancel)
      turn?.cancel()
      if (turn) await turn.result.catch(() => {})
      await session.dispose()
      if (this.turn === turn) this.turn = undefined
      if (this.model && this.activeId === id) this.publish({ phase: 'ready', modelId: id })
    }
  }

  async compareWasmSampling<T>(
    signal: AbortSignal,
    compare: (sample: (profile: BrowserTextProfile, confirmation: boolean) => Promise<SdkResult>) => Promise<T>,
    spec: BrowserTextSource,
  ): Promise<T> {
    if (this.calibrating || this.turn || this.loadJob) throw new Error('CALIBRATION_BUSY')
    const unloading = this.unload()
    this.calibrating = true
    try {
      await unloading
      return await compare(async (profile, confirmation) => {
        signal.throwIfAborted()
        const model = await loadWasmTextModel(signal, () => {}, profile, spec)
        let session: Session
        try { session = model.create_session() }
        catch (error) { await model.dispose(); throw error }
        const generate = async (content: string, maxTokens: number) => {
          signal.throwIfAborted()
          const turn = session.generate([{ role: 'user', content }], {
            generation_mode: 'text', max_new_tokens: maxTokens, do_sample: false,
          })
          const cancel = () => turn.cancel()
          signal.addEventListener('abort', cancel, { once: true })
          try {
            const result = await turn.result
            signal.throwIfAborted()
            return result
          } finally { signal.removeEventListener('abort', cancel) }
        }
        try {
          await generate('Name the first two prime numbers.', 8)
          return await generate(confirmation
            ? 'Explain how a solar eclipse occurs. Use at least six numbered paragraphs with concrete examples.'
            : 'Name the first eight prime numbers in order.', confirmation ? 512 : 32)
        } finally {
          await session.dispose()
          await model.dispose()
        }
      })
    } finally { this.calibrating = false }
  }

  async unload() {
    if (this.calibrating) throw new Error("CALIBRATION_BUSY")
    if (this.activeNative) await this.native?.unload()
    this.activeNative = false
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

export type NativeConversationBackend = Pick<BrowserRuntime, 'snapshot' | 'subscribe' | 'load' | 'loadedId' | 'cancelLoad' | 'generate' | 'speech' | 'unload'> & { supports(id: string): boolean }

export const browserRuntime = new BrowserRuntime()
