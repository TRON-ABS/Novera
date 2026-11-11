import { useState } from 'react'
import { klein4bRecommendation, wan13bRecommendation } from '@/constants/creationRecommendations'
import musicManifest from '@/constants/music-manifest.json'
import { browserLocalImagesEnabled, imageComponentNames, setBrowserImageFiles } from '@/services/browser-preview/local-media'
import { browserLocalMusicEnabled, musicComponentNames, setBrowserMusicFiles } from '@/services/browser-preview/local-music'
import { browserWanAutoTuneAvailable, browserWanFiles, setBrowserWanFiles } from '@/services/browser-preview/local-video-calibration'
import { restoreBrowserModelImports, saveBrowserModelImport } from '@/services/browser-preview/model-imports'

type Component = { name: string; url: string; size?: number }

const musicComponents = musicComponentNames.map(name => {
  const asset = musicManifest.find(file => file.name === name)
  if (!asset) throw new Error('Fichier ACE-Step absent du manifeste : ' + name)
  return asset
})

export function matchBrowserModelFiles(files: readonly File[], components: readonly Component[]) {
  return components.map(component => {
    const matches = files.filter(file => file.name === component.name && file.size > 0 &&
      (component.size === undefined || file.size === component.size))
    // Preserve an explicit choice when a name has several distinct candidates.
    const first = matches[0]
    return first && matches.every(file => file.size === first.size && file.lastModified === first.lastModified)
      ? first : undefined
  })
}

export function BrowserModelsFolderSetup({ disabled }: { disabled: boolean }) {
  const [busy, setBusy] = useState(false)
  const [status, setStatus] = useState('')
  const packs = [
    { kind: 'image', title: 'FLUX.2 Klein', enabled: browserLocalImagesEnabled(), apply: setBrowserImageFiles,
      components: klein4bRecommendation.map((file, index) => ({ name: imageComponentNames[index], url: file.url })) },
    { kind: 'music', title: 'ACE-Step', enabled: browserLocalMusicEnabled(), apply: setBrowserMusicFiles,
      components: musicComponents },
    { kind: 'video', title: 'Wan 2.1', enabled: browserWanAutoTuneAvailable(), apply: setBrowserWanFiles,
      components: wan13bRecommendation.map((file, index) => ({ name: browserWanFiles[index], url: file.url })) },
  ] as const
  const enabledPacks = packs.filter(pack => pack.enabled)
  if (!enabledPacks.length) return null

  async function importFolder(files: File[]) {
    if (!files.length) return
    setBusy(true)
    setStatus('')
    const messages: string[] = []
    try {
      await restoreBrowserModelImports()
      for (const pack of enabledPacks) {
        const matches = matchBrowserModelFiles(files, pack.components)
        const missing = pack.components.filter((_, index) => !matches[index])
        if (missing.length) {
          messages.push(pack.title + ' · Fichiers à choisir : ' + missing.map(file => file.name).join(', '))
          continue
        }
        const complete = matches.filter((file): file is File => Boolean(file))
        try {
          pack.apply(complete)
          await saveBrowserModelImport(pack.kind, complete)
          messages.push(pack.title + ' · Enregistré dans Auto-Tune')
        } catch (error) {
          messages.push(pack.title + ' · ' + (error instanceof Error ? error.message : String(error)))
        }
      }
    } finally {
      setStatus(messages.join('\n'))
      setBusy(false)
    }
  }

  return (
    <section className="space-y-2 rounded-xl border p-4" aria-label="Dossier des modèles Novera">
      <h2 className="font-medium">Dossier des modèles Novera</h2>
      <p className="text-sm text-muted-foreground">
        Choisis <code>C:\Users\&lt;nom&gt;\Documents\Novera models</code>. Novera recherche les composants compatibles dans ses sous-dossiers.
      </p>
      <label className="block text-sm">
        Importer le dossier des modèles
        <input type="file" className="mt-1 block w-full" {...{ webkitdirectory: '' }}
          disabled={disabled || busy} onChange={event => {
            const files = Array.from(event.currentTarget.files ?? [])
            event.currentTarget.value = ''
            void importFolder(files)
          }} />
      </label>
      {busy && <p role="status" className="text-sm">Enregistrement des modèles…</p>}
      {status && <p role="status" className="whitespace-pre-line break-words text-sm">{status}</p>}
      <details className="text-sm">
        <summary className="cursor-pointer">Télécharger les fichiers des modèles</summary>
        <p className="my-2 text-muted-foreground">Place les fichiers téléchargés dans le dossier Novera models, puis sélectionne ce dossier.</p>
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
      </details>
    </section>
  )
}
