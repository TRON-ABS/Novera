import { invoke } from '@tauri-apps/api/core'
import type { ImportOptions } from '@janhq/core'
import manifest from '@/constants/text-manifest.json'

type Engine = { get: (id: string) => Promise<unknown>; import: (id: string, opts: ImportOptions) => Promise<void> }
type Deleted = string | { provider: string; id: string }
type Candidate = { id: string; path: string; size: number; sha256: string }
const pending = new WeakMap<Engine, Promise<void>>()

/** Import verified recommendations by reference; never download or overwrite a model. */
export function registerRecommendedModels(engine: Engine, deleted: Deleted[] = []): Promise<void> {
  const running = pending.get(engine)
  if (running) return running
  const job = (async () => {
    const missing = new Set<string>()
    for (const spec of manifest) {
      const id = spec.name.replace(/\.gguf$/, '')
      if (deleted.some((entry) => typeof entry === 'string' ? entry === id : entry.provider === 'llamacpp' && entry.id === id)) continue
      if (!(await engine.get(id))) missing.add(id)
    }
    if (!missing.size) return
    const candidates = await invoke<Candidate[]>('recommended_model_files')
    if (!Array.isArray(candidates)) return
    for (const file of candidates) {
      if (!missing.has(file.id)) continue
      try {
        if (await engine.get(file.id)) continue
        await engine.import(file.id, { modelPath: file.path, modelSha256: file.sha256, modelSize: file.size })
      } catch (error) {
        console.warn(`Could not register recommended model ${file.id}:`, error)
      }
    }
  })().catch((error) => console.warn('Recommended model discovery unavailable:', error))
    .finally(() => pending.delete(engine))
  pending.set(engine, job)
  return job
}
