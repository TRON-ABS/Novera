import type { HuggingFaceRepo } from './types'

const canonical = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value && typeof value === 'object') return `{${Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, item]) => `${JSON.stringify(key)}:${canonical(item)}`).join(',')}}`
  return JSON.stringify(value)
}

/** Public, revision-pinned JSON only. Missing/invalid ModelOpt metadata stays blocked. */
export async function hydrateModeloptMetadata(fetchImpl: typeof fetch, repo: HuggingFaceRepo, allowNetwork = true): Promise<HuggingFaceRepo> {
  if (!repo.siblings?.some(file => file.rfilename === 'hf_quant_config.json')) return repo
  const blocked = { ...repo, config: { ...repo.config, quantization_config: { quant_method: 'modelopt' } } }
  const id = repo.modelId ?? repo.id
  if (!allowNetwork || !/^[\w.-]+\/[\w.-]+$/.test(id) || !/^[a-f0-9]{40}$/i.test(repo.sha ?? '')) return blocked
  const read = async (file: string) => {
    const response = await fetchImpl(`https://huggingface.co/${id}/resolve/${repo.sha}/${file}`, {
      credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(20000),
    })
    if (!response.ok || Number(response.headers.get('Content-Length')) > 256 * 1024) throw new Error('ModelOpt metadata unavailable')
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Missing ModelOpt metadata body')
    const decoder = new TextDecoder()
    let text = ''
    let bytes = 0
    try {
      for (;;) {
        const chunk = await reader.read()
        if (chunk.done) break
        bytes += chunk.value.byteLength
        if (bytes > 256 * 1024) {
          await reader.cancel()
          throw new Error('ModelOpt metadata too large')
        }
        text += decoder.decode(chunk.value, { stream: true })
      }
      text += decoder.decode()
    } finally { reader.releaseLock() }
    const data: unknown = JSON.parse(text)
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Invalid ModelOpt metadata')
    return data as Record<string, unknown>
  }
  try {
    const [sidecar, config] = await Promise.all([read('hf_quant_config.json'), read('config.json')])
    const quant = sidecar.quantization
    if (!quant || typeof quant !== 'object' || Array.isArray(quant)) return blocked
    const inline = config.quantization_config
    if (inline != null) {
      if (typeof inline !== 'object' || Array.isArray(inline)) return blocked
      const { quant_method, quantization, ...flat } = inline as Record<string, unknown>
      if (quant_method !== 'modelopt' || canonical(quantization === undefined ? flat : quantization) !== canonical(quant)) return blocked
    }
    return { ...repo, config: { ...config, quantization_config: { quant_method: 'modelopt', quantization: quant } } }
  } catch { return blocked }
}
