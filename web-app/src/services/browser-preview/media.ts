import { parseCreationReference, type CreationTask } from '@/modules/engines/creation'

export const BROWSER_MEDIA_LIMIT = 256 * 1024 * 1024
type MediaRecord = { name: string; task: CreationTask; blob: Blob; metadata: { provider: string; model: string; prompt: string; createdAt: number } }
type SaveRequest = { id: string; task: CreationTask; provider: string; model: string; prompt: string; url?: string; base64?: string }
const jobs = new Map<string, AbortController>()
let connection: Promise<IDBDatabase> | undefined

function database() {
  return connection ??= new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('novera-browser-media-v1', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('media', { keyPath: 'name' })
    request.onerror = () => { connection = undefined; reject(request.error) }
    request.onblocked = () => { connection = undefined; reject(new Error('Fermez les autres onglets Novera avant de mettre le stockage à jour.')) }
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); connection = undefined }
      resolve(request.result)
    }
  })
}

export async function readBrowserMedia(task: CreationTask, name: string): Promise<MediaRecord> {
  if (!parseCreationReference(`novera-creation:${task}/${encodeURIComponent(name)}`)) throw new Error('Référence média invalide.')
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('media', 'readonly')
    const request = transaction.objectStore('media').get(name)
    transaction.oncomplete = () => request.result?.task === task ? resolve(request.result) : reject(new Error('Ce fichier n’est plus dans ce navigateur.'))
    transaction.onerror = transaction.onabort = () => reject(transaction.error)
  })
}

function format(bytes: Uint8Array, task: CreationTask) {
  const ascii = (offset: number, count: number) => String.fromCharCode(...bytes.subarray(offset, offset + count))
  if (task === 'image') {
    if (bytes.length >= 24 && ascii(1, 3) === 'PNG' && bytes[0] === 137 && ascii(12, 4) === 'IHDR') return ['png', 'image/png']
    if (bytes.length >= 4 && bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return ['jpg', 'image/jpeg']
    if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WEBP') return ['webp', 'image/webp']
  } else if (task === 'music') {
    if (ascii(0, 4) === 'RIFF' && ascii(8, 4) === 'WAVE') return ['wav', 'audio/wav']
    if (ascii(0, 3) === 'ID3' || (bytes.length >= 4 && bytes[0] === 255 && (bytes[1] & 224) === 224)) return ['mp3', 'audio/mpeg']
  } else if (task === 'video') {
    if (bytes.length >= 12 && ascii(4, 4) === 'ftyp' && !/^(avif|avis|heic|heif)$/.test(ascii(8, 4))) return ['mp4', 'video/mp4']
    if (bytes[0] === 26 && bytes[1] === 69 && bytes[2] === 223 && bytes[3] === 163 && new TextDecoder().decode(bytes.subarray(0, 4096)).includes('webm')) return ['webm', 'video/webm']
  }
  throw new Error('Le fournisseur n’a pas renvoyé un fichier compatible avec ce format.')
}

async function resultBytes(request: SaveRequest, signal: AbortSignal): Promise<Uint8Array> {
  signal.throwIfAborted()
  if (request.base64) {
    if (request.base64.length > Math.ceil(BROWSER_MEDIA_LIMIT * 4 / 3) + 4 || !/^[A-Za-z0-9+/]*={0,2}$/.test(request.base64)) throw new Error('Fichier média trop volumineux ou invalide.')
    const binary = atob(request.base64)
    if (binary.length > BROWSER_MEDIA_LIMIT) throw new Error('Fichier média trop volumineux.')
    return Uint8Array.from(binary, character => character.charCodeAt(0))
  }
  const url = new URL(request.url ?? '')
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('URL de résultat incompatible.')
  const response = await fetch(url, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' })
  if (!response.ok || Number(response.headers.get('content-length')) > BROWSER_MEDIA_LIMIT) {
    await response.body?.cancel().catch(() => {})
    throw new Error('Téléchargement du média impossible ou trop volumineux.')
  }
  const reader = response.body?.getReader()
  if (!reader) throw new Error('Le fournisseur n’a pas renvoyé de fichier.')
  const chunks: Uint8Array[] = []
  let size = 0
  try {
    for (;;) {
      const next = await reader.read()
      if (next.done) break
      size += next.value.length
      if (size > BROWSER_MEDIA_LIMIT) throw new Error('Fichier média trop volumineux.')
      chunks.push(next.value)
    }
  } catch (error) { await reader.cancel().catch(() => {}); throw error }
  finally { reader.releaseLock() }
  signal.throwIfAborted()
  const bytes = new Uint8Array(size)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length }
  return bytes
}

export async function browserMediaCommand(command: string, args?: Record<string, unknown>): Promise<unknown> {
  const id = typeof args?.id === 'string' ? args.id : ''
  if (command === 'creation_cloud_prepare') {
    if (!id || jobs.has(id)) throw new Error('Identifiant de création invalide.')
    if (jobs.size) throw new Error('Une création est déjà en cours dans cet onglet.')
    jobs.set(id, new AbortController())
    return
  }
  if (command === 'creation_cancel' || command === 'creation_cloud_release') {
    jobs.get(id)?.abort()
    if (command === 'creation_cloud_release') jobs.delete(id)
    return
  }
  if (command === 'sharing_metadata' || command === 'creation_info' || command === 'creation_image_input') {
    const task = command === 'creation_image_input' ? 'image' : args?.task
    if (task !== 'image' && task !== 'music' && task !== 'video') throw new Error('Format média invalide.')
    const record = await readBrowserMedia(task, String(args?.name))
    if (command === 'creation_image_input') {
      const bytes = new Uint8Array(await record.blob.arrayBuffer())
      let binary = ''
      for (let index = 0; index < bytes.length; index += 8192) binary += String.fromCharCode(...bytes.subarray(index, index + 8192))
      return `data:${record.blob.type};base64,${btoa(binary)}`
    }
    return command === 'sharing_metadata' ? record.metadata : undefined
  }
  if (command !== 'creation_cloud_save') throw new Error('Ce moteur nécessite Novera Desktop.')
  const request = args?.request as SaveRequest | undefined
  if (!request || !['image', 'music', 'video'].includes(request.task) || request.provider !== 'fal') throw new Error('Ce fournisseur n’est pas encore adapté au navigateur.')
  if (Boolean(request.url) === Boolean(request.base64)) throw new Error('Le résultat doit fournir un seul fichier.')
  const job = jobs.get(request.id)
  if (!job) throw new Error('La création n’est plus active.')
  const bytes = await resultBytes(request, job.signal)
  return saveBrowserLocalMedia(new Blob([bytes.slice().buffer]), request, job.signal)
}

/** Commit a locally generated result before publishing its conversation reference. */
export async function saveBrowserLocalMedia(blob: Blob, request: { task: CreationTask; provider: string; model: string; prompt: string }, signal: AbortSignal) {
  signal.throwIfAborted()
  if (!blob.size || blob.size > BROWSER_MEDIA_LIMIT) throw new Error('Fichier média trop volumineux ou vide.')
  const [extension, mediaType] = format(new Uint8Array(await blob.slice(0, 4096).arrayBuffer()), request.task)
  const name = `Novera-${crypto.randomUUID()}.${extension}`
  const record: MediaRecord = { name, task: request.task, blob: blob.slice(0, blob.size, mediaType), metadata: { provider: request.provider, model: request.model, prompt: request.prompt, createdAt: Date.now() } }
  signal.throwIfAborted()
  const db = await database()
  signal.throwIfAborted()
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction('media', 'readwrite')
    const abort = () => { try { transaction.abort() } catch { /* Already settled. */ } }
    signal.addEventListener('abort', abort, { once: true })
    transaction.oncomplete = () => { signal.removeEventListener('abort', abort); resolve() }
    transaction.onabort = transaction.onerror = () => { signal.removeEventListener('abort', abort); reject(transaction.error ?? new Error('Enregistrement du média impossible. Vérifiez l’espace du navigateur.')) }
    try { transaction.objectStore('media').put(record) }
    catch (error) { signal.removeEventListener('abort', abort); abort(); reject(error) }
    if (signal.aborted) abort()
  })
  return { name, mediaType }
}

export function downloadBrowserBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url; link.download = name; link.click()
  setTimeout(() => URL.revokeObjectURL(url), 30_000)
}
