import { useEffect, useState } from 'react'
import { browserVideoFiles, browserWanFiles, setBrowserWanFiles } from '@/services/browser-preview/local-video-calibration'
import { restoreBrowserModelImports, saveBrowserModelImport } from '@/services/browser-preview/model-imports'

export function BrowserLocalVideoSetup({ disabled }: { disabled: boolean }) {
  const [loading, setLoading] = useState(true)
  const [ready, setReady] = useState(() => browserVideoFiles().length === browserWanFiles.length)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    void restoreBrowserModelImports().then(() => {
      if (!mounted) return
      setReady(browserVideoFiles().length === browserWanFiles.length)
      setLoading(false)
    })
    return () => { mounted = false }
  }, [])

  return <div className="space-y-1 text-sm">
    <label className="block space-y-1">
      <span>Auto-Tune · {browserWanFiles[0]}</span>
      <input type="file" multiple accept=".gguf,.safetensors" disabled={disabled || loading}
        onChange={async event => {
          const selected = Array.from(event.currentTarget.files ?? [])
          if (!selected.length) return
          const files = browserWanFiles.flatMap(name => selected.filter(file => file.name === name && file.size > 0).slice(0, 1))
          if (files.length !== browserWanFiles.length) {
            setError('Sélectionnez les trois fichiers Wan indiqués.')
            return
          }
          setError('')
          setBrowserWanFiles(files)
          setLoading(true)
          try {
            await saveBrowserModelImport('video', files)
            setReady(true)
          } catch (reason) {
            setError(reason instanceof Error ? reason.message : String(reason))
          } finally { setLoading(false) }
        }} />
      <span className="block text-xs text-muted-foreground">{browserWanFiles.join(' · ')}</span>
    </label>
    {ready && <p role="status">Modèle vidéo disponible dans Auto-Tune.</p>}
    {error && <p role="alert" className="text-destructive">{error}</p>}
  </div>
}
