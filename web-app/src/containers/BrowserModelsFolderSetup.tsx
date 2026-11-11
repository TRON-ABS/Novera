import { useState } from 'react'
import { browserModelFolderPickerAvailable, browserModelPacks, chooseBrowserModelFolder, importBrowserModelFiles } from '@/services/browser-preview/model-folder'
import { browserLargeTextSupported, wasmTextSupported } from '@/services/browser-preview/wasm-text'
import { refreshAutoTuneModels } from '@/services/creation/auto-tune'

export function BrowserModelsFolderSetup({ disabled }: { disabled: boolean }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const enabledPacks = browserModelPacks().filter(pack => pack.enabled)
  if (!enabledPacks.length && !wasmTextSupported()) return null

  async function importFolder(importFiles: () => Promise<string[]>) {
    setBusy(true)
    setStatus('')
    try {
      setStatus((await importFiles()).join('\n'))
      await refreshAutoTuneModels()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) {
        setStatus(error instanceof Error ? error.message : String(error))
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2 rounded-xl border p-4" aria-label="Dossier des modèles Novera">
      <h2 className="font-medium">Dossier des modèles Novera</h2>
      <p className="text-sm text-muted-foreground">
        Choisis <code>C:\Users\&lt;nom&gt;\Documents\Novera models</code>. Novera cherche les packs pris en charge et les GGUF texte dans ses sous-dossiers. Auto-Tune teste automatiquement les modèles ajoutés quand il est activé.
      </p>
      {browserModelFolderPickerAvailable() ? (
        <button type="button" className="underline text-sm" disabled={disabled || busy}
          onClick={() => void importFolder(chooseBrowserModelFolder)}>
          Autoriser et mémoriser le dossier des modèles
        </button>
      ) : <label className="block text-sm">
        Importer le dossier des modèles
        <input type="file" className="mt-1 block w-full" {...{ webkitdirectory: '' }}
          disabled={disabled || busy} onChange={event => {
            const files = Array.from(event.currentTarget.files ?? [])
            event.currentTarget.value = ''
            void importFolder(() => importBrowserModelFiles(files))
          }} />
      </label>}
      {wasmTextSupported() && !browserLargeTextSupported() && <p className="text-sm text-muted-foreground">
        Sur ce navigateur, le moteur texte accepte les GGUF de moins de 4 Gio.
      </p>}
      {browserModelFolderPickerAvailable() && <p className="text-sm text-muted-foreground">
        Le dossier mémorisé est scanné à l’ouverture puis toutes les 30 secondes pendant que la page est visible.
      </p>}
      {busy && <p role="status" className="text-sm">Enregistrement des modèles…</p>}
      {status && <p role="status" className="whitespace-pre-line break-words text-sm">{status}</p>}
      {enabledPacks.length > 0 && <details className="text-sm">
        <summary className="cursor-pointer">Télécharger les fichiers des modèles</summary>
        <p className="my-2 text-muted-foreground">Enregistre les fichiers téléchargés dans Novera models.</p>
        {enabledPacks.map(pack => (
          <div key={pack.kind} className="mb-2">
            <h3 className="font-medium">{pack.title}</h3>
            <ul className="space-y-1">
              {pack.components.map(file => (
                <li key={file.name}>
                  <a className="break-all underline" href={file.url} target="_blank" rel="noreferrer">{file.name}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </details>}
    </section>
  )
}
