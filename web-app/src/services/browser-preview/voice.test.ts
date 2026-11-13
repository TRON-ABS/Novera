import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createBrowserVoiceBackend, pcmSamples, unlockBrowserVoice } from './voice'
import type { BrowserRuntime } from './runtime'
import { nativeSpeechSettings, omniAsrPrompt, omniTtsPrompt } from './voice-prompts'

const capture = vi.hoisted(() => vi.fn())
vi.mock('@/lib/omniVoice', () => ({ capturePcm: capture }))
beforeEach(() => vi.clearAllMocks())

describe('browser Omni microphone', () => {
  it('uses documented task prompts with English language names and selected gender', () => {
    expect(omniAsrPrompt('fr-FR')).toBe('Perform ASR in French.')
    expect(omniTtsPrompt('en_GB', 'female')).toBe('Perform TTS in British English using a female voice.')
    expect(nativeSpeechSettings(omniTtsPrompt('de', 'female'))).toEqual({ lang: 'de', voice: 'female' })
    expect(() => omniTtsPrompt('xx')).toThrow('unavailable')
  })
  it('plays model samples at 24 kHz and rejects a silent synthesis result', async () => {
    const started = vi.fn()
    const buffer = { copyToChannel: vi.fn(), duration: 0.1 }
    const createBuffer = vi.fn(() => buffer)
    vi.stubGlobal('AudioContext', class {
      state = 'running'; currentTime = 0; destination = {}
      resume = vi.fn().mockResolvedValue(undefined)
      createBuffer = createBuffer
      createBufferSource() {
        const source = { buffer: null, onended: undefined as undefined | (() => void), connect: vi.fn(), disconnect: vi.fn(), stop: vi.fn(), start: () => { started(); queueMicrotask(() => source.onended?.()) } }
        return source
      }
    })
    try {
      unlockBrowserVoice()
      const runtime = { speech: vi.fn<BrowserRuntime['speech']>(async (_id, _messages, _mode, _signal, audio) => { audio?.(new Float32Array([0, 0.2])); return '' }) }
      const backend = createBrowserVoiceBackend('omni', 'fr', runtime as unknown as BrowserRuntime, 'female')
      await backend.speak('Bonjour', new AbortController().signal)
      expect(runtime.speech.mock.calls[0][1][0]).toEqual({ role: 'system', content: 'Perform TTS in French using a female voice.' })
      expect(createBuffer).toHaveBeenCalledWith(1, 2, 24000)
      expect(started).toHaveBeenCalledOnce()
      runtime.speech.mockImplementation(async () => '')
      await expect(backend.speak('Bonjour', new AbortController().signal)).rejects.toThrow('unavailable')
    } finally { vi.unstubAllGlobals() }
  })
  it('reads signed PCM16 samples with a view offset and rejects partial samples', () => {
    const pcm = new Uint8Array([0, 0, 0, 128, 255, 127, 0, 0])
    expect([...pcmSamples(pcm.subarray(2, 6))]).toEqual([-1, 32767 / 32768])
    expect(() => pcmSamples(pcm.subarray(0, 3))).toThrow('unavailable')
  })

  it('transcribes captured PCM through the browser runtime', async () => {
    capture.mockImplementation(async (_signal, onReady) => {
      onReady()
      return new Uint8Array([0, 128, 255, 127])
    })
    const runtime = { load: vi.fn(), speech: vi.fn().mockResolvedValue(' Bonjour ') }
    const phase = vi.fn()
    const backend = createBrowserVoiceBackend('omni', 'fr', runtime as unknown as BrowserRuntime)
    expect(await backend.listen(new AbortController().signal, undefined, phase)).toBe('Bonjour')
    expect(phase.mock.calls.map(call => call[0])).toEqual(['preparing', 'listening', 'transcribing'])
    expect(runtime.speech.mock.calls[0][1][0]).toEqual({ role: 'system', content: 'Perform ASR in French.' })
    expect(runtime.speech.mock.calls[0][1][1].content[0]).toEqual({ type: 'audio', audio: new Float32Array([-1, 32767 / 32768]) })
    expect(runtime.speech.mock.calls[0][2]).toBe('text')
  })

  it('does not send silence or capture after cancellation during loading', async () => {
    const runtime = { load: vi.fn(), speech: vi.fn() }
    const backend = createBrowserVoiceBackend('omni', 'fr', runtime as unknown as BrowserRuntime)
    capture.mockResolvedValue(new Uint8Array())
    expect(await backend.listen(new AbortController().signal)).toBe('')
    expect(runtime.speech).not.toHaveBeenCalled()
    capture.mockClear()
    const controller = new AbortController()
    runtime.load.mockImplementation(async () => { controller.abort() })
    await expect(backend.listen(controller.signal)).rejects.toThrow()
    expect(capture).not.toHaveBeenCalled()
  })
})
