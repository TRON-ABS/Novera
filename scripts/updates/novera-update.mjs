import { readFileSync, writeFileSync } from 'node:fs'
import { basename, resolve } from 'node:path'
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

export function releaseManifest({ version, artifact, signature, notes = '', publishedAt = new Date().toISOString() }) {
  if (!/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/.test(version)) throw new Error('The stable feed requires a stable semantic version')
  const file = basename(artifact)
  if (!file.endsWith('_x64-setup.exe') || !file.includes(`_${version}_`))
    throw new Error('Use the matching signed Windows x64 NSIS installer, not the portable executable')
  const lines = Buffer.from(signature.trim(), 'base64').toString('utf8').trim().split(/\r?\n/)
  if (!lines[0]?.startsWith('untrusted comment:') || !lines[2]?.startsWith('trusted comment:') ||
      Buffer.from(lines[1] ?? '', 'base64').length !== 74 || Buffer.from(lines[3] ?? '', 'base64').length !== 64)
    throw new Error('Expected the complete Tauri .sig file contents')
  if (Number.isNaN(Date.parse(publishedAt))) throw new Error('Invalid publication date')
  return {
    version, notes, pub_date: publishedAt,
    platforms: { 'windows-x86_64': {
      url: `https://github.com/TRON-ABS/Novera/releases/download/v${version}/${encodeURIComponent(file)}`,
      signature: signature.trim(),
    } },
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
  let result
  if (command === 'config') {
    result = releaseConfig(readFileSync(options['public-key'], 'utf8'))
  } else if (command === 'manifest') {
    const raw = readFileSync(options.artifact)
    result = releaseManifest({
      version: options.version, artifact: options.artifact,
      signature: readFileSync(options.signature, 'utf8'),
      notes: options.notes ? readFileSync(options.notes, 'utf8') : '',
    })
    writeFileSync(`${output}.sha256`, `${createHash('sha256').update(raw).digest('hex')}  ${basename(options.artifact)}\n`, { flag: 'wx' })
  } else throw new Error('Use config or manifest')
  writeFileSync(output, JSON.stringify(result, null, 2) + '\n', { flag: 'wx' })
  console.log(`Prepared ${command}: ${output}. Nothing uploaded or enabled.`)
}
