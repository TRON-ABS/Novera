import { describe, expect, it } from 'vitest'
import { measuredBatchProfile } from './performance-profile'

const model = {
  model_path: 'C:\\models\\Tron-v1-Q6_K.gguf',
  size_bytes: 2221614624,
}
const devices = [
  { id: 'CUDA0', name: 'NVIDIA GeForce RTX 5070 Laptop GPU', free: 7000 },
]

describe('calibrated batching', () => {
  it('selects the measured configuration only in its calibration domain', () => {
    expect(measuredBatchProfile(model, devices, 'b11721', 8192, 1)).toEqual({
      batch: 2048,
      ubatch: 2048,
    })
    expect(measuredBatchProfile(model, devices, 'b11823', 8192, 1)).toEqual({
      batch: 2048,
      ubatch: 2048,
    })
    for (const context of [0, NaN, 32768]) {
      expect(
        measuredBatchProfile(model, devices, 'b11721', context, 1)
      ).toBeUndefined()
    }
    expect(
      measuredBatchProfile(model, devices, 'b11722', 8192, 1)
    ).toBeUndefined()
    expect(
      measuredBatchProfile(model, devices, 'b11721', 8192, 2)
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, size_bytes: 123 },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, n_gpu_layers: 0 },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, n_gpu_layers: 10 },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, flash_attn: 'off' },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, cache_type_k: 'q4_0' },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        { ...model, device: 'CPU' },
        devices,
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        model,
        [{ ...devices[0], free: 512 }],
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
    expect(
      measuredBatchProfile(
        model,
        [{ ...devices[0], name: 'Other GPU' }],
        'b11721',
        8192,
        1
      )
    ).toBeUndefined()
  })
})
