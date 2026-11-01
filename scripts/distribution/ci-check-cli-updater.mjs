import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

if (process.env.GITHUB_ACTIONS !== 'true' || process.env.NOVERA_ENABLE_CLI_UPDATER !== 'true') throw new Error('Signed CLI CI candidate required')
const platform = { 'win32:x64': 'windows-x86_64', 'linux:x64': 'linux-x86_64', 'darwin:arm64': 'darwin-aarch64' }[`${process.platform}:${process.arch}`]
if (!platform) throw new Error('Unsupported signed CLI architecture')
const version = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json')).version
const file = `Novera_CLI_${version}_${platform}.zip`
const binary = path.join('.build/candidates', process.platform === 'win32' ? 'jan.exe' : 'jan')
const python = process.platform === 'win32' ? 'python' : 'python3'
execFileSync(python, ['scripts/distribution/package-cli-update.py', binary, '.build/candidates/packages', version, platform, process.env.GITHUB_SHA], { stdio: 'inherit' })
const archive = path.resolve('.build/candidates/packages', file)
execFileSync(process.execPath, [path.resolve('node_modules/@tauri-apps/cli/tauri.js'), 'signer', 'sign', archive], { stdio: ['ignore', 'pipe', 'pipe'] })
const pubkey = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json')).plugins.updater.pubkey
const checked = await verifyUpdateBundle(archive, fs.readFileSync(archive + '.sig', 'utf8'), pubkey)
fs.writeFileSync('.build/candidates/CLI-UPDATER-READINESS.json', JSON.stringify({
  commit: process.env.GITHUB_SHA, platform, version,
  endpoint: 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest-cli.json',
  updaterEnabled: true, signaturesVerified: true, installedUpdateValidated: false, publicationAuthorized: false,
  artifacts: [{ file, signature: file + '.sig', ...checked }],
}, null, 2) + '\n')
console.log(`Signed CLI archive verified for ${platform}; publication remains blocked`)
