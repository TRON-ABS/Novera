import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { homedir } from 'node:os'
import { execFile, type ChildProcess } from 'node:child_process'
import { link, mkdir, readdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import { pipeline } from 'node:stream'
import { prepareBrowserRuntime } from '../scripts/distribution/browser-runtime-assets.mjs'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import packageJson from './package.json'
import { monitoringBuildInfo } from '../scripts/monitoring/build-info.mjs'
import { prepareSymbols, uploadSymbols } from '../scripts/monitoring/symbols.mjs'
import { resolvePublicTelemetry } from '../scripts/monitoring/telemetry.mjs'
import publicTelemetry from '../scripts/monitoring/novera-telemetry.public.json'
const host = process.env.TAURI_DEV_HOST
const __dirname = import.meta.dirname

// https://vite.dev/config/
export default defineConfig(({ mode, command }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')
  const browserPreview = env.VITE_NOVERA_WEB_PREVIEW === 'true'
  const telemetry = resolvePublicTelemetry(env, publicTelemetry)
  const build = monitoringBuildInfo()
  const monitoring = command === 'build' && env.NOVERA_MONITORING_BUILD === 'true'
  const privateSymbols = path.resolve(__dirname, '../.build/monitoring-symbols', build.buildId)
  const localMedia = browserPreview && env.VITE_NOVERA_WEB_LOCAL_MEDIA === 'true'
  const mediaRuntime = localMedia ? prepareBrowserRuntime(env.NOVERA_BROWSER_MEDIA_BUILD) : undefined
  const localMusic = browserPreview && env.VITE_NOVERA_WEB_LOCAL_MUSIC === 'true'
  const musicRuntime = localMusic ? prepareBrowserRuntime(env.NOVERA_BROWSER_MUSIC_BUILD, 'music') : undefined

  const textRuntime = browserPreview && env.NOVERA_BROWSER_TEXT_BUILD ? prepareBrowserRuntime(env.NOVERA_BROWSER_TEXT_BUILD, 'text') : undefined

  const text64Runtime = browserPreview && env.NOVERA_BROWSER_TEXT64_BUILD
    ? prepareBrowserRuntime(env.NOVERA_BROWSER_TEXT64_BUILD, 'text', true) : undefined

  return {
    base: browserPreview ? (env.VITE_NOVERA_WEB_BASE || './') : undefined,
    plugins: [
      ...(command === 'serve' && browserPreview && env.VITE_NOVERA_PRIVATE_NATIVE_CONVERSATION === 'true' ? [{
        name: 'novera-local-model-adjustment',
        configureServer(server) {
          let running = false
          let recalibrating = false
          let recalibrationFailed = false
          let currentRun: string | undefined
          let recalibrationProcess: ChildProcess | undefined
          let stopping = false
          const weightDirectory = path.resolve(__dirname, '../.build/weight-recalibration')
          server.middlewares.use('/__novera/quantization-download', async (request, response) => {
            const saving = request.method === 'POST'
            const host = request.headers.host
            if ((!saving && request.method !== 'GET') || !/^127\.0\.0\.1:\d+$/.test(host ?? '') ||
              request.headers['sec-fetch-site'] !== 'same-origin' ||
              (saving && request.headers.origin !== `http://${host}`)) {
              response.writeHead(403).end()
              return
            }
            const params = new URL(request.url ?? '/', 'http://localhost').searchParams
            const run = params.get('run') ?? ''
            const file = params.get('file') ?? ''
            const first = file === 'LFM3-Q4_K_M-calibrated.gguf'
            if (!/^(?:q4-varied|q[234]-run-\d+)$/.test(run) ||
              (!first && !/^(?:LFM3-(?:Q4_K_M|Q[234])|Qwen3\.5-Q4)-[a-z0-9-]+\.gguf$/.test(file))) {
              response.writeHead(404).end()
              return
            }
            try {
              const report = JSON.parse(await readFile(path.join(weightDirectory, run, 'report.json'), 'utf8'))
              if (!report.runs?.some((entry: { file: string }) => entry.file === file)) {
                response.writeHead(404).end()
                return
              }
              const source = path.join(weightDirectory, first ? 'q4-first' : run, file)
              if (saving) {
                const qwen = file.startsWith('Qwen3.5-')
                const runtimeModels = path.resolve(__dirname, '../.build/web-runtime-real/models')
                const parent = qwen
                  ? path.resolve(__dirname, '../.build/engine-validation-2026-10-22/models')
                  : path.join(homedir(), 'Documents', 'Novera models', 'LFM3-Omni-2B-Q8')
                const name = `Novera-${path.basename(file, '.gguf')}-${run}.gguf`
                const destination = path.join(parent, name)
                const projector = qwen ? null : 'mmproj-LFM3-Omni-2B-Q8_0.gguf'
                const saveLink = async (originalPath: string, targetPath: string) => link(originalPath, targetPath).catch(async error => {
                  if (error.code !== 'EEXIST') throw error
                  const [original, existing] = await Promise.all([stat(originalPath), stat(targetPath)])
                  if (original.ino !== existing.ino || original.dev !== existing.dev || original.size !== existing.size) throw error
                })
                await mkdir(parent, { recursive: true })
                if (projector) await saveLink(path.join(runtimeModels, projector), path.join(parent, projector))
                await saveLink(source, destination)
                response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
                response.end(JSON.stringify({ name, folder: parent, projector }))
                return
              }
              const stream = createReadStream(source)
              stream.once('error', () => { if (!response.headersSent) response.writeHead(404).end() })
              stream.once('open', () => {
                response.writeHead(200, {
                  'Content-Type': 'application/octet-stream',
                  'Content-Disposition': `attachment; filename="Novera-${file}"`,
                  'Cache-Control': 'no-store',
                })
                pipeline(stream, response, () => {})
              })
            } catch {
              response.writeHead(404).end()
            }
          })
          server.middlewares.use('/__novera/quantization-start', (request, response) => {
            const host = request.headers.host
            if (request.method !== 'POST' || !/^127\.0\.0\.1:\d+$/.test(host ?? '') ||
              request.headers.origin !== `http://${host}` || request.headers['sec-fetch-site'] !== 'same-origin') {
              response.writeHead(403).end()
              return
            }
            if (running || recalibrating) { response.writeHead(409).end(); return }
            const params = new URL(request.url ?? '/', 'http://localhost').searchParams
            const level = params.get('level') ?? '4'
            const reference = params.get('reference') ?? 'q8'
            if (level !== '2' && level !== '3' && level !== '4') { response.writeHead(400).end(); return }
            if (reference !== 'q8') {
              response.writeHead(400).end()
              return
            }
            recalibrating = true
            recalibrationFailed = false
            currentRun = `q${level}-run-${Date.now()}`
            const script = level === '4' ? 'benchmark-q4-recalibration.py' : 'benchmark-q3-recalibration.py'
            const runDirectory = path.join(weightDirectory, currentRun)
            recalibrationProcess = execFile('python', [path.resolve(__dirname, '../scripts', script),
              ...(level === '4' ? [] : ['--level', level, '--reference', reference]),
              '--output', runDirectory], { windowsHide: true }, async error => {
              recalibrationProcess = undefined
              const stopped = stopping
              try {
                if (stopped) {
                  await mkdir(runDirectory, { recursive: true })
                  const destination = path.join(runDirectory, 'report.json')
                  const report = JSON.parse(await readFile(destination, 'utf8').catch(() => '{"runs":[]}'))
                  report.stage = 'Comparaison arrêtée'
                  const temporary = path.join(runDirectory, 'stopped.json')
                  await writeFile(temporary, JSON.stringify(report), 'utf8')
                  await rename(temporary, destination)
                }
              } catch (cause) {
                server.config.logger.error('Could not save stopped recalibration: ' + String(cause))
              } finally {
                stopping = false
                recalibrating = false
                recalibrationFailed = Boolean(error) && !stopped
                if (recalibrationFailed && error) server.config.logger.error('Weight recalibration failed: ' + error.message)
              }
            })
            response.writeHead(202, { 'Cache-Control': 'no-store' }).end()
          })
          server.middlewares.use('/__novera/quantization-stop', (request, response) => {
            const host = request.headers.host
            if (request.method !== 'POST' || !/^127\.0\.0\.1:\d+$/.test(host ?? '') ||
              request.headers.origin !== `http://${host}` || request.headers['sec-fetch-site'] !== 'same-origin') {
              response.writeHead(403).end()
              return
            }
            const pid = recalibrationProcess?.pid
            if (!pid || stopping || process.platform !== 'win32') { response.writeHead(409).end(); return }
            stopping = true
            execFile('taskkill.exe', ['/PID', String(pid), '/T', '/F'], { windowsHide: true }, error => {
              if (error && recalibrationProcess?.pid === pid) {
                stopping = false
                response.writeHead(500).end()
                return
              }
              response.writeHead(202, { 'Cache-Control': 'no-store' }).end()
            })
          })
          server.middlewares.use('/__novera/quantization-report', async (request, response) => {
            if (request.method !== 'GET' || !/^127\.0\.0\.1:\d+$/.test(request.headers.host ?? '') ||
              request.headers['sec-fetch-site'] !== 'same-origin') {
              response.writeHead(403).end()
              return
            }
            try {
              const names = await readdir(weightDirectory).catch(() => [] as string[])
              const latest = (recalibrating ? currentRun : undefined) ?? names.filter(name => /^q[234]-run-\d+$/.test(name))
                .sort((left, right) => Number(left.slice(7)) - Number(right.slice(7))).at(-1) ?? 'q4-varied'
              const varied = await readFile(path.join(weightDirectory, latest, 'report.json'), 'utf8').catch(() => null)
              const initial = varied ? null : await readFile(path.join(weightDirectory, 'q4-first/report.json'), 'utf8').catch(() => null)
              const report = JSON.parse(varied ?? initial ?? '{}')
              response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' })
              const activeReport = /^q[234]-run-\d+$/.test(latest) && varied &&
                !['Comparaison terminée', 'Comparaison interrompue', 'Comparaison arrêtée'].includes(report.stage)
              response.end(JSON.stringify({ recalibrating: recalibrating || Boolean(activeReport),
                canStop: process.platform === 'win32' && Boolean(recalibrationProcess?.pid) && !stopping,
                stopping,
                recalibrationFailed: recalibrationFailed || report.stage === 'Comparaison interrompue', ...(varied
                ? { stage: report.stage, runs: report.runs, runId: latest, corpus: report.corpus,
                    referenceBytes: report.referenceBytes, referenceName: report.referenceName }
                : recalibrating ? { stage: 'Démarrage du recalibrage', runs: [] }
                : { baseline: report.baseline_metrics, candidate: report.candidate_metrics }) }))
            } catch {
              response.writeHead(404, { 'Cache-Control': 'no-store' }).end()
            }
          })
          server.middlewares.use('/__novera/local-model-adjustment', (request, response) => {
            const host = request.headers.host
            if (request.method !== 'POST' || !/^127\.0\.0\.1:\d+$/.test(host ?? '') ||
              request.headers.origin !== `http://${host}` || request.headers['sec-fetch-site'] !== 'same-origin') {
              response.writeHead(403).end()
              return
            }
            if (running || recalibrating) { response.writeHead(409).end(); return }
            running = true
            const controller = new AbortController()
            response.once('close', () => { if (!response.writableEnded) controller.abort() })
            const mode = new URL(request.url ?? '/', 'http://localhost').searchParams.get('mode')
            const child = execFile('python', [path.resolve(__dirname, '../scripts/local-model-adjustment.py'),
              ...(mode === 'calibrate-q8' ? ['--calibrate-q8'] : mode === 'reference-q4' ? ['--reference-q4'] : [])], {
              signal: controller.signal, timeout: 1800000, windowsHide: true, maxBuffer: 8 * 1024 * 1024,
            }, error => {
              running = false
              if (error && !controller.signal.aborted) server.config.logger.error('Local model adjustment failed: ' + error.message)
              if (!response.destroyed) response.end()
            })
            response.writeHead(200, { 'Content-Type': 'application/x-ndjson', 'Cache-Control': 'no-store' })
            response.flushHeaders()
            child.stdout?.on('data', chunk => { if (!response.destroyed) response.write(chunk) })
          })
        },
      } satisfies Plugin] : []),
      ...[textRuntime, text64Runtime].filter(runtime => runtime !== undefined).map((runtime, index) => ({
        name: 'novera-local-text-assets-' + index,
        configureServer(server) {
          server.middlewares.use('/' + runtime.directory, (request, response, next) => {
            const asset = runtime.assets.find(entry => request.url === '/' + entry.name)
            if (!asset) return next()
            const type = asset.name.endsWith('.wasm') ? 'application/wasm' : asset.name.endsWith('.mjs')
              ? 'text/javascript' : asset.name.endsWith('.json') ? 'application/json' : 'text/plain'
            response.writeHead(200, { 'Content-Type': type })
            response.end(asset.source)
          })
        },
        generateBundle() {
          for (const asset of runtime.assets) this.emitFile({ type: 'asset', fileName: `${runtime.directory}/${asset.name}`, source: asset.source })
        },
      } satisfies Plugin)),
      ...(musicRuntime ? [{ name: 'novera-local-music-assets', generateBundle() {
        for (const asset of musicRuntime.assets) this.emitFile({ type: 'asset', fileName: `${musicRuntime.directory}/${asset.name}`, source: asset.source })
      } } satisfies Plugin] : []),
      ...(localMedia ? [{ name: 'novera-local-media-assets', generateBundle() {
        for (const asset of mediaRuntime!.assets) this.emitFile({ type: 'asset', fileName: `${mediaRuntime!.directory}/${asset.name}`, source: asset.source })
      } } satisfies Plugin] : []),
      ...(browserPreview ? [{ name: 'novera-web-version', generateBundle() {
        this.emitFile({ type: 'asset', fileName: 'novera-web-version.json', source: JSON.stringify({
          application: 'NoveraWeb', schemaVersion: 1, version: packageJson.version, buildId: build.buildId, commit: build.commit,
        }) })
      } } satisfies Plugin] : []),
      ...(monitoring ? [{ name: 'novera-private-symbols', closeBundle() {
        prepareSymbols({ dist: path.resolve(__dirname, 'dist'), output: privateSymbols, ...build, version: packageJson.version })
        if (process.env.POSTHOG_CLI_API_KEY) uploadSymbols(privateSymbols)
        else console.warn('PostHog: private source maps prepared locally; authenticated upload is still required before release.')
      } }] : []),
      TanStackRouterVite({
        target: 'react',
        autoCodeSplitting: true,
        routeFileIgnorePattern: '.((test).ts)|test-page',
      }),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        path: path.resolve(__dirname, './src/lib/browserPath.ts'),
        'node:path': path.resolve(__dirname, './src/lib/browserPath.ts'),
        '@': path.resolve(__dirname, './src'),
        '@janhq/assistant-extension': path.resolve(__dirname, '../extensions/assistant-extension/dist/index.js'),
        '@janhq/conversational-extension': path.resolve(__dirname, '../extensions/conversational-extension/dist/index.js'),
        '@janhq/download-extension': path.resolve(__dirname, '../extensions/download-extension/dist/index.js'),
        '@janhq/llamacpp-extension': path.resolve(__dirname, '../extensions/llamacpp-extension/dist/index.js'),
        '@janhq/mlx-extension': path.resolve(__dirname, '../extensions/mlx-extension/dist/index.js'),
        '@janhq/rag-extension': path.resolve(__dirname, '../extensions/rag-extension/dist/index.js'),
        '@janhq/vector-db-extension': path.resolve(__dirname, '../extensions/vector-db-extension/dist/index.js'),
      },
    },
    optimizeDeps: {
      // Extensions are prebuilt, self-contained ESM dist bundles. Excluding them
      // stops Vite's dev dep-optimizer from crawling/re-bundling them mid-boot,
      // which otherwise invalidates the in-flight dynamic import of the service
      // hub and surfaces as "Importing a module script failed" on cold start.
      exclude: [
        '@janhq/assistant-extension',
        '@janhq/conversational-extension',
        '@janhq/download-extension',
        '@janhq/llamacpp-extension',
        '@janhq/mlx-extension',
        '@janhq/rag-extension',
        '@janhq/vector-db-extension',
      ],
    },
    define: {
      'import.meta.env.VITE_NOVERA_BROWSER_TEXT64_PATH': JSON.stringify(text64Runtime?.directory ?? ''),
      'import.meta.env.VITE_NOVERA_BROWSER_TEXT_PATH': JSON.stringify(textRuntime?.directory ?? ''),
      'import.meta.env.VITE_NOVERA_BROWSER_MEDIA_PATH': JSON.stringify(mediaRuntime?.directory ?? ''),
      'import.meta.env.VITE_NOVERA_BROWSER_MUSIC_PATH': JSON.stringify(musicRuntime?.directory ?? ''),
      NOVERA_BUILD_ID: JSON.stringify(build.buildId),
      NOVERA_BUILD_COMMIT: JSON.stringify(build.commit),
      NOVERA_BUILD_ARCH: JSON.stringify(build.arch),
      NOVERA_BUILD_SOURCE_STATE: JSON.stringify(build.sourceState),
      NOVERA_BUILD_ENVIRONMENT: JSON.stringify(mode === 'production' ? 'production' : 'development'),
      IS_TAURI: JSON.stringify(browserPreview ? false : process.env.IS_TAURI),
      IS_DEV: JSON.stringify(process.env.IS_DEV),
      IS_WEB_APP: JSON.stringify(browserPreview),
      IS_MACOS: JSON.stringify(
        process.env.TAURI_ENV_PLATFORM?.includes('darwin') ?? false
      ),
      IS_WINDOWS: JSON.stringify(
        process.env.TAURI_ENV_PLATFORM?.includes('windows') ?? false
      ),
      IS_LINUX: JSON.stringify(
        process.env.TAURI_ENV_PLATFORM?.includes('linux') ?? false
      ),
      IS_IOS: JSON.stringify(
        process.env.TAURI_ENV_PLATFORM?.includes('ios') ?? false
      ),
      IS_ANDROID: JSON.stringify(
        process.env.TAURI_ENV_PLATFORM?.includes('android') ?? false
      ),
      PLATFORM: JSON.stringify(process.env.TAURI_ENV_PLATFORM),

      VERSION: JSON.stringify(packageJson.version),

      // Only explicit Novera configuration is accepted. Inherited Jan/GA
      // variables cannot silently activate tracking in a new build.
      POSTHOG_KEY: JSON.stringify(telemetry.key),
      POSTHOG_HOST: JSON.stringify(telemetry.host),
      GA_MEASUREMENT_ID: JSON.stringify(''),
      AUTO_UPDATER_DISABLED: JSON.stringify(
        process.env.NOVERA_ENABLE_UPDATER !== 'true'
      ),
      UPDATE_CHECK_INTERVAL_MS: JSON.stringify(
        Number(env.UPDATE_CHECK_INTERVAL_MS) || 60 * 60 * 1000
      ),
    },

    // Vite options tailored for Tauri development and only applied in `tauri dev` or `tauri build`
    //
    // 1. prevent vite from obscuring rust errors
    build: { sourcemap: monitoring },
    clearScreen: false,
    // 2. tauri expects a fixed port, fail if that port is not available
    server: {
      port: 1420,
      strictPort: true,
      host: host || false,
      hmr: host
        ? {
            protocol: 'ws',
            host,
            port: 1421,
          }
        : undefined,
      watch: {
        // 3. tell vite to ignore watching `src-tauri`
        ignored: ['**/src-tauri/**'],
        usePolling: true
      },
    },
  }
})
