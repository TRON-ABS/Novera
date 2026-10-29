/** Invalid or legacy preferences retain the single-output default. */
export function normalizeGenerationCount(value: unknown): number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1 && value <= 10 ? value : 1
}
