export type ImageSeedMode = 'random' | 'fixed' | 'increment' | 'decrement'
export const MAX_IMAGE_SEED = 0xffffffff

/** Concrete uint32 seeds work with all three local image engines. */
export function imageSeedPlan(
  seed: number,
  mode: ImageSeedMode = 'fixed',
  randomSeed = 0
) {
  const value = mode === 'random' ? randomSeed : seed
  if (!Number.isInteger(value) || value < 0 || value > MAX_IMAGE_SEED)
    throw new Error('Invalid image seed')
  return {
    seed: value,
    nextSeed:
      mode === 'increment'
        ? (value + 1) >>> 0
        : mode === 'decrement'
          ? (value - 1) >>> 0
          : seed,
  }
}
