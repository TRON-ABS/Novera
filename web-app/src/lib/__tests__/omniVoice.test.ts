import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { capturePcm, createOmniVoiceBackend, isOmniVoiceModel, omniVoiceSupported } from '../omniVoice'

const speech = vi.hoisted(() => ({listen:vi.fn(),speak:vi.fn(),stop:vi.fn()}))
const playReply = vi.hoisted(() => vi.fn())
vi.mock('../omniSpeech', () => ({playOmniReply:playReply}))
const foreground = vi.hoisted(() => vi.fn())
vi.mock('@tauri-apps/api/core', () => ({invoke:foreground}))
vi.mock('../voicePlatform', () => ({ nativeWindowsVoice: () => true, createVoiceBackend: () => speech }))
vi.mock('@tauri-apps/plugin-http', () => ({ fetch: (...args: unknown[]) => fetchMock(...args) }))
const stopTrack = vi.fn()
const stream = {getTracks: () => [{stop:stopTrack}]}
const getUserMedia = vi.fn()
class Context {
  sampleRate = 16000
  state = 'running'
  audioWorklet = {addModule:vi.fn(async () => {})}
  destination = {}
  createMediaStreamSource() { return {connect:vi.fn(),disconnect:vi.fn()} }
  resume = vi.fn(async () => {})
  close = vi.fn(async () => { this.state = 'closed' })
}
class Worklet {
  static current?: Worklet
  port = {onmessage:null as null | ((event: {data:{pcm:ArrayBuffer;rms:number}}) => void)}
  connect = vi.fn()
  disconnect = vi.fn()
  constructor() { Worklet.current = this }
}
const fetchMock = vi.fn()
beforeEach(() => {
  vi.clearAllMocks(); Worklet.current = undefined
  foreground.mockResolvedValue(true)
  playReply.mockResolvedValue(undefined)
  getUserMedia.mockResolvedValue(stream)
  fetchMock.mockResolvedValue({ok:true,json:async () => ({text:'Bonjour Novera'})})
  vi.stubGlobal('AudioContext', Context)
  vi.stubGlobal('AudioWorkletNode', Worklet)
  vi.stubGlobal('fetch', fetchMock)
  Object.defineProperty(navigator, 'mediaDevices', {value:{getUserMedia},configurable:true})
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })
async function phrase() {
  await vi.waitFor(() => expect(Worklet.current?.port.onmessage).toBeTypeOf('function'))
  for (let frame = 0; frame < 20; frame++) Worklet.current!.port.onmessage?.({data:{pcm:new ArrayBuffer(640),rms:0.05}})
  for (let frame = 0; frame < 55; frame++) Worklet.current!.port.onmessage?.({data:{pcm:new ArrayBuffer(640),rms:0}})
}
const prepare = () => Promise.resolve({port:34123,api_key:'test-local-key'})

describe('direct local Omni microphone', () => {
  it('uses the user message language for speech even when the interface is English', async () => {
    const backend=createOmniVoiceBackend('en',{model:'local-omni',prepare})
    backend.setInputLanguage?.('Combien font deux plus deux ?')
    await backend.speak('2 + 2 = 4',new AbortController().signal)
    expect(playReply).toHaveBeenCalledWith('2 + 2 = 4','fr','male',expect.any(AbortSignal),prepare,'local-omni')
  })
  it('selects only the local LFM3-Omni model and checks audio capture availability', () => {
    expect(isOmniVoiceModel('llamacpp','C:/models/LFM3-Omni-2B')).toBe(true)
    expect(isOmniVoiceModel('llamacpp','LFM3-Audio-2B')).toBe(true)
    expect(isOmniVoiceModel('openai','LFM3-Omni-2B')).toBe(false)
    expect(isOmniVoiceModel('llamacpp','text-only-model')).toBe(false)
    expect(omniVoiceSupported()).toBe(true)
  })
  it('sends PCM to the authenticated loopback model, never to Windows recognition', async () => {
    const phase = vi.fn()
    const backend = createOmniVoiceBackend('fr',{model:'local-omni',prepare})
    const result = backend.listen(new AbortController().signal, undefined, phase)
    await phrase()
    expect(await result).toBe('Bonjour Novera')
    expect(stopTrack).toHaveBeenCalledOnce()
    expect(speech.listen).not.toHaveBeenCalled()
    expect(fetchMock.mock.calls[0][0]).toBe('http://127.0.0.1:34123/v1/novera/audio/transcriptions')
    const request = fetchMock.mock.calls[0][1]
    expect(request.headers.Authorization).toBe('Bearer test-local-key')
    expect(JSON.parse(request.body)).toMatchObject({model:'local-omni',language:'fr',sample_rate:16000})
    expect(JSON.parse(request.body).audio.length).toBeGreaterThan(100)
    expect(phase.mock.calls.map(call => call[0])).toEqual(['preparing','listening','transcribing'])
    await backend.speak('Réponse',new AbortController().signal)
    expect(playReply).toHaveBeenCalledWith('Réponse','fr','male',expect.any(AbortSignal),prepare,'local-omni')
    expect(speech.speak).not.toHaveBeenCalled()
  })
  it('never opens a microphone after cancellation during model loading', async () => {
    let ready!: (value:{port:number;api_key:string}) => void
    const pending = new Promise<{port:number;api_key:string}>(resolve => { ready = resolve })
    const controller = new AbortController()
    const result = createOmniVoiceBackend('fr',{model:'omni',prepare:() => pending}).listen(controller.signal)
    controller.abort(); ready({port:34123,api_key:'test'})
    await expect(result).rejects.toThrow('cancelled')
    expect(getUserMedia).not.toHaveBeenCalled()
  })
  it('does not silently fall back to Windows when native model transcription fails', async () => {
    fetchMock.mockResolvedValue({ok:true,json:async () => ({error:{code:'audio_transcription_failed'}})})
    const result = createOmniVoiceBackend('fr',{model:'omni',prepare}).listen(new AbortController().signal)
    const failure = expect(result).rejects.toThrow('unavailable')
    await phrase(); await failure
    expect(speech.listen).not.toHaveBeenCalled()
  })
  it('releases a permission grant arriving after the user stopped', async () => {
    let grant!: (value:unknown) => void
    getUserMedia.mockReturnValue(new Promise(resolve => { grant = resolve }))
    const controller = new AbortController()
    const result = capturePcm(controller.signal)
    await vi.waitFor(() => expect(getUserMedia).toHaveBeenCalledOnce())
    controller.abort()
    await expect(result).rejects.toThrow('cancelled')
    grant(stream); await Promise.resolve(); await Promise.resolve()
    expect(stopTrack).toHaveBeenCalledOnce()
    expect(Worklet.current?.disconnect).toHaveBeenCalledOnce()
  })
  it('never opens the microphone in a background native window', async () => {
    foreground.mockResolvedValue(false)
    const result = createOmniVoiceBackend('fr',{model:'omni',prepare}).listen(new AbortController().signal)
    await expect(result).rejects.toThrow('cancelled')
    expect(getUserMedia).not.toHaveBeenCalled()
  })
  it('releases capture when native foreground is lost despite stale WebView focus', async () => {
    const result = createOmniVoiceBackend('fr',{model:'omni',prepare}).listen(new AbortController().signal)
    const cancelled = expect(result).rejects.toThrow('cancelled')
    await vi.waitFor(() => expect(Worklet.current?.port.onmessage).toBeTypeOf('function'))
    foreground.mockResolvedValue(false)
    await cancelled
    expect(stopTrack).toHaveBeenCalledOnce()
    expect(fetchMock).not.toHaveBeenCalled()
  })
})
