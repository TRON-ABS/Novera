import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import packageJson from './package.json'
import { monitoringBuildInfo } from '../scripts/monitoring/build-info.mjs'
import { prepareSymbols, uploadSymbols } from '../scripts/monitoring/symbols.mjs'
import { resolvePublicTelemetry } from '../scripts/monitoring/telemetry.mjs'
import publicTelemetry from '../scripts/monitoring/novera-telemetry.public.json'
const host = process.env.TAURI_DEV_HOST

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

  return {
    base: browserPreview ? './' : undefined,
    plugins: [
      ...(localMedia ? [{ name: 'novera-local-media-assets', generateBundle() {
        if (!env.NOVERA_BROWSER_MEDIA_BUILD) throw new Error('Set NOVERA_BROWSER_MEDIA_BUILD to a verified experimental runtime build directory.')
        const folder = path.resolve(env.NOVERA_BROWSER_MEDIA_BUILD)
        const receipt = JSON.parse(readFileSync(path.join(folder, 'BUILD-VERIFICATION.json'), 'utf8'))
        if (receipt.compiled !== true) throw new Error('The browser media runtime has no successful build receipt.')
        for (const name of ['novera-diffusion.mjs', 'novera-diffusion.wasm']) {
          const bytes = readFileSync(path.join(folder, name))
          const expected = receipt.artifacts.find((artifact: { name: string }) => artifact.name === name)
          if (!expected || expected.bytes !== bytes.length || expected.sha256 !== createHash('sha256').update(bytes).digest('hex')) throw new Error(`Browser media artifact differs from its receipt: ${name}`)
          this.emitFile({ type: 'asset', fileName: `novera-runtime/${name}`, source: bytes })
        }
        this.emitFile({ type: 'asset', fileName: 'novera-runtime/BUILD-VERIFICATION.json', source: JSON.stringify(receipt) })
        for (const name of ['sdcpp', 'ggml']) this.emitFile({ type: 'asset', fileName: `novera-runtime/LICENSE-${name}.txt`, source: readFileSync(path.resolve(folder, '..', name, 'LICENSE')) })
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
