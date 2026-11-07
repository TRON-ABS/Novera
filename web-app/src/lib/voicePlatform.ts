import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { isPlatformTauri } from '@/lib/platform/utils'
import type { VoiceBackend } from './voiceConversation'
import { replyLanguage } from './replyLanguage'
import { spokenMath } from './spokenMath'
import { frenchNumbers } from './frenchNumbers'

interface LocalRecognition {
  processLocally: boolean
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal?: boolean }> }) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error: string }) => void) | null
  start(): void
  abort(): void
}
interface RecognitionConstructor {
  new(): LocalRecognition
  prototype: LocalRecognition
  available?: (options: { langs: string[]; processLocally: boolean }) => Promise<string>
}
type SpeechWindow = Window & {
  SpeechRecognition?: RecognitionConstructor
  webkitSpeechRecognition?: RecognitionConstructor
}

export const nativeWindowsVoice = () => isPlatformTauri() && /Windows/i.test(navigator.userAgent)
function recognitionConstructor() {
  const surface = window as SpeechWindow
  return surface.SpeechRecognition ?? surface.webkitSpeechRecognition
}
export function voiceSupported() {
  if (nativeWindowsVoice()) return true
  // Native hosts need an explicit speech adapter and OS permission wiring.
  // Do not enable a partial WebKit/WebView API as an unverified native adapter.
  if (isPlatformTauri()) return false
  const Constructor = recognitionConstructor()
  return Boolean(Constructor && 'processLocally' in Constructor.prototype &&
    Constructor.available && window.speechSynthesis)
}

// Locale aliases used by Novera's catalogs are not all BCP47 language tags.
export function voiceLocale(language: string) {
  const aliases: Record<string, string> = { vn: 'vi', uzn: 'uz', pnb: 'pa-Arab', gaz: 'om', azb: 'az-Arab', cmn: 'zh-CN' }
  const locale = aliases[language] ?? language
  try { return Intl.getCanonicalLocales(locale)[0] ?? navigator.language } catch { return navigator.language }
}

let sessionCounter = 0
export function createVoiceBackend(locale: string): VoiceBackend {
  if (!voiceSupported()) throw new Error('unavailable')
  if (nativeWindowsVoice()) {
    const session = `voice-${Date.now().toString(36)}-${++sessionCounter}`
    let turn = 0
    let currentSession = session
    const run = async (operation: 'listen' | 'speak', text: string, signal: AbortSignal, captureSession?: string) => {
      if (signal.aborted) throw new Error('cancelled')
      currentSession = captureSession ?? `${session}-${++turn}`
      const operationSession = currentSession
      const cancel = () => { void invoke('voice_cancel', {session:operationSession}).catch(()=>{}) }
      signal.addEventListener('abort',cancel,{once:true})
      try {
        const result = await invoke<{ status: string; text: string }>('voice_run', { operation, locale, session: operationSession, text })
        if (signal.aborted) throw new Error('cancelled')
        return result
      } finally { signal.removeEventListener('abort',cancel) }
    }
    return {
      setInputLanguage: text => {locale=voiceLocale(replyLanguage(locale,[text]))},
      listen: async (signal, transcript) => {
        if (signal.aborted) throw new Error('cancelled')
        const listenSession = currentSession = `${session}-${++turn}`
        let closed = false
        const unlisten = await listen<{ session: string; text: string }>('novera-voice-transcript', event => {
          if (!closed && event.payload.session === listenSession && !signal.aborted) transcript?.(event.payload.text)
        })
        try {
          const result = await run('listen', '', signal, listenSession)
          // Compatibility with the previous embedded helper: uncertainty is
          // editable dictation, not a missing/failed speech engine.
          if (result.status === 'uncertain') return { text: result.text, needsReview: true as const }
          return result.text
        } finally { closed = true; unlisten() }
      },
      speak: async (text, signal) => {
        // Keep normal replies in one native synthesizer session. Bound very
        // long replies below the native 64 KiB payload / 600 second deadline.
        for (const chunk of frenchNumbers(spokenMath(text,locale),locale).match(/.{1,4500}(?:\s|$)|\S{1,4500}/gsu) ?? []) {
          const result = await run('speak', chunk, signal)
          if (signal.aborted) throw new Error('cancelled')
          if (result.status !== 'done') throw new Error('unavailable')
        }
      },
      stop: () => { void invoke('voice_cancel', { session: currentSession }).catch(() => {}) },
    }
  }

  const Constructor = recognitionConstructor()!
  let recognition: LocalRecognition | undefined
  return {
    setInputLanguage: text => {locale=voiceLocale(replyLanguage(locale,[text]))},
    listen: async (signal, transcript) => {
      // Never fall back to a browser/vendor cloud recognizer or silently install
      // a language pack. Native Windows also uses installed, local OS engines.
      if (await Constructor.available!({ langs: [locale], processLocally: true }) !== 'available') {
        throw new Error('unavailable')
      }
      if (signal.aborted) throw new Error('cancelled')
      return new Promise<string>((resolve, reject) => {
        const current = new Constructor()
        recognition = current
        current.processLocally = true
        current.lang = locale
        current.continuous = false
        current.interimResults = true
        let text = ''
        const cleanup = () => {
          clearTimeout(timeout)
          signal.removeEventListener('abort', cancel)
          current.onresult = current.onend = current.onerror = null
          if (recognition === current) recognition = undefined
        }
        const cancel = () => { cleanup(); current.abort(); reject(new Error('cancelled')) }
        const timeout = setTimeout(() => { cleanup(); current.abort(); resolve('') }, 30_000)
        signal.addEventListener('abort', cancel, { once: true })
        current.onresult = event => {
          const results = Array.from(event.results)
          text = results.filter(result => result.isFinal !== false).map(result => result[0]?.transcript ?? '').join(' ')
          transcript?.(results.map(result => result[0]?.transcript ?? '').join(' '))
        }
        current.onend = () => { cleanup(); resolve(text) }
        current.onerror = event => {
          cleanup(); current.abort()
          if (event.error === 'no-speech') resolve('')
          else reject(new Error('unavailable'))
        }
        try { current.start() } catch { cleanup(); reject(new Error('unavailable')) }
      })
    },
    speak: async (text, signal) => {
      const voices = window.speechSynthesis.getVoices().filter(voice => voice.localService)
      const voice = voices.find(voice => voice.lang.toLowerCase() === locale.toLowerCase()) ??
        voices.find(voice => voice.lang.split('-')[0] === locale.split('-')[0])
      if (!voice) throw new Error('unavailable')
      // Bound utterances to avoid long-utterance stalls in browser engines.
      const chunks = frenchNumbers(spokenMath(text,locale),locale).match(/.{1,220}(?:\s|$)|\S{1,220}/gsu) ?? []
      let playback: Promise<void> | undefined
      try {
        for (const chunk of chunks) {
          if (signal.aborted) throw new Error('cancelled')
          const previous = playback
          playback = new Promise<void>((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(chunk)
            utterance.lang = locale
            utterance.voice = voice
            const cleanup = () => { clearTimeout(timeout); signal.removeEventListener('abort', cancel) }
            const cancel = () => { cleanup(); window.speechSynthesis.cancel(); reject(new Error('cancelled')) }
            const unavailable = () => { cleanup(); window.speechSynthesis.cancel(); reject(new Error('unavailable')) }
            let timeout = setTimeout(unavailable, 30_000)
            utterance.onstart = () => { clearTimeout(timeout); timeout = setTimeout(unavailable, 30_000) }
            signal.addEventListener('abort', cancel, { once: true })
            utterance.onend = () => { cleanup(); resolve() }
            utterance.onerror = () => { cleanup(); reject(new Error('unavailable')) }
            window.speechSynthesis.speak(utterance)
          })
          void playback.catch(()=>{})
          // Queue one utterance ahead in the system engine; avoid a JS round
          // trip between chunks without queuing an unbounded reply.
          if (previous) await previous
        }
        await playback
      } catch(error) { window.speechSynthesis.cancel(); throw error }
    },
    stop: () => { recognition?.abort(); window.speechSynthesis.cancel() },
  }
}
