// Secrets stay in the signer process environment; never persist or print them.
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { verifyUpdateBundle } from './ci-check-updater.mjs'

if (process.env.GITHUB_ACTIONS !== 'true' || !process.env.TAURI_SIGNING_PRIVATE_KEY || !process.env.TAURI_SIGNING_PRIVATE_KEY_PASSWORD) throw new Error('Configured CI signer required')
const output = '.build/portable/packages'
const version = '1.0.0'
const key = JSON.parse(fs.readFileSync('src-tauri/tauri.portable.conf.json')).plugins.updater.pubkey
const names = [`Novera_${version}_x64-portable.zip`, `Novera_${version}_x64-portable-update.exe`]
const verified = []
for (const name of names) {
  const file = path.join(output, name)
  execFileSync(process.execPath, [path.resolve('node_modules/@tauri-apps/cli/tauri.js'), 'signer', 'sign', file], { stdio: ['ignore', 'pipe', 'pipe'] })
  const signature = fs.readFileSync(file + '.sig', 'utf8').trim()
  const result = await verifyUpdateBundle(file, signature, key)
  verified.push({ name, ...result })
}
const update = names[1]
fs.writeFileSync(path.join(output, 'latest-portable.json'), JSON.stringify({ version, notes: 'Novera 1.0.0 Windows x64 portable. Program and Data travel together; signed updates preserve Data.', pub_date: new Date().toISOString(), platforms: { 'windows-x86_64': { url: `https://github.com/TRON-ABS/Novera/releases/download/v1.0.0-windows-portable/${update}`, signature: fs.readFileSync(path.join(output, update + '.sig'), 'utf8').trim() } } }, null, 2) + '\n')
fs.writeFileSync(path.join(output, 'PORTABLE-SIGNATURES.json'), JSON.stringify(verified, null, 2) + '\n')
console.log('Both final portable payload signatures verified with the pinned Novera key')
