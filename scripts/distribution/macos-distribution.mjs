import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

// These variables are supplied only to the explicit macOS distribution build.
export const appleCredentials = ['APPLE_CERTIFICATE', 'APPLE_CERTIFICATE_PASSWORD', 'APPLE_SIGNING_IDENTITY', 'APPLE_ID', 'APPLE_PASSWORD', 'APPLE_TEAM_ID']

export function preflight(env) {
  if (env.NOVERA_MACOS_DISTRIBUTION !== 'true') return
  if (env.REQUESTED !== 'macos' || env.NOVERA_ENABLE_UPDATER !== 'true') throw new Error('Apple distribution requires target=macos and signed_updates=true')
  const missing = [...appleCredentials, 'TAURI_SIGNING_PRIVATE_KEY', 'TAURI_SIGNING_PRIVATE_KEY_PASSWORD'].filter(name => !env[name]?.trim())
  if (missing.length) throw new Error(`Missing distribution credentials: ${missing.join(', ')}`)
  if (!env.APPLE_SIGNING_IDENTITY.startsWith('Developer ID Application: ')) throw new Error('A Developer ID Application identity is required')
}

async function digest(file) {
  const hash = createHash('sha256')
  for await (const chunk of fs.createReadStream(file)) hash.update(chunk)
  return hash.digest('hex')
}

// Compare the entire bundle, including hidden files, executable modes and links.
// Never follow framework symlinks or accept links escaping the application.
export async function bundleManifest(root) {
  const entries = []
  async function visit(dir) {
    for (const name of fs.readdirSync(dir).sort()) {
      const file = path.join(dir, name), stat = fs.lstatSync(file)
      const relative = path.relative(root, file).replaceAll('\\', '/')
      if (stat.isSymbolicLink()) {
        const target = fs.readlinkSync(file)
        const resolved = path.relative(root, path.resolve(path.dirname(file), target))
        if (path.isAbsolute(target) || resolved === '..' || resolved.startsWith(`..${path.sep}`) || path.isAbsolute(resolved)) throw new Error(`External bundle symlink: ${relative}`)
        entries.push({ file: relative, link: target })
      } else if (stat.isDirectory()) {
        entries.push({ file: relative, directory: true, mode: stat.mode & 0o777 })
        await visit(file)
      } else if (stat.isFile()) entries.push({ file: relative, mode: stat.mode & 0o777, size: stat.size, sha256: await digest(file) })
      else throw new Error(`Unsupported bundle entry: ${relative}`)
    }
  }
  await visit(root)
  if (!entries.length) throw new Error('Empty application bundle')
  return entries
}

export function compareBundles(expected, actual) {
  if (JSON.stringify(expected) !== JSON.stringify(actual)) throw new Error('DMG/updater application differs from the verified signed bundle')
}

async function verify(app, packages) {
  if (process.platform !== 'darwin' || process.env.GITHUB_ACTIONS !== 'true') throw new Error('macOS GitHub runner required')
  preflight(process.env)
  if (process.env.NOVERA_MACOS_DISTRIBUTION !== 'true') throw new Error('Explicit Apple distribution mode required')
  const run = (command, args) => execFileSync(command, args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
  const checkApp = file => {
    run('codesign', ['--verify', '--deep', '--strict', file])
  }
  checkApp(app)
  // An ad-hoc signature passes codesign --verify, but has no Apple authority.
  const { spawnSync } = await import('node:child_process')
  const details = spawnSync('codesign', ['--display', '--verbose=4', app], { encoding: 'utf8' })
  if (details.status !== 0 || !details.stderr.split('\n').includes(`Authority=${process.env.APPLE_SIGNING_IDENTITY}`) || !details.stderr.split('\n').includes(`TeamIdentifier=${process.env.APPLE_TEAM_ID}`) || !/flags=.*\bruntime\b/.test(details.stderr)) throw new Error('Unexpected Apple signing identity, team or hardened runtime')
  run('xcrun', ['stapler', 'validate', app])
  run('spctl', ['--assess', '--type', 'execute', '--verbose=2', app])
  const names = fs.readdirSync(packages)
  const one = suffix => {
    const matches = names.filter(name => name.endsWith(suffix))
    if (matches.length !== 1) throw new Error(`Expected one ${suffix} package for this architecture`)
    return path.resolve(packages, matches[0])
  }
  const dmg = one('.dmg'), archive = one('.app.tar.gz')
  const expected = await bundleManifest(app)
  const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-macos-distribution-'))
  const mount = path.join(scratch, 'mount'), unpacked = path.join(scratch, 'update')
  let mounted = false
  try {
    fs.mkdirSync(mount); fs.mkdirSync(unpacked)
    run('tar', ['-xzf', archive, '-C', unpacked])
    const updateApp = path.join(unpacked, 'Novera.app')
    compareBundles(expected, await bundleManifest(updateApp))
    checkApp(updateApp)
    run('xcrun', ['stapler', 'validate', updateApp])
    run('hdiutil', ['attach', '-readonly', '-nobrowse', '-mountpoint', mount, dmg])
    mounted = true
    const diskApp = path.join(mount, 'Novera.app')
    compareBundles(expected, await bundleManifest(diskApp))
    checkApp(diskApp)
    run('xcrun', ['stapler', 'validate', diskApp])
    run('spctl', ['--assess', '--type', 'execute', '--verbose=2', diskApp])
    const artifacts = await Promise.all([dmg, archive].map(async file => ({ file: path.basename(file), size: fs.statSync(file).size, sha256: await digest(file) })))
    fs.writeFileSync('.build/candidates/MACOS-DISTRIBUTION.json', JSON.stringify({ commit: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID, architecture: process.arch, appleSignatureVerified: true, stapledAppVerified: true, gatekeeperAssessmentPassed: true, dmgMatchesUpdater: true, realDeviceUIValidated: false, artifacts }, null, 2) + '\n')
  } finally {
    if (mounted) run('hdiutil', ['detach', mount])
    // The directory is created above under the OS temp root, never from input.
    if (path.dirname(scratch) !== os.tmpdir() || !path.basename(scratch).startsWith('novera-macos-distribution-')) throw new Error('Unexpected temporary directory')
    fs.rmSync(scratch, { recursive: true, force: true })
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'preflight') preflight(process.env)
  else if (process.argv[2] === 'verify' && process.argv.length === 5) await verify(process.argv[3], process.argv[4])
  else throw new Error('Usage: macos-distribution.mjs preflight | verify APP PACKAGES')
}
