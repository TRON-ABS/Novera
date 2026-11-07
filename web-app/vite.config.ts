import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { prepareBrowserRuntime } from '../scripts/distribution/browser-runtime-assets.mjs'
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
  const mediaRuntime = localMedia ? prepareBrowserRuntime(env.NOVERA_BROWSER_MEDIA_BUILD) : undefined
  const localMusic = browserPreview && env.VITE_NOVERA_WEB_LOCAL_MUSIC === 'true'
  const musicRuntime = localMusic ? prepareBrowserRuntime(env.NOVERA_BROWSER_MUSIC_BUILD, 'music') : undefined

  return {
    base: browserPreview ? (env.VITE_NOVERA_WEB_BASE || './') : undefined,
    plugins: [
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
