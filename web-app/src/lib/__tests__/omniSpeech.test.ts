import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest'
import {playOmniReply,speechLanguage,speechSegments} from '../omniSpeech'
import {spokenText} from '../voiceConversation'
import {frenchNumbers} from '../frenchNumbers'
const mocks=vi.hoisted(()=>({fetch:vi.fn(),foreground:vi.fn()}))
vi.mock('@tauri-apps/api/core',()=>({invoke:mocks.foreground}))
vi.mock('@tauri-apps/plugin-http',()=>({fetch:mocks.fetch}))
let autoEnd=true
class Context {
  static latest: Context
  currentTime=0
  state='running'
  destination={}
  sources: Array<ReturnType<Context['createBufferSource']>>=[]
  get source(){return this.sources[this.sources.length-1]}
  constructor(){Context.latest=this}
  decodeAudioData=vi.fn(async()=>({duration:1,numberOfChannels:1}))
  resume=vi.fn(async()=>{})
  close=vi.fn(async()=>{this.state='closed'})
  createBufferSource(): {buffer:unknown;onended:null|(()=>void);connect:ReturnType<typeof vi.fn>;disconnect:ReturnType<typeof vi.fn>;stop:ReturnType<typeof vi.fn>;start:ReturnType<typeof vi.fn>} {
    const source={buffer:null as unknown,onended:null as null|(()=>void),connect:vi.fn(),disconnect:vi.fn(),stop:vi.fn(),start:vi.fn((_when?:number)=>{if(autoEnd)queueMicrotask(()=>source.onended?.())})}
    this.sources.push(source)
    return source
  }
}
const prepare=vi.fn(async()=>({port:34123,api_key:'local-test-key'}))
beforeEach(()=>{
 vi.clearAllMocks();autoEnd=true;Context.latest=undefined as unknown as Context;mocks.foreground.mockResolvedValue(true)
 mocks.fetch.mockResolvedValue({ok:true,json:async()=>({engine:'native-audio',format:'wav',audio:btoa('test-wave')})})
 vi.stubGlobal('AudioContext',Context)
})
afterEach(()=>vi.unstubAllGlobals())
describe('native Omni speech output',()=>{
 it('keeps every sentence of the reported reply including the final sentence',async()=>{
  const text=spokenText('En 1889, le billet coûtait **2,50 francs** [[cite:https://example.org]].\n\nEn 2019, la température atteignait **21,7 degrés**.\n\nEn 2026, le trajet mesure **80,05 kilomètres** et dure **1,5 heure**.\n\nCes trois faits sont des données factuelles vérifiables via des sources en ligne.')
  await playOmniReply(text,'fr','male',new AbortController().signal,prepare,'omni')
  const inputs=mocks.fetch.mock.calls.map(call=>JSON.parse(call[1].body).input)
  expect(inputs.at(-1)).toBe('Ces trois faits sont des données factuelles vérifiables via des sources en ligne.')
  expect(inputs.join(' ').replace(/\s+/g,' ')).toBe(frenchNumbers(text,'fr').replace(/\s+/g,' '))
  expect(Context.latest.sources).toHaveLength(inputs.length)
  expect(Context.latest.sources.every(source=>source.start.mock.calls.length===1)).toBe(true)
 })
 it('prepares and schedules one segment ahead on the audio clock, with no scheduled gap',async()=>{
  autoEnd=false
  const result=playOmniReply('Première phrase. Deuxième phrase. Dernière phrase.','fr','male',new AbortController().signal,prepare,'omni')
  await vi.waitFor(()=>expect(Context.latest?.sources).toHaveLength(2))
  expect(mocks.fetch).toHaveBeenCalledTimes(2)
  expect(Context.latest.sources[0].start).toHaveBeenCalledWith(0.02)
  expect(Context.latest.sources[1].start).toHaveBeenCalledWith(1.02)
  Context.latest.sources[0].onended?.()
  await vi.waitFor(()=>expect(Context.latest.sources).toHaveLength(3))
  expect(Context.latest.sources[2].start).toHaveBeenCalledWith(2.02)
  let done=false;void result.then(()=>done=true)
  Context.latest.sources[1].onended?.();await Promise.resolve()
  expect(done).toBe(false)
  Context.latest.sources[2].onended?.();await result
  expect(Context.latest.close).toHaveBeenCalledOnce()
 })
 it('cancels in-flight preparation and current playback without fetching a third segment',async()=>{
  autoEnd=false
  mocks.fetch.mockResolvedValueOnce({ok:true,json:async()=>({engine:'native-audio',format:'wav',audio:btoa('test-wave')})})
    .mockImplementationOnce((_url,{signal})=>new Promise((_resolve,reject)=>signal.addEventListener('abort',()=>reject(new Error('cancelled')),{once:true})))
  const controller=new AbortController()
  const result=playOmniReply('Première phrase. Deuxième phrase. Dernière phrase.','fr','male',controller.signal,prepare,'omni')
  const rejected=expect(result).rejects.toThrow('cancelled')
  await vi.waitFor(()=>expect(mocks.fetch).toHaveBeenCalledTimes(2))
  controller.abort();await rejected
  expect(Context.latest.source.stop).toHaveBeenCalledOnce()
  expect(mocks.fetch).toHaveBeenCalledTimes(2)
 })
 it('verbalizes a numeric answer in French before native synthesis',async()=>{
  await playOmniReply('2 + 2 = 4','fr','male',new AbortController().signal,prepare,'omni')
  expect(JSON.parse(mocks.fetch.mock.calls[0][1].body)).toMatchObject({lang:'fr',input:'Calcul : deux plus deux égale quatre.'})
 })
 it('verbalizes years and decimals in French prose before native synthesis',async()=>{
  await playOmniReply('Paris en 1889, puis 2019 : 2,05.','fr-FR','male',new AbortController().signal,prepare,'omni')
  expect(JSON.parse(mocks.fetch.mock.calls[0][1].body).input).toBe('Paris en mille huit cent quatre-vingt-neuf, puis deux mille dix-neuf : deux virgule zéro cinq.')
 })
 it('uses supported speech languages and refuses an unsupported locale instead of speaking English',()=>{
  expect(speechLanguage('fr-FR')).toBe('fr');expect(speechLanguage('pt-BR')).toBe('pt');expect(speechLanguage('en-GB')).toBe('en-gb')
  expect(()=>speechLanguage('rw')).toThrow('unavailable')
 })
 it('splits long replies without losing words or splitting Unicode pairs',()=>{
  const text=('Bonjour 🌍. '.repeat(100)).trim(),parts=speechSegments(text)
  expect(parts.length).toBeGreaterThan(1);expect(parts.every(p=>Array.from(p).length<=240)).toBe(true)
  expect(parts.join(' ').replaceAll(/\s/g,'')).toBe(text.replaceAll(/\s/g,''))
 })
 it.each(['male','female'] as const)('requests %s in French, decodes and plays actual native audio',async voice=>{
  await playOmniReply('Bonjour','fr-FR',voice,new AbortController().signal,prepare,'omni')
  const [url,options]=mocks.fetch.mock.calls[0]
  expect(url).toBe('http://127.0.0.1:34123/v1/novera/audio/speech')
  expect(options.headers.Authorization).toBe('Bearer local-test-key')
  expect(JSON.parse(options.body)).toEqual({model:'omni',input:'Bonjour',lang:'fr',voice})
  expect(Context.latest.source.start).toHaveBeenCalledOnce();expect(Context.latest.close).toHaveBeenCalledOnce()
 })
 it('cancels playback and the bounded next segment without requesting a third',async()=>{
  const controller=new AbortController()
  autoEnd=false
  const result=playOmniReply('Bonjour '.repeat(100),'fr','male',controller.signal,prepare,'omni')
  const cancelled=expect(result).rejects.toThrow('cancelled')
  await vi.waitFor(()=>expect(Context.latest?.source.start).toHaveBeenCalledOnce())
  controller.abort()
  await cancelled
  expect(Context.latest.source.stop).toHaveBeenCalled();expect(mocks.fetch.mock.calls.length).toBeLessThanOrEqual(2)
 })
 it('does not play after a permission/context change while the model prepares',async()=>{
  const controller=new AbortController()
  const result=playOmniReply('Bonjour','fr','male',controller.signal,async()=>{controller.abort();return {port:34123,api_key:'test'}},'omni')
  await expect(result).rejects.toThrow('cancelled');expect(mocks.fetch).not.toHaveBeenCalled()
 })
 it('rejects native synthesis errors without a Windows speech fallback',async()=>{
  mocks.fetch.mockResolvedValue({ok:true,json:async()=>({error:{code:'audio_synthesis_failed'}})})
  await expect(playOmniReply('Bonjour','fr','male',new AbortController().signal,prepare,'omni')).rejects.toThrow('unavailable')
  expect(Context.latest.close).toHaveBeenCalledOnce()
 })
})
