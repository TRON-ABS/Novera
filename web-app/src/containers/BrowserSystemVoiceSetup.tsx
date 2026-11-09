import { useEffect, useRef, useState } from 'react'
import { useGeneralSetting } from '@/hooks/useGeneralSetting'
import { useBrowserSystemVoices } from '@/hooks/useBrowserSystemVoices'
import { browserPreviewEnabled } from '@/services/browser-preview/config'
import { createSystemSpeechBackend, localSystemVoice } from '@/lib/systemSpeech'
import { voiceLocale } from '@/lib/voicePlatform'
import type { VoiceBackend } from '@/lib/voiceConversation'

export function BrowserSystemVoiceSetup() {
  const browser = browserPreviewEnabled()
  const voices = useBrowserSystemVoices(browser)
  const mode = useGeneralSetting(state => state.webVoiceOutput)
  const uri = useGeneralSetting(state => state.webSystemVoiceURI)
  const language = useGeneralSetting(state => state.currentLanguage)
  const setMode = useGeneralSetting(state => state.setWebVoiceOutput)
  const setVoice = useGeneralSetting(state => state.setWebSystemVoiceURI)
  const [status, setStatus] = useState('')
  const active = useRef<VoiceBackend | undefined>(undefined)
  useEffect(() => () => { const backend = active.current; active.current = undefined; backend?.stop() }, [])
  useEffect(() => { const backend = active.current; active.current = undefined; backend?.stop() }, [mode, uri, language])
  if (!browser) return null
  const locale = voiceLocale(language)
  return <div className="border-t px-4 py-3 space-y-2">
    <label className="block text-sm">Lecture des réponses Web
      <select aria-label="Lecture des réponses Web" className="bg-secondary border rounded-md px-3 py-2 ml-2 max-w-full" value={mode === 'system' ? 'system' : 'model'} onChange={event => { setStatus(''); setMode(event.target.value === 'system' ? 'system' : 'model') }}>
        <option value="model">Voix du modèle</option><option value="system">Voix système locale</option>
      </select>
    </label>
    {mode === 'system' && <>
      <label className="block text-sm">Voix système
        <select aria-label="Voix système locale" className="bg-secondary border rounded-md px-3 py-2 ml-2 max-w-full" value={uri ?? ''} onChange={event => { setStatus(''); setVoice(event.target.value) }}>
          <option value="">Automatique · langue de la réponse</option>
          {voices.map(voice => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} · {voice.lang}</option>)}
        </select>
      </label>
      <p className="text-xs text-muted-foreground">Seules les voix déclarées locales par le navigateur sont proposées. La disponibilité dépend des voix installées sur cet appareil. Ce choix concerne la lecture des réponses.</p>
      {!localSystemVoice(locale, uri, voices) && <p role="status">Aucune voix système locale disponible pour cette sélection.</p>}
      <button type="button" className="underline text-sm" disabled={!localSystemVoice(locale, uri, voices)} onClick={async () => {
        active.current?.stop()
        const backend = createSystemSpeechBackend(locale, uri)
        active.current = backend; setStatus('Lecture en cours…')
        try { await backend.speak('Bonjour. Dix-sept plus vingt-cinq font quarante-deux.', new AbortController().signal); if (active.current === backend) setStatus('Lecture terminée.') }
        catch { if (active.current === backend) setStatus('Lecture interrompue ou voix indisponible.') }
      }}>Tester la voix système</button>
      <button type="button" className="underline text-sm ml-3" onClick={() => active.current?.stop()}>Arrêter la lecture</button>
      {status && <p role="status">{status}</p>}
    </>}
  </div>
}
