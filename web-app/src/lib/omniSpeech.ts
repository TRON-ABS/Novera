import { invoke } from '@tauri-apps/api/core'
import { fetch as fetchLocalEngine } from '@tauri-apps/plugin-http'
import { spokenMath } from './spokenMath'
import { frenchNumbers } from './frenchNumbers'

export type OmniVoice = 'male' | 'female'
const supportedLanguages = new Set(['ar','da','de','el','en','fi','fr','he','it','ja','ko','nl','pl','pt','es','sv','tr','zh'])
export function speechLanguage(locale: string) {
  const normalized = locale.toLowerCase().replace('_','-')
  const base = normalized.split('-')[0]
  if (!supportedLanguages.has(base)) throw new Error('unavailable')
  return normalized === 'en-gb' || normalized === 'en-us' ? normalized : base
}

// Bound each model request without truncating a long reply or splitting a
// surrogate pair. Prefer sentence/word boundaries; 240 chars fit 1200 UTF-8 bytes.
export function speechSegments(text: string): string[] {
  const segments: string[] = []
  // Keep short sentences/paragraphs independent, especially the final sentence.
  // A generative TTS model is less likely to drop the tail of a short request.
  for (const sentence of text.trim().split(/(?<=[.!?。！？])\s+|\n{2,}/u)) {
    const words = Array.from(sentence.trim())
    while (words.length) {
      let end = Math.min(words.length,240)
      if (words.length > end) {
        for (let index=end-1;index>=80;index--) {
          if (/\s/u.test(words[index])) {end=index+1;break}
        }
      }
      const part=words.splice(0,end).join('').trim()
      if (part) segments.push(part)
    }
  }
  return segments
}

export async function playOmniReply(text: string, locale: string, voice: OmniVoice, signal: AbortSignal,
  prepare: (signal: AbortSignal) => Promise<{port:number;api_key:string}>, model: string): Promise<void> {
  if (signal.aborted) throw new Error('cancelled')
  const lang=speechLanguage(locale)
  const operation=new AbortController()
  const cancel=()=>operation.abort()
  signal.addEventListener('abort',cancel,{once:true})
  let context: AudioContext | undefined
  const sources = new Set<AudioBufferSourceNode>()
  let timer: ReturnType<typeof setInterval> | undefined
  let deadline: ReturnType<typeof setTimeout> | undefined
  let checking=false,finished=false,expired=false
  // Audio must stop immediately even while waiting for another model segment.
  const stopAudio=()=>{for(const source of sources){try{source.stop()}catch{/* Already ended. */}source.disconnect()}sources.clear();if(context&&context.state!=='closed')void context.close().catch(()=>{})}
  operation.signal.addEventListener('abort',stopAudio,{once:true})
  const foreground=async()=>{
    if(checking||operation.signal.aborted||finished)return
    checking=true
    try{const focused=await invoke<boolean>('voice_is_foreground');if(!finished&&!focused)operation.abort()}
    catch{if(!finished)operation.abort()}
    finally{checking=false}
  }
  try {
    const engine=await prepare(operation.signal)
    if(operation.signal.aborted)throw new Error('cancelled')
    if(!Number.isInteger(engine.port)||engine.port<1||engine.port>65535||!engine.api_key)throw new Error('unavailable')
    await foreground()
    if(operation.signal.aborted)throw new Error('cancelled')
    timer=setInterval(()=>{void foreground()},100)
    context=new AudioContext()
    let playback: Promise<void> | undefined
    let nextStart = 0
    for(const input of speechSegments(frenchNumbers(spokenMath(text,lang),lang))) {
      if(operation.signal.aborted)throw new Error('cancelled')
      deadline=setTimeout(()=>{expired=true;operation.abort()},125_000)
      const response=await fetchLocalEngine(`http://127.0.0.1:${engine.port}/v1/novera/audio/speech`,{
        method:'POST',signal:operation.signal,
        headers:{'Content-Type':'application/json',Authorization:`Bearer ${engine.api_key}`},
        body:JSON.stringify({model,input,lang,voice}),
      })
      const result=await response.json()
      if(operation.signal.aborted)throw new Error('cancelled')
      if(!response.ok||result.error||result.format!=='wav'||result.engine!=='native-audio'||typeof result.audio!=='string'||result.audio.length>16_000_000)throw new Error('unavailable')
      const binary=atob(result.audio)
      const bytes=Uint8Array.from(binary,char=>char.charCodeAt(0))
      const buffer=await context.decodeAudioData(bytes.buffer)
      if(operation.signal.aborted)throw new Error('cancelled')
      if(buffer.duration<=0||buffer.duration>120||buffer.numberOfChannels!==1)throw new Error('unavailable')
      clearTimeout(deadline)
      await context.resume()
      if(operation.signal.aborted)throw new Error('cancelled')
      const source=context.createBufferSource();source.buffer=buffer;source.connect(context.destination)
      sources.add(source)
      const previous = playback
      // Use the audio clock, rather than an onended -> JS -> start transition.
      // Generate the next segment while this one plays; at most two sources
      // are scheduled and only one synthesis request is in flight.
      const startAt = nextStart ? Math.max(context.currentTime, nextStart) : context.currentTime + 0.02
      nextStart = startAt + buffer.duration
      playback = new Promise<void>((resolve,reject)=>{
        const abort=()=>{operation.signal.removeEventListener('abort',abort);reject(new Error('cancelled'))}
        operation.signal.addEventListener('abort',abort,{once:true})
        source.onended=()=>{operation.signal.removeEventListener('abort',abort);source.disconnect();sources.delete(source);resolve()}
        source.start(startAt)
      })
      // Cancellation can reject playback while synthesis is being awaited.
      // Attach a handler immediately; the awaited original still propagates it.
      void playback.catch(()=>{})
      if (previous) await previous
      if(operation.signal.aborted)throw new Error('cancelled')
    }
    await playback
  } catch(error) {if(expired)throw new Error('unavailable',{cause:error});throw error}
  finally {
    finished=true;clearInterval(timer);clearTimeout(deadline)
    signal.removeEventListener('abort',cancel);operation.signal.removeEventListener('abort',stopAudio)
    stopAudio()
  }
}
