import { spokenLinks } from './spokenLinks'

export type VoicePhase = 'idle' | 'preparing' | 'listening' | 'transcribing' | 'review' | 'waiting' | 'speaking'
export type VoiceRecognition = string | { text: string; needsReview: true }
function cancelled(error: unknown) {
  return error === 'cancelled' ||
    (error instanceof Error && (error.message === 'cancelled' || error.name === 'AbortError')) ||
    (typeof DOMException !== 'undefined' && error instanceof DOMException && error.name === 'AbortError')
}
export interface VoiceBackend {
  listen(signal: AbortSignal, transcript?: (text: string) => void,
    phase?: (phase: 'preparing' | 'listening' | 'transcribing') => void): Promise<VoiceRecognition>
  speak(text: string, signal: AbortSignal): Promise<void>
  stop(): void
  setInputLanguage?(text: string): void
}
export interface VoiceBinding {
  scope: string
  isNew: boolean
  busy: boolean
  failed: boolean
  canStart: boolean
  replyId: string
  reply: string
  replyComplete?: boolean
  lastUserText: string
  lastUserAt?: number
  knownScopes?: readonly string[]
  context?: string
  submit(text: string): Promise<unknown>
  transcribe?(text: string): void
  recover?(text: string): void
  error(stage?: VoicePhase): void
}

export function spokenText(text: string): string {
  return spokenLinks(text
    .replace(/<(think|analysis)>[\s\S]*?<\/\1>/gi, '')
    .replace(/<(think|analysis)>[\s\S]*$/gi, '')
    .replace(/```[\s\S]*?```/g, '')
  )
    // RenderMarkdown displays these as favicon chips, not spoken text. Keeping
    // the hidden URL also prevents numeric-only speech normalization.
    .replace(/\[\[cite:\s*[^\]\r\n]*(?:\]\]|$)/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/[*_`#~]/g, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
}

// One in-memory session per webview. Survives the home -> newly created thread
// remount, but never persists transcripts or starts with the application.
export class VoiceConversation {
  private phase: VoicePhase = 'idle'
  private subscribers = new Set<() => void>()
  private binding?: VoiceBinding
  private scope = ''
  private adoptNewThread = false
  private submitted = ''
  private baseline = ''
  private backend?: VoiceBackend
  private abort?: AbortController
  private generation = 0
  private replyTimer?: ReturnType<typeof setTimeout>
  private detachTimer?: ReturnType<typeof setTimeout>
  private quietSince = 0
  private seenBusy = false
  private knownScopes = new Set<string>()
  private submittedAt = 0
  private failedAtSubmit = false
  private readOnly = false
  private allowSameReply = false
  private outputEnabled = true
  setOutputEnabled(enabled: boolean) {
    this.outputEnabled = enabled
    if (!enabled && this.phase === 'speaking') {
      // Invalidate the old playback completion before resuming capture.
      this.interruptCapture()
      if (this.readOnly) this.stop()
      else void this.listen(this.generation)
    }
  }
  private autoRead?: {createBackend: () => VoiceBackend; binding: VoiceBinding}

  configureAutoRead(config?: {createBackend: () => VoiceBackend; binding: VoiceBinding}) {
    this.autoRead = config
  }

  subscribe = (listener: () => void) => {
    this.subscribers.add(listener)
    return () => { this.subscribers.delete(listener) }
  }
  snapshot = () => this.phase
  private setPhase(phase: VoicePhase) {
    if (this.phase === phase) return
    this.phase = phase
    this.subscribers.forEach(listener => listener())
  }
  start(backend: VoiceBackend, binding: VoiceBinding) {
    if (this.open(backend,binding,false)) void this.listen(this.generation)
  }
  private open(backend: VoiceBackend, binding: VoiceBinding, readOnly: boolean) {
    this.stop()
    if (!binding.canStart || binding.busy) { binding.error(); return false }
    this.readOnly = readOnly
    this.allowSameReply = false
    this.binding = binding
    this.scope = binding.scope
    this.adoptNewThread = binding.isNew
    this.knownScopes = new Set(binding.knownScopes)
    this.backend = backend
    this.abort = new AbortController()
    this.quietSince = Date.now()
    return true
  }
  stop = () => {
    this.generation++
    clearTimeout(this.replyTimer)
    clearTimeout(this.detachTimer)
    this.abort?.abort()
    this.backend?.stop()
    this.abort = undefined
    this.backend = undefined
    this.binding = undefined
    this.submitted = ''
    this.baseline = ''
    this.scope = ''
    this.knownScopes.clear()
    this.setPhase('idle')
  }
  private interruptCapture() {
    this.generation++
    this.abort?.abort()
    this.backend?.stop()
    this.abort = new AbortController()
  }
  edit = () => {
    if (this.phase === 'idle' || this.phase === 'review') return
    if (this.phase !== 'listening') { this.stop(); return }
    // Editing ends capture, but Send can continue the existing voice session.
    this.interruptCapture()
    this.setPhase('review')
  }
  manualSubmit(text: string) {
    if (!text.trim()) return
    if (this.phase === 'idle' && this.autoRead) {
      const {createBackend,binding}=this.autoRead
      if (binding.busy || !binding.canStart) return
      try {
        if (this.open(createBackend(),binding,true)) this.beginWaiting(text)
      } catch {this.stop();binding.error()}
      return
    }
    if ((this.phase !== 'review' && this.phase !== 'listening') || !text.trim()) return
    if (!this.binding || this.binding.busy) { this.stop(); return }
    this.interruptCapture()
    this.beginWaiting(text)
  }
  regenerate(scope: string) {
    const config = this.autoRead
    if (!config || config.binding.scope !== scope || !config.binding.canStart || config.binding.busy) return
    try {
      if (this.open(config.createBackend(), config.binding, true)) {
        this.allowSameReply = true
        this.beginWaiting(config.binding.lastUserText)
      }
    } catch { this.stop(); config.binding.error() }
  }
  private beginWaiting(text: string) {
    this.backend?.setInputLanguage?.(text)
    this.quietSince = Date.now()
    this.baseline = this.binding!.replyId
    this.seenBusy = false
    this.submitted = text
    this.submittedAt = Date.now()
    this.failedAtSubmit = this.binding!.failed
    this.setPhase('waiting')
    clearTimeout(this.replyTimer)
    const generation = this.generation
    this.replyTimer = setTimeout(() => { if (this.current(generation)) this.fail() }, 300_000)
  }
  detach() {
    if (this.phase === 'idle') return
    if (this.phase !== 'waiting') { this.stop(); return }
    // A new-thread send replaces the composer. No microphone is open here.
    clearTimeout(this.detachTimer)
    this.detachTimer = setTimeout(this.stop, 2000)
  }
  observe(binding: VoiceBinding) {
    if (this.phase === 'idle') return
    if (binding.context !== this.binding?.context) { this.stop(); return }
    if (binding.scope !== this.scope) {
      if (this.phase === 'waiting' && this.adoptNewThread &&
          !binding.isNew && !this.knownScopes.has(binding.scope) &&
          (binding.lastUserAt ?? 0) + 999 >= this.submittedAt && binding.lastUserText === this.submitted) {
        this.scope = binding.scope
        this.adoptNewThread = false
      } else {
        if (this.adoptNewThread && this.phase === 'waiting') { this.detach(); return }
        this.stop()
        return
      }
    }
    clearTimeout(this.detachTimer)
    this.binding = binding
    if (!binding.failed) this.failedAtSubmit = false
    if (binding.failed && this.phase === 'waiting' &&
        (!this.failedAtSubmit || this.seenBusy || binding.replyId !== this.baseline)) { this.fail(); return }
    if ((this.phase === 'listening' || this.phase === 'review') && (!binding.canStart || binding.busy)) { this.stop(); return }
    if (this.phase === 'waiting' && binding.busy) this.seenBusy = true
    if (this.phase === 'waiting' && !binding.busy &&
        binding.replyComplete !== false && binding.replyId && binding.reply.trim() &&
        (binding.replyId !== this.baseline || (this.allowSameReply && this.seenBusy))) {
      clearTimeout(this.replyTimer)
      void this.speak(binding.reply, this.generation)
    }
  }
  private current(generation: number) {
    return generation === this.generation && Boolean(this.backend && this.abort && !this.abort.signal.aborted)
  }
  private fail() {
    const stage = this.phase
    const report = this.binding?.error
    const recover = this.binding?.recover
    const submitted = this.submitted
    this.stop()
    if (submitted) recover?.(submitted)
    report?.(stage)
  }
  private async listen(generation: number): Promise<void> {
    if (!this.current(generation)) return
    if (!this.binding?.canStart || this.binding.busy) { this.stop(); return }
    this.setPhase('listening')
    try {
      const result = await this.backend!.listen(this.abort!.signal, partial => {
        if (this.current(generation) && this.phase === 'listening') this.binding?.transcribe?.(partial)
      }, phase => {
        if (this.current(generation)) this.setPhase(phase)
      })
      if (!this.current(generation)) return
      if (typeof result !== 'string') {
        if (result.text.trim()) this.binding?.transcribe?.(result.text.trim())
        this.setPhase('review')
        return
      }
      const text = result.trim()
      if (!text) {
        if (Date.now() - this.quietSince > 120_000) { this.stop(); return }
        // Empty/no-speech results must not create turns or a tight restart loop.
        await new Promise(resolve => setTimeout(resolve, 400))
        if (this.current(generation)) void this.listen(generation)
        return
      }
      this.beginWaiting(text)
      this.binding?.transcribe?.(text)
      // No microphone is open while the model runs or Novera reads its reply.
      await this.binding!.submit(text)
    } catch (error) {
      if (this.current(generation)) {
        if (cancelled(error)) this.stop()
        else this.fail()
      }
    }
  }
  private async speak(reply: string, generation: number) {
    if (!this.current(generation)) return
    this.setPhase('speaking')
    try {
      const text = spokenText(reply)
      if (text && this.outputEnabled) await this.backend!.speak(text, this.abort!.signal)
      if (this.current(generation)) {
        this.quietSince = Date.now()
        if (this.readOnly) this.stop()
        else void this.listen(generation)
      }
    } catch (error) {
      if (this.current(generation)) {
        if (cancelled(error)) this.stop()
        else this.fail()
      }
    }
  }
}

export const voiceConversation = new VoiceConversation()
