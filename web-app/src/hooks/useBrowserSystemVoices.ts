import { useEffect, useState } from 'react'
import { localSystemVoices } from '@/lib/systemSpeech'

export function useBrowserSystemVoices(enabled: boolean) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (!enabled || !window.speechSynthesis) return
    const synth = window.speechSynthesis
    const refresh = () => setVoices(localSystemVoices())
    refresh()
    synth.addEventListener?.('voiceschanged', refresh)
    return () => synth.removeEventListener?.('voiceschanged', refresh)
  }, [enabled])
  return voices
}
