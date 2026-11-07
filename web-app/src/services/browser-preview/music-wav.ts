/** ACE returns planar stereo; WAV stores interleaved IEEE float samples. */
export function musicWav(samples: Float32Array, frames: number, rate: number): Blob {
  if (rate !== 48000 || !Number.isSafeInteger(frames) || frames < 1 || frames > rate * 30 || samples.length !== frames * 2) throw new Error('Dimensions audio invalides.')
  const buffer = new ArrayBuffer(44 + samples.length * 4)
  const view = new DataView(buffer)
  const ascii = (offset: number, value: string) => { for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i)) }
  ascii(0, 'RIFF'); view.setUint32(4, buffer.byteLength - 8, true); ascii(8, 'WAVE'); ascii(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 3, true); view.setUint16(22, 2, true)
  view.setUint32(24, rate, true); view.setUint32(28, rate * 8, true); view.setUint16(32, 8, true); view.setUint16(34, 32, true)
  ascii(36, 'data'); view.setUint32(40, samples.length * 4, true)
  for (let frame = 0; frame < frames; frame++) for (let channel = 0; channel < 2; channel++) {
    const sample = samples[channel * frames + frame]
    if (!Number.isFinite(sample) || Math.abs(sample) > 1) throw new Error('Échantillon audio invalide.')
    view.setFloat32(44 + (frame * 2 + channel) * 4, sample, true)
  }
  return new Blob([buffer], { type: 'audio/wav' })
}
