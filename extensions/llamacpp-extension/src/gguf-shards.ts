import type { ImportOptions } from '@janhq/core'

/** Reject partial series and unsafe names before writing any weights. */
export function validateShardManifest(opts: ImportOptions): void {
  const parts = opts.modelShards
  if (!parts) {
    if (/-\d{5}-of-\d{5}\.gguf(?:[?#]|$)/i.test(opts.modelPath)) {
      throw new Error('Split GGUF requires a complete shard manifest')
    }
    return
  }
  const first = parts[0]?.filename.match(/^(.*)-00001-(of)-(\d{5})(\.gguf)$/i)
  if (
    !first ||
    parts.length < 2 ||
    Number(first[3]) !== parts.length ||
    opts.modelPath !== parts[0].url
  ) {
    throw new Error('Incomplete GGUF split series')
  }
  for (const [index, part] of parts.entries()) {
    const expected = `${first[1]}-${String(index + 1).padStart(5, '0')}-${first[2]}-${first[3]}${first[4]}`
    if (
      part.filename !== expected ||
      /[\\/]/.test(part.filename) ||
      !part.url.startsWith('https://') ||
      !Number.isSafeInteger(part.size) ||
      part.size <= 0 ||
      !/^[a-f0-9]{64}$/i.test(part.sha256)
    ) {
      throw new Error(`Invalid GGUF shard: ${part.filename}`)
    }
  }
}

export function validateShardMetadata(
  metadata: Record<string, string>,
  index: number,
  count: number
): void {
  if (
    !/^\d+$/.test(metadata['split.no'] ?? '') ||
    !/^\d+$/.test(metadata['split.count'] ?? '') ||
    Number(metadata['split.no']) !== index ||
    Number(metadata['split.count']) !== count
  ) {
    throw new Error(
      `GGUF split metadata mismatch for shard ${index + 1}/${count}`
    )
  }
}
