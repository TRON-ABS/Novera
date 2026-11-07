import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

const origin = 'https://github.com/TRON-ABS/Novera/releases/'
const targets = ['linux-x86_64', 'windows-x86_64']

export function reviewCanonicalCliFeed(feed, version, selected = targets) {
  selected = [...selected].sort()
  if (!/^\d+\.\d+\.\d+$/.test(version) || feed.version !== version ||
      !targets.every(target => selected.includes(target)) ||
      selected.some(target => ![...targets, 'darwin-aarch64'].includes(target)) ||
      new Set(selected).size !== selected.length ||
      JSON.stringify(Object.keys(feed.platforms ?? {}).sort()) !== JSON.stringify(selected)) {
    throw new Error('Canonical CLI feed version/platform scope differs')
  }
  for (const target of selected) {
    const entry = feed.platforms[target]
    if (entry.url !== `${origin}download/v${version}-cli-novera/Novera_CLI_${version}_${target}.zip` ||
        !/^[a-f0-9]{64}$/.test(entry.sha256 ?? '') || typeof entry.signature !== 'string' || !entry.signature) {
      throw new Error('Canonical CLI feed has an unreviewed URL, checksum or signature')
    }
  }
  return feed
}

async function getBytes(url, limit) {
  const response = await fetch(url, { signal: AbortSignal.timeout(180_000), headers: { 'User-Agent': 'Novera-public-CLI-validation' } })
  if (!response.ok || !response.url.startsWith('https://')) throw new Error(`Public CLI download failed: HTTP ${response.status}`)
  const chunks = []
  let bytes = 0
  for await (const chunk of response.body) {
    bytes += chunk.byteLength
    if (bytes > limit) throw new Error('Public CLI response exceeds its limit')
    chunks.push(Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

async function main(descriptorPath) {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Disposable GitHub-hosted runner required')
  const target = { 'win32:x64': 'windows-x86_64', 'linux:x64': 'linux-x86_64', 'darwin:arm64': 'darwin-aarch64' }[`${process.platform}:${process.arch}`]
  if (!target) throw new Error('Unsupported public CLI validation host')
  const descriptor = JSON.parse(fs.readFileSync(descriptorPath))
  if (descriptor.cliIdentityFormatVersion !== 2 || descriptor.cliManifestName !== 'latest-novera-cli.json' || !/^[a-f0-9]{40}$/.test(descriptor.cliSourceCommit)) throw new Error('Reviewed canonical CLI descriptor required')
  const record = name => {
    const matches = descriptor.assets.filter(item => item.name === name)
    if (matches.length !== 1 || !/^[a-f0-9]{64}$/.test(matches[0].sha256) || !Number.isSafeInteger(matches[0].bytes)) throw new Error('Ambiguous reviewed public asset')
    return matches[0]
  }
  const check = (bytes, item) => {
    if (bytes.length !== item.bytes || createHash('sha256').update(bytes).digest('hex') !== item.sha256) throw new Error('Public CLI bytes differ from reviewed bytes')
  }
  const feedBytes = await getBytes(`${origin}latest/download/latest-novera-cli.json`, 1024 * 1024)
  check(feedBytes, record('latest-novera-cli.json'))
  const feed = reviewCanonicalCliFeed(JSON.parse(feedBytes), descriptor.version, descriptor.channels?.cli ? Object.keys(descriptor.channels.cli) : targets)
  const name = `Novera_CLI_${descriptor.version}_${target}.zip`
  const entry = feed.platforms[target]
  const archive = await getBytes(entry.url, 128 * 1024 * 1024)
  check(archive, record(name))
  if (entry.sha256 !== record(name).sha256) throw new Error('CLI feed digest differs from reviewed archive')
  const signature = await getBytes(entry.url + '.sig', 16 * 1024)
  check(signature, record(name + '.sig'))
  if (signature.toString('utf8').trim() !== entry.signature) throw new Error('Published signature differs from CLI feed')
  const directory = path.resolve(`.build/cli-public-${target}`)
  fs.mkdirSync(directory, { recursive: true })
  const archivePath = path.join(directory, name)
  fs.writeFileSync(archivePath, archive, { flag: 'wx' })
  const key = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey
  await verifyUpdateBundle(archivePath, signature.toString('utf8'), key)
  const python = process.platform === 'win32' ? 'python' : 'python3'
  const inspected = JSON.parse(execFileSync(python, ['scripts/distribution/package-cli-update.py', '--inspect', archivePath, descriptor.version, target, descriptor.cliSourceCommit], { encoding: 'utf8' }))
  const binary = process.platform === 'win32' ? 'novera.exe' : 'novera'
  if (inspected.binary !== binary || inspected.formatVersion !== 2) throw new Error('Legacy executable in canonical public archive')
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-cli-public-'))
  try {
    const executable = path.join(scratch, binary)
    execFileSync(python, ['-c', 'import pathlib,sys,zipfile; pathlib.Path(sys.argv[3]).write_bytes(zipfile.ZipFile(sys.argv[1]).read(sys.argv[2]))', archivePath, binary, executable])
    fs.chmodSync(executable, 0o755)
    const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/TOKEN|PASSWORD|SECRET|PRIVATE_KEY/i.test(key)))
    for (const key of ['HOME','USERPROFILE','APPDATA','LOCALAPPDATA','XDG_CONFIG_HOME','XDG_DATA_HOME','XDG_CACHE_HOME']) env[key] = scratch
    env.NOVERA_DATA_FOLDER = path.join(scratch, 'data')
    const help = execFileSync(executable, ['--help'], { cwd: scratch, env, encoding: 'utf8', timeout: 60_000 })
    if (!help.includes('Novera CLI') || !help.includes('novera') || /Usage: jan|jan cli|jan update|~\/\.jan\//.test(help)) throw new Error('Public CLI help has the wrong product identity')
    const output = execFileSync(executable, ['update','--check'], { cwd: scratch, env, encoding: 'utf8', timeout: 90_000 })
    if (!output.includes('Already on the latest ') || !output.includes(` build (${descriptor.version})`)) throw new Error('Public CLI did not confirm its production channel')
    const receipt = { target, version: descriptor.version, sourceCommit: descriptor.cliSourceCommit, binary,
      archiveSha256: entry.sha256, signatureVerified: true, publicFeedVerified: true,
      canonicalHelpVerified: true, nativeProductionCheckPassed: true, updateInstalled: false, stdout: output }
    fs.writeFileSync(path.join(directory, 'PUBLIC-CLI-VERIFIED.json'), JSON.stringify(receipt, null, 2) + '\n')
    console.log(JSON.stringify(receipt))
  } finally {
    if (!scratch.startsWith(path.join(os.tmpdir(), 'novera-cli-public-'))) throw new Error('Unexpected owned scratch directory')
    fs.rmSync(scratch, { recursive: true, force: true })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 3) throw new Error('Usage: node verify-cli-public.mjs REVIEWED_DESCRIPTOR.json')
  await main(process.argv[2])
}
