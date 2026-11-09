import { useState } from 'react'
import { useCreation } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { connectNativeImageBridge, disconnectNativeImageBridge, NATIVE_IMAGE_MODEL, NATIVE_IMAGE_PROVIDER, useNativeImageBridge } from '@/services/browser-preview/native-image-bridge'

export function NativeImageBridgeSetup({ scope, disabled }: { scope: string; disabled: boolean }) {
  const health = useNativeImageBridge(state => state.health)
  const [error, setError] = useState('')
  const [connecting, setConnecting] = useState(false)
  const upscale = useImageUpscale()
  return <fieldset className="rounded-md border border-border p-3 space-y-2" disabled={disabled || connecting}>
    <legend className="px-1 font-medium">Moteur natif local</legend>
    <p className="text-sm text-muted-foreground">Lancez la passerelle Novera sur cet ordinateur, puis importez son fichier de connexion. Le moteur et les modèles restent sur cet appareil. La connexion vaut pour cette session.</p>
    <label className="block text-sm">Fichier de connexion locale
      <input className="block w-full mt-1" type="file" accept=".json,application/json" onChange={async event => {
        const file = event.target.files?.[0]
        if (!file) return
        setError(''); setConnecting(true)
        try {
          await connectNativeImageBridge(file)
          useCreation.getState().setSettings({ steps: 4, generationCount: 1 })
          useCreation.getState().setSelection(scope, 'image', { provider: NATIVE_IMAGE_PROVIDER, id: NATIVE_IMAGE_MODEL })
          useCreation.getState().setMode(scope, 'image')
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
        finally { setConnecting(false) }
      }} />
    </label>
    {health && <>
      <p role="status" className="text-sm">Moteur natif connecté · FLUX.2 Klein Q4 · Novera {health.version}</p>
      <label className="flex gap-2 items-center text-sm"><input type="checkbox" disabled={disabled || !health.upscaleX2} checked={upscale.enabled && upscale.factor === 2} onChange={event => { upscale.setFactor(2); upscale.setEnabled(event.target.checked) }} />Real-ESRGAN ×2</label>
      <button type="button" className="text-sm underline" onClick={() => { disconnectNativeImageBridge(); setError('') }}>Déconnecter le moteur natif</button>
    </>}
    {connecting && <p role="status" className="text-sm">Connexion au moteur local…</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </fieldset>
}
