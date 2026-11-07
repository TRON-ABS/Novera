/// <reference lib="webworker" />

// Each job owns its WASM heap and GPU resources. Terminating this worker is the
// cancellation boundary, including during an otherwise synchronous CPU decode.
const worker = self as unknown as DedicatedWorkerGlobalScope
worker.onmessage = async event => {
  try {
    const { runtimeUrl, files, prompt, seed } = event.data as { runtimeUrl: string; files: File[]; prompt: string; seed: number }
    const adapter = await navigator.gpu?.requestAdapter()
    if (!adapter?.features.has('shader-f16')) throw new Error('Ce moteur image nécessite WebGPU et shader-f16 sur cet appareil.')
    const createRuntime = (await import(/* @vite-ignore */ runtimeUrl)).default
    const runtime = await createRuntime({
      print: () => {},
      printErr: () => {},
      onAbort: (reason: unknown) => worker.postMessage({ type: 'error', message: `Le moteur image s’est arrêté : ${String(reason).slice(0, 500)}` }),
    })
    // The C++ callbacks use self.postMessage for log/progress notifications.
    runtime.FS.mkdir('/models')
    runtime.FS.mount(runtime.WORKERFS, { files }, '/models')
    const loaded = await runtime.ccall('novera_load', 'number', ['string', 'string', 'string', 'number'], [...files.map(file => `/models/${file.name}`), 0], { async: true })
    if (!loaded) throw new Error('Impossible de charger les trois fichiers du modèle image.')
    worker.postMessage({ type: 'stage', stage: 'generating', progress: 15 })
    const generated = await runtime.ccall('novera_generate', 'number', ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'number'], [0, prompt, 256, 256, 4, seed, 1, 16], { async: true })
    if (!generated) throw new Error('Le modèle local n’a pas produit d’image.')
    const width = runtime._novera_width(0), height = runtime._novera_height(0), channels = runtime._novera_channels(0)
    const address = Number(runtime._novera_frame_data(0))
    if (width !== 256 || height !== 256 || ![3, 4].includes(channels) || !Number.isSafeInteger(address) || address < 0 || address + width * height * channels > runtime.HEAPU8.length) throw new Error('Pixels de sortie invalides.')
    const pixels: Uint8Array = runtime.HEAPU8.slice(address, address + width * height * channels)
    const rgba = new Uint8ClampedArray(width * height * 4)
    for (let source = 0, target = 0; target < rgba.length; source += channels, target += 4) {
      rgba[target] = pixels[source]; rgba[target + 1] = pixels[source + 1]; rgba[target + 2] = pixels[source + 2]; rgba[target + 3] = channels === 4 ? pixels[source + 3] : 255
    }
    const canvas = new OffscreenCanvas(width, height)
    const context = canvas.getContext('2d')
    if (!context) throw new Error('Encodage PNG indisponible sur cet appareil.')
    context.putImageData(new ImageData(rgba, width, height), 0, 0)
    const image = await canvas.convertToBlob({ type: 'image/png' })
    await runtime.ccall('novera_release', null, [], [], { async: true })
    worker.postMessage({ type: 'complete', image })
  } catch (error) {
    worker.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  }
}
