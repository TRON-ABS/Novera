import { detectEmbeddingFromGgufMeta } from './util'

type RegisteredModel = { id: string; path: string }
type Host = {
  registered: () => Promise<RegisteredModel[]>
  deletedIds: () => Promise<string[]>
  metadata: (path: string) => Promise<{ metadata: Record<string, unknown> }>
  importModel: (id: string, path: string) => Promise<void>
  busy: () => boolean
  warn: (path: string, error: unknown) => void
}

function pathKey(path: string): string {
  const normal = path.replace(/\\/g, '/').replace(/^\/\/\?\/UNC\//i, '//').replace(/^\/\/\?\//, '')
  return /^[a-z]:\//i.test(normal) || normal.startsWith('//') ? normal.toLowerCase() : normal
}

/** Register a full Qwen3 decoder already selected as a media encoder.
 * Other architectures, embeddings, VAEs and projectors remain pipeline components.
 * This checks metadata only; the ordinary importer and calibration validate the model.
 */
function isTextDecoder(metadata: Record<string, unknown>): boolean {
  return metadata['general.architecture'] === 'qwen3' &&
    !detectEmbeddingFromGgufMeta(metadata) &&
    !/embedding/i.test(String(metadata['general.name'] ?? '')) &&
    typeof metadata['tokenizer.chat_template'] === 'string' &&
    metadata['tokenizer.chat_template'].trim().length > 0 &&
    Number(metadata['qwen3.block_count']) > 0
}

/** Serializes dashboard/queue discoveries; never scans folders or starts a test. */
export class MediaTextRegistration {
  private pending: Promise<void> = Promise.resolve()

  constructor(private readonly host: Host) {}

  sync(paths: readonly string[]): Promise<void> {
    const selected = [...new Map(paths.filter(path =>
      typeof path === 'string' && /\.gguf$/i.test(path) &&
      (/^[a-z]:[\\/]/i.test(path) || path.startsWith('/') || path.startsWith('\\\\'))
    ).map(path => [pathKey(path), path])).values()]
    const next = this.pending.then(() => this.register(selected))
    this.pending = next.catch(() => {})
    return next
  }

  private async register(paths: string[]): Promise<void> {
    if (!paths.length || this.host.busy()) return
    let registered = await this.host.registered()
    for (const path of paths) {
      if (this.host.busy()) return
      try {
        if (registered.some(model => pathKey(model.path) === pathKey(path))) continue
        const base = path.split(/[\\/]/).pop()!.replace(/\.gguf$/i, '')
          .replace(/[^a-z0-9_.-]/gi, '_').slice(0, 100)
        if (!base || base === '.' || base === '..') continue
        const deleted = new Set(await this.host.deletedIds())
        if (deleted.has(base) || deleted.has(base + '.gguf')) continue
        if (!isTextDecoder((await this.host.metadata(path)).metadata)) continue

        // A manual import may have finished while metadata was being read.
        registered = await this.host.registered()
        if (registered.some(model => pathKey(model.path) === pathKey(path))) continue
        let id = base
        if (registered.some(model => model.id === id)) {
          const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pathKey(path)))
          const suffix = Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 12)
          id = `${base}-${suffix}`
          // Never overwrite a different registered model, even on an ID collision.
          if (registered.some(model => model.id === id)) continue
        }
        const latestDeleted = new Set(await this.host.deletedIds())
        if (latestDeleted.has(base) || latestDeleted.has(base + '.gguf') || latestDeleted.has(id) || this.host.busy()) continue
        await this.host.importModel(id, path)
        registered.push({ id, path })
      } catch (error) {
        // A missing/invalid encoder cannot hide the other registered models.
        this.host.warn(path, error)
      }
    }
  }
}
