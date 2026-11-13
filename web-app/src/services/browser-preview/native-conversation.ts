import { browserRuntime, type BrowserMessage, type BrowserRuntimeStatus, type BrowserTool, type BrowserToolCall, type NativeConversationBackend, type SdkResult, type SpeechMessage } from './runtime'
import { parseNativeConnection, type NativeConnection } from './native-connection'
import { normalizeFrenchCalculation } from '@/lib/frenchNumbers'
import { nativeSpeechSettings } from './voice-prompts'

import { nativeOmniQ8 } from './config'

const MODEL = 'LFM3-Omni-2B-Q4_K_M'

export class NativeConversationRuntime implements NativeConversationBackend {
  private status: BrowserRuntimeStatus = { phase: 'idle', modelId: '', backend: 'native' }
  private listeners = new Set<() => void>()
  private operation?: AbortController
  private loaded = false
  private model = MODEL
  constructor(private connection: NativeConnection) {}
  snapshot = () => this.status
  subscribe = (listener: () => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  private publish(status: BrowserRuntimeStatus) { this.status = { ...status, backend: 'native' }; this.listeners.forEach(listener => listener()) }
  modelId() { return this.model }
  supports(id: string) { return id === this.model }
  loadedId() { return this.loaded ? this.model : '' }
  cancelLoad() { this.operation?.abort() }

  private async request(path: string, options: RequestInit = {}) {
    const response = await fetch(this.connection.endpoint + path, { ...options, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
      headers: { Authorization: `Bearer ${this.connection.token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) } })
    if (!response.ok) {
      await response.body?.cancel()
      throw new Error('La passerelle de conversation a refusé la demande.')
    }
    return response
  }
  async health() {
    const health = await (await this.request('/v1/health', { signal: AbortSignal.timeout(5000) })).json()
    if (health.version !== '1.0.1' || ![MODEL, nativeOmniQ8].includes(health.model) || health.contextTokens !== 32768 || !/^[a-f0-9]{64}$/.test(health.workerSha256) || !['text', 'speech', 'transcription', 'web-tools'].every(item => health.capabilities?.includes(item))) throw new Error('Passerelle de conversation incompatible.')
    this.model = health.model
    return health
  }
  async load(id: string) {
    if (!this.supports(id)) throw new Error('Modèle natif non configuré.')
    if (this.loaded) return
    if (this.operation) throw new Error('Une opération native est déjà en cours.')
    const controller = new AbortController(); this.operation = controller
    this.publish({ phase: 'loading', modelId: id })
    try { await this.request('/v1/load', { method: 'POST', signal: controller.signal }); this.loaded = true; this.publish({ phase: 'ready', modelId: id }) }
    catch (error) { this.publish({ phase: 'error', modelId: id, error: 'Chargement natif interrompu.' }); throw error }
    finally { if (this.operation === controller) this.operation = undefined }
  }
  private async run<T>(body: Record<string, unknown>, signal: AbortSignal | undefined, task: (response: Response) => Promise<T>): Promise<T> {
    if (this.operation) throw new Error('Une opération native est déjà en cours.')
    signal?.throwIfAborted()
    const controller = new AbortController(); this.operation = controller
    const id = crypto.randomUUID()
    const cancel = () => {
      if (controller.signal.aborted) return
      controller.abort()
      void this.request(`/v1/jobs/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(3000) }).catch(() => {})
    }
    const timer = setTimeout(cancel, 180000)
    signal?.addEventListener('abort', cancel, { once: true })
    this.publish({ phase: 'generating', modelId: this.model })
    try {
      const response = await this.request('/v1/conversation', { method: 'POST', body: JSON.stringify({ id, ...body }), signal: controller.signal })
      return await task(response)
    } catch (error) {
      cancel()
      throw error
    } finally {
      clearTimeout(timer); signal?.removeEventListener('abort', cancel)
      if (this.operation === controller) this.operation = undefined
      this.publish({ ...this.status, phase: 'ready' })
    }
  }
  async *generate(id: string, messages: BrowserMessage[], signal?: AbortSignal, maxTokens = 512, tools?: BrowserTool[]): AsyncGenerator<{ text?: string; result?: SdkResult }> {
    const allowed = new Set(['web_search', 'web_fetch'])
    if (tools?.some(tool => !allowed.has(tool.function.name)) || messages.some(message => message.tool_calls?.some(call => !allowed.has(call.function.name)))) throw new Error('Outil de recherche natif non pris en charge.')
    await this.load(id)
    const started = performance.now()
    let firstTextMs: number | undefined
    let text = ''; let usage: SdkResult['usage']; let timings: SdkResult['timings']; let reason = 'stop'
    const calls = new Map<number, { id: string; name: string; arguments: string }>()
    const pending: Array<{ text?: string; result?: SdkResult }> = []
    let wake: (() => void) | undefined
    let done = false; let failure: unknown
    const wireMessages = messages.map(message => ({
      ...message,
      content: id === nativeOmniQ8 && message.role === 'user' ? normalizeFrenchCalculation(message.content) : message.content,
      ...(message.tool_calls ? { tool_calls: message.tool_calls.map(call => ({ ...call, function: { ...call.function, arguments: JSON.stringify(call.function.arguments) } })) } : {}),
    }))
    const producer = this.run({ mode: 'text', messages: wireMessages, ...(tools?.length ? { tools } : {}), maxTokens: Math.min(1024, Math.max(1, maxTokens)) }, signal, async response => {
      const reader = response.body?.getReader()
      if (!reader) throw new Error('Réponse native vide.')
      const decoder = new TextDecoder(); let buffer = ''; let terminal = false
      try {
        while (true) {
          const chunk = await reader.read()
          if (chunk.done) break
          buffer += decoder.decode(chunk.value, { stream: true })
          let boundary
          while ((boundary = buffer.indexOf('\n')) >= 0) {
            const line = buffer.slice(0, boundary).trim(); buffer = buffer.slice(boundary + 1)
            if (!line.startsWith('data:')) continue
            const data = line.slice(5).trim()
            if (data === '[DONE]') { terminal = true; continue }
            const event = JSON.parse(data)
            if (event.error) throw new Error('Erreur du moteur natif.')
            const choice = event.choices?.[0]
            if (choice?.delta?.tool_calls) for (const part of choice.delta.tool_calls) {
              if (!Number.isSafeInteger(part.index) || part.index < 0 || part.index > 7) throw new Error('Appel natif invalide.')
              const call = calls.get(part.index) ?? { id: '', name: '', arguments: '' }
              if (typeof part.id === 'string') call.id = part.id
              if (typeof part.function?.name === 'string') call.name = part.function.name
              if (typeof part.function?.arguments === 'string') call.arguments += part.function.arguments
              if (call.arguments.length > 32000) throw new Error('Arguments natifs trop volumineux.')
              calls.set(part.index, call)
            }
            if (typeof choice?.delta?.content === 'string' && choice.delta.content) {
              firstTextMs ??= performance.now() - started
              text += choice.delta.content
              pending.push({ text: choice.delta.content }); wake?.()
            }
            if (event.usage) usage = { ...event.usage, ...(Number.isSafeInteger(event.usage.prompt_tokens_details?.cached_tokens) ? { cached_tokens: event.usage.prompt_tokens_details.cached_tokens } : {}) }
            if (choice?.finish_reason) reason = choice.finish_reason
            if (Number.isFinite(event.timings?.predicted_per_second)) timings = { tokens_per_second: event.timings.predicted_per_second }
          }
          if (buffer.length > 2 * 1024 * 1024) throw new Error('Réponse native trop volumineuse.')
        }
        if (!terminal) throw new Error('Réponse native interrompue.')
        this.publish({ phase: 'generating', modelId: id, lastGeneration: { firstTextMs, totalMs: performance.now() - started, completionTokens: usage?.completion_tokens, cachedTokens: usage?.cached_tokens, tokensPerSecond: timings?.tokens_per_second } })
        const toolCalls: BrowserToolCall[] = [...calls.values()].map(call => {
          const args = JSON.parse(call.arguments)
          if (!call.id || !allowed.has(call.name) || !tools?.some(tool => tool.function.name === call.name) || !args || typeof args !== 'object' || Array.isArray(args)) throw new Error('Appel de recherche natif invalide.')
          return { id: call.id, type: 'function', function: { name: call.name, arguments: args } }
        })
        pending.push({ result: { message: { role: 'assistant', content: text, ...(toolCalls.length ? { tool_calls: toolCalls } : {}) }, finish_reason: reason, usage, timings } })
      } finally { reader.releaseLock() }
    }).catch(error => { failure = error }).finally(() => { done = true; wake?.() })
    try {
      while (!done || pending.length) {
        if (pending.length) { yield pending.shift()!; continue }
        await new Promise<void>(resolve => { wake = resolve })
      }
      if (failure) throw failure
    } finally { this.operation?.abort(); await producer }
  }
  async speech(id: string, messages: SpeechMessage[], mode: 'text' | 'audio', signal: AbortSignal, onAudio?: (samples: Float32Array) => void) {
    await this.load(id)
    const user = messages.slice().reverse().find(message => message.role === 'user')
    const hint = messages.find(message => message.role === 'system')?.content
    const { lang, voice } = nativeSpeechSettings(hint)
    if (mode === 'audio') {
      if (typeof user?.content !== 'string') throw new Error('Texte vocal manquant.')
      return this.run({ mode: 'speech', input: user.content, lang, voice }, signal, async response => {
        const result = await response.json()
        if (result.error || result.engine !== 'native-audio' || result.format !== 'wav' || typeof result.audio !== 'string' || result.audio.length > 16000000) throw new Error('Synthèse native indisponible.')
        const bytes = Uint8Array.from(atob(result.audio), value => value.charCodeAt(0))
        const context = new OfflineAudioContext(1, 1, 24000)
        const buffer = await context.decodeAudioData(bytes.buffer)
        if (buffer.numberOfChannels !== 1 || !buffer.length || buffer.duration > 120) throw new Error('Audio natif invalide.')
        signal.throwIfAborted(); onAudio?.(buffer.getChannelData(0).slice())
        return ''
      })
    }
    if (!Array.isArray(user?.content) || user.content.length !== 1) throw new Error('Audio manquant.')
    const samples = user.content[0].audio
    if (!samples.length || samples.length > 16000 * 22 || samples.some(value => !Number.isFinite(value))) throw new Error('Audio invalide.')
    const pcm = new Uint8Array(samples.length * 2); const view = new DataView(pcm.buffer)
    samples.forEach((value, index) => view.setInt16(index * 2, Math.max(-32768, Math.min(32767, Math.round(value * 32768))), true))
    let binary = ''; for (let i = 0; i < pcm.length; i += 8192) binary += String.fromCharCode(...pcm.subarray(i, i + 8192))
    return this.run({ mode: 'transcription', audio: btoa(binary), lang }, signal, async response => {
      const result = await response.json()
      if (result.error || result.engine !== 'native-audio' || typeof result.text !== 'string') throw new Error('Transcription native indisponible.')
      return result.text.trim()
    })
  }
  async unload() {
    this.operation?.abort()
    const deadline = performance.now() + 5000
    while (this.operation && performance.now() < deadline) await new Promise(resolve => setTimeout(resolve, 20))
    if (this.operation) throw new Error('L’arrêt du moteur natif n’est pas terminé.')
    if (this.loaded) await this.request('/v1/unload', { method: 'POST', signal: AbortSignal.timeout(10000) })
    this.loaded = false; this.publish({ phase: 'idle', modelId: '' })
  }
}

export async function connectNativeConversation(file: File) {
  if (file.size > 8192) throw new Error('Fichier de connexion trop volumineux.')
  const backend = new NativeConversationRuntime(parseNativeConnection(JSON.parse(await file.text()), location.origin))
  await backend.health()
  await browserRuntime.setNativeBackend(backend)
  return backend.modelId()
}
export async function disconnectNativeConversation() { await browserRuntime.setNativeBackend(undefined) }
