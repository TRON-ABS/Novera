import { createHash, randomUUID } from 'node:crypto'
import { createReadStream, readFileSync, existsSync, renameSync, rmSync } from 'node:fs'

const tools = JSON.parse(readFileSync(new URL('../runtime-tools.lock.json', import.meta.url), 'utf8'))

export function runtimeAsset(tool, name) {
  const release = tools[tool]
  const asset = release?.artifacts[name]
  if (!asset || !/^[a-f0-9]{64}$/.test(asset.sha256)
    || !asset.url.startsWith(`https://github.com/${release.repository}/releases/download/${release.version}/`)) {
    throw new Error(`No verified ${tool} artifact for ${name}`)
  }
  return { ...asset, version: release.version }
}

async function sha256(file) {
  const hash = createHash('sha256')
  for await (const chunk of createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

/** Cached artifacts are verified again; a failed refresh preserves the old file. */
export async function ensureRuntimeArtifact(asset, file, download) {
  if (existsSync(file) && await sha256(file) === asset.sha256) return
  const pending = `${file}.${randomUUID()}.pending`
  try {
    await download(asset.url, pending)
    if (await sha256(pending) !== asset.sha256) throw new Error('Runtime artifact SHA-256 mismatch')
    renameSync(pending, file)
  } finally {
    rmSync(pending, { force: true })
  }
}
