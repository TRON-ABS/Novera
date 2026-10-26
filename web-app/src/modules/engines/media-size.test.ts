import { describe, expect, it } from 'vitest'
import {
  mediaRatios,
  mediaResolutions,
  fitMediaRatio,
  inferMediaRatio,
} from './media-size'
describe('image and video dimensions', () => {
  it('preserves the current long edge while changing aspect ratio', () => {
    expect(fitMediaRatio('16:9', 1024)).toEqual({ width: 1024, height: 576 })
    expect(fitMediaRatio('9:16', 1024)).toEqual({ width: 576, height: 1024 })
    expect(fitMediaRatio('4:3', 1024)).toEqual({ width: 1024, height: 768 })
    expect(fitMediaRatio('21:9', 1024)).toEqual({ width: 1024, height: 432 })
  })
  it('keeps every preset compatible with the native bounds and grid', () => {
    for (const ratio of mediaRatios)
      for (const resolution of mediaResolutions) {
        const { width, height } = fitMediaRatio(ratio, resolution)
        expect(width % 16).toBe(0)
        expect(height % 16).toBe(0)
        expect(Math.min(width, height)).toBeGreaterThanOrEqual(64)
        expect(Math.max(width, height)).toBeLessThanOrEqual(2048)
        expect(Math.max(width, height)).toBe(resolution)
      }
  })
  it('supports custom ratios and rejects impossible ratios', () => {
    expect(fitMediaRatio('custom:7:5', 1024)).toEqual({
      width: 1024,
      height: 736,
    })
    expect(inferMediaRatio(1024, 576)).toBe('16:9')
    expect(() => fitMediaRatio('1:100', 512)).toThrow()
    expect(() => fitMediaRatio('0:1', 512)).toThrow()
  })
})
