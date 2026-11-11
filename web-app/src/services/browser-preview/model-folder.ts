import { klein4bRecommendation, wan13bRecommendation } from '@/constants/creationRecommendations'
import musicManifest from '@/constants/music-manifest.json'
import { browserLocalImagesEnabled, imageComponentNames, setBrowserImageFiles } from '@/services/browser-preview/local-media'
import { browserLocalMusicEnabled, musicComponentNames, setBrowserMusicFiles } from '@/services/browser-preview/local-music'
import { browserWanAutoTuneAvailable, browserWanFiles, setBrowserWanFiles } from '@/services/browser-preview/local-video-calibration'
import { registerBrowserLocalTextModel } from '@/services/browser-preview/local-text-imports'
import { wasmTextSupported } from '@/services/browser-preview/wasm-text'
import { browserPreviewEnabled } from './config'
import { rememberBrowserModelFolder, restoreBrowserModelImports, saveBrowserModelImport, savedBrowserModelFolder } from './model-imports'

type Component = { name: string; url: string; size?: number }

const musicComponents = musicComponentNames.map(name => {
  const asset = musicManifest.find(file => file.name === name)
  if (!asset) throw new Error('Fichier ACE-Step absent du manifeste : ' + name)
  return asset
})

function matchBrowserModelFiles(files: readonly File[], components: readonly Component[]) {
  return components.map(component => {
    const matches = files.filter(file => file.name === component.name && file.size > 0 &&
      (component.size === undefined || file.size === component.size))
    // Preserve an explicit choice when a name has several distinct candidates.
    const first = matches[0]
    return first && matches.every(file => file.size === first.size && file.lastModified === first.lastModified)
      ? first : undefined
  })
}

export function browserModelPacks() {
  return [
    { kind: 'image', title: 'FLUX.2 Klein', enabled: browserLocalImagesEnabled(), apply: setBrowserImageFiles,
      components: klein4bRecommendation.map((file, index) => ({ name: imageComponentNames[index], url: file.url })) },
    { kind: 'music', title: 'ACE-Step', enabled: browserLocalMusicEnabled(), apply: setBrowserMusicFiles,
      components: musicComponents },
    { kind: 'video', title: 'Wan 2.1', enabled: browserWanAutoTuneAvailable(), apply: setBrowserWanFiles,
      components: wan13bRecommendation.map((file, index) => ({ name: browserWanFiles[index], url: file.url })) },
  ] as const
}

const importedPacks = new Map<string, string>()

export async function importBrowserModelFiles(files: File[], background = false) {
  const messages: string[] = []
  const packs = browserModelPacks()
  const enabledPacks = packs.filter(pack => pack.enabled)
  const textEnabled = wasmTextSupported()
  await restoreBrowserModelImports()
  for (const pack of enabledPacks) {
    const matches = matchBrowserModelFiles(files, pack.components)
    const missing = pack.components.filter((_, index) => !matches[index])
    if (missing.length) {
      messages.push(pack.title + ' · Fichiers à choisir : ' + missing.map(file => file.name).join(', '))
      continue
    }
    const complete = matches.filter((file): file is File => Boolean(file))
    const version = JSON.stringify(complete.map(file => [file.name, file.size, file.lastModified]))
    if (background && importedPacks.get(pack.kind) === version) continue
    try {
      pack.apply(complete)
      await saveBrowserModelImport(pack.kind, complete)
      importedPacks.set(pack.kind, version)
      messages.push(pack.title + ' · Enregistré dans Auto-Tune')
    } catch (error) {
      messages.push(pack.title + ' · ' + (error instanceof Error ? error.message : String(error)))
    }
  }
  if (textEnabled) {
    const mediaNames = new Set<string>(packs.flatMap(pack => pack.components.map(file => file.name)))
    for (const file of files) {
      if (mediaNames.has(file.name) || /(?:^|[-_.])(?:mmproj|taesd)(?:[-_.]|$)/i.test(file.name)) continue
      try {
        if (!await registerBrowserLocalTextModel(file)) continue
        await saveBrowserModelImport('text', [file])
        messages.push(file.name + ' · Ajouté à Auto-Tune pour vérifier sa compatibilité')
      } catch (error) {
        messages.push(file.name + ' · ' + (error instanceof Error ? error.message : String(error)))
      }
    }
  }
  return messages
}

type ModelDirectory = FileSystemDirectoryHandle & {
  values(): AsyncIterableIterator<FileSystemHandle>
  queryPermission(options: { mode: 'read' }): Promise<PermissionState>
}
const directoryPicker = () => (window as Window & {
  showDirectoryPicker?: (options: { id: string; startIn: 'documents'; mode: 'read' }) => Promise<ModelDirectory>
}).showDirectoryPicker
export const browserModelFolderPickerAvailable = () => typeof window !== 'undefined' && Boolean(directoryPicker())

let folder: ModelDirectory | undefined
let directoryRestored: Promise<void> | undefined
let scan: Promise<string[] | undefined> | undefined
let fingerprint: string | undefined

async function readFiles(directory: ModelDirectory, files: File[]) {
  for await (const handle of directory.values()) {
    if (handle.kind === 'directory') {
      await readFiles(handle as ModelDirectory, files)
    } else if (/\.(gguf|safetensors)$/i.test(handle.name)) {
      try { files.push(await (handle as FileSystemFileHandle).getFile()) }
      catch (error) {
        if (!(error instanceof DOMException && error.name === 'NotFoundError')) throw error
      }
    }
  }
}

export async function scanBrowserModelFolder(force = false) {
  directoryRestored ??= savedBrowserModelFolder()
    .then(saved => { folder ??= saved as ModelDirectory | undefined })
    .catch(error => { directoryRestored = undefined; if (!folder) throw error })
  await directoryRestored
  const directory = folder
  if (!directory || await directory.queryPermission({ mode: 'read' }) !== 'granted') return
  if (scan) {
    if (!force) return scan
    await scan.catch(() => {})
  }
  const current = (async () => {
    const files: File[] = []
    await readFiles(directory, files)
    const version = JSON.stringify(files.map(file => JSON.stringify([file.name, file.size, file.lastModified])).sort())
    if (!force && fingerprint === version) return
    const result = await importBrowserModelFiles(files, !force)
    if (folder === directory) fingerprint = version
    return result
  })()
  scan = current
  try { return await current }
  finally { if (scan === current) scan = undefined }
}

export async function chooseBrowserModelFolder() {
  const picker = directoryPicker()
  if (!picker) return []
  const directory = await picker.call(window, { id: 'novera-models', startIn: 'documents', mode: 'read' })
  folder = directory
  fingerprint = undefined
  let saved = true
  try { await rememberBrowserModelFolder(directory) }
  catch { saved = false }
  const results = await scanBrowserModelFolder(true) ?? []
  return [saved ? directory.name + ' · Dossier mémorisé' : directory.name + ' · Dossier autorisé pour cet onglet', ...results]
}

export function watchBrowserModelFolder(onImport: () => Promise<void>) {
  if (!browserPreviewEnabled() || !browserModelFolderPickerAvailable()) return
  const check = async () => {
    if (document.visibilityState === 'hidden') return
    try {
      if (await scanBrowserModelFolder()) await onImport()
    } catch (error) { console.warn('Impossible de scanner le dossier des modèles Novera.', error) }
  }
  void check()
  const timer = window.setInterval(check, 30_000)
  window.addEventListener('focus', check)
  document.addEventListener('visibilitychange', check)
  return () => {
    window.clearInterval(timer)
    window.removeEventListener('focus', check)
    document.removeEventListener('visibilitychange', check)
  }
}
