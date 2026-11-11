import { restoreBrowserModelImports, saveBrowserModelImport } from '@/services/browser-preview/model-imports'
import { useEffect, useState } from 'react'
import { BROWSER_IMAGE_MODEL, BROWSER_IMAGE_PROVIDER, browserLocalImagesEnabled, imageComponentNames, browserImageFiles, setBrowserImageFiles, setBrowserImageUpscaleFile, browserImageUpscaleReady } from '@/services/browser-preview/local-media'
import { useCreation } from '@/hooks/useCreation'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { NativeImageBridgeSetup } from './NativeImageBridgeSetup'

export function BrowserLocalMediaSetup({ scope, disabled }: { scope: string; disabled: boolean }) {
  const [files, setFiles] = useState<Array<File | undefined>>([undefined, undefined, undefined])
  const [error, setError] = useState('')
  const [ready, setReady] = useState(() => browserImageFiles().length > 0)
  const [loading, setLoading] = useState(true)
  const [upscaleReady, setUpscaleReady] = useState(browserImageUpscaleReady)
  const upscale = useImageUpscale()
  useEffect(() => {
    let mounted = true
    void restoreBrowserModelImports().then(() => {
      if (!mounted) return
      const restored = browserImageFiles()
      setReady(restored.length > 0)
      if (restored.length) setFiles(restored)
      setUpscaleReady(browserImageUpscaleReady())
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])
  const settings = useCreation(state => state.settings)
  return <><NativeImageBridgeSetup scope={scope} disabled={disabled} />{browserLocalImagesEnabled() && <fieldset className="rounded-md border border-border p-3 space-y-2" disabled={disabled || loading}>
    <legend className="px-1 font-medium">Image sur cet appareil · essai FLUX.2 Klein</legend>
    <p className="text-sm text-muted-foreground">Choisissez les trois fichiers Desktop. Ils sont enregistrés dans ce navigateur. Réglez ensuite le ratio et la résolution, jusqu’à 2048 pixels par côté. La compatibilité mémoire et la vitesse dépendent de votre appareil. Real-ESRGAN ×2 est expérimental ; ×4 et la vidéo locale restent en préparation.</p>
    {imageComponentNames.map((name, index) => <label key={name} className="block text-xs break-all">{name}
      <input className="block w-full mt-1" type="file" accept={index === 2 ? '.safetensors' : '.gguf'} onChange={async event => {
        setReady(false); setError('')
        const next = files.slice(); next[index] = event.target.files?.[0]; setFiles(next)
        if (!next.every(Boolean)) return
        try {
          setBrowserImageFiles(next as File[])
          useCreation.getState().setSettings({ width: 256, height: 256, mediaRatio: '1:1', steps: 4, generationCount: 1 })
          useCreation.getState().setSelection(scope, 'image', { provider: BROWSER_IMAGE_PROVIDER, id: BROWSER_IMAGE_MODEL })
          setLoading(true)
          try {
            await saveBrowserModelImport('image', next as File[])
            setReady(true)
          } finally { setLoading(false) }
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
      }} />
    </label>)}
    <label className="block text-xs">RealESRGAN_x2plus.pth · facultatif, agrandissement ×2
      <input className="block w-full mt-1" type="file" accept=".pth" onChange={async event => {
        setError(''); setUpscaleReady(false)
        try {
          const file = event.target.files?.[0]
          setBrowserImageUpscaleFile(file)
          setUpscaleReady(Boolean(file))
          upscale.setFactor(2); upscale.setEnabled(Boolean(file))
          await saveBrowserModelImport('upscale', file ? [file] : [])
        } catch (reason) { setError(reason instanceof Error ? reason.message : String(reason)) }
      }} />
    </label>
    <label className="flex gap-2 items-center text-sm"><input type="checkbox" checked={upscale.enabled && upscale.factor === 2} disabled={disabled || !upscaleReady} onChange={event => { upscale.setFactor(2); upscale.setEnabled(event.target.checked) }} />Real-ESRGAN ×2 · {settings.width * 2} × {settings.height * 2}</label>
    {ready && <p role="status" className="text-sm">Modèle image sélectionné. Fermez ces réglages puis envoyez une demande en mode Image.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </fieldset>}</>
}
