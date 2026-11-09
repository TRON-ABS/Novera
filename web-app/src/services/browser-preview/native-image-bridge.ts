import { create } from 'zustand'

export const NATIVE_IMAGE_PROVIDER = 'novera-native-bridge'
export const NATIVE_IMAGE_MODEL = 'flux-2-klein-4b-Q4_K_M'
type Connection = { version: 1; origin: string; endpoint: string; token: string }
type Health = { version: string; model: string; upscaleX2: boolean; engineSha256: string }
export const useNativeImageBridge = create<{ connection?: Connection; health?: Health }>(() => ({}))

export function parseNativeConnection(value: unknown, origin: string): Connection {
  if (!value || typeof value !== 'object') throw new Error('Fichier de connexion locale invalide.')
  const record = value as Record<string, unknown>
  if (record.version !== 1 || record.origin !== origin || typeof record.endpoint !== 'string' || typeof record.token !== 'string' || !/^[a-f0-9]{64}$/.test(record.token)) throw new Error('Ce fichier de connexion ne correspond pas à ce site Novera.')
  const endpoint = new URL(record.endpoint)
  if (endpoint.protocol !== 'http:' || endpoint.hostname !== '127.0.0.1' || !endpoint.port || endpoint.username || endpoint.password || endpoint.pathname !== '/' || endpoint.search || endpoint.hash) throw new Error('La passerelle doit écouter sur cet appareil (127.0.0.1).')
  return { version: 1, origin, endpoint: endpoint.origin, token: record.token }
}

async function request(connection: Connection, path: string, options: RequestInit = {}) {
  const response = await fetch(connection.endpoint + path, {
    ...options, credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
    headers: { Authorization: `Bearer ${connection.token}`, ...(options.body ? { 'Content-Type': 'application/json' } : {}) },
  })
  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(typeof data.error === 'string' ? data.error.slice(0, 2500) : 'La passerelle native a refusé la demande.')
  }
  return response
}

export async function connectNativeImageBridge(file: File) {
  if (file.size > 8192) throw new Error('Fichier de connexion locale trop volumineux.')
  const connection = parseNativeConnection(JSON.parse(await file.text()), location.origin)
  const response = await request(connection, '/v1/health', { signal: AbortSignal.timeout(5000) })
  const health: Health = await response.json()
  if (health.version !== '1.0.1' || health.model !== NATIVE_IMAGE_MODEL || typeof health.upscaleX2 !== 'boolean' || !/^[a-f0-9]{64}$/.test(health.engineSha256)) throw new Error('Cette passerelle n’est pas compatible avec Novera 1.0.1.')
  useNativeImageBridge.setState({ connection, health })
}

export function disconnectNativeImageBridge() {
  useNativeImageBridge.setState({ connection: undefined, health: undefined })
}

function pause(signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const abort = () => { clearTimeout(timer); reject(signal.reason) }
    const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve() }, 250)
    signal.addEventListener('abort', abort, { once: true })
    if (signal.aborted) abort()
  })
}

export async function generateNativeImage(
  parameters: { prompt: string; width: number; height: number; steps: number; seed: number; upscale: boolean },
  signal: AbortSignal,
  onProgress: (stage: string, progress: number) => void,
) {
  const { connection, health } = useNativeImageBridge.getState()
  if (!connection) throw new Error('Connectez la passerelle native dans les réglages Image.')
  if (parameters.upscale && !health?.upscaleX2) throw new Error('RealESRGAN ×2 n’est pas configuré dans la passerelle.')
  signal.throwIfAborted()
  const id = crypto.randomUUID()
  // A client-owned id also cancels requests whose POST response was interrupted.
  const cancel = () => { void request(connection, `/v1/jobs/${id}`, { method: 'DELETE', signal: AbortSignal.timeout(3000) }).catch(() => {}) }
  signal.addEventListener('abort', cancel, { once: true })
  try {
    const started = await request(connection, '/v1/jobs', { method: 'POST', body: JSON.stringify({ id, ...parameters }), signal })
    if ((await started.json()).id !== id) throw new Error('Identifiant de création native incorrect.')
    while (true) {
      signal.throwIfAborted()
      const response = await request(connection, `/v1/jobs/${id}`, { signal })
      const job = await response.json()
      if (job.id !== id) throw new Error('Réponse de création native incorrecte.')
      if (job.status === 'error' || job.status === 'cancelled') throw new Error(typeof job.error === 'string' ? job.error : 'Création native annulée.')
      if (typeof job.stage === 'string' && typeof job.progress === 'number' && Number.isFinite(job.progress)) onProgress(job.stage, Math.max(0, Math.min(100, job.progress)))
      if (job.status === 'complete') {
        const factor = parameters.upscale ? 2 : 1
        if (job.width !== parameters.width * factor || job.height !== parameters.height * factor) throw new Error('Dimensions de sortie native incorrectes.')
        const result = await request(connection, `/v1/jobs/${id}/image`, { signal })
        if (result.headers.get('Content-Type') !== 'image/png') throw new Error('Image native PNG attendue.')
        const image = await result.blob()
        if (!image.size || image.size > 128 * 1024 * 1024) throw new Error('Taille d’image native invalide.')
        const timings: Record<string, number> = {}
        for (const [key, value] of Object.entries(job.timings ?? {})) if (['nativeTotalMs', 'textEncodingMs', 'diffusionMs', 'decodingMs', 'upscalingMs'].includes(key) && typeof value === 'number' && Number.isFinite(value) && value >= 0) timings[key] = value
        return { image, timings, engineSha256: health?.engineSha256 }
      }
      if (job.status !== 'running') throw new Error('État de création native inconnu.')
      await pause(signal)
    }
  } catch (error) {
    cancel()
    throw error
  } finally {
    signal.removeEventListener('abort', cancel)
  }
}
