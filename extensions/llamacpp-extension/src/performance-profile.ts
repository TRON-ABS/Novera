/** A measured recommendation, deliberately bounded to its calibration domain. */
export function measuredBatchProfile(
  model: {
    model_path: string
    size_bytes: number
    ctx_size?: number
    parallel?: number
    n_gpu_layers?: number
    flash_attn?: string
    cache_type_k?: string
    cache_type_v?: string
    no_kv_offload?: boolean
    cpu_moe?: boolean
    n_cpu_moe?: number
    n_cpu_ffn?: number
    device?: string
    split_mode?: string
  },
  devices: { id: string; name: string; free: number }[],
  engineTag: string,
  context: number,
  parallel: number
): { batch: number; ubatch: number } | undefined {
  if (
    !['b11721', 'b11823'].includes(engineTag) ||
    model.size_bytes !== 2221614624 ||
    !/(?:^|[\\/])Tron-v1-Q6_K\.gguf$/i.test(model.model_path) ||
    !Number.isFinite(context) ||
    context < 256 ||
    context > 8704 ||
    parallel !== 1 ||
    model.n_gpu_layers === 0 ||
    (model.n_gpu_layers != null &&
      model.n_gpu_layers > 0 &&
      model.n_gpu_layers < 31) ||
    model.flash_attn === 'off' ||
    (model.cache_type_k != null && model.cache_type_k !== 'f16') ||
    (model.cache_type_v != null && model.cache_type_v !== 'f16') ||
    model.no_kv_offload === true ||
    model.cpu_moe === true ||
    (model.n_cpu_moe ?? 0) > 0 ||
    (model.n_cpu_ffn ?? 0) > 0 ||
    (model.device != null && model.device !== '' && model.device !== 'CUDA0') ||
    (model.split_mode != null && !['none', 'layer'].includes(model.split_mode))
  )
    return undefined
  const requiredFree = model.size_bytes / 1048576 + 1024
  if (
    devices.length !== 1 ||
    !devices.some(
      (d) =>
        d.id.startsWith('CUDA') &&
        /RTX 5070 Laptop/i.test(d.name) &&
        Number.isFinite(d.free) &&
        d.free >= requiredFree
    )
  ) {
    return undefined
  }
  return { batch: 2048, ubatch: 2048 }
}
