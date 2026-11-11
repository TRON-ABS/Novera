/// <reference lib="webworker" />
import { musicWav } from './music-wav'

const worker = self as unknown as DedicatedWorkerGlobalScope
// The reviewed Web runtime reads these settings from its owning Worker.
Object.assign(worker, {
  noveraMusicPlannerRanges: true,
  noveraMusicPlannerWindows: true,
  noveraMusicEncoderWindows: true,
  noveraMusicDiTWindows: true,
  noveraMusicDiTFileOrder: true,
  noveraMusicPlannerGpuHead: true,
  noveraMusicPlannerReadAhead: true,
  noveraMusicReuseSamplingExp: true,
})
worker.onmessage = async event => {
  let runtime: any
  try {
    const { runtimeUrl, files, prompt, lyrics, language, seconds, seed, bitrate } = event.data
    const adapter = await navigator.gpu?.requestAdapter()
    if (!adapter?.features.has('shader-f16')) throw new Error('Ce moteur musical nécessite WebGPU et shader-f16.')
    Object.assign(worker, {
      noveraMusicDiTWindows: event.data.ditWindows !== false,
      noveraMusicEncoderWindows: event.data.encoderWindows !== false,
      noveraMusicPlannerWindows: event.data.plannerWindows !== false,
    })
    const create = (await import(/* @vite-ignore */ runtimeUrl)).default
    runtime = await create({ print: () => {}, printErr: () => {}, onAbort: () => worker.postMessage({ type: 'error', message: 'Le moteur musical a été interrompu.' }) })
    runtime.FS.mkdir('/models'); runtime.FS.mount(runtime.WORKERFS, { files }, '/models')
    const ok = await runtime.ccall('novera_music_generate', 'number', ['string', 'string', 'string', 'string', 'string', 'string', 'string', 'number', 'number'], [...files.map((file: File) => `/models/${file.name}`), prompt, lyrics, language, seconds, seed], { async: true })
    if (!ok) throw new Error('Le modèle musical local n’a pas produit de résultat.')
    const frames = runtime._novera_music_length(), rate = runtime._novera_music_rate(), pointer = Number(runtime._novera_music_samples())
    if (!Number.isSafeInteger(pointer) || pointer < 0 || pointer % 4 || !Number.isSafeInteger(frames) || frames < 1 || frames > 48000 * seconds || pointer / 4 + frames * 2 > runtime.HEAPF32.length) throw new Error('Mémoire audio invalide.')
    let audio: Blob
    if (bitrate === 128 || bitrate === 320) {
      const started = performance.now()
      const mp3Pointer = Number(runtime._novera_music_encode_mp3(bitrate))
      const size = runtime._novera_music_mp3_size()
      const heap = runtime.HEAPF32.buffer
      if (!Number.isSafeInteger(mp3Pointer) || mp3Pointer <= 0 || !Number.isSafeInteger(size) || size <= 0 || size > heap.byteLength - mp3Pointer) {
        throw new Error('L’encodage MP3 a échoué.')
      }
      audio = new Blob([new Uint8Array(heap, mp3Pointer, size).slice()], { type: 'audio/mpeg' })
      worker.postMessage({ type: 'music-timing', phase: 'mp3EncodeMs', milliseconds: performance.now() - started })
    } else {
      audio = musicWav(runtime.HEAPF32.slice(pointer / 4, pointer / 4 + frames * 2), frames, rate)
    }
    await runtime.ccall('novera_music_release', null, [], [], { async: true }); runtime = undefined
    worker.postMessage({ type: 'complete', audio, seconds: frames / rate })
  } catch (error) {
    worker.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  } finally {
    if (runtime) { try { await runtime.ccall('novera_music_release', null, [], [], { async: true }) } catch { /* Owning worker is terminated by the caller. */ } }
  }
}
