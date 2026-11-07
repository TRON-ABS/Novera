import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function reviewedVerificationVersion(descriptor, applicationVersion) {
  if (!/^\d+\.\d+\.\d+$/.test(descriptor.version ?? '') || descriptor.version !== applicationVersion) throw new Error('Public verification must use the current application version')
  if (!Array.isArray(descriptor.assets) || !descriptor.assets.length || !descriptor.channels?.desktop || !descriptor.channels?.cli) throw new Error('Reviewed public assets and channels required')
  return descriptor.version
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
  const relative = process.env.RELEASE_DESCRIPTOR ?? ''
  if (!/^scripts\/distribution\/public-release-\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?\.json$/.test(relative)) throw new Error('Use a reviewed repository public-release descriptor')
  const filename = path.resolve(root, relative)
  if (fs.realpathSync(filename) !== filename) throw new Error('Linked public descriptor refused')
  const descriptor = JSON.parse(fs.readFileSync(filename))
  const application = JSON.parse(fs.readFileSync(path.join(root, 'src-tauri/tauri.conf.json')))
  const version = reviewedVerificationVersion(descriptor, application.version)
  fs.appendFileSync(process.env.GITHUB_ENV, `RELEASE_VERSION=${version}\n`)
  console.log(`Reviewed public verification version: ${version}`)
}
