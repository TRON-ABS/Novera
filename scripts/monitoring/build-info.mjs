import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'

export function monitoringBuildInfo(env = process.env) {
  let commit = 'unknown'
  let sourceState = 'unknown'
  try { commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8', windowsHide: true }).trim() } catch { /* Source archives need an explicit build ID. */ }
  try { sourceState = execFileSync('git', ['status', '--porcelain', '--untracked-files=normal'], { encoding: 'utf8', windowsHide: true, maxBuffer: 2000000 }).trim() ? 'dirty' : 'clean' } catch { /* Never guess whether local modifications were included. */ }
  const supplied = env.NOVERA_BUILD_ID
  if (supplied && !/^[A-Za-z0-9._-]{1,96}$/.test(supplied)) throw new Error('Invalid NOVERA_BUILD_ID')
  return {
    buildId: supplied || `${commit.slice(0, 12)}-${Date.now()}-${randomUUID().slice(0, 8)}`,
    commit: /^[a-f0-9]{40}$/.test(commit) ? commit : 'unknown',
    arch: env.TAURI_ENV_ARCH || process.arch,
    sourceState,
  }
}
