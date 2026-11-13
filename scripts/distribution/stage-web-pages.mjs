import fs from 'node:fs'
import path from 'node:path'
import { preparePagesSite } from './prepare-pages-site.mjs'
import { prepareWebDelivery } from './web-delivery.mjs'

const [output, commit, source] = process.argv.slice(2)
if (!output || !source || !/^[a-f0-9]{40}$/.test(commit ?? '')) throw new Error('Usage: stage-web-pages.mjs NEW_OUTPUT COMMIT COMPILED_WEB')
const identity = JSON.parse(fs.readFileSync(path.join(source, 'novera-web-version.json'), 'utf8'))
const version = JSON.parse(fs.readFileSync(new URL('../../web-app/package.json', import.meta.url), 'utf8')).version
if (identity.application !== 'NoveraWeb' || identity.commit !== commit || identity.version !== version) throw new Error('Web identity differs from reviewed source')
// Reject private data, models, symbols and unexpected symlinks before staging.
const receipt = prepareWebDelivery(source, { version: identity.version, commit })
const requiredRuntimeFiles = ['novera-diffusion.mjs', 'novera-diffusion.wasm', 'novera-music.mjs', 'novera-music.wasm', 'novera-text.mjs', 'novera-text.wasm', 'worker.mjs']
for (const name of requiredRuntimeFiles) {
  if (!receipt.artifacts.some(asset => asset.file.startsWith('novera-runtime/') && asset.file.endsWith(`/${name}`))) {
    throw new Error(`Missing bundled browser runtime file ${name}`)
  }
}
const textRuntimeReceipts = receipt.artifacts
  .filter(asset => /^novera-runtime\/[a-f0-9]{64}\/novera-text\.wasm$/.test(asset.file))
  .map(asset => JSON.parse(fs.readFileSync(path.join(source, path.dirname(asset.file), 'BUILD-VERIFICATION.json'), 'utf8')))
if (textRuntimeReceipts.length !== 2 || !textRuntimeReceipts.some(runtime => runtime.memory64 === true) ||
    !textRuntimeReceipts.some(runtime => runtime.memory64 === false)) throw new Error('Both Web text memory widths must be staged.')
for (const file of ['video-performance/index.html', 'video-performance/worker.js']) {
  if (!receipt.artifacts.some(asset => asset.file === file)) throw new Error(`Missing Wan video page file ${file}`)
}
preparePagesSite(output, commit, undefined, identity.version)
fs.cpSync(source, path.join(output, 'web'), { recursive: true, errorOnExist: true, force: false })
fs.writeFileSync(path.join(output, 'web/WEB-DELIVERY-READINESS.json'), JSON.stringify({ ...receipt, channel: 'public', publicReleaseAuthorized: true, cachePolicy: 'GitHub Pages managed cache; no strict no-store guarantee' }, null, 2) + '\n')
console.log(JSON.stringify({ commit, version: identity.version, files: receipt.artifacts.length, channel: 'public' }))
