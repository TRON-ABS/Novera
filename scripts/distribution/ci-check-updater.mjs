import fs from 'node:fs'
import path from 'node:path'
import { createHash, createPublicKey, verify } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { validatePublicKey, endpoint } from '../updates/novera-update.mjs'

export async function verifyUpdateBundle(file, signatureText, publicKey) {
  validatePublicKey(publicKey.trim())
  const key = Buffer.from(Buffer.from(publicKey.trim(), 'base64').toString().trim().split(/\r?\n/)[1], 'base64')
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(signatureText.trim())) throw new Error('Invalid signature encoding')
  const lines = Buffer.from(signatureText.trim(), 'base64').toString('utf8').trim().split(/\r?\n/)
  const packet = Buffer.from(lines[1] ?? '', 'base64'), global = Buffer.from(lines[3] ?? '', 'base64')
  if (lines.length !== 4 || !lines[0].startsWith('untrusted comment:') || !lines[2].startsWith('trusted comment: ') || packet.length !== 74 || packet.subarray(0, 2).toString() !== 'ED' || global.length !== 64 || !packet.subarray(2, 10).equals(key.subarray(2, 10))) throw new Error('Signature packet does not match the Novera key')
  const publicObject = createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), key.subarray(10)]), format: 'der', type: 'spki' })
  const digest = createHash('blake2b512'), sha = createHash('sha256')
  for await (const block of fs.createReadStream(file)) { digest.update(block); sha.update(block) }
  if (!verify(null, digest.digest(), publicObject, packet.subarray(10))) throw new Error('Invalid update payload signature')
  if (!verify(null, Buffer.concat([packet.subarray(10), Buffer.from(lines[2].slice('trusted comment: '.length))]), publicObject, global)) throw new Error('Invalid trusted-comment signature')
  return { sha256: sha.digest('hex'), publicKeyFingerprintSha256: createHash('sha256').update(key).digest('hex') }
}

export function requireUpdatePublication(candidate, receipt) {
  if (candidate.kind !== 'desktop' || candidate.updaterChannelConfigured !== true || candidate.updaterSignaturesVerified !== true) throw new Error('Publication blocked: no verified update channel for this candidate')
  if (!receipt || receipt.commit !== candidate.commit || receipt.endpoint !== endpoint || receipt.updaterEnabled !== true || receipt.signaturesVerified !== true || !receipt.artifacts?.length) throw new Error('Publication blocked: missing or mismatched updater receipt')
  if (!['windows-x86_64', 'windows-aarch64', 'linux-x86_64', 'darwin-x86_64', 'darwin-aarch64'].includes(receipt.platform)) throw new Error('Publication blocked: unsupported update platform')
  const expected = { 'win32:x64': 'windows-x86_64', 'win32:arm64': 'windows-aarch64', 'linux:x64': 'linux-x86_64', 'darwin:x64': 'darwin-x86_64', 'darwin:arm64': 'darwin-aarch64' }[`${candidate.platform}:${candidate.architecture}`]
  if (expected !== receipt.platform) throw new Error('Publication blocked: updater platform differs from candidate architecture')
  return true
}

async function check() {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.NOVERA_ENABLE_UPDATER !== 'true') throw new Error('Signed GitHub desktop build required')
  const config = JSON.parse(fs.readFileSync('.build/candidate-config.json'))
  const pinned = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json'))
  if (config.bundle.createUpdaterArtifacts !== true || JSON.stringify(config.plugins?.updater) !== JSON.stringify(pinned.plugins.updater) || config.plugins.updater.endpoints[0] !== endpoint) throw new Error('Updater trust configuration was not embedded')
  const version = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json')).version
  const folder = '.build/candidates/packages'
  const platforms = { win32: { x64: 'windows-x86_64', arm64: 'windows-aarch64' }, linux: { x64: 'linux-x86_64' }, darwin: { x64: 'darwin-x86_64', arm64: 'darwin-aarch64' } }
  const platform = platforms[process.platform]?.[process.arch]
  if (!platform) throw new Error('Unsupported desktop update architecture')
  const cpu = process.arch === 'arm64' ? 'arm64' : 'x64'
  const name = process.platform === 'win32' ? `Novera_${version}_${cpu}-setup.exe` : process.platform === 'linux' ? `Novera_${version}_amd64.AppImage` : `Novera_${version}_${process.arch === 'arm64' ? 'aarch64' : 'x64'}.app.tar.gz`
  const file = path.join(folder, name)
  if (process.platform === 'darwin' && !fs.existsSync(file)) {
    const archives = fs.readdirSync(folder).filter(n => n.endsWith('.app.tar.gz'))
    if (archives.length !== 1) throw new Error('Expected one macOS updater archive')
    fs.renameSync(path.join(folder, archives[0]), file)
    if (fs.existsSync(path.join(folder, archives[0] + '.sig'))) fs.renameSync(path.join(folder, archives[0] + '.sig'), file + '.sig')
  }
  if (!fs.statSync(file).isFile()) throw new Error('Missing final updater bundle')
  // AppImage repacking happens after Tauri bundling. Sign the final delivered
  // bytes, and use the same explicit step for every supported desktop target.
  execFileSync(process.execPath, [path.resolve('node_modules/@tauri-apps/cli/tauri.js'), 'signer', 'sign', path.resolve(file)], { stdio: ['ignore', 'pipe', 'pipe'] })
  const checked = await verifyUpdateBundle(file, fs.readFileSync(file + '.sig', 'utf8'), pinned.plugins.updater.pubkey)
  const receipt = { commit: process.env.GITHUB_SHA, platform, endpoint, updaterEnabled: true, signaturesVerified: true, artifacts: [{ file: name, signature: name + '.sig', ...checked }] }
  fs.writeFileSync('.build/candidates/UPDATER-READINESS.json', JSON.stringify(receipt, null, 2) + '\n')
  console.log(`Verified the signed final update bundle for ${platform}`)
}
async function publicationCheck(directory) {
  const root = fs.realpathSync(directory)
  const candidate = JSON.parse(fs.readFileSync(path.join(root, 'candidate.json')))
  const receipt = JSON.parse(fs.readFileSync(path.join(root, 'UPDATER-READINESS.json')))
  requireUpdatePublication(candidate, receipt)
  const pinned = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json'))
  for (const artifact of receipt.artifacts) {
    for (const name of [artifact.file, artifact.signature]) {
      if (typeof name !== 'string' || path.basename(name) !== name || name.includes('\\') || name.includes('/')) throw new Error('Unsafe update artifact path')
    }
    const file = path.join(root, 'packages', artifact.file)
    const checked = await verifyUpdateBundle(file, fs.readFileSync(path.join(root, 'packages', artifact.signature), 'utf8'), pinned.plugins.updater.pubkey)
    if (checked.sha256 !== artifact.sha256 || checked.publicKeyFingerprintSha256 !== artifact.publicKeyFingerprintSha256) throw new Error('Update receipt differs from the actual signed bytes')
  }
  console.log(`Publication update prerequisite verified for ${receipt.platform}; no release was published.`)
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === '--publication-check' && process.argv.length === 4) await publicationCheck(process.argv[3])
  else if (process.argv.length === 2) await check()
  else throw new Error('Usage: ci-check-updater.mjs [--publication-check CANDIDATE_DIRECTORY]')
}
