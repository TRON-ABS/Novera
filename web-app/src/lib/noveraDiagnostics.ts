export const diagnosticOperations = ['unhandled', 'model_load', 'download', 'verification', 'generation', 'save', 'runtime', 'memory_transition', 'configuration', 'smoke_test'] as const
export const diagnosticTasks = ['text', 'image', 'music', 'video', 'embedding', 'unknown'] as const
export const diagnosticEngines = ['llamacpp', 'mlx', 'transformers', 'onnx', 'sdcpp', 'nvfp4', 'acestep', 'cloud', 'unknown'] as const
export const diagnosticCodes = ['memory', 'timeout', 'network', 'authentication', 'rate_limit', 'storage', 'integrity', 'runtime_exit', 'runtime_missing', 'model_missing', 'unsupported', 'unknown', 'monitoring_test'] as const
const reasons = ['COMPONENT_REQUIRED', 'COMPONENT_BUSY', 'COMPONENT_SPACE', 'COMPONENT_RECEIPT', 'COMPONENT_PLATFORM', 'COMPONENT_PROCESS', 'COMPONENT_TIMEOUT', 'COMPONENT_FAILED', 'COMPONENT_UV_MISSING', 'COMPONENT_INTERRUPTED', 'COMPONENT_STORAGE', 'COMPONENT_STORAGE_LINK', 'COMPONENT_PROBE', 'CREATION_BUNDLED_ENGINE_MISSING', 'CREATION_BUSY', 'CREATION_TEXT_ENCODER_AS_DIFFUSION', 'CREATION_UPSCALE_FACTOR_MISMATCH', 'CREATION_UPSCALE_INVALID_PNG', 'CREATION_UPSCALE_INVALID', 'CREATION_UPSCALE_MISSING', 'NVFP4_NATIVE_UNAVAILABLE', 'MUSIC_OUTPUT_FORMAT', 'SETUP_NOT_VERIFIED', 'SETUP_TEXT_MISSING'] as const
export type DiagnosticContext = {
  operation: typeof diagnosticOperations[number]
  task?: typeof diagnosticTasks[number]
  engine?: typeof diagnosticEngines[number]
  code?: typeof diagnosticCodes[number]
  status?: number
}
type Sink = (error: unknown, context: DiagnosticContext) => void
let sink: Sink | undefined
export function installDiagnosticSink(next: Sink) {
  sink = next
  return () => { if (sink === next) sink = undefined }
}
/** Calling this never enables tracking. A sink exists only while consent is active. */
export function reportDiagnostic(error: unknown, context: DiagnosticContext) {
  try {
    if (error && typeof error === 'object' && 'name' in error && error.name === 'AbortError') return
    sink?.(error, context)
  } catch { /* Diagnostics must never replace the original failure. */ }
}
export function diagnosticCode(error: unknown): typeof diagnosticCodes[number] {
  let text = ''
  try { text = (error instanceof Error ? error.message : typeof error === 'string' ? error : '').slice(0, 8192) } catch { return 'unknown' }
  if (/COMPONENT_(SPACE|STORAGE)/.test(text)) return 'storage'
  if (/COMPONENT_RECEIPT/.test(text)) return 'integrity'
  if (/COMPONENT_PLATFORM/.test(text)) return 'unsupported'
  if (/COMPONENT_TIMEOUT/.test(text)) return 'timeout'
  if (/COMPONENT_(REQUIRED|UV_MISSING)/.test(text)) return 'runtime_missing'
  if (/out of memory|memoryerror|failed to allocate|workspace (?:capacity|allocation)|not enough.*memory/i.test(text)) return 'memory'
  if (/sha.?256|checksum|integrity|hash mismatch|verification failed|corrupt/i.test(text)) return 'integrity'
  if (/ENOSPC|disk full|permission denied|EACCES|read.only|failed to (?:save|write)/i.test(text)) return 'storage'
  if (/worker.*(?:exit|died|crash)|process.*(?:exit|terminated)/i.test(text)) return 'runtime_exit'
  if (/unauthori[sz]ed|invalid.?api.?key|\b40[13]\b/i.test(text)) return 'authentication'
  if (/rate.?limit|\b429\b/i.test(text)) return 'rate_limit'
  if (/timeout|timed out|deadline/i.test(text)) return 'timeout'
  if (/fetch failed|failed to fetch|network|ECONN|connection refused|offline/i.test(text)) return 'network'
  if (/runtime.*(?:missing|unavailable)|not installed|executable.*not found|NVFP4_NATIVE_UNAVAILABLE/i.test(text)) return 'runtime_missing'
  if (/model.*(?:missing|not found)|SETUP_TEXT_MISSING/i.test(text)) return 'model_missing'
  if (/unsupported|not supported|incompatible/i.test(text)) return 'unsupported'
  return 'unknown'
}
/** Runtime allowlists remain necessary even for typed callers and native events. */
export function safeDiagnosticContext(error: unknown, input: DiagnosticContext) {
  let reason: string | undefined
  try {
    const message = (error instanceof Error ? error.message : typeof error === 'string' ? error : '').slice(0, 8192)
    reason = reasons.find(code => new RegExp(`(?:^|[^A-Z0-9_])${code}(?:$|[^A-Z0-9_])`).test(message))
  } catch { /* Never serialize arbitrary context or error properties. */ }
  return {
    operation: diagnosticOperations.includes(input.operation) ? input.operation : 'unhandled',
    task: diagnosticTasks.includes(input.task!) ? input.task! : 'unknown',
    engine: diagnosticEngines.includes(input.engine!) ? input.engine! : 'unknown',
    error_code: diagnosticCodes.includes(input.code!) ? input.code! : input.status === 401 || input.status === 403 ? 'authentication' : input.status === 429 ? 'rate_limit' : diagnosticCode(error),
    ...(reason ? { reason_code: reason } : {}),
    ...(Number.isInteger(input.status) && input.status! >= 400 && input.status! <= 599 ? { http_status: input.status } : {}),
  }
}
