import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

export function prepareBrowserRuntime(folder, kind = 'image') {
  if (!['image', 'music', 'text'].includes(kind)) throw new Error('Unknown browser runtime kind.')
  if (!folder) throw new Error('Set the browser runtime build directory to a verified build.')
  const root = path.resolve(folder)
  const receipt = JSON.parse(fs.readFileSync(path.join(root, 'BUILD-VERIFICATION.json'), 'utf8'))
  if (receipt.compiled !== true || !Array.isArray(receipt.artifacts)) throw new Error('The browser media runtime has no successful build receipt.')
  const assets = []
  const module = { image: 'novera-diffusion', music: 'novera-music', text: 'novera-text' }[kind]
  for (const name of [`${module}.mjs`, `${module}.wasm`]) {
    const source = fs.readFileSync(path.join(root, name))
    const expected = receipt.artifacts.filter(artifact => artifact.name === name)
    const sha256 = createHash('sha256').update(source).digest('hex')
    if (expected.length !== 1 || expected[0].bytes !== source.length || expected[0].sha256 !== sha256) throw new Error(`Browser media artifact differs from its receipt: ${name}`)
    assets.push({ name, source })
  }
  assets.push({ name: 'BUILD-VERIFICATION.json', source: Buffer.from(JSON.stringify(receipt)) })
  if (kind === 'text') {
    if (receipt.pthreads !== false || receipt.jspi !== true || receipt.tokenOnlySampler !== true ||
        receipt.backendPatch?.batchedHostInputs !== true || receipt.contextTokens !== 32768) {
      throw new Error('The text runtime must use the verified single-thread WebGPU configuration.')
    }
    const worker = fs.readFileSync(new URL('../browser-text/worker.mjs', import.meta.url))
    if (createHash('sha256').update(worker).digest('hex') !== receipt.wrapperSha256?.['worker.mjs']) {
      throw new Error('Browser text worker differs from its build receipt.')
    }
    assets.push({ name: 'worker.mjs', source: worker })
    assets.push({ name: 'LICENSE-llama.cpp.txt', source: fs.readFileSync(path.resolve(root, '../source/LICENSE')) })
  } else {
    for (const name of [kind === 'music' ? 'ace' : 'sdcpp', 'ggml']) {
      assets.push({ name: `LICENSE-${name}.txt`, source: fs.readFileSync(path.resolve(root, '..', name, 'LICENSE')) })
    }
  }
  const hash = createHash('sha256')
  for (const asset of assets) hash.update(asset.name).update('\0').update(createHash('sha256').update(asset.source).digest())
  // The JS module resolves its WASM relative to itself. Give the whole verified
  // set a new directory so browser caches cannot mix two runtime versions.
  return { directory: `novera-runtime/${hash.digest('hex')}`, assets }
}
