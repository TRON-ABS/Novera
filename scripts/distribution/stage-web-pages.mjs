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
for (const module of ['novera-diffusion', 'novera-music']) {
  for (const suffix of ['.mjs', '.wasm']) if (!receipt.artifacts.some(asset => asset.file.endsWith(`/${module}${suffix}`))) throw new Error('Missing bundled browser runtime')
}
preparePagesSite(output, commit)
fs.cpSync(source, path.join(output, 'web'), { recursive: true, errorOnExist: true, force: false })
fs.writeFileSync(path.join(output, 'web/WEB-DELIVERY-READINESS.json'), JSON.stringify({ ...receipt, channel: 'public-experimental', publicReleaseAuthorized: true, cachePolicy: 'GitHub Pages managed cache; no strict no-store guarantee' }, null, 2) + '\n')
console.log(JSON.stringify({ commit, version: identity.version, files: receipt.artifacts.length, channel: 'public-experimental' }))
