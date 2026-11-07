import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'

const digest = bytes => createHash('sha256').update(bytes).digest('hex')
export function prepareWebDelivery(directory, { version, commit }) {
  if (!/^\d+\.\d+\.\d+$/.test(version) || !/^[a-f0-9]{40}$/.test(commit)) throw new Error('An exact stable version and source commit are required')
  const root = fs.realpathSync(directory)
  const artifacts = []
  const visit = (folder) => {
    for (const entry of fs.readdirSync(folder, { withFileTypes: true })) {
      const file = path.join(folder, entry.name)
      const name = path.relative(root, file).replaceAll('\\', '/')
      if (entry.isSymbolicLink() || name.split('/').some(p => p.startsWith('.') || ['profiles', 'models', 'chats', 'threads', 'user-data'].includes(p.toLowerCase())) || /\.(?:map|db|sqlite|gguf|safetensors|onnx|pdb|log)$/i.test(name)) throw new Error('Unpublishable Web payload entry')
      if (entry.isDirectory()) visit(file)
      else if (entry.isFile() && name !== 'novera-web-version.json') {
        const bytes = fs.readFileSync(file)
        artifacts.push({ file: name, bytes: bytes.length, sha256: digest(bytes) })
      }
    }
  }
  visit(root)
  const index = artifacts.find(a => a.file === 'index.html')
  if (!index || !artifacts.some(a => /\.js$/.test(a.file))) throw new Error('A compiled HTML entry point and JavaScript payload are required')
  const versionFile = path.join(root, 'novera-web-version.json')
  let browserIdentity = {}
  if (fs.existsSync(versionFile)) {
    const existing = JSON.parse(fs.readFileSync(versionFile, 'utf8'))
    if (existing.application === 'NoveraWeb') {
      if (existing.schemaVersion !== 1 || existing.version !== version || existing.commit !== commit || typeof existing.buildId !== 'string' || !/^[A-Za-z0-9._-]{1,96}$/.test(existing.buildId)) throw new Error('Browser build identity differs from the delivery revision')
      browserIdentity = { application: 'NoveraWeb', schemaVersion: 1, buildId: existing.buildId }
    }
  }
  const metadata = { formatVersion: 1, product: 'Novera Web', version, commit, entrypoint: 'index.html', entrypointSha256: index.sha256, ...browserIdentity }
  fs.writeFileSync(path.join(root, 'novera-web-version.json'), JSON.stringify(metadata, null, 2) + '\n')
  return { ...metadata, artifacts, deliveryMode: 'browser-reload', requiredEntrypointCacheControl: 'no-cache', requiredVersionCacheControl: 'no-store', hostedChannelValidated: false, browserUpgradeValidated: false, publicReleaseAuthorized: false }
}

export async function validateWebDelivery(baseUrl, expected) {
  const base = new URL(baseUrl)
  if (base.username || base.password || base.search || base.hash || (base.protocol !== 'https:' && !(base.protocol === 'http:' && ['127.0.0.1', '[::1]'].includes(base.hostname)))) throw new Error('Web delivery requires HTTPS, or an explicit loopback test origin')
  if (!base.pathname.endsWith('/')) throw new Error('The deployment base must end with a slash')
  const get = async (file, maximum) => {
    const response = await fetch(new URL(file.split('/').map(encodeURIComponent).join('/'), base), { redirect: 'error' })
    if (!response.ok) throw new Error('Missing deployed Web payload')
    const chunks = []; let size = 0
    for await (const chunk of response.body) {
      size += chunk.length
      if (size > maximum) throw new Error('Deployed response exceeds the reviewed payload size')
      chunks.push(chunk)
    }
    return { bytes: Buffer.concat(chunks), cache: response.headers.get('cache-control') ?? '' }
  }
  const manifest = await get('novera-web-version.json', 16384)
  if (!/(?:^|,)\s*no-store(?:\s|,|$)/i.test(manifest.cache)) throw new Error('Web version metadata must disable storage in caches')
  const metadata = JSON.parse(manifest.bytes)
  if (metadata.formatVersion !== 1 || metadata.product !== 'Novera Web' || metadata.version !== expected.version || metadata.commit !== expected.commit || metadata.entrypoint !== 'index.html' || metadata.entrypointSha256 !== expected.entrypointSha256) throw new Error('Deployed Web revision differs from the reviewed build')
  if (expected.buildId && (metadata.application !== 'NoveraWeb' || metadata.schemaVersion !== 1 || metadata.buildId !== expected.buildId)) throw new Error('Deployed browser update identity differs from the reviewed build')
  for (const artifact of expected.artifacts) {
    if (!artifact.file || artifact.file.startsWith('/') || artifact.file.split('/').some(p => p === '..' || !p) || /[\\?#:]/.test(artifact.file)) throw new Error('Unsafe Web artifact path')
    const actual = await get(artifact.file, artifact.bytes)
    if (actual.bytes.length !== artifact.bytes || digest(actual.bytes) !== artifact.sha256) throw new Error('Deployed Web payload differs from the reviewed build')
    if (artifact.file === 'index.html' && !/(?:^|,)\s*(?:no-cache|no-store)(?:\s|,|$)/i.test(actual.cache)) throw new Error('Web entry point must be revalidated on reload')
  }
  return { version: metadata.version, commit: metadata.commit, filesVerified: expected.artifacts.length, entrypointRevalidated: true, hostedChannelValidated: base.protocol === 'https:', browserUpgradeValidated: false, publicReleaseAuthorized: false }
}
