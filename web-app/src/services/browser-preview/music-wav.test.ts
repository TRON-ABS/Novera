import { expect, it } from 'vitest'
import { Blob as NodeBlob } from 'node:buffer'
import { musicWav } from './music-wav'

it('interleaves planar stereo without changing sample values and writes an IEEE float WAV header', async () => {
  const previous = globalThis.Blob
  globalThis.Blob = NodeBlob as unknown as typeof Blob
  try {
    const wav = musicWav(new Float32Array([0.25, -0.5, 0.75, -1]), 2, 48000)
    const view = new DataView(await wav.arrayBuffer())
    expect(wav.type).toBe('audio/wav')
    expect(view.getUint16(20, true)).toBe(3)
    expect(view.getUint16(22, true)).toBe(2)
    expect(view.getUint32(24, true)).toBe(48000)
    expect(view.getUint32(40, true)).toBe(16)
    expect([0, 1, 2, 3].map(i => view.getFloat32(44 + i * 4, true))).toEqual([0.25, 0.75, -0.5, -1])
  } finally { globalThis.Blob = previous }
})

it('rejects invalid sizes, rates and non-finite or unclipped audio', () => {
  for (const samples of [[NaN, 0], [Infinity, 0], [1.1, 0]]) expect(() => musicWav(new Float32Array(samples), 1, 48000)).toThrow('Échantillon')
  expect(() => musicWav(new Float32Array(2), 1, 44100)).toThrow('Dimensions')
  expect(() => musicWav(new Float32Array(1), 1, 48000)).toThrow('Dimensions')
  expect(() => musicWav(new Float32Array(2), 48000 * 31, 48000)).toThrow('Dimensions')
})
