import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const required = ['cuda_nvcc', 'cuda_crt', 'libnvvm', 'libnvptxcompiler', 'libnvjitlink', 'libnvfatbin', 'cuda_cuobjdump', 'cuda_nvdisasm', 'cuda_nvprune', 'cuda_cuxxfilt', 'cuda_nvrtc', 'cuda_cudart', 'libcublas', 'cuda_cccl', 'cuda_nvtx', 'cuda_profiler_api']
const previouslyBundled = new Set(['cuda_crt', 'libnvvm', 'libnvptxcompiler'])
export function cudaPlan(manifest, platform, release) {
  if (!/^\d+\.\d+\.\d+$/.test(release) || !['linux-x86_64', 'windows-x86_64'].includes(platform)) throw new Error('Unsupported CUDA release/platform')
  if (manifest.release_label && manifest.release_label !== release) throw new Error('CUDA manifest release mismatch')
  const [major, minor] = release.split('.').map(Number)
  return required.flatMap(name => {
    // NVIDIA renamed the redist component; preserve the old manifests too.
    const component = name === 'cuda_cccl' && !manifest.cuda_cccl ? 'cccl' : name
    const item = manifest[component]?.[platform]
    if (!item) {
      if ((major < 12 || major === 12 && minor < 8) && previouslyBundled.has(name)) return []
      throw new Error(`Missing CUDA component: ${component}/${platform}`)
    }
    if (!/^[a-fA-F0-9]{64}$/.test(item.sha256 || '')) throw new Error(`Missing SHA-256: ${component}`)
    const relative = item.relative_path
    if (typeof relative !== 'string' || !relative.startsWith(`${component}/${platform}/`) || relative.includes('..') || !/^[a-zA-Z0-9_./-]+$/.test(relative)) throw new Error(`Unsafe CUDA archive path: ${component}`)
    return [{ component, relative, sha256: item.sha256.toLowerCase() }]
  })
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const plan = cudaPlan(JSON.parse(fs.readFileSync(process.argv[2], 'utf8')), process.argv[3], process.argv[4])
  process.stdout.write(plan.map(p => `${p.component}\t${p.relative}\t${p.sha256}`).join('\n') + '\n')
}
