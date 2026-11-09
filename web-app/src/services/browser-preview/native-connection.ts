export type NativeConnection = { version: 1; origin: string; endpoint: string; token: string }

export function parseNativeConnection(value: unknown, origin: string): NativeConnection {
  if (!value || typeof value !== 'object') throw new Error('Fichier de connexion locale invalide.')
  const record = value as Record<string, unknown>
  if (record.version !== 1 || record.origin !== origin || typeof record.endpoint !== 'string' || typeof record.token !== 'string' || !/^[a-f0-9]{64}$/.test(record.token)) throw new Error('Ce fichier de connexion ne correspond pas à ce site Novera.')
  const endpoint = new URL(record.endpoint)
  if (endpoint.protocol !== 'http:' || endpoint.hostname !== '127.0.0.1' || !endpoint.port || endpoint.username || endpoint.password || endpoint.pathname !== '/' || endpoint.search || endpoint.hash) throw new Error('La passerelle doit écouter sur cet appareil (127.0.0.1).')
  return { version: 1, origin, endpoint: endpoint.origin, token: record.token }
}
