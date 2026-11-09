import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSystemSpeechBackend, localSystemVoice, localSystemVoices } from '../systemSpeech'

const local = { voiceURI: 'local-fr', name: 'Local French', lang: 'fr-FR', localService: true } as SpeechSynthesisVoice
const remote = { voiceURI: 'online-fr', name: 'Online French', lang: 'fr-FR', localService: false } as SpeechSynthesisVoice
afterEach(() => vi.unstubAllGlobals())
function setup(end = true) {
  const utterances: SpeechSynthesisUtterance[] = []
  const synth = { getVoices: () => [local, remote], cancel: vi.fn(), speak: vi.fn((utterance: SpeechSynthesisUtterance) => {
    utterances.push(utterance)
    if (end) queueMicrotask(() => { utterance.onstart?.({} as SpeechSynthesisEvent); utterance.onend?.({} as SpeechSynthesisEvent) })
  }) }
  vi.stubGlobal('speechSynthesis', synth)
  vi.stubGlobal('SpeechSynthesisUtterance', class { constructor(public text: string) {} })
  return { synth, utterances }
}
describe('local system speech output', () => {
  it('lists local voices only and refuses explicitly selected remote or missing voices', async () => {
    const { synth } = setup()
    expect(localSystemVoices()).toEqual([local])
    expect(localSystemVoice('fr')).toBe(local)
    for (const uri of ['online-fr', 'removed-voice']) await expect(createSystemSpeechBackend('fr', uri).speak('Bonjour', new AbortController().signal)).rejects.toThrow('unavailable')
    expect(synth.speak).not.toHaveBeenCalled()
  })
  it('reads without a recognizer or an Omni model and respects the selected installed voice', async () => {
    const { utterances } = setup()
    const output = createSystemSpeechBackend('fr', 'local-fr')
    await output.speak('17 + 25 = 42', new AbortController().signal)
    expect(utterances[0].voice).toBe(local)
    expect(utterances[0].lang).toBe('fr-FR')
    expect(utterances[0].text).toContain('dix-sept')
    await expect(output.listen(new AbortController().signal)).rejects.toThrow('unavailable')
  })
  it('cancels active output promptly instead of waiting for a browser end event', async () => {
    const { synth } = setup(false)
    const signal = new AbortController()
    const output = createSystemSpeechBackend('fr')
    const reading = output.speak('Bonjour', signal.signal)
    const rejected = expect(reading).rejects.toThrow('cancelled')
    signal.abort()
    await rejected
    expect(synth.cancel).toHaveBeenCalled()
  })
  it('keeps input delegated to the existing backend without adding a recognizer', async () => {
    setup()
    const input = { listen: vi.fn().mockResolvedValue('Bonjour'), speak: vi.fn(), stop: vi.fn(), setInputLanguage: vi.fn() }
    const output = createSystemSpeechBackend('fr', '', input)
    output.setInputLanguage?.('Bonjour')
    expect(await output.listen(new AbortController().signal)).toBe('Bonjour')
    output.stop()
    expect(input.stop).toHaveBeenCalledOnce()
    expect(input.speak).not.toHaveBeenCalled()
  })
})
