import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const sources = ['src-tauri/tauri.conf.json', 'web-app/package.json', 'src-tauri/Cargo.toml', 'src-tauri/novera-cli/Cargo.toml', 'src-tauri/Cargo.lock', 'src-tauri/novera-cli/Cargo.lock']
function parse(version) {
  const match = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?$/.exec(version)
  if (!match || match[4]?.split('.').some(p => /^\d+$/.test(p) && p.length > 1 && p.startsWith('0'))) throw new Error('Expected a semantic version')
  return { core: match.slice(1, 4).map(BigInt), pre: match[4]?.split('.') }
}
export function compareVersions(left, right) {
  const a = parse(left), b = parse(right)
  for (let i = 0; i < 3; i++) if (a.core[i] !== b.core[i]) return a.core[i] > b.core[i] ? 1 : -1
  if (!a.pre || !b.pre) return a.pre ? -1 : b.pre ? 1 : 0
  for (let i = 0; i < Math.max(a.pre.length, b.pre.length); i++) {
    const x = a.pre[i], y = b.pre[i]
    if (x === y) continue
    if (x === undefined || y === undefined) return x === undefined ? -1 : 1
    const nx = /^\d+$/.test(x), ny = /^\d+$/.test(y)
    if (nx && ny) return BigInt(x) > BigInt(y) ? 1 : -1
    if (nx !== ny) return nx ? -1 : 1
    return x > y ? 1 : -1
  }
  return 0
}
function replacePackageVersion(text, names, current, next, lock = false) {
  const found = new Set()
  const chunks = text.split(lock ? /(?=^\[\[package\]\])/m : /(?=^\[)/m)
  let result = chunks.map(chunk => {
    if (!chunk.startsWith(lock ? '[[package]]' : '[package]')) return chunk
    const name = chunk.match(/^name\s*=\s*"([^"]+)"/m)?.[1]
    if (!names.includes(name)) return chunk
    if (found.has(name)) throw new Error(`Duplicate package ${name}`)
    found.add(name)
    const versions = [...chunk.matchAll(/^version\s*=\s*"([^"]+)"/gm)]
    if (versions.length !== 1 || versions[0][1] !== current) throw new Error(`Version mismatch for ${name}`)
    return chunk.replace(/(^version\s*=\s*")[^"]+(".*$)/m, (_, prefix, suffix) => prefix + next + suffix)
  }).join('')
  if (found.size !== names.length) throw new Error(`Missing package version: ${names.filter(n => !found.has(n)).join(', ')}`)
  if (lock) for (const name of names) result = result.replaceAll(`"${name} ${current}"`, `"${name} ${next}"`)
  return result
}
export function versionPlan(directory, requested) {
  const root = fs.realpathSync(directory)
  const files = sources.map(file => {
    const absolute = path.join(root, file), relative = path.relative(root, fs.realpathSync(absolute))
    if (relative.startsWith('..' + path.sep) || path.isAbsolute(relative) || fs.lstatSync(absolute).isSymbolicLink()) throw new Error(`Version source escapes repository: ${file}`)
    return { file, before: fs.readFileSync(absolute, 'utf8') }
  })
  const current = JSON.parse(files[0].before).version
  parse(current)
  const next = requested ?? current
  parse(next)
  if (next !== current && compareVersions(next, current) <= 0) throw new Error('The next version must be strictly newer; build metadata alone is not an upgrade')
  for (const [i, names, lock] of [[2, ['Novera'], false], [3, ['jan-cli'], false], [4, ['Novera'], true], [5, ['Novera', 'jan-cli'], true]]) {
    files[i].after = replacePackageVersion(files[i].before, names, current, next, lock)
  }
  for (const i of [0, 1]) {
    if (JSON.parse(files[i].before).version !== current) throw new Error(`Version mismatch: ${files[i].file}`)
    files[i].after = files[i].before.replace(/("version"\s*:\s*")[^"]+(".*)/, (_, prefix, suffix) => prefix + next + suffix)
    if (JSON.parse(files[i].after).version !== next) throw new Error(`Unsupported version field layout: ${files[i].file}`)
  }
  return { root, current, next, files: files.filter(f => f.before !== f.after) }
}
export function applyVersion(plan) {
  for (const f of plan.files) if (fs.readFileSync(path.join(plan.root, f.file), 'utf8') !== f.before) throw new Error(`Source changed after planning: ${f.file}`)
  const attempted = []
  try {
    for (const f of plan.files) {
      attempted.push(f)
      fs.writeFileSync(path.join(plan.root, f.file), f.after)
    }
  } catch (error) {
    const failures = [error]
    for (const f of attempted.reverse()) {
      try { fs.writeFileSync(path.join(plan.root, f.file), f.before) } catch (restore) { failures.push(restore) }
    }
    throw new AggregateError(failures, 'Version preparation failed; inspect the Git diff before continuing')
  }
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [next, ...options] = process.argv.slice(2)
  if (!next || options.some(o => o !== '--write') || options.length > 1) throw new Error('Usage: node scripts/distribution/prepare-version.mjs VERSION [--write]. Default: preview only.')
  const plan = versionPlan(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..'), next)
  if (options.includes('--write')) applyVersion(plan)
  console.log(JSON.stringify({ currentVersion: plan.current, nextVersion: plan.next, changedSources: plan.files.map(f => f.file), applied: options.includes('--write'), compilationPerformed: false, publicationPerformed: false }, null, 2))
}
