import { expect, it } from 'vitest'
import { browserImageOptions, browserImagePerformance, browserUpscaleTile } from './image-options'

it('keeps the exact desktop panorama dimensions and step count', () => {
  expect(browserImageOptions({ width: 2048, height: 880, steps: 4, browserGpuBudgetGiB: 6 })).toEqual({ width: 2048, height: 880, steps: 4, gpuBudgetGiB: 6 })
  expect(browserImageOptions({ width: 2048, height: 2048, steps: 4 }).width).toBe(2048)
})
it('shows only finite bounded stage measurements', () => {
  expect(browserImagePerformance({ modelLoadMs: 1000, diffusionMs: NaN, decodingMs: -1, initializationMs: Infinity })).toEqual([{ label: 'Chargement des modèles', ms: 1000 }])
})
it('rejects unsupported dimensions before allocating model or pixel buffers', () => {
  for (const value of [0, 63, 2049, 880.5, NaN, Infinity]) expect(() => browserImageOptions({ width: value, height: 880, steps: 4 })).toThrow('Dimensions')
  expect(() => browserImageOptions({ width: 2048, height: 881, steps: 4 })).toThrow('Dimensions')
  expect(() => browserImageOptions({ width: 2048, height: 880, steps: 0 })).toThrow('Étapes')
  expect(() => browserImageOptions({ width: 2048, height: 880, steps: 4, browserGpuBudgetGiB: 64 })).toThrow('Budget')
})
it('preserves the validated x2 default and bounds explicit probes by GPU limits', () => {
  expect(browserUpscaleTile(2, 2 ** 31)).toBe(128)
  expect(browserUpscaleTile(4, 2 ** 31)).toBe(128)
  expect(browserUpscaleTile(6, 2 ** 31)).toBe(128)
  expect(browserUpscaleTile(6, 128 * 1024 ** 2)).toBe(128)
  expect(browserUpscaleTile(6, 2 ** 31, 256)).toBe(256)
  expect(browserUpscaleTile(6, 2 ** 31, 512)).toBe(512)
  expect(() => browserUpscaleTile(4, 2 ** 31, 512)).toThrow('insuffisante')
  expect(() => browserUpscaleTile(6, 64 * 1024 ** 2)).toThrow('insuffisante')
  expect(() => browserUpscaleTile(6, 2 ** 31, 1024)).toThrow('insuffisante')
})
