import type { VoiceBackend } from '@/lib/voiceConversation'
import { capturePcm } from '@/lib/omniVoice'
import { replyLanguage } from '@/lib/replyLanguage'
import { speechSegments } from '@/lib/omniSpeech'
import { spokenMath } from '@/lib/spokenMath'
import { frenchNumbers } from '@/lib/frenchNumbers'
import { browserRuntime, type BrowserRuntime } from './runtime'
import { omniAsrPrompt, omniTtsPrompt } from './voice-prompts'

let output: AudioContext | undefined
// Called directly from a microphone/speaker click, before asynchronous work.
export function unlockBrowserVoice() {
  try {
    output ??= new AudioContext()
    void output.resume().catch(() => {})
  } catch { /* The actual voice operation reports unavailable audio devices. */ }
}

export function browserVoiceSupported() {
  const gpu = (navigator as Navigator & { gpu?: { requestAdapter?: unknown } }).gpu
  return typeof gpu?.requestAdapter === 'function' && typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof window.AudioContext === 'function' && typeof window.AudioWorkletNode === 'function'
}

export function pcmSamples(pcm: Uint8Array) {
  if (pcm.byteLength % 2) throw new Error('unavailable')
  const view = new DataView(pcm.buffer, pcm.byteOffset, pcm.byteLength)
  return Float32Array.from({ length: pcm.byteLength / 2 }, (_, index) => view.getInt16(index * 2, true) / 32768)
}

export function createBrowserVoiceBackend(model: string, locale: string, runtime: BrowserRuntime = browserRuntime, voice: 'male' | 'female' = 'male'): VoiceBackend {
  let active: AbortController | undefined
  const sources = new Set<AudioBufferSourceNode>()
  const stopAudio = () => {
    for (const source of sources) { try { source.stop() } catch { /* Already ended. */ } source.disconnect() }
    sources.clear()
  }
  const run = async <T>(signal: AbortSignal, task: (signal: AbortSignal) => Promise<T>) => {
    signal.throwIfAborted()
    const controller = new AbortController()
    active = controller
    const cancel = () => { controller.abort(); stopAudio() }
    signal.addEventListener('abort', cancel, { once: true })
    // Request cancellation at the SDK's next boundary and release queued audio.
    const deadline = setTimeout(cancel, 180_000)
    try { return await task(controller.signal) }
    finally {
      clearTimeout(deadline)
      signal.removeEventListener('abort', cancel)
      stopAudio()
      if (active === controller) active = undefined
    }
  }
  return {
    setInputLanguage: text => { locale = replyLanguage(locale, [text]) },
    listen: (signal, _transcript, phase) => run(signal, async operation => {
      phase?.('preparing')
      await runtime.load(model)
      operation.throwIfAborted()
      const pcm = await capturePcm(operation, () => phase?.('listening'))
      operation.throwIfAborted()
      if (!pcm.length) return ''
      phase?.('transcribing')
      return (await runtime.speech(model, [
        { role: 'system', content: omniAsrPrompt(locale) },
        { role: 'user', content: [{ type: 'audio', audio: pcmSamples(pcm) }] },
      ], 'text', operation)).trim()
    }),
    speak: (text, signal) => run(signal, async operation => {
      output ??= new AudioContext()
      const context = output
      // A browser can require an explicit speaker click before automatic audio.
      if (context.state !== 'running') throw new Error('unavailable')
      let nextStart = context.currentTime
      let last: Promise<void> | undefined
      let received = false
      let audioSeconds = 0
      for (const segment of speechSegments(frenchNumbers(spokenMath(text, locale), locale))) {
        await runtime.speech(model, [
          { role: 'system', content: omniTtsPrompt(locale, voice) },
          { role: 'user', content: segment },
        ], 'audio', operation, samples => {
          if (!samples.length || samples.some(value => !Number.isFinite(value))) throw new Error('unavailable')
          received = true
          // The pinned Omni codec emits mono float samples at 24 kHz.
          const buffer = context.createBuffer(1, samples.length, 24000)
          audioSeconds += buffer.duration
          if (audioSeconds > 180) throw new Error('unavailable')
          buffer.copyToChannel(new Float32Array(samples), 0)
          const source = context.createBufferSource()
          source.buffer = buffer
          source.connect(context.destination)
          sources.add(source)
          last = new Promise<void>((resolve, reject) => {
            const cancel = () => { cleanup(); reject(new Error('cancelled')) }
            const cleanup = () => operation.removeEventListener('abort', cancel)
            operation.addEventListener('abort', cancel, { once: true })
            source.onended = () => { cleanup(); sources.delete(source); source.disconnect(); resolve() }
            source.start(Math.max(context.currentTime + 0.02, nextStart))
            nextStart = Math.max(context.currentTime + 0.02, nextStart) + buffer.duration
          })
          void last.catch(() => {})
        })
        await last
        operation.throwIfAborted()
      }
      if (!received) throw new Error('unavailable')
    }),
    stop: () => { active?.abort(); stopAudio() },
  }
}
