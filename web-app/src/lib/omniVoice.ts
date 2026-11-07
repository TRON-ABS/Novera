import type { VoiceBackend } from './voiceConversation'
import { nativeWindowsVoice } from './voicePlatform'
import { playOmniReply, type OmniVoice } from './omniSpeech'
import { VoiceUtterance } from './voiceUtterance'
import { fetch as fetchLocalEngine } from '@tauri-apps/plugin-http'
import { invoke } from '@tauri-apps/api/core'
import { replyLanguage } from './replyLanguage'

export interface OmniVoiceOptions {
  model: string
  voice?: OmniVoice
  prepare(signal: AbortSignal): Promise<{ port: number; api_key: string }>
}
export function isOmniVoiceModel(provider: string, id: string, name = '') {
  return provider === 'llamacpp' && /lfm3[-_\s]*(omni|audio)/i.test(`${id} ${name}`)
}
export function omniVoiceSupported() {
  return nativeWindowsVoice() && typeof navigator.mediaDevices?.getUserMedia === 'function' &&
    typeof window.AudioContext === 'function' && typeof window.AudioWorkletNode === 'function'
}

export async function capturePcm(signal: AbortSignal): Promise<Uint8Array> {
  if (signal.aborted) throw new Error('cancelled')
  let stream: MediaStream | undefined
  let context: AudioContext | undefined
  let source: MediaStreamAudioSourceNode | undefined
  let node: AudioWorkletNode | undefined
  let closed = false
  const cleanup = () => {
    if (closed) return
    closed = true
    stream?.getTracks().forEach(track => track.stop())
    if (node) { node.port.onmessage = null; node.disconnect() }
    source?.disconnect()
    if (context && context.state !== 'closed') void context.close().catch(() => {})
  }
  try {
    const requested = navigator.mediaDevices.getUserMedia({ video: false, audio: {
      channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true,
    } })
    // Permission prompts cannot be aborted. Any late grant is immediately closed.
    void requested.then(value => { if (closed || signal.aborted) value.getTracks().forEach(track => track.stop()) }, () => {})
    stream = await abortable(requested, signal)
    if (signal.aborted) throw new Error('cancelled')
    context = new AudioContext({sampleRate:16000})
    if (context.sampleRate !== 16000) throw new Error('unavailable')
    await abortable(context.audioWorklet.addModule('/audio/pcm-capture-worklet.js'), signal)
    if (signal.aborted) throw new Error('cancelled')
    source = context.createMediaStreamSource(stream)
    node = new AudioWorkletNode(context, 'novera-pcm-capture')
    source.connect(node); node.connect(context.destination)
    const utterance = new VoiceUtterance()
    return await new Promise<Uint8Array>((resolve, reject) => {
      const finish = (error?: Error) => {
        clearTimeout(timeout); signal.removeEventListener('abort', cancel)
        cleanup()
        if (error) reject(error); else resolve(utterance.pcm())
      }
      const cancel = () => finish(new Error('cancelled'))
      const timeout = setTimeout(() => finish(), 22_000)
      signal.addEventListener('abort', cancel, {once:true})
      node!.port.onmessage = event => {
        if (closed) return
        try { if (utterance.push(event.data.pcm, event.data.rms)) finish() }
        catch { finish(new Error('unavailable')) }
      }
      void context!.resume().catch(() => finish(new Error('unavailable')))
    })
  } finally { cleanup() }
}

async function abortable<T>(promise: Promise<T>, signal: AbortSignal): Promise<T> {
  if (signal.aborted) throw new Error('cancelled')
  return new Promise((resolve, reject) => {
    const cancel = () => reject(new Error('cancelled'))
    signal.addEventListener('abort', cancel, {once:true})
    promise.then(resolve, reject).finally(() => signal.removeEventListener('abort', cancel))
  })
}

export function pcmBase64(pcm: Uint8Array) {
  let text = ''
  for (let index = 0; index < pcm.length; index += 8192) text += String.fromCharCode(...pcm.subarray(index, index + 8192))
  return btoa(text)
}

export function createOmniVoiceBackend(locale: string, options: OmniVoiceOptions): VoiceBackend {
  let active: AbortController | undefined
  return {
    setInputLanguage: text => {locale=replyLanguage(locale,[text])},
    listen: async (signal, _transcript, phase) => {
      if (signal.aborted) throw new Error('cancelled')
      const operation = new AbortController()
      active = operation
      const cancel = () => operation.abort()
      signal.addEventListener('abort', cancel, {once:true})
      let deadline: ReturnType<typeof setTimeout> | undefined
      let expired = false
      let foregroundTimer: ReturnType<typeof setInterval> | undefined
      let checkingForeground = false
      let guardingForeground = true
      try {
        phase?.('preparing')
        const engine = await options.prepare(operation.signal)
        if (operation.signal.aborted) throw new Error('cancelled')
        if (!Number.isInteger(engine.port) || engine.port < 1 || engine.port > 65535 || !engine.api_key) throw new Error('unavailable')
        // WebView2 can keep hasFocus=true and hidden=false after minimization.
        // Ask Windows about this caller's real foreground root instead.
        const checkForeground = async () => {
          if (checkingForeground || operation.signal.aborted) return
          checkingForeground = true
          try {
            const foreground = await invoke<boolean>('voice_is_foreground')
            if (guardingForeground && !foreground) operation.abort()
          } catch { if (guardingForeground) operation.abort() }
          finally { checkingForeground = false }
        }
        await checkForeground()
        if (operation.signal.aborted) throw new Error('cancelled')
        foregroundTimer = setInterval(() => { void checkForeground() }, 100)
        phase?.('listening')
        const pcm = await capturePcm(operation.signal)
        if (operation.signal.aborted) throw new Error('cancelled')
        if (!pcm.length) return ''
        phase?.('transcribing')
        deadline = setTimeout(() => { expired = true; operation.abort() }, 95_000)
        const response = await fetchLocalEngine(`http://127.0.0.1:${engine.port}/v1/novera/audio/transcriptions`, {
          method:'POST', signal:operation.signal,
          headers:{'Content-Type':'application/json',Authorization:`Bearer ${engine.api_key}`},
          body:JSON.stringify({model:options.model,language:locale,sample_rate:16000,audio:pcmBase64(pcm)}),
        })
        const result = await response.json()
        if (operation.signal.aborted) throw new Error('cancelled')
        if (!response.ok || result.error || typeof result.text !== 'string' || result.text.length > 16384) throw new Error('unavailable')
        return result.text.trim()
      } catch (error) { if (expired) throw new Error('unavailable', {cause:error}); throw error }
      finally {
        guardingForeground = false
        clearTimeout(deadline); signal.removeEventListener('abort', cancel)
        clearInterval(foregroundTimer)
        if (active === operation) active = undefined
      }
    },
    speak: async (text, signal) => {
      const operation = new AbortController()
      active = operation
      const cancel = () => operation.abort()
      signal.addEventListener('abort', cancel, {once:true})
      try {
        if (signal.aborted) throw new Error('cancelled')
        await playOmniReply(text, locale, options.voice ?? 'male', operation.signal, options.prepare, options.model)
      } finally {
        signal.removeEventListener('abort', cancel)
        if (active === operation) active = undefined
      }
    },
    stop: () => { active?.abort() },
  }
}
