import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { releaseConfig } from '../updates/novera-update.mjs'
import { prepareNsisRuntime } from './windows-runtime.mjs'
import { prepareWebDelivery } from './web-delivery.mjs'

export function safePayload(name) {
  const parts = name.replaceAll('\\', '/').split('/')
  return !parts.some(p => ['..', 'profiles', 'user-data', 'models', 'chats', 'threads', 'logs'].includes(p.toLowerCase())) &&
    !/\.(?:pdb|map|log|sqlite|db|gguf|safetensors|pth|pt|onnx)$/i.test(name) && !parts.some(p => p.startsWith('.env'))
}
export function sha(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
export function macosDeploymentTarget(architecture) {
  if (architecture === 'arm64') return '14.0' // MLX's declared minimum.
  if (architecture === 'x64') return '13.0' // Bundled Bun's declared minimum.
  throw new Error(`Unsupported macOS architecture: ${architecture}`)
}
export function candidateResources(resources, platform, architecture) {
  // MLX supports Apple Silicon; Intel macOS retains its native GGUF worker.
  return platform === 'macos' && architecture === 'x64'
    ? resources.filter(p => !p.startsWith('resources/bin/mlx-'))
    : resources
}
function files(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    if (e.isSymbolicLink()) throw new Error(`Linked candidate entry: ${p}`)
    return e.isDirectory() ? files(p) : [p]
  })
}
function packages(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
    const p = path.join(dir, e.name)
    if (e.isSymbolicLink()) return []
    if (e.isDirectory()) return /\.(app|AppDir)$/.test(e.name) ? [] : packages(p)
    return /\.(exe|msi|deb|AppImage|dmg|app\.tar\.gz)(?:\.sig)?$/.test(p) ? [p] : []
  })
}
function run(mode, kind) {
  if (process.env.GITHUB_ACTIONS !== 'true') throw new Error('GitHub Actions only')
  const root = process.cwd(), out = path.join(root, '.build/candidates')
  fs.mkdirSync(out, { recursive: true })
  const copy = (src, name) => {
    if (!safePayload(name) || path.isAbsolute(name)) throw new Error(`Rejected payload: ${name}`)
    const dest = path.join(out, name)
    fs.mkdirSync(path.dirname(dest), { recursive: true }); fs.copyFileSync(src, dest)
  }
  const json = (name, value) => fs.writeFileSync(name, JSON.stringify(value, null, 2) + '\n')
  const signature = 'TRON-ABS\nThe art of Human with AI\n\nJe vous souhaite à toutes et à tous une belle aventure avec Novera.\nExplorez vos idées, créez librement et laissez votre curiosité vous emmener plus loin.\n\nTo everyone setting out with Novera: I wish you a wonderful adventure.\nExplore your ideas, create freely and let your curiosity take you further.\n'
  const release = path.resolve(process.env.CARGO_TARGET_DIR || 'src-tauri/target', 'release')
  if (mode === 'begin') {
    fs.writeFileSync(path.join(out, 'SIGNATURE.txt'), signature)
    json('.build/ci-status.json', { kind, state: 'building', commit: process.env.GITHUB_SHA, runId: process.env.GITHUB_RUN_ID })
  } else if (mode === 'config' || mode === 'config-ios') {
    const config = { bundle: { createUpdaterArtifacts: false } }
    if (process.env.NOVERA_ENABLE_UPDATER === 'true') {
      if (mode !== 'config') throw new Error('The desktop updater cannot configure a mobile build')
      const publicConfig = JSON.parse(fs.readFileSync('src-tauri/tauri.updater.conf.json'))
      const signed = releaseConfig(publicConfig.plugins.updater.pubkey)
      if (JSON.stringify(signed) !== JSON.stringify(publicConfig)) throw new Error('Unexpected updater trust configuration')
      Object.assign(config.bundle, signed.bundle)
      config.plugins = signed.plugins
    }
    const platform = mode === 'config-ios' ? 'ios' : ({ win32: 'windows', linux: 'linux', darwin: 'macos' })[process.platform]
    const base = JSON.parse(fs.readFileSync(`src-tauri/tauri.${platform}.conf.json`))
    config.bundle.resources = [...candidateResources(base.bundle.resources || [], platform, process.arch), 'resources/SIGNATURE.txt']
    if (platform === 'macos') config.bundle.macOS = { minimumSystemVersion: macosDeploymentTarget(process.arch) }
    fs.writeFileSync('src-tauri/resources/SIGNATURE.txt', signature)
    if (process.env.CANDIDATE_VARIANT === 'arm64') {
      config.bundle.resources = ['resources/LICENSE', 'resources/SIGNATURE.txt', 'resources/bin/novera-llama-worker.exe', 'resources/bin/*.dll']
      config.bundle.targets = ['nsis']
    }
    if (mode === 'config-ios') config.bundle.iOS = { ...base.bundle.iOS, developmentTeam: null }
    json('.build/candidate-config.json', config)
  } else if (mode === 'web') {
    for (const p of files('web-app/dist')) copy(p, path.join('web', path.relative('web-app/dist', p)))
    const web = prepareWebDelivery(path.join(out, 'web'), { version: JSON.parse(fs.readFileSync('web-app/package.json')).version, commit: process.env.GITHUB_SHA })
    json(path.join(out, 'WEB-DELIVERY-READINESS.json'), web)
  } else if (mode === 'cli') {
    const exe = process.platform === 'win32' ? 'novera.exe' : 'novera'
    copy(path.join(release, exe), exe)
    fs.chmodSync(path.join(out, exe), 0o755)
  } else if (mode === 'desktop') {
    const bundles = packages(path.join(release, 'bundle'))
    for (const p of bundles) copy(p, path.join('packages', path.basename(p)))
    if (process.platform === 'win32') {
      copy(path.join(release, 'Novera-Desktop.exe'), 'desktop/Novera-Desktop.exe')
      if (process.env.NOVERA_ENABLE_UPDATER === 'true') {
        const file = path.join(out, 'desktop/Novera-Desktop.exe')
        const prepared = prepareNsisRuntime(fs.readFileSync(file))
        fs.writeFileSync(file, prepared.binary)
        json(path.join(out, 'WINDOWS-RUNTIME.json'), prepared.proof)
      }
      for (const e of fs.readdirSync(release, { withFileTypes: true }).filter(e => e.isFile() && e.name.endsWith('.dll'))) copy(path.join(release, e.name), 'desktop/' + e.name)
      for (const name of ['bun', 'uv']) {
        const triple = process.arch === 'arm64' ? 'aarch64-pc-windows-msvc' : 'x86_64-pc-windows-msvc'
        copy(`src-tauri/resources/bin/${name}-${triple}.exe`, `desktop/${name}.exe`)
      }
      for (const p of files('src-tauri/resources')) {
        const rel = path.relative('src-tauri/resources', p).replaceAll('\\', '/')
        if (rel === 'LICENSE' || rel === 'SIGNATURE.txt' || rel === 'bin/novera-llama-worker.exe' || /^bin\/.*\.dll$/i.test(rel) || rel.startsWith('image-engine/')) copy(p, 'desktop/resources/' + rel)
      }
      for (const n of ['LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md']) copy(n, 'desktop/' + n)
      const version = JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json')).version
      fs.writeFileSync(path.join(out, 'desktop/BUILD_INFO.md'), `# Novera candidate\n\nVersion: ${version}\nCommit: ${process.env.GITHUB_SHA}\nGitHub run: ${process.env.GITHUB_RUN_ID}\nUnsigned candidate; no personal data or models included.\n`)
    }
    if (!bundles.length) throw new Error('No desktop package was produced')
  } else if (mode === 'android') {
    const apks = files('src-tauri/gen/android/app/build/outputs/apk').filter(p => p.endsWith('.apk'))
    if (!apks.length) throw new Error('No APK produced')
    for (const p of apks) copy(p, path.basename(p))
  } else if (mode === 'ios') {
    // Simulator output is deliberately distinct from a signed iPhone IPA.
    const build = 'src-tauri/gen/apple/build'
    const findApps = dir => fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => {
      const p = path.join(dir, e.name)
      return e.isDirectory() ? (e.name.endsWith('.app') ? [p] : findApps(p)) : []
    }) : []
    const apps = findApps(build).filter(p => /(?:^|[/\\])(?:arm64-sim|x86_64-sim|[^/\\]*iphonesimulator)(?:[/\\])/i.test(p))
    if (!apps.length) throw new Error('No iOS simulator application produced')
    apps.forEach((p, i) => execFileSync('tar', ['-czf', path.join(out, `Novera-iOS-simulator-${i}.tar.gz`), '-C', path.dirname(p), path.basename(p)]))
  } else if (mode === 'finish') {
    const payload = files(out)
    if (!payload.some(p => !/\.(txt|json|md)$/.test(p))) throw new Error('No compiled payload to retain')
    const manifest = {
      format: 'novera-ci-candidate', version: JSON.parse(fs.readFileSync('src-tauri/tauri.conf.json')).version,
      kind, platform: process.platform, architecture: process.arch, commit: process.env.GITHUB_SHA,
      runId: process.env.GITHUB_RUN_ID, compilationPerformed: true, deviceValidated: false,
      productionSigned: false, publicReleasePublished: false, personalDataIncluded: false, modelsIncluded: false,
      updaterChannelConfigured: (kind === 'desktop' && process.env.NOVERA_ENABLE_UPDATER === 'true') || (kind === 'cli' && process.env.NOVERA_ENABLE_CLI_UPDATER === 'true'),
      updaterSignaturesVerified: (kind === 'desktop' && process.env.NOVERA_ENABLE_UPDATER === 'true' && fs.existsSync(path.join(out, 'UPDATER-READINESS.json'))) || (kind === 'cli' && process.env.NOVERA_ENABLE_CLI_UPDATER === 'true' && fs.existsSync(path.join(out, 'CLI-UPDATER-READINESS.json'))),
      limitations: [
        ...(kind === 'ios' ? ['Simulator application only; iPhone IPA requires Apple signing and provisioning.'] : []),
        ...(kind === 'android' ? ['Debug-signed test APK; mobile reviews and device validation remain pending.'] : []),
        ...(process.env.CANDIDATE_VARIANT === 'arm64' ? ['CPU text engine; Windows x64 image runtime is excluded.'] : []),
        ...(kind === 'web' ? ['Browser frontend; desktop-native capabilities are unavailable.'] : []),
        ...(kind === 'cli' ? ['Executable name: novera.'] : []),
        ...(kind === 'desktop' && process.platform === 'darwin' && process.arch === 'x64' ? ['Intel macOS uses GGUF; the Apple Silicon-only MLX server is excluded.'] : []),
      ],
    }
    json(path.join(out, 'candidate.json'), manifest)
    fs.writeFileSync(path.join(out, 'SIGNATURE.txt'), signature)
    for (const name of ['LICENSE', 'BRANDING.md', 'OFFICIAL_RELEASES.md']) copy(name, name)
    const listing = files(out).filter(p => p !== path.join(out, 'SHA256SUMS')).map(p => ({ path: path.relative(out, p).replaceAll('\\', '/'), sha256: sha(p), bytes: fs.statSync(p).size }))
    fs.writeFileSync(path.join(out, 'SHA256SUMS'), listing.map(p => `${p.sha256}  ${p.path}`).join('\n') + '\n')
    json('.build/ci-status.json', { ...manifest, state: 'compiled', files: listing })
  } else throw new Error(`Unknown mode ${mode}`)
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) run(process.argv[2], process.argv[3])
