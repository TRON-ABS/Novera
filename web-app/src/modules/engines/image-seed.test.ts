import { describe, expect, it } from 'vitest'
import { imageSeedPlan, MAX_IMAGE_SEED } from './image-seed'

describe('local image seeds', () => {
  it('preserves fixed seeds and the behavior of saved settings without a mode', () => {
    expect(imageSeedPlan(42)).toEqual({ seed: 42, nextSeed: 42 })
    expect(imageSeedPlan(0, 'fixed')).toEqual({ seed: 0, nextSeed: 0 })
  })
  it('uses a concrete random uint32 without replacing the user’s fixed seed', () => {
    expect(imageSeedPlan(42, 'random', MAX_IMAGE_SEED)).toEqual({
      seed: MAX_IMAGE_SEED,
      nextSeed: 42,
    })
  })
  it('wraps increment and decrement at the supported uint32 boundaries', () => {
    expect(imageSeedPlan(MAX_IMAGE_SEED, 'increment')).toEqual({
      seed: MAX_IMAGE_SEED,
      nextSeed: 0,
    })
    expect(imageSeedPlan(0, 'decrement')).toEqual({
      seed: 0,
      nextSeed: MAX_IMAGE_SEED,
    })
    expect(imageSeedPlan(42, 'increment').nextSeed).toBe(43)
    expect(imageSeedPlan(42, 'decrement').nextSeed).toBe(41)
  })
  it.each([-1, MAX_IMAGE_SEED + 1, NaN, Infinity, 1.5])(
    'rejects an invalid seed %s',
    (seed) => {
      expect(() => imageSeedPlan(seed, 'fixed')).toThrow()
      expect(() => imageSeedPlan(42, 'random', seed)).toThrow()
    }
  )
})
