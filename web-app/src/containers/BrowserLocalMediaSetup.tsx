import { useState } from 'react'
import { BROWSER_IMAGE_MODEL, BROWSER_IMAGE_PROVIDER, browserLocalImagesEnabled, imageComponentNames, setBrowserImageFiles } from '@/services/browser-preview/local-media'
import { useCreation } from '@/hooks/useCreation'

export function BrowserLocalMediaSetup({ scope, disabled }: { scope: string; disabled: boolean }) {
  const [files, setFiles] = useState<Array<File | undefined>>([undefined, undefined, undefined])
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  if (!browserLocalImagesEnabled()) return null
  return <fieldset className="rounded-md border border-border p-3 space-y-2" disabled={disabled}>
    <legend className="px-1 font-medium">Image sur cet appareil · essai FLUX.2 Klein</legend>
    <p className="text-sm text-muted-foreground">Choisissez les trois fichiers Desktop. Ils restent sur cet appareil, pour cette session. Premier essai limité à 256 × 256 et 4 étapes, avec accélération GPU. La vitesse dépend de votre appareil. Musique et vidéo locales restent en préparation.</p>
    {imageComponentNames.map((name, index) => <label key={name} className="block text-xs break-all">{name}
      <input className="block w-full mt-1" type="file" accept={index === 2 ? '.safetensors' : '.gguf'} onChange={event => {
        setReady(false); setError('')
        const next = files.slice(); next[index] = event.target.files?.[0]; setFiles(next)
        if (!next.every(Boolean)) return
        try {
          setBrowserImageFiles(next as File[])
          useCreation.getState().setSelection(scope, 'image', { provider: BROWSER_IMAGE_PROVIDER, id: BROWSER_IMAGE_MODEL })
          setReady(true)
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
      }} />
    </label>)}
    {ready && <p role="status" className="text-sm">Modèle image sélectionné. Fermez ces réglages puis envoyez une demande en mode Image.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </fieldset>
}
