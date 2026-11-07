import { describe, it, expect } from 'vitest'
import { VoiceUtterance } from '../voiceUtterance'

describe('bounded microphone utterances', () => {
  it('returns no audio for sustained silence', () => {
    const speech = new VoiceUtterance()
    let done = false
    for (let frame = 0; frame < 600; frame++) done = speech.push(new ArrayBuffer(640), 0)
    expect(done).toBe(true)
    expect(speech.pcm()).toHaveLength(0)
  })
  it('keeps the beginning and ends a phrase after a natural pause', () => {
    const speech = new VoiceUtterance()
    for (let frame = 0; frame < 8; frame++) speech.push(new ArrayBuffer(640), 0)
    for (let frame = 0; frame < 20; frame++) expect(speech.push(new ArrayBuffer(640), 0.05)).toBe(false)
    for (let frame = 0; frame < 54; frame++) expect(speech.push(new ArrayBuffer(640), 0)).toBe(false)
    expect(speech.push(new ArrayBuffer(640), 0)).toBe(true)
    expect(speech.pcm().byteLength).toBe(83 * 640)
  })
  it('bounds a continuously noisy input to twenty seconds', () => {
    const speech = new VoiceUtterance()
    let done = false
    for (let frame = 0; frame < 1000; frame++) done = speech.push(new ArrayBuffer(640), 0.1)
    expect(done).toBe(true)
    expect(speech.pcm().byteLength).toBeLessThanOrEqual(640000)
  })
  it('does not transcribe a brief click or invalid frames', () => {
    const speech = new VoiceUtterance()
    speech.push(new ArrayBuffer(640), 0.1)
    speech.push(new ArrayBuffer(640), 0.1)
    expect(speech.pcm()).toHaveLength(0)
    expect(() => speech.push(new ArrayBuffer(100000), 1)).toThrow()
  })
})
