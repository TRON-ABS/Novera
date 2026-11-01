import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { macosDeploymentTarget } from './ci-candidates.mjs'

export function packedVersion(value) {
  const parts = value.split('.').map(Number)
  if (parts.length > 3 || parts.some(n => !Number.isInteger(n) || n < 0 || n > 255)) throw new Error('Invalid macOS version')
  return parts[0] * 65536 + (parts[1] || 0) * 256 + (parts[2] || 0)
}
export function inspectMacHeader(header, architecture, maximum) {
  if (header.length < 32 || header.readUInt32LE(0) !== 0xfeedfacf) throw new Error('Expected native 64-bit Mach-O')
  const cpu = { arm64: 0x100000c, x64: 0x1000007 }[architecture]
  if (!cpu || header.readUInt32LE(4) !== cpu) throw new Error('Unexpected binary architecture')
  const end = 32 + header.readUInt32LE(20)
  if (end > header.length) throw new Error('Truncated Mach-O commands')
  let offset = 32, minimum = null
  for (let i = 0; i < header.readUInt32LE(16); i++) {
    if (offset + 8 > end) throw new Error('Truncated Mach-O command')
    const command = header.readUInt32LE(offset), size = header.readUInt32LE(offset + 4)
    if (size < 8 || offset + size > end) throw new Error('Invalid Mach-O command size')
    if (command === 0x32 || command === 0x24) {
      if (size < (command === 0x32 ? 24 : 16)) throw new Error('Truncated version command')
      if (command === 0x32 && header.readUInt32LE(offset + 8) !== 1) throw new Error('Expected macOS platform')
      const version = header.readUInt32LE(offset + (command === 0x32 ? 12 : 8))
      minimum = Math.max(minimum ?? 0, version)
    }
    offset += size
  }
  if (minimum === null) throw new Error('Missing macOS minimum')
  if (minimum > packedVersion(maximum)) throw new Error(`Binary requires a newer macOS than ${maximum}`)
  return `${minimum >>> 16}.${(minimum >>> 8) & 255}.${minimum & 255}`
}
function files(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    return e.isDirectory() ? files(p) : e.isFile() ? [p] : []
  })
}
function check(app) {
  if (process.env.GITHUB_ACTIONS !== 'true' || process.platform !== 'darwin') throw new Error('macOS GitHub runner required')
  const minimum = macosDeploymentTarget(process.arch)
  const plist = execFileSync('/usr/libexec/PlistBuddy', ['-c', 'Print :LSMinimumSystemVersion', path.join(app, 'Contents/Info.plist')], { encoding: 'utf8' }).trim()
  if (packedVersion(plist) !== packedVersion(minimum)) throw new Error('App minimum differs from the build target')
  const native = [...files(path.join(app, 'Contents/MacOS')), ...files(path.join(app, 'Contents/Resources/resources/bin')).filter(p => /(?:\.dylib|\.so)$/.test(p) || ['novera-llama-worker', 'mlx-server'].includes(path.basename(p)))]
  if (!native.length) throw new Error('No native application payload')
  const results = native.map(p => {
    const fd = fs.openSync(p, 'r'), header = Buffer.alloc(65536)
    let length
    try { length = fs.readSync(fd, header) } finally { fs.closeSync(fd) }
    const file = path.relative(app, p).replaceAll('\\', '/')
    try { return { file, minimum: inspectMacHeader(header.subarray(0, length), process.arch, minimum) } }
    catch (error) { throw new Error(`${file}: ${error.message}`) }
  })
  fs.writeFileSync('.build/candidates/MACOS-COMPATIBILITY.json', JSON.stringify({ architecture: process.arch, minimumSystemVersion: minimum, nativeFiles: results }, null, 2) + '\n')
  console.log(`Verified ${results.length} native binaries against macOS ${minimum} and the app plist`)
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) check(process.argv[2])
