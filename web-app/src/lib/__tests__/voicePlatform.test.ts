import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createVoiceBackend, voiceSupported, voiceLocale } from '../voicePlatform'
import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { isPlatformTauri } from '@/lib/platform/utils'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@tauri-apps/api/event', () => ({ listen: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: vi.fn(() => false) }))
const invokeMock = vi.mocked(invoke)
const platformMock = vi.mocked(isPlatformTauri)

class Recognition {
  static instance: Recognition
  static available = vi.fn(async () => 'available')
  processLocally = true
  lang = ''
  continuous = false
  interimResults = false
  onresult: ((event: {results: {transcript: string}[][]}) => void) | null = null
  onend: (() => void) | null = null
  onerror: ((event: {error: string}) => void) | null = null
  constructor() { Recognition.instance = this }
  start = vi.fn()
  abort = vi.fn()
}
Recognition.prototype.processLocally = true

beforeEach(() => {
  invokeMock.mockReset()
  vi.mocked(listen).mockReset().mockResolvedValue(vi.fn())
  platformMock.mockReturnValue(false)
  Recognition.available.mockReset().mockResolvedValue('available')
  vi.stubGlobal('SpeechRecognition', Recognition)
  vi.stubGlobal('speechSynthesis', { getVoices: () => [], speak: vi.fn(), cancel: vi.fn() })
})
afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks() })

describe('local voice adapters', () => {
  it('keeps a normal long reply and its final sentence in one Windows synthesizer session',async()=>{
    platformMock.mockReturnValue(true);vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'done',text:''})
    const text='Une phrase française. '.repeat(100)+'Dernière phrase à lire.'
    await createVoiceBackend('fr').speak(text,new AbortController().signal)
    expect(invokeMock).toHaveBeenCalledOnce()
    expect(invokeMock.mock.calls[0][1]?.text).toBe(text)
  })
  it('reports a system synthesis failure instead of silently skipping a reply',async()=>{
    platformMock.mockReturnValue(true);vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'unavailable',text:''})
    await expect(createVoiceBackend('fr').speak('Bonjour',new AbortController().signal)).rejects.toThrow('unavailable')
  })
  it('queues one browser system utterance ahead and waits for the final utterance',async()=>{
    const queue: Array<{text:string;onend:()=>void;onstart:()=>void}>=[]
    vi.stubGlobal('SpeechSynthesisUtterance',class {constructor(public text:string){}})
    vi.stubGlobal('speechSynthesis',{getVoices:()=>[{lang:'fr',localService:true}],speak:vi.fn(utterance=>queue.push(utterance)),cancel:vi.fn()})
    const text='Une phrase. '.repeat(45)+'Dernière phrase.'
    const result=createVoiceBackend('fr').speak(text,new AbortController().signal)
    expect(queue).toHaveLength(2)
    let done=false;void result.then(()=>done=true)
    for(let i=0;i<queue.length;i++){
      queue[i].onstart?.();queue[i].onend()
      await Promise.resolve();await Promise.resolve()
    }
    await result
    expect(done).toBe(true)
    expect(queue.map(utterance=>utterance.text).join('')).toBe(text)
    expect(queue.at(-1)?.text).toContain('Dernière phrase.')
  })
  it('cancels the bounded browser queue without scheduling the rest of the reply',async()=>{
    const queue:unknown[]=[];const cancel=vi.fn()
    vi.stubGlobal('SpeechSynthesisUtterance',class {constructor(public text:string){}})
    vi.stubGlobal('speechSynthesis',{getVoices:()=>[{lang:'fr',localService:true}],speak:vi.fn(utterance=>queue.push(utterance)),cancel})
    const controller=new AbortController()
    const result=createVoiceBackend('fr').speak('Une longue réponse. '.repeat(100),controller.signal)
    const rejected=expect(result).rejects.toThrow('cancelled')
    expect(queue).toHaveLength(2)
    controller.abort();await rejected
    expect(cancel).toHaveBeenCalled()
    expect(queue).toHaveLength(2)
  })
  it('cancels the same native speech session when its signal is aborted',async()=>{
    platformMock.mockReturnValue(true);vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    let finish!:(result:unknown)=>void
    invokeMock.mockImplementation((command)=>command==='voice_run'?new Promise(resolve=>{finish=resolve}):Promise.resolve())
    const controller=new AbortController()
    const result=createVoiceBackend('fr').speak('Bonjour',controller.signal)
    const rejected=expect(result).rejects.toThrow('cancelled')
    const session=invokeMock.mock.calls[0][1]?.session
    controller.abort();finish({status:'done',text:''});await rejected
    expect(invokeMock).toHaveBeenCalledWith('voice_cancel',{session})
  })
  it('speaks a numeric answer in the detected user language instead of the interface locale', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'done',text:''})
    const backend=createVoiceBackend('en')
    backend.setInputLanguage?.('Combien font deux plus deux ?')
    await backend.speak('2 + 2 = 4',new AbortController().signal)
    expect(invokeMock.mock.lastCall?.[1]).toMatchObject({locale:'fr',text:'Calcul : deux plus deux égale quatre.'})
  })
  it('does not turn an uncertain legacy Windows result into unavailability', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'uncertain',text:'Editable words'})
    await expect(createVoiceBackend('fr').listen(new AbortController().signal)).resolves.toEqual({
      text:'Editable words',needsReview:true,
    })
  })
  it('can speak after cancelling a capture by using a fresh native operation session', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'recognized',text:'Question'})
    const backend=createVoiceBackend('fr')
    await backend.listen(new AbortController().signal)
    const capturedSession=invokeMock.mock.calls[0][1]?.session
    backend.stop()
    invokeMock.mockResolvedValue({status:'done',text:''})
    await backend.speak('Answer',new AbortController().signal)
    const spokenSession=invokeMock.mock.lastCall?.[1]?.session
    expect(spokenSession).not.toBe(capturedSession)
    expect(invokeMock.mock.lastCall?.[1]?.operation).toBe('speak')
  })
  it('uses native Windows IPC with text as data and cancels the same session', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'recognized',text:'Bonjour'})
    const backend = createVoiceBackend('fr')
    expect(await backend.listen(new AbortController().signal)).toBe('Bonjour')
    const first = invokeMock.mock.calls[0]
    expect(first[0]).toBe('voice_run')
    expect(first[1]).toMatchObject({operation:'listen',locale:'fr',text:''})
    invokeMock.mockResolvedValue({status:'done',text:''})
    await backend.speak('$(untrusted) is plain speech text', new AbortController().signal)
    expect(invokeMock.mock.calls[1][1]).toMatchObject({operation:'speak',text:'$(untrusted) is plain speech text'})
    backend.stop()
    const speechSession = invokeMock.mock.calls[1][1]?.session
    expect(speechSession).not.toBe(first[1]?.session)
    expect(invokeMock.mock.lastCall).toEqual(['voice_cancel',{session:speechSession}])
  })
  it('does not begin native recognition after cancellation', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows NT 10.0')
    const signal = new AbortController(); signal.abort()
    await expect(createVoiceBackend('fr').listen(signal.signal)).rejects.toThrow('cancelled')
    expect(invokeMock).not.toHaveBeenCalled()
  })
  it('does not mistake an unverified native WebView for a speech adapter', () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Linux')
    expect(voiceSupported()).toBe(false)
  })
  it('never falls back to cloud recognition or silently downloads a language pack', async () => {
    Recognition.available.mockResolvedValue('downloadable')
    await expect(createVoiceBackend('fr').listen(new AbortController().signal)).rejects.toThrow('unavailable')
    expect(Recognition.available).toHaveBeenCalledWith({langs:['fr'],processLocally:true})
  })
  it('only returns recognized text after recognition has ended', async () => {
    const promise = createVoiceBackend('fr').listen(new AbortController().signal)
    await Promise.resolve()
    const recognition = Recognition.instance
    expect(recognition.processLocally).toBe(true)
    recognition.onresult?.({results:[[{transcript:'Bonjour'}]]})
    let finished = false; void promise.then(() => { finished = true })
    await Promise.resolve()
    expect(finished).toBe(false)
    recognition.onend?.()
    expect(await promise).toBe('Bonjour')
  })
  it('aborts active browser recognition on cancellation', async () => {
    const signal = new AbortController()
    const promise = createVoiceBackend('fr').listen(signal.signal)
    await Promise.resolve(); signal.abort()
    await expect(promise).rejects.toThrow('cancelled')
    expect(Recognition.instance.abort).toHaveBeenCalledOnce()
  })
  it('shows browser hypotheses immediately but only sends finalized words', async () => {
    const transcribe = vi.fn()
    const result = createVoiceBackend('fr').listen(new AbortController().signal, transcribe)
    await Promise.resolve()
    const recognition = Recognition.instance
    expect(recognition.interimResults).toBe(true)
    const partial = Object.assign([{transcript:'Bonjour'}], {isFinal:false})
    recognition.onresult?.({results:[partial]})
    expect(transcribe).toHaveBeenCalledWith('Bonjour')
    recognition.onend?.()
    expect(await result).toBe('')
  })
  it('scopes native live words to their capture and removes listeners on completion', async () => {
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows NT 10.0')
    const unlisten = vi.fn()
    vi.mocked(listen).mockResolvedValue(unlisten)
    let finish!: (reply: unknown) => void
    invokeMock.mockImplementation(() => new Promise(resolve => { finish = resolve }))
    const transcribe = vi.fn()
    const result = createVoiceBackend('fr').listen(new AbortController().signal, transcribe)
    await Promise.resolve()
    const session = invokeMock.mock.calls[0][1]?.session
    const callback = vi.mocked(listen).mock.calls[0][1]
    callback({payload:{session:'other-session',text:'Wrong window'}} as any)
    expect(transcribe).not.toHaveBeenCalled()
    callback({payload:{session,text:'Bonjour'}} as any)
    expect(transcribe).toHaveBeenCalledWith('Bonjour')
    finish({status:'recognized',text:'Bonjour Novera'})
    expect(await result).toBe('Bonjour Novera')
    expect(unlisten).toHaveBeenCalledOnce()
    callback({payload:{session,text:'Late words'}} as any)
    expect(transcribe).toHaveBeenCalledTimes(1)
  })
  it('rejects remote-only synthesis voices', async () => {
    vi.stubGlobal('speechSynthesis', {getVoices:()=>[{lang:'fr',localService:false}],speak:vi.fn(),cancel:vi.fn()})
    await expect(createVoiceBackend('fr').speak('Private reply',new AbortController().signal)).rejects.toThrow('unavailable')
    expect(window.speechSynthesis.speak).not.toHaveBeenCalled()
  })
  it('maps legacy Novera language aliases to speech locales', () => {
    expect(voiceLocale('vn')).toBe('vi')
    expect(voiceLocale('uzn')).toBe('uz')
    expect(voiceLocale('fr')).toBe('fr')
  })
  it('passes French prose numbers as words to the Windows system voice',async()=>{
    platformMock.mockReturnValue(true)
    vi.spyOn(navigator,'userAgent','get').mockReturnValue('Windows NT 10.0')
    invokeMock.mockResolvedValue({status:'done',text:''})
    await createVoiceBackend('fr-FR').speak('En 1889, valeur 2,05.',new AbortController().signal)
    expect(invokeMock).toHaveBeenCalledWith('voice_run',expect.objectContaining({operation:'speak',locale:'fr-FR',text:'En mille huit cent quatre-vingt-neuf, valeur deux virgule zéro cinq.'}))
  })
})
