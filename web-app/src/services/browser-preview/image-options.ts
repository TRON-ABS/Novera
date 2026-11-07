export function browserImageOptions(value: { width: number; height: number; steps: number; browserGpuBudgetGiB?: number }) {
  const { width, height, steps } = value
  if (![width, height].every(n => Number.isSafeInteger(n) && n >= 64 && n <= 2048 && n % 16 === 0)) throw new Error('Dimensions Web invalides : multiples de 16, de 64 à 2048 pixels.')
  if (!Number.isSafeInteger(steps) || steps < 1 || steps > 100) throw new Error('Étapes de génération invalides.')
  const gpuBudgetGiB = value.browserGpuBudgetGiB ?? 2
  if (![2, 4, 6, 8, 12].includes(gpuBudgetGiB)) throw new Error('Budget GPU Web invalide.')
  return { width, height, steps, gpuBudgetGiB }
}

export function browserUpscaleTile(gpuBudgetGiB: number, maxBindingBytes: number, requested?: number) {
  if (![2, 4, 6, 8, 12].includes(gpuBudgetGiB)) throw new Error('Budget GPU Web invalide.')
  // Largest ESRGAN im2col: 64 input channels, 3x3 kernel, x2 output,
  // F16 patch storage. Reserve additional space for graph/output buffers.
  // Larger tiles changed the measured rendering and color balance. Preserve
  // the validated Desktop-like 128-pixel default regardless of VRAM budget.
  const candidates = [requested ?? 128]
  for (const tile of candidates) {
    if (![128, 256, 512].includes(tile)) break
    const requiredGiB = tile === 512 ? 6 : tile === 256 ? 4 : 2
    if (gpuBudgetGiB >= requiredGiB && Number.isFinite(maxBindingBytes) && maxBindingBytes >= 64 * 9 * (tile * 2) ** 2 * 2) return tile
  }
  throw new Error('Mémoire ou limite de tampon insuffisante pour ces tuiles Real-ESRGAN.')
}

export function browserImagePerformance(value: unknown): Array<{ label: string; ms: number }> {
  if (!value || typeof value !== 'object') return []
  const record = value as Record<string, unknown>
  return Object.entries({ initializationMs: 'Initialisation', modelLoadMs: 'Chargement des modèles', textEncodingMs: 'Encodage du texte', diffusionMs: 'Diffusion', decodingMs: 'Décodage de l’image', upscalingMs: 'Real-ESRGAN ×2', encodingMs: 'Export PNG' }).flatMap(([key, label]) => {
    const ms = record[key]
    return typeof ms === 'number' && Number.isFinite(ms) && ms >= 0 && ms <= 7 * 24 * 3600 * 1000 ? [{ label, ms }] : []
  })
}
