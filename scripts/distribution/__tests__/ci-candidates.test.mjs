import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { execFileSync, spawnSync } from 'node:child_process'
import { safePayload, candidateResources, macosDeploymentTarget } from '../ci-candidates.mjs'

test('Android test builds have a distinct identity from production storage', () => {
  const main = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json'))
  const android = JSON.parse(fs.readFileSync('src-tauri/tauri.android.conf.json'))
  const suffix = android.bundle.android.debugApplicationIdSuffix
  assert.match(suffix, /^\.[A-Za-z0-9_]+$/)
  const testId = android.identifier + suffix
  assert.notEqual(testId, android.identifier)
  assert.notEqual(testId, main.identifier)
})

test('the macOS Apple Silicon floor satisfies the declared MLX package requirement', () => {
  const swift = fs.readFileSync('mlx-server/Package.swift', 'utf8')
  const minimum = Number(swift.match(/\.macOS\(\.v(\d+)\)/)[1])
  assert.ok(Number(macosDeploymentTarget('arm64').split('.')[0]) >= minimum)
  assert.throws(() => macosDeploymentTarget('ia32'), /Unsupported macOS architecture/)
})

test('Intel macOS excludes Apple Silicon-only MLX resources and preserves the native worker', () => {
  const resources = JSON.parse(fs.readFileSync('src-tauri/tauri.macos.conf.json')).bundle.resources
  const intel = candidateResources(resources, 'macos', 'x64')
  assert.ok(intel.includes('resources/bin/novera-llama-worker'))
  assert.ok(intel.includes('resources/bin/libggml*'))
  assert.equal(intel.some(p => p.includes('mlx-')), false)
  assert.deepEqual(candidateResources(resources, 'macos', 'arm64'), resources)
})

test('candidate payload excludes personal profiles, model weights, secrets and private symbols', () => {
  for (const p of ['profiles/test.json', 'desktop/user-data/chat.json', 'models/m.gguf', 'a/weights.safetensors', 'logs/session.txt', '.env.production', 'frontend/main.js.map', 'resources/test.sqlite', '../secret']) assert.equal(safePayload(p), false, p)
  for (const p of ['Novera.exe', 'desktop/resources/bin/ggml.dll', 'resources/image-engine/manifest.json', 'LICENSE']) assert.equal(safePayload(p), true, p)
})
test('an empty build cannot be certified as compiled', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-ci-'))
  try {
    const entry = path.resolve('scripts/distribution/ci-candidates.mjs')
    execFileSync(process.execPath, [entry, 'begin', 'web'], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: 'true' } })
    assert.ok(fs.existsSync(path.join(root, '.build/candidates/SIGNATURE.txt')))
    const r = spawnSync(process.execPath, [entry, 'finish', 'web'], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: 'true' }, encoding: 'utf8' })
    assert.notEqual(r.status, 0)
    assert.match(r.stderr, /No compiled payload/)
    assert.equal(fs.existsSync(path.join(root, '.build/candidates/candidate.json')), false)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})

test('iOS collection retains the Tauri simulator app and excludes a device app', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-ios-'))
  try {
    for (const target of ['arm64-sim', 'arm64']) {
      const app = path.join(root, 'src-tauri/gen/apple/build', target, 'Novera.app')
      fs.mkdirSync(app, { recursive: true })
      fs.writeFileSync(path.join(app, 'Novera'), target)
    }
    execFileSync(process.execPath, [path.resolve('scripts/distribution/ci-candidates.mjs'), 'ios'], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: 'true' } })
    const archives = fs.readdirSync(path.join(root, '.build/candidates'))
    assert.deepEqual(archives, ['Novera-iOS-simulator-0.tar.gz'])
    const binary = execFileSync('tar', ['-xOzf', path.join(root, '.build/candidates', archives[0]), 'Novera.app/Novera'], { encoding: 'utf8' })
    assert.equal(binary, 'arm64-sim')
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
test('a completed candidate retains signature, license, provenance and matching checksums', () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-ci-complete-'))
  try {
    fs.mkdirSync(path.join(root, '.build/candidates/web'), { recursive: true })
    fs.mkdirSync(path.join(root, 'src-tauri'))
    fs.writeFileSync(path.join(root, '.build/candidates/web/index.html'), '<html>Candidate</html>')
    fs.writeFileSync(path.join(root, 'src-tauri/tauri.conf.json'), JSON.stringify({ version: '1.0.0' }))
    for (const name of ['LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md']) fs.writeFileSync(path.join(root, name), name)
    execFileSync(process.execPath, [path.resolve('scripts/distribution/ci-candidates.mjs'), 'finish', 'web'], { cwd: root, env: { ...process.env, GITHUB_ACTIONS: 'true', GITHUB_SHA: 'fixture-commit' } })
    const dir = path.join(root, '.build/candidates')
    const result = JSON.parse(fs.readFileSync(path.join(dir, 'candidate.json')))
    assert.equal(result.commit, 'fixture-commit')
    assert.equal(result.compilationPerformed, true)
    assert.equal(result.deviceValidated, false)
    assert.equal(result.productionSigned, false)
    assert.match(fs.readFileSync(path.join(dir, 'SIGNATURE.txt'), 'utf8'), /TRON-ABS\nThe art of Human with AI/)
    assert.match(fs.readFileSync(path.join(dir, 'SHA256SUMS'), 'utf8'), /[a-f0-9]{64}  web\/index.html/)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
test('explicit Android test opt-in cannot bypass technical blockers or affect ordinary builds', { skip: process.platform !== 'win32' }, () => {
  const policy = path.resolve('scripts/android/build-policy.ps1').replaceAll("'", "''")
  const script = `. '${policy}';
    $reviews=[pscustomobject]@{ready=$false;blockers=@('review-mobileDependencies','review-mobilePermissions','review-mobileStorage')};
    if(Test-NoveraAndroidBuildAllowed $reviews $false $true){throw 'ordinary CI must remain guarded'};
    if(Test-NoveraAndroidBuildAllowed $reviews $true $false){throw 'local opt-in must remain guarded'};
    if(!(Test-NoveraAndroidBuildAllowed $reviews $true $true)){throw 'explicit test candidate rejected'};
    foreach($critical in @('permissions','local-engine','ndk','review-unknown')){
      $bad=[pscustomobject]@{ready=$false;blockers=@('review-mobileStorage',$critical)};
      if(Test-NoveraAndroidBuildAllowed $bad $true $true){throw "technical guard bypass: $critical"}
    }`
  execFileSync('powershell', ['-NoProfile', '-Command', script])
})
test('Windows CI selects the native MSVC linker for each architecture and refuses a missing tool', { skip: process.platform !== 'win32' }, () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'novera-msvc-'))
  try {
    const entry = path.resolve('scripts/distribution/ci-msvc.ps1')
    for (const [arch, target, triple] of [['X64', 'x64', 'X86_64'], ['ARM64', 'arm64', 'AARCH64']]) {
      const tool = path.join(root, 'MSVC tools', `bin/Host${target}/${target}/link.exe`)
      fs.mkdirSync(path.dirname(tool), { recursive: true }); fs.writeFileSync(tool, 'fixture')
      const envFile = path.join(root, arch + '.env')
      execFileSync('powershell', ['-NoProfile', '-File', entry], { env: { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_ARCH: arch, VSCMD_ARG_TGT_ARCH: target, VCToolsInstallDir: path.join(root, 'MSVC tools'), GITHUB_ENV: envFile } })
      assert.match(fs.readFileSync(envFile, 'utf8'), new RegExp(`CARGO_TARGET_${triple}_PC_WINDOWS_MSVC_LINKER=`))
      assert.ok(fs.readFileSync(envFile, 'utf8').includes(tool))
      assert.ok(fs.readFileSync(envFile, 'utf8').includes('NOVERA_MSVC_LINKER=' + tool))
    }
    const rejected = spawnSync('powershell', ['-NoProfile', '-File', entry], { env: { ...process.env, GITHUB_ACTIONS: 'true', RUNNER_ARCH: 'X64', VSCMD_ARG_TGT_ARCH: 'x64', VCToolsInstallDir: path.join(root, 'missing'), GITHUB_ENV: path.join(root, 'reject.env') }, encoding: 'utf8' })
    assert.notEqual(rejected.status, 0)
    assert.equal(fs.existsSync(path.join(root, 'reject.env')), false)
  } finally { fs.rmSync(root, { recursive: true, force: true }) }
})
