import type { VoiceBackend } from './voiceConversation'
import { frenchNumbers } from './frenchNumbers'
import { spokenMath } from './spokenMath'
import { replyLanguage } from './replyLanguage'

export function localSystemVoices(): SpeechSynthesisVoice[] {
  try { return typeof window === 'undefined' ? [] : (window.speechSynthesis?.getVoices() ?? []).filter(voice => voice.localService) }
  catch { return [] }
}
export function localSystemVoice(locale: string, uri = '', voices = localSystemVoices()) {
  if (uri) return voices.find(voice => voice.voiceURI === uri && voice.localService)
  const language = locale.toLowerCase().replaceAll('_', '-')
  return voices.find(voice => voice.lang.toLowerCase() === language) ?? voices.find(voice => voice.lang.toLowerCase().split('-')[0] === language.split('-')[0])
}

// Output can be used even when the browser has no local speech recognizer.
// The optional input backend remains responsible for its own microphone path.
export function createSystemSpeechBackend(locale: string, uri = '', input?: VoiceBackend): VoiceBackend {
  let operation: AbortController | undefined
  return {
    setInputLanguage: text => { locale = replyLanguage(locale, [text]); input?.setInputLanguage?.(text) },
    listen: (signal, transcript, phase) => input ? input.listen(signal, transcript, phase) : Promise.reject(new Error('unavailable')),
    speak: async (text, signal) => {
      signal.throwIfAborted()
      const synth = window.speechSynthesis
      const voice = localSystemVoice(locale, uri)
      if (!synth || !voice || !voice.localService) throw new Error('unavailable')
      operation?.abort()
      const controller = new AbortController(); operation = controller
      const cancel = () => controller.abort()
      const stop = () => synth.cancel()
      signal.addEventListener('abort', cancel, { once: true })
      controller.signal.addEventListener('abort', stop, { once: true })
      const retained = new Set<SpeechSynthesisUtterance>()
      try {
        const chunks = frenchNumbers(spokenMath(text, locale), locale).match(/.{1,220}(?:\s|$)|\S{1,220}/gsu) ?? []
        for (const chunk of chunks) {
          controller.signal.throwIfAborted()
          await new Promise<void>((resolve, reject) => {
            const utterance = new SpeechSynthesisUtterance(chunk)
            retained.add(utterance)
            utterance.voice = voice; utterance.lang = voice.lang
            const cleanup = () => { clearTimeout(timer); retained.delete(utterance); controller.signal.removeEventListener('abort', aborted); utterance.onstart = utterance.onend = utterance.onerror = null }
            const aborted = () => { cleanup(); reject(new Error('cancelled')) }
            let timer = setTimeout(() => { cleanup(); synth.cancel(); reject(new Error('unavailable')) }, 30000)
            controller.signal.addEventListener('abort', aborted, { once: true })
            utterance.onstart = () => { clearTimeout(timer); timer = setTimeout(() => { cleanup(); synth.cancel(); reject(new Error('unavailable')) }, 30000) }
            utterance.onend = () => { cleanup(); resolve() }
            utterance.onerror = () => { cleanup(); reject(new Error('unavailable')) }
            try { synth.speak(utterance) } catch (error) { cleanup(); reject(error) }
          })
        }
      } finally {
        signal.removeEventListener('abort', cancel)
        controller.signal.removeEventListener('abort', stop)
        if (operation === controller) operation = undefined
      }
    },
    stop: () => { operation?.abort(); input?.stop() },
  }
}
