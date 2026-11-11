/// <reference lib="webworker" />
import { browserImageOptions, browserUpscaleTile } from './image-options'

// Each job owns its WASM heap and GPU resources. Terminating this worker is the
// cancellation boundary, including during an otherwise synchronous CPU decode.
const worker = self as unknown as DedicatedWorkerGlobalScope
worker.onmessage = async event => {
  try {
    const { runtimeUrl, files, prompt, seed, upscaleFile, upscaleOnly, inputImage } = event.data as { runtimeUrl: string; files: File[]; prompt: string; seed: number; upscaleFile?: File; upscaleOnly?: boolean; inputImage?: Blob }
    const options = browserImageOptions({ ...event.data, browserGpuBudgetGiB: event.data.gpuBudgetGiB })
    const started = performance.now()
    const adapter = await navigator.gpu?.requestAdapter()
    if (!adapter?.features.has('shader-f16')) throw new Error('Ce moteur image nécessite WebGPU et shader-f16 sur cet appareil.')
    if (!upscaleOnly && [0, 242, 12530].includes(event.data.kernelFlags))
      Object.assign(worker, { noveraImageKernelFlags: event.data.kernelFlags })
    const createRuntime = (await import(/* @vite-ignore */ runtimeUrl)).default
    const runtime = await createRuntime({
      print: () => {},
      printErr: (message: unknown) => worker.postMessage({ type: 'engine-stderr', message: String(message).slice(0, 2000) }),
      onAbort: (reason: unknown) => worker.postMessage({ type: 'error', message: `Le moteur image s’est arrêté : ${String(reason).slice(0, 500)}` }),
    })
    const initialized = performance.now()
    // The C++ callbacks use self.postMessage for log/progress notifications.
    runtime.FS.mkdir('/models')
    if (upscaleFile) {
      const digest = Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', await upscaleFile.arrayBuffer())), byte => byte.toString(16).padStart(2, '0')).join('')
      if (upscaleFile.name !== 'RealESRGAN_x2plus.pth' || digest !== '49fafd45f8fd7aa8d31ab2a22d14d91b536c34494a5cfe31eb5d89c2fa266abb') throw new Error('Le modèle Real-ESRGAN ×2 ne correspond pas au fichier officiel vérifié.')
    }
    runtime.FS.mount(runtime.WORKERFS, { files }, '/models')
    let loadedAt = initialized
    let upscaleTilePixels: number | undefined
    if (upscaleOnly) {
      if (!upscaleFile || !(inputImage instanceof Blob)) throw new Error('Source Real-ESRGAN manquante.')
      upscaleTilePixels = browserUpscaleTile(options.gpuBudgetGiB, adapter.limits.maxStorageBufferBindingSize, event.data.upscaleTilePixels)
      worker.postMessage({ type: 'stage', stage: 'generating', progress: 90 })
      const bitmap = await createImageBitmap(inputImage)
      if (bitmap.width !== options.width || bitmap.height !== options.height) { bitmap.close(); throw new Error('Dimensions de la source Real-ESRGAN invalides.') }
      const inputCanvas = new OffscreenCanvas(bitmap.width, bitmap.height)
      const inputContext = inputCanvas.getContext('2d')
      if (!inputContext) { bitmap.close(); throw new Error('Lecture des pixels indisponible.') }
      inputContext.drawImage(bitmap, 0, 0); bitmap.close()
      runtime.FS.writeFile('/input.rgba', new Uint8Array(inputContext.getImageData(0, 0, options.width, options.height).data.buffer))
      if (!await runtime.ccall('novera_upscale_image', 'number', ['string', 'string', 'number', 'number', 'number'], [`/models/${upscaleFile.name}`, '/input.rgba', options.width, options.height, upscaleTilePixels], { async: true })) throw new Error('Real-ESRGAN ×2 n’a pas produit d’image. La sortie n’a pas été agrandie artificiellement.')
    } else {
      if (!runtime.ccall('novera_configure_image_budget', 'number', ['number'], [options.gpuBudgetGiB])) throw new Error('Budget mémoire image refusé.')
      const loaded = await runtime.ccall('novera_load', 'number', ['string', 'string', 'string', 'number'], [...files.map(file => `/models/${file.name}`), 0], { async: true })
      if (!loaded) throw new Error('Impossible de charger les trois fichiers du modèle image.')
      loadedAt = performance.now()
      worker.postMessage({ type: 'stage', stage: 'generating', progress: 15 })
      const generated = await runtime.ccall('novera_generate', 'number', ['number', 'string', 'number', 'number', 'number', 'number', 'number', 'number'], [0, prompt, options.width, options.height, options.steps, seed, 1, 16], { async: true })
      if (!generated) throw new Error('Le modèle local n’a pas produit d’image.')
    }
    const generatedAt = performance.now()
    const factor = upscaleOnly ? 2 : 1
    const width = runtime._novera_width(0), height = runtime._novera_height(0), channels = runtime._novera_channels(0)
    const address = Number(runtime._novera_frame_data(0))
    if (width !== options.width * factor || height !== options.height * factor || ![3, 4].includes(channels) || !Number.isSafeInteger(address) || address < 0 || address + width * height * channels > runtime.HEAPU8.length) throw new Error('Pixels de sortie invalides.')
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
    worker.postMessage({ type: 'complete', image, timings: upscaleOnly ? { upscalingMs: performance.now() - started, upscaleTilePixels } : { initializationMs: initialized - started, modelLoadMs: loadedAt - initialized, generationMs: generatedAt - loadedAt, encodingMs: performance.now() - generatedAt } })
  } catch (error) {
    worker.postMessage({ type: 'error', message: error instanceof Error ? error.message : String(error), diagnostic: error instanceof WebAssembly.RuntimeError ? error.stack?.slice(0, 4000) : undefined })
  }
}
