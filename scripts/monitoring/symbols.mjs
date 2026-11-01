import { spawnSync } from 'node:child_process'
import { copyFileSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs'
import { createHash, randomUUID } from 'node:crypto'
import { dirname, join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CLI_VERSION = '0.19.0'
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const cliLauncher = join(root, '.build/posthog-tools/node_modules/@posthog/cli/run-posthog-cli.js')
export function runPosthog(args, env = process.env) {
  if (!existsSync(cliLauncher)) throw new Error(`Install @posthog/cli@${CLI_VERSION} in .build/posthog-tools before a monitored build`)
  if (JSON.parse(readFileSync(join(dirname(cliLauncher), 'package.json'), 'utf8')).version !== CLI_VERSION)
    throw new Error(`Expected the pinned PostHog CLI ${CLI_VERSION}`)
  const result = spawnSync(process.execPath, [cliLauncher, ...args], { env, windowsHide: true, encoding: 'utf8', timeout: 120000 })
  // CLI output can contain account metadata. Do not echo it into build logs.
  if (result.error || result.status !== 0) throw new Error('PostHog CLI failed; verify its installation, authentication and project access')
}
function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    if (entry.isSymbolicLink() || lstatSync(path).isSymbolicLink()) throw new Error('Linked symbol paths are not allowed')
    return entry.isDirectory() ? files(path) : [path]
  })
}
/** Called before native compilation. Maps remain private, outside frontendDist. */
export function prepareSymbols({ dist, output, buildId, version, commit = 'unknown', arch = 'unknown', sourceState = 'unknown', inject = injectLocalChunks }) {
  dist = realpathSync(dist); output = resolve(output)
  if (output === dist || output.startsWith(dist + sep)) throw new Error('Private symbol output must be outside the shipped frontend')
  const maps = files(dist).filter(path => path.endsWith('.map'))
  if (!maps.length) throw new Error('Monitored build has no JavaScript source maps')
  const args = ['sourcemap', 'inject', '--directory', dist, '--release-name', 'novera', '--release-version', buildId, '--release-mode', 'symbol-set']
  inject(args)
  mkdirSync(output, { recursive: true })
  const archived = []
  for (const map of maps) {
    const js = map.slice(0, -4)
    const code = readFileSync(js, 'utf8')
    if (js.endsWith('.js') && !/\/\/# chunkId=[a-f0-9-]{36}/i.test(code)) throw new Error('Missing PostHog chunk metadata after injection')
    const parsed = JSON.parse(readFileSync(map, 'utf8'))
    if (parsed.sources?.some(source => /(?:^|[\\/])\.env(?:\.|$)/i.test(source))) throw new Error('Source maps must not include environment files')
    for (const source of [js, map]) {
      const path = relative(dist, source)
      if (path.startsWith('..') || !source.startsWith(dist + sep)) throw new Error('Invalid source map path')
      const destination = join(output, path)
      mkdirSync(dirname(destination), { recursive: true }); copyFileSync(source, destination)
      archived.push({ path: path.replaceAll('\\', '/'), sha256: createHash('sha256').update(readFileSync(source)).digest('hex') })
    }
  }
  const record = { buildId, version, commit, arch, sourceState, releaseName: 'novera', releaseVersion: buildId, cliVersion: CLI_VERSION,
    maps: maps.length, upload: 'pending', files: archived }
  writeFileSync(join(output, 'symbols.json'), JSON.stringify(record, null, 2))
  // Delete only maps successfully archived above, never directories or input roots.
  for (const map of maps) {
    const js = map.slice(0, -4)
    writeFileSync(js, readFileSync(js, 'utf8').replace(/^\/\/# sourceMappingURL=.*$/gm, '').replace(/\/\*# sourceMappingURL=.*?\*\//g, ''))
    unlinkSync(map)
  }
  writeFileSync(join(dist, 'build-info.json'), JSON.stringify({ buildId, version, commit, arch, sourceState, symbols: 'private' }))
  return record
}
/** PostHog's public chunk registry / chunk_id map format (cli/src/sourcemaps).
 * One inserted line is reflected in the standard source-map generated mappings.
 * Preparation needs no account credentials; only the official CLI upload does. */
export function injectLocalChunks(args) {
  const directory = args[args.indexOf('--directory') + 1]
  for (const map of files(directory).filter(path => path.endsWith('.js.map'))) {
    const js = map.slice(0, -4), code = readFileSync(js, 'utf8'), data = JSON.parse(readFileSync(map, 'utf8'))
    if (data.sections || typeof data.mappings !== 'string' || /\/\/# chunkId=/.test(code))
      throw new Error('Expected a fresh non-indexed Vite source map')
    const id = randomUUID()
    // Registry contract verified against PostHog's public CODE_SNIPPET_TEMPLATE.
    const snippet = `!function(){try{var e=globalThis,n=(new Error).stack;n&&(e._posthogChunkIds=e._posthogChunkIds||{},e._posthogChunkIds[n]=${JSON.stringify(id)})}catch(e){}}();`
    data.chunk_id = id
    data.mappings = ';' + data.mappings
    writeFileSync(js, snippet + '\n' + code + '\n//# chunkId=' + id + '\n')
    writeFileSync(map, JSON.stringify(data))
  }
}
export function verifySymbols(directory, requireUploaded = false) {
  const base = realpathSync(directory)
  const recordPath = join(directory, 'symbols.json')
  const record = JSON.parse(readFileSync(recordPath, 'utf8'))
  if (!/^[A-Za-z0-9._-]{1,96}$/.test(record.buildId) || !Array.isArray(record.files) || !record.files.length)
    throw new Error('Invalid private symbol manifest')
  for (const file of record.files) {
    const path = resolve(directory, file.path)
    if (!path.startsWith(resolve(directory) + sep) || !/\.(?:js|css|map)$/.test(file.path) || !realpathSync(path).startsWith(base + sep) ||
      createHash('sha256').update(readFileSync(path)).digest('hex') !== file.sha256)
      throw new Error('Private symbols changed after preparation')
  }
  const expected = new Set(record.files.map(file => file.path))
  if (files(directory).filter(path => /\.(?:js|css|map)$/.test(path)).some(path => !expected.has(relative(directory, path).replaceAll('\\', '/'))))
    throw new Error('Unlisted files must not be uploaded as private symbols')
  if (requireUploaded && record.upload !== 'succeeded') throw new Error('Private source map upload is still pending; release is not verified')
  return record
}
export function uploadSymbols(directory, env = process.env, run = runPosthog) {
  const record = verifySymbols(directory)
  if (run === runPosthog && !env.POSTHOG_CLI_API_KEY)
    throw new Error('Set POSTHOG_CLI_API_KEY locally for the explicitly selected EU project; no implicit credential/project fallback')
  run(['sourcemap', 'upload', '--directory', directory, '--release-name', 'novera', '--release-version', record.buildId,
    '--release-mode', 'symbol-set'], { ...env, POSTHOG_CLI_HOST: 'https://eu.posthog.com', POSTHOG_CLI_PROJECT_ID: '319433' })
  record.upload = 'succeeded'; record.uploadedAt = new Date().toISOString()
  writeFileSync(join(directory, 'symbols.json'), JSON.stringify(record, null, 2))
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!['upload', 'check'].includes(process.argv[2]) || !process.argv[3]) throw new Error('Usage: node scripts/monitoring/symbols.mjs <upload|check> <private-symbol-directory>')
  if (process.argv[2] === 'upload') uploadSymbols(resolve(process.argv[3]))
  const record = verifySymbols(resolve(process.argv[3]), true)
  process.stdout.write(`Local symbol hashes and upload receipt verified for build ${record.buildId}, targeting PostHog project 319433.\n`)
}
