import { useState } from 'react'
import { connectNativeConversation, disconnectNativeConversation } from '@/services/browser-preview/native-conversation'
import { useModelProvider } from '@/hooks/useModelProvider'

export function NativeConversationSetup({ disabled }: { disabled: boolean }) {
  const [connected, setConnected] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState('')
  return <details className="mt-1">
    <summary className="cursor-pointer">Accélération locale facultative · texte et voix</summary>
    <p>Le mode navigateur fonctionne sans Novera Desktop. Pour utiliser le moteur natif, lancez la passerelle sur cet ordinateur puis importez son fichier de connexion. Le programme natif est requis uniquement pour ce mode. Les modèles et la conversation restent sur cet appareil.</p>
    <label>Connexion au moteur natif LFM3-Omni
      <input type="file" accept=".json,application/json" disabled={disabled || pending} onChange={async event => {
        const file = event.target.files?.[0]
        if (!file) return
        setPending(true); setError('')
        try {
          const model = await connectNativeConversation(file)
          useModelProvider.getState().selectModelProvider('llamacpp', model)
          setConnected(true)
        }
        catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
        finally { setPending(false); event.target.value = '' }
      }} />
    </label>
    {connected && <p role="status">Moteur natif local sélectionné pour LFM3-Omni · connexion limitée à cette session.
      <button className="underline ml-2" disabled={disabled || pending} onClick={async () => {
        setPending(true); setError('')
        try { await disconnectNativeConversation(); setConnected(false) }
        catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
        finally { setPending(false) }
      }}>Revenir au moteur navigateur</button>
    </p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </details>
}
