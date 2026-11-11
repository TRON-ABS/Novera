import { browserPreviewEnabled } from './config'

type Kind = 'image' | 'music' | 'video' | 'upscale'
type SavedImport = { kind: Kind; id: string; files: File[]; savedAt: number }
let connection: Promise<IDBDatabase> | undefined
let restoring: Promise<void> | undefined

function database() {
  if (!connection) connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('novera-browser-models-v1', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('imports', { keyPath: ['kind', 'id'] })
    request.onsuccess = () => {
      const db = request.result
      db.onversionchange = () => { db.close(); connection = undefined }
      resolve(db)
    }
    request.onerror = () => { connection = undefined; reject(request.error) }
  })
  return connection
}

async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('imports', mode)
    const request = operation(transaction.objectStore('imports'))
    transaction.oncomplete = () => resolve(request.result)
    transaction.onabort = () => reject(transaction.error ?? new Error('Enregistrement du modèle impossible.'))
  })
}

export async function saveBrowserModelImport(kind: Kind, files: File[]) {
  const id = kind === 'image' || kind === 'music'
    ? JSON.stringify(files.map(file => [file.name, file.size, file.lastModified]))
    : 'current'
  try {
    if (files.length) {
      await transact('readwrite', store => store.put({ kind, id, files, savedAt: Date.now() } satisfies SavedImport))
    } else {
      await transact('readwrite', store => store.delete([kind, id]))
    }
  } catch {
    throw new Error('Le modèle reste utilisable dans cet onglet. Son enregistrement a échoué. Vérifiez l’espace de stockage du navigateur.')
  }
}

export function restoreBrowserModelImports() {
  if (!browserPreviewEnabled() || typeof indexedDB === 'undefined') return Promise.resolve()
  restoring ??= restore().catch(error => {
    restoring = undefined
    console.warn('Impossible de restaurer les modèles Web enregistrés.', error)
  })
  return restoring
}

async function restore() {
  const entries = await transact<SavedImport[]>('readonly', store => store.getAll())
  if (!entries.length) return
  const [image, music, video] = await Promise.all([
    import('./local-media'), import('./local-music'), import('./local-video-calibration'),
  ])
  // Replay accepted configurations in order, keeping the most recent one active.
  for (const entry of entries.sort((a, b) => a.savedAt - b.savedAt)) {
    try {
      switch (entry.kind) {
        case 'image': if (image.browserLocalImagesEnabled()) image.setBrowserImageFiles(entry.files); break
        case 'upscale': if (image.browserLocalImagesEnabled()) image.setBrowserImageUpscaleFile(entry.files[0]); break
        case 'music': if (music.browserLocalMusicEnabled()) music.setBrowserMusicFiles(entry.files); break
        case 'video': if (video.browserWanAutoTuneAvailable()) video.setBrowserWanFiles(entry.files); break
      }
    } catch (error) {
      console.warn('Impossible de restaurer une configuration de modèle Web.', error)
    }
  }
}
