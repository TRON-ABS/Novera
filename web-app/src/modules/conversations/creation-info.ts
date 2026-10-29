import type { UIMessage } from 'ai'

type CreationInfo = { totalMs: number; generationMs?: number; seed?: number }
const object = (value: unknown): Record<string, unknown> | undefined =>
  value !== null && typeof value === 'object' ? value as Record<string, unknown> : undefined

function validated(value: unknown): CreationInfo | undefined {
  const info = object(value)
  const number = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0
  if (!info || !number(info.totalMs)) return
  return {
    totalMs: info.totalMs,
    ...(number(info.generationMs) && info.generationMs <= info.totalMs ? { generationMs: info.generationMs } : {}),
    ...(number(info.seed) && Number.isSafeInteger(info.seed) && info.seed <= 0xffffffff ? { seed: info.seed } : {}),
  }
}

export function savedCreationInfo(metadata: unknown, url: string): CreationInfo | undefined {
  if (!/^novera-creation:(?:image|music|video)\//.test(url)) return
  return validated(object(object(metadata)?.creationInfo)?.[url])
}

/** Store only public numeric creation information, keyed by its durable file reference. */
export function creationInfoOf(message: UIMessage): Record<string, CreationInfo> | undefined {
  const result: Record<string, CreationInfo> = {}
  for (const part of message.parts ?? []) {
    if (part.type !== 'file' || !/^novera-creation:(?:image|music|video)\//.test(part.url)) continue
    const info = validated(part.providerMetadata?.novera) ?? savedCreationInfo(message.metadata, part.url)
    if (info) result[part.url] = info
  }
  return Object.keys(result).length ? result : undefined
}
