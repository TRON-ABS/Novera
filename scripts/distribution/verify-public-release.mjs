import fs from 'node:fs'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

const origin = 'https://github.com/TRON-ABS/Novera/releases/'
const platforms = ['linux-x86_64', 'windows-x86_64']

export function reviewedAssetUrl(url, version, filename) {
  const parsed = new URL(url)
  const tag = parsed.pathname.split('/')[5]
  if (parsed.origin !== 'https://github.com' || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== `/TRON-ABS/Novera/releases/download/${tag}/${filename}` || !new RegExp(`^v${version.replaceAll('.', '\\.')}(-[a-z0-9.-]+)?$`).test(tag)) throw new Error('Unexpected official release asset URL')
  return url
}

export function reviewPublicFeeds(desktop, cli, version, plannedChannels) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('Stable version required')
  const files = new Map()
  for (const [kind, feed] of [['desktop', desktop], ['cli', cli]]) {
    const planned = plannedChannels?.[kind]
    const selected = planned ? Object.keys(planned).sort() : platforms
    const allowed = kind === 'desktop' ? [...platforms, 'windows-aarch64'] : platforms
    if (!platforms.every(p => selected.includes(p)) || selected.some(p => !allowed.includes(p)) || feed.version !== version || JSON.stringify(Object.keys(feed.platforms ?? {}).sort()) !== JSON.stringify(selected)) throw new Error('Public feed version or platform scope differs from this release')
    if (kind === 'desktop' && Number.isNaN(Date.parse(feed.pub_date))) throw new Error('Invalid publication date')
    for (const platform of selected) {
      const entry = feed.platforms[platform]
      const file = kind === 'cli' ? `Novera_CLI_${version}_${platform}.zip` : platform === 'windows-x86_64' ? `Novera_${version}_x64-setup.exe` : platform === 'windows-aarch64' ? `Novera_${version}_arm64-setup.exe` : `Novera_${version}_amd64.AppImage`
      const url = planned?.[platform] ?? `${origin}download/v${version}/${file}`
      reviewedAssetUrl(url, version, file)
      if (entry.url !== url || typeof entry.signature !== 'string' || !entry.signature) throw new Error('Unexpected public asset URL or missing signature')
      if (kind === 'cli' && !/^[a-f0-9]{64}$/.test(entry.sha256 ?? '')) throw new Error('Missing CLI checksum')
      files.set(file, entry)
    }
  }
  return files
}

async function get(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(600_000), headers: { 'User-Agent': 'Novera-public-release-validation' } })
  if (!response.ok) throw new Error(`Public URL returned HTTP ${response.status}: ${url}`)
  if (!response.url.startsWith('https://')) throw new Error('Non-HTTPS redirect')
  return response
}

async function main(version, expectedFile) {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Disposable GitHub-hosted runner required')
  const descriptor = JSON.parse(fs.readFileSync(expectedFile))
  if (!Array.isArray(descriptor) && descriptor.version !== version) throw new Error('Reviewed release descriptor version differs')
  const expected = Array.isArray(descriptor) ? descriptor : descriptor.assets
  const output = '.build/public-release'
  fs.mkdirSync(output, { recursive: true })
  const feeds = []
  for (const name of ['latest.json', 'latest-cli.json']) {
    const response = await get(`${origin}latest/download/${name}`)
    const bytes = Buffer.from(await response.arrayBuffer())
    const record = expected.find(a => a.name === name)
    if (!record || createHash('sha256').update(bytes).digest('hex') !== record.sha256) throw new Error('Public manifest differs from the reviewed draft')
    fs.writeFileSync(`${output}/${name}`, bytes)
    feeds.push(JSON.parse(bytes))
  }
  const files = reviewPublicFeeds(...feeds, version, descriptor.channels)
  const key = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey
  const verified = []
  for (const record of expected) {
    if (!/^[A-Za-z0-9_.-]+$/.test(record.name) || !/^[a-f0-9]{64}$/.test(record.sha256)) throw new Error('Unsafe expected asset')
    const target = `${output}/${record.name}`
    if (!fs.existsSync(target)) {
      const response = await get(reviewedAssetUrl(record.url ?? `${origin}download/v${version}/${record.name}`, version, record.name))
      await pipeline(Readable.fromWeb(response.body), fs.createWriteStream(target, { flags: 'wx' }))
    }
    const hash = createHash('sha256')
    for await (const block of fs.createReadStream(target)) hash.update(block)
    if (fs.statSync(target).size !== record.bytes || hash.digest('hex') !== record.sha256) throw new Error('Public asset differs from reviewed bytes: ' + record.name)
    verified.push(record.name)
  }
  for (const [name, entry] of files) {
    const signature = fs.readFileSync(`${output}/${name}.sig`, 'utf8').trim()
    if (signature !== entry.signature) throw new Error('Feed signature differs from published signature file')
    const checked = await verifyUpdateBundle(`${output}/${name}`, signature, key)
    if (entry.sha256 && entry.sha256 !== checked.sha256) throw new Error('CLI feed checksum mismatch')
  }
  const receipt = { version, publicFeedsReachableWithoutCredentials: true, publicAssetsVerified: verified, updaterSignaturesVerified: true, twoPublishedVersionsUpgradeValidated: false }
  fs.writeFileSync(`${output}/PUBLIC-RELEASE-VERIFIED.json`, JSON.stringify(receipt, null, 2) + '\n')
  console.log(JSON.stringify(receipt, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 4) throw new Error('Usage: verify-public-release.mjs VERSION EXPECTED_ASSETS.json')
  await main(process.argv[2], process.argv[3])
}
