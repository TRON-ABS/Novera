import fs from 'node:fs'
import path from 'node:path'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Disposable native runner required')
const nativeEnv = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/TOKEN|PASSWORD|SECRET|PRIVATE_KEY/i.test(key)))
const platform = { 'win32:x64': 'windows-x86_64', 'linux:x64': 'linux-x86_64', 'darwin:arm64': 'darwin-aarch64' }[`${process.platform}:${process.arch}`]
if (!platform) throw new Error('Unsupported native CLI host')
const descriptor = JSON.parse(fs.readFileSync('scripts/distribution/public-release-1.0.1.json'))
const version = descriptor.version
if (version !== '1.0.1' || descriptor.cliIdentityFormatVersion !== 2 || !/^[a-f0-9]{40}$/.test(descriptor.cliSourceCommit)) throw new Error('Reviewed canonical CLI source required')
const sourceName = `Novera_CLI_${version}_${platform}.zip`
const record = name => {
  const records = descriptor.assets.filter(asset => asset.name === name)
  if (records.length !== 1 || !/^[a-f0-9]{64}$/.test(records[0].sha256)) throw new Error('Ambiguous canonical CLI source')
  return records[0]
}
const base = `https://github.com/TRON-ABS/Novera/releases/download/v${version}-cli-novera/`
const source = '.build/legacy-cli-source', output = '.build/legacy-cli'
fs.mkdirSync(source, { recursive: true })
for (const name of [sourceName, sourceName + '.sig']) {
  const expected = record(name)
  const response = await fetch(base + name, { signal: AbortSignal.timeout(120000) })
  if (!response.ok) throw new Error(`Canonical CLI download failed: ${response.status}`)
  let size = 0
  const chunks = []
  for await (const block of response.body) {
    size += block.length
    if (size > 128 * 1024 * 1024) throw new Error('Canonical CLI archive exceeds limit')
    chunks.push(Buffer.from(block))
  }
  const bytes = Buffer.concat(chunks)
  if (bytes.length !== expected.bytes || createHash('sha256').update(bytes).digest('hex') !== expected.sha256) throw new Error('Canonical CLI bytes changed')
  fs.writeFileSync(path.join(source, name), bytes, { flag: 'wx' })
}
const key = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey
await verifyUpdateBundle(path.join(source, sourceName), fs.readFileSync(path.join(source, sourceName + '.sig'), 'utf8'), key)
const proof = JSON.parse(execFileSync(process.platform === 'win32' ? 'python' : 'python3',
  ['scripts/distribution/package-legacy-cli-update.py', path.join(source, sourceName), output, version, platform, descriptor.cliSourceCommit], { encoding: 'utf8', env: nativeEnv }))
if (!process.env.TAURI_SIGNING_PRIVATE_KEY || !process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD) throw new Error('Configured Novera CI signer required')
execFileSync(process.execPath, [path.resolve('node_modules/@tauri-apps/cli/tauri.js'), 'signer', 'sign', proof.archive], { stdio: ['ignore', 'pipe', 'pipe'] })
const signature = fs.readFileSync(proof.archive + '.sig', 'utf8').trim()
const checked = await verifyUpdateBundle(proof.archive, signature, key)
const versionOutput = execFileSync(path.resolve(proof.executable), ['--version'], { encoding: 'utf8', timeout: 30000, env: nativeEnv })
if (!/\b1\.0\.1\b/.test(versionOutput)) throw new Error('Actual compatibility executable has the wrong version')
const receipt = { ...proof, ...checked, name: sourceName, bytes: fs.statSync(proof.archive).size, signature,
  url: `https://github.com/TRON-ABS/Novera/releases/download/v${version}/${sourceName}`,
  nativeVersionProbePassed: true, originalPublicUpdaterEndToEndPassed: false, workflowCommit: process.env.GITHUB_SHA }
fs.writeFileSync(path.join(output, `CLI-LEGACY-${platform}.json`), JSON.stringify(receipt, null, 2) + '\n')
console.log(`Verified and signed unchanged CLI ${version} for the format-1 ${platform} updater; public upgrade test is separate`)
