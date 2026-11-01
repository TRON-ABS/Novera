import { readFileSync, writeFileSync, createReadStream, existsSync, openSync, closeSync, unlinkSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'

export const endpoint = 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json'

export function validatePublicKey(key) {
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(key)) throw new Error('Expected a Tauri public key, not a private key or placeholder')
  const lines = Buffer.from(key, 'base64').toString('utf8').trim().split(/\r?\n/)
  const packet = Buffer.from(lines[1] ?? '', 'base64')
  if (!lines[0]?.startsWith('untrusted comment:') || lines.length !== 2 || packet.length !== 42 || packet.subarray(0, 2).toString() !== 'Ed')
    throw new Error('Invalid Tauri/minisign public key')
  return key
}

export function releaseConfig(key) {
  return {
    bundle: { createUpdaterArtifacts: true },
    plugins: { updater: { pubkey: validatePublicKey(key.trim()), endpoints: [endpoint], windows: { installMode: 'passive' } } },
  }
}

function updateEntry(version, { platform = 'windows-x86_64', artifact, signature }) {
  const filenames = {
    'windows-x86_64': `Novera_${version}_x64-setup.exe`,
    'windows-aarch64': `Novera_${version}_arm64-setup.exe`,
    'linux-x86_64': `Novera_${version}_amd64.AppImage`,
    'darwin-aarch64': `Novera_${version}_aarch64.app.tar.gz`,
    'darwin-x86_64': `Novera_${version}_x64.app.tar.gz`,
  }
  if (!Object.hasOwn(filenames, platform)) throw new Error('Unsupported Novera update platform')
  const file = basename(artifact)
  if (file !== filenames[platform]) throw new Error(`Use the version-matched updater bundle for ${platform}`)
  if (!/^[A-Za-z0-9+/]+={0,2}$/.test(signature?.trim() || '')) throw new Error('Expected complete Tauri .sig contents')
  const lines = Buffer.from(signature.trim(), 'base64').toString('utf8').trim().split(/\r?\n/)
  const packet = Buffer.from(lines[1] ?? '', 'base64')
  if (lines.length !== 4 || !lines[0]?.startsWith('untrusted comment:') || !lines[2]?.startsWith('trusted comment:') ||
      packet.length !== 74 || !['Ed', 'ED'].includes(packet.subarray(0, 2).toString()) || Buffer.from(lines[3] ?? '', 'base64').length !== 64)
    throw new Error('Expected complete Tauri .sig contents')
  return { platform, value: { url: `https://github.com/TRON-ABS/Novera/releases/download/v${version}/${encodeURIComponent(file)}`, signature: signature.trim() } }
}

export function releaseManifest({ version, artifact, signature, platform, artifacts, notes = '', publishedAt = new Date().toISOString() }) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('The stable feed requires a stable semantic version')
  if (Number.isNaN(Date.parse(publishedAt))) throw new Error('Invalid publication date')
  if (artifacts && (artifact || signature || platform)) throw new Error('Choose a single artifact or an artifact list')
  const entries = artifacts ?? [{ platform, artifact, signature }]
  if (!Array.isArray(entries) || !entries.length) throw new Error('Provide at least one updater artifact')
  const platforms = {}
  for (const entry of entries) {
    const item = updateEntry(version, entry)
    if (Object.hasOwn(platforms, item.platform)) throw new Error('Duplicate updater platform')
    platforms[item.platform] = item.value
  }
  return { version, notes, pub_date: publishedAt, platforms }
}

async function digest(file) {
  const hash = createHash('sha256')
  for await (const block of createReadStream(file)) hash.update(block)
  return hash.digest('hex')
}
function writeNew(outputs) {
  if (outputs.some(([file]) => existsSync(file))) throw new Error('Output already exists; choose new output paths')
  const created = []
  try {
    for (const [file, content] of outputs) {
      const fd = openSync(file, 'wx')
      created.push(file)
      try { writeFileSync(fd, content) } finally { closeSync(fd) }
    }
  } catch (error) {
    for (const file of created.reverse()) unlinkSync(file)
    throw error
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [command, ...args] = process.argv.slice(2)
  const options = Object.fromEntries(args.reduce((pairs, value, index) => {
    if (index % 2 === 0) {
      if (!value.startsWith('--') || args[index + 1] === undefined) throw new Error('Expected --option value pairs')
      pairs.push([value.slice(2), args[index + 1]])
    }
    return pairs
  }, []))
  const output = options.out
  if (!output) throw new Error('Provide --out with a new output file path')
  let result, checksums
  if (command === 'config') {
    result = releaseConfig(readFileSync(options['public-key'], 'utf8'))
  } else if (command === 'manifest') {
    let entries
    if (options['artifacts-file']) {
      if (options.artifact || options.signature || options.platform) throw new Error('Choose single-artifact options or --artifacts-file')
      const descriptor = resolve(options['artifacts-file'])
      const list = JSON.parse(readFileSync(descriptor, 'utf8'))
      if (!Array.isArray(list) || !list.length) throw new Error('The artifact file must contain a non-empty array')
      entries = list.map(item => ({ platform: item.platform, artifact: resolve(dirname(descriptor), item.artifact), signature: readFileSync(resolve(dirname(descriptor), item.signature), 'utf8') }))
    } else {
      entries = [{ platform: options.platform, artifact: options.artifact, signature: readFileSync(options.signature, 'utf8') }]
    }
    result = releaseManifest({ version: options.version, artifacts: entries,
      notes: options.notes ? readFileSync(options.notes, 'utf8') : '',
    })
    checksums = (await Promise.all(entries.map(async item => `${await digest(item.artifact)}  ${basename(item.artifact)}\n`))).join('')
  } else throw new Error('Use config or manifest')
  writeNew([[output, JSON.stringify(result, null, 2) + '\n'], ...(checksums ? [[`${output}.sha256`, checksums]] : [])])
  console.log(`Prepared ${command}: ${output}. Nothing uploaded or enabled.`)
}
