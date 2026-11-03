import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

export const cliPlatforms = ['windows-x86_64', 'linux-x86_64', 'darwin-aarch64']
export const publishedCliPlatforms = ['windows-x86_64', 'linux-x86_64']
export function reviewCliProof(proof, version) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('Canonical stable CLI version required')
  const identity = proof.archiveIdentityVerified
  const installed = proof.nativeInstalledReplacementReceipt
  const expectedPlatform = { 'win32:x64': 'windows-x86_64', 'linux:x64': 'linux-x86_64', 'darwin:arm64': 'darwin-aarch64' }[`${proof.platform}:${proof.architecture}`]
  if (proof.kind !== 'cli' || proof.binaryArchitectureVerified !== true || proof.cryptographicUpdateSignatureVerified !== true || proof.pinnedPublicKeyEmbedded !== true || !cliPlatforms.includes(expectedPlatform)) throw new Error('An independently verified signed CLI proof is required')
  if (identity?.product !== 'Novera CLI' || identity.formatVersion !== 2 || identity.version !== version || identity.platform !== expectedPlatform || identity.commit !== proof.commit || !/^[a-f0-9]{40}$/.test(proof.commit) || !/^[a-f0-9]{64}$/.test(proof.signedArchiveSha256)) throw new Error('CLI identity differs from the selected release')
  for (const field of ['signatureVerified', 'tamperedArchiveRejected', 'replacementPerformed', 'replacedExecutableRuns', 'profileWitnessPreserved']) {
    if (installed?.[field] !== true) throw new Error('Missing actual isolated CLI replacement evidence')
  }
  if (installed.platform !== expectedPlatform || installed.version !== version || installed.archiveSha256 !== proof.signedArchiveSha256) throw new Error('CLI replacement receipt differs from the signed archive')
  return { platform: expectedPlatform, file: `Novera_CLI_${version}_${expectedPlatform}.zip`, commit: proof.commit, sha256: proof.signedArchiveSha256 }
}

export async function prepareCliFeed(version, proofPaths, output) {
  if (proofPaths.length !== publishedCliPlatforms.length) throw new Error('Both published signed CLI platforms are required')
  if (path.basename(output) !== 'latest-novera-cli.json') throw new Error('Use the reviewed latest-novera-cli.json output name')
  const publicKey = JSON.parse(fs.readFileSync(new URL('../../src-tauri/tauri.updater.conf.json', import.meta.url))).plugins.updater.pubkey
  const platforms = {}
  for (const filename of proofPaths) {
    const proofPath = path.resolve(filename)
    const proof = JSON.parse(fs.readFileSync(proofPath))
    const item = reviewCliProof(proof, version)
    if (!publishedCliPlatforms.includes(item.platform)) throw new Error('CLI platform is not selected for public distribution')
    if (Object.hasOwn(platforms, item.platform)) throw new Error('Duplicate CLI platform')
    if (!Number.isSafeInteger(proof.artifactId) || proof.artifactId <= 0) throw new Error('Missing reviewed artifact identity')
    const archive = path.join(path.dirname(proofPath), `${proof.artifactId}-cli-inspection`, item.file)
    const signature = fs.readFileSync(archive + '.sig', 'utf8').trim()
    if (fs.statSync(archive).size >= 2 * 1024 ** 3) throw new Error('CLI asset exceeds the GitHub release limit')
    const checked = await verifyUpdateBundle(archive, signature, publicKey)
    if (checked.sha256 !== item.sha256) throw new Error('CLI archive differs from the replacement proof')
    // Inspect the identity inside the authenticated ZIP; do not trust a renamed
    // old archive or an editable external JSON record as the version binding.
    const identity = JSON.parse(execFileSync(process.platform === 'win32' ? 'python' : 'python3', [fileURLToPath(new URL('./package-cli-update.py', import.meta.url)), '--inspect', archive, version, item.platform, item.commit], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))
    if (identity.binarySha256 !== proof.archiveIdentityVerified.binarySha256) throw new Error('CLI executable digest differs from the reviewed archive')
    platforms[item.platform] = { url: `https://github.com/TRON-ABS/Novera/releases/download/v${version}-cli-novera/${item.file}`, sha256: checked.sha256, signature }
  }
  const feed = { version, platforms }
  fs.writeFileSync(output, JSON.stringify(feed, null, 2) + '\n', { flag: 'wx' })
  return { output: path.basename(output), version, platforms: Object.keys(platforms), signaturesReverified: true, productionEndpointValidated: false, publicReleaseAuthorized: false }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [version, output, ...proofs] = process.argv.slice(2)
  if (!version || !output) throw new Error('Usage: node prepare-cli-feed.mjs VERSION OUTPUT/latest-novera-cli.json TWO_VERIFIED_PROOFS')
  console.log(JSON.stringify(await prepareCliFeed(version, proofs, output), null, 2))
}
