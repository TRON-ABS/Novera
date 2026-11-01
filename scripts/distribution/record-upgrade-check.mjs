import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function upgradeResult(output) {
  const clean = output.replace(/\x1b\[[0-9;]*m/g, '')
  const summaries = [...clean.matchAll(/test result: (ok|FAILED)\. (\d+) passed; (\d+) failed; (\d+) ignored;/g)]
  if (summaries.length !== 1) throw new Error('Expected one upgrade compatibility suite result')
  const [, state, passed, failed, ignored] = summaries[0]
  if (state !== 'ok' || Number(passed) === 0 || Number(failed) || Number(ignored)) throw new Error('Upgrade tests must execute and pass without ignored cases')
  return { passed: Number(passed), failed: 0, ignored: 0 }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('GitHub runner required')
  const result = upgradeResult(fs.readFileSync(process.argv[2], 'utf8'))
  const fixtures = fs.readdirSync('src-tauri/tests/fixtures/upgrade').filter(n => /^\d+\.\d+\.\d+$/.test(n))
  if (!fixtures.length) throw new Error('Missing historical release fixtures')
  fs.writeFileSync('.build/candidates/UPGRADE-COMPATIBILITY.json', JSON.stringify({ suite: 'upgrade_compat', commit: process.env.GITHUB_SHA, fixtures, ...result }, null, 2) + '\n')
  console.log(`Verified ${result.passed} upgrade compatibility tests against committed release fixtures`)
}
