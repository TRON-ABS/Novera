#!/usr/bin/env node
// Read-only source preparation audit. Never executes a build, downloads or contacts CI.
import { existsSync, readFileSync, realpathSync, statSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function checkReleaseReadiness(root) {
  root = realpathSync(root)
  const errors = []
  const read = (file) => {
    if (typeof file !== 'string' || path.isAbsolute(file) || file.includes(':') || file.split(/[\\/]/).includes('..')) {
      errors.push(`Invalid source path: ${String(file)}`)
      return
    }
    const absolute = path.join(root, file)
    if (!existsSync(absolute) || !statSync(absolute).isFile()) {
      errors.push(`Missing source file: ${file}`)
      return
    }
    const relative = path.relative(root, realpathSync(absolute))
    if (relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) {
      errors.push(`Source file escapes the repository: ${file}`)
      return
    }
    return readFileSync(absolute, 'utf8')
  }
  const json = (file) => {
    const text = read(file)
    if (text === undefined) return
    try { return JSON.parse(text) } catch { errors.push(`Invalid JSON: ${file}`) }
  }
  const manifest = json('scripts/distribution/release-targets.json')
  const report = {
    mode: 'preparation-only',
    sourceDefinitionsValid: false,
    compilationPerformed: false,
    buildReadiness: 'not-verified',
    deviceValidation: 'not-performed',
    actionsSettingsChecked: false,
    actionsSettingsChanged: false,
    publicationPerformed: false,
    version: undefined,
    targets: [],
    errors,
  }
  if (!manifest) return report
  if (manifest.schemaVersion !== 1 || manifest.mode !== 'preparation-only' || !Array.isArray(manifest.targets) || !Array.isArray(manifest.requiredSources)) {
    errors.push('Expected schema version 1, preparation-only mode and source/target arrays')
    return report
  }
  for (const file of manifest.requiredSources) read(file)
  const main = json('src-tauri/tauri.conf.json')
  const web = json('web-app/package.json')
  const workspace = json('package.json')
  const cargo = read('src-tauri/Cargo.toml')
  const cli = read('src-tauri/novera-cli/Cargo.toml')
  const nativeVersion = cargo?.match(/^version\s*=\s*"([^"]+)"/m)?.[1]
  const cliVersion = cli?.match(/^version\s*=\s*"([^"]+)"/m)?.[1]
  report.version = main?.version
  if (!main?.version || web?.version !== main.version || nativeVersion !== main.version || cliVersion !== main.version) {
    errors.push('Version mismatch: desktop config, web app, native package and CLI must agree')
  }
  if (main?.productName !== 'Novera' || main?.mainBinaryName !== 'Novera-Desktop' || main?.identifier !== 'io.github.tronabs.novera') {
    errors.push('Unexpected canonical Novera application identity')
  }
  const ids = new Set()
  for (const target of manifest.targets) {
    if (!target || typeof target.id !== 'string' || ids.has(target.id) || !target.host || !Array.isArray(target.artifacts) || !target.artifacts.length || !Array.isArray(target.sources) || !Array.isArray(target.packageScripts) || !Array.isArray(target.pending) || !target.pending.length) {
      errors.push(`Invalid or duplicate target definition: ${target?.id}`)
      continue
    }
    ids.add(target.id)
    const initialErrors = errors.length
    for (const file of target.sources) read(file)
    for (const script of target.packageScripts) {
      if (typeof workspace?.scripts?.[script] !== 'string') errors.push(`Missing package script for ${target.id}: ${script}`)
    }
    const config = target.config ? json(target.config) : undefined
    const pending = [...target.pending]
    if (target.id === 'android') {
      const mobile = json('scripts/android/readiness.json')
      for (const review of ['mobileDependencies', 'mobilePermissions', 'mobileStorage']) {
        if (mobile?.reviews?.[review] !== true) pending.push(`Android review pending: ${review}`)
      }
    }
    if (target.id === 'ios' && (!config?.bundle?.iOS?.developmentTeam || /^<.*>$/.test(config.bundle.iOS.developmentTeam))) {
      pending.push('Apple development team is not configured in the checked-in iOS settings.')
    }
    report.targets.push({
      id: target.id,
      host: target.host,
      artifacts: target.artifacts,
      sourceReferencesValid: errors.length === initialErrors,
      buildReadiness: 'not-verified',
      pending,
    })
  }
  const expected = ['desktop', 'setup', 'msi', 'portable', 'arm64', 'linux', 'macos', 'android', 'ios', 'web', 'cli']
  for (const id of expected) if (!ids.has(id)) errors.push(`Missing distribution target: ${id}`)
  for (const id of ids) if (!expected.includes(id)) errors.push(`Unknown distribution target: ${id}`)
  report.sourceDefinitionsValid = errors.length === 0
  return report
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2)
  if (args.some(arg => arg !== '--json' && arg !== '--help')) {
    console.error('Usage: node scripts/distribution/check-release-readiness.mjs [--json | --help]')
    process.exitCode = 1
  } else if (args.includes('--help')) {
    console.log('Read-only Novera distribution source audit. No builds, installs, network, CI activation or publication. --json prints the source checks and pending platform validation.')
  } else {
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
    const report = checkReleaseReadiness(root)
    if (args.includes('--json')) console.log(JSON.stringify(report, null, 2))
    else {
      console.log(`Novera ${report.version ?? '?'} — preparation only; no compilation`)
      console.log(`Source definitions: ${report.sourceDefinitionsValid ? 'valid' : 'invalid'}`)
      for (const target of report.targets) console.log(`${target.id}: ${target.sourceReferencesValid ? 'source references valid' : 'source errors'}; build not verified; ${target.pending.length} pending prerequisites/validations`)
      for (const error of report.errors) console.error(error)
      console.log('No Actions setting changed. No binary or platform validation is certified by this audit.')
    }
    if (!report.sourceDefinitionsValid) process.exitCode = 1
  }
}
