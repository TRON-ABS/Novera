import { useCreation } from '@/hooks/useCreation'
import { browserMediaProfileKey, browserMediaWorkerTrial, type BrowserMediaProbe } from './auto-tune'
import { registerBrowserAutoTuneSource, removeBrowserAutoTuneSource } from './auto-tune-registry'

export const browserWanFiles = ['Wan2.1-T2V-1.3B-Q4_K_M.gguf', 'umt5-xxl-encoder-Q4_K_M.gguf', 'wan_2.1_vae.safetensors'] as const
let modelFiles: File[] | undefined
export function browserVideoFiles() { return modelFiles?.slice() ?? [] }
let runtimeJob: Promise<string | undefined> | undefined

export function browserWanAutoTuneAvailable() {
  return import.meta.env.VITE_NOVERA_WEB_LOCAL_WAN === 'true'
}

export function setBrowserWanFiles(files: File[]) {
  modelFiles = browserWanFiles.map(name => files.find(file => file.name === name && file.size))
    .filter((file): file is File => Boolean(file))
  // The existing video input also uses an empty/partial list to disconnect it.
  if (modelFiles.length === 3) registerBrowserAutoTuneSource('video-wan', () => browserWanAutoTuneProbe())
  else removeBrowserAutoTuneSource('video-wan')
}

export async function browserWanAutoTuneProbe(): Promise<BrowserMediaProbe | undefined> {
  if (!browserWanAutoTuneAvailable() || modelFiles?.length !== 3) return
  const files = modelFiles.slice()
  const base = new URL(import.meta.env.BASE_URL, document.baseURI)
  const runtime = await (runtimeJob ??= fetch(new URL('video-performance/runtime.json', base))
    .then(async response => {
      if (!response.ok) return
      const { directory } = await response.json()
      if (typeof directory === 'string' && /^novera-runtime\/[a-f0-9]{64}$/.test(directory)) return directory
    }).catch(() => undefined))
  if (!runtime) {
    runtimeJob = undefined
    return
  }
  const runtimeUrl = new URL(runtime + '/novera-diffusion.mjs', base)
  return { task: 'video', model: browserWanFiles[0], provider: 'novera-browser',
    components: [{ model: files[1].name, role: 'encoder' }, { model: files[2].name, role: 'vae' }],
    key: browserMediaProfileKey(runtime + ':wan', files), candidates: [
      { label: 'WebGPU · 12742898', settings: { wanKernelFlags: 12742898 } },
      { label: 'WebGPU · 143602', settings: { wanKernelFlags: 143602 } },
      { label: 'WebGPU · 159986', settings: { wanKernelFlags: 159986 } },
      { label: 'WebGPU · 4354290', settings: { wanKernelFlags: 4354290 } },
    ],
    defaults: { wanKernelFlags: 12742898 },
    confirmation: 'best-two',
    async run(candidate, signal, confirmation, progress) {
      if (Object.values(useCreation.getState().progress).some(Boolean)) throw new Error('CALIBRATION_BUSY')
      const receipt = await fetch(new URL('BUILD-VERIFICATION.json', runtimeUrl), { signal }).then(response => response.json())
      if (!receipt.kernelTuningCompiled || receipt.kernelDefaultFlags !== 143602 ||
          !receipt.sources?.patches?.some(({ patch }: { patch: string }) => patch === 'patches/webgpu-wan-narrow-f16-matmul.patch'))
        throw new Error('No alternate verified Wan kernel profile')
      const worker = new Worker(new URL('video-performance/worker.js', base))
      return browserMediaWorkerTrial(worker, {
        runtimeUrl: runtimeUrl.href, files, width: 512, height: 224,
        frames: confirmation ? 81 : 25, fps: confirmation ? 16 : 8, steps: confirmation ? 20 : 2,
        prompt: 'A blue cup on a wooden table, fixed camera', seed: 42, gpuBudgetGiB: 4,
        flashAttention: true, batchedCfg: false, calibration: true,
        kernelFlags: candidate.wanKernelFlags ?? 12742898,
      }, 'frames', signal, progress)
    },
  }
}
