import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'

vi.mock('./config', () => ({ browserPreviewEnabled: () => true, browserCatalog: [] }))
vi.mock('./runtime', () => ({ browserRuntime: {} }))
vi.mock('./media', () => ({ saveBrowserLocalMedia: vi.fn() }))
vi.mock('@/hooks/useNoveraInstructions', () => ({ withNoveraInstructions: vi.fn() }))

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals() })

it('restores saved media imports into an empty Auto-Tune registry', async () => {
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MEDIA', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MEDIA_PATH', 'novera-runtime/image')
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_MUSIC', 'true')
  vi.stubEnv('VITE_NOVERA_BROWSER_MUSIC_PATH', 'novera-runtime/music')
  vi.stubEnv('VITE_NOVERA_WEB_LOCAL_WAN', 'true')
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ directory: 'novera-runtime/' + 'a'.repeat(64) }))))
  const { imageComponentNames } = await import('./local-media')
  const { musicComponentNames } = await import('./local-music')
  const { browserWanFiles } = await import('./local-video-calibration')
  const { saveBrowserModelImport } = await import('./model-imports')
  // File metadata fixtures avoid jsdom's incompatible File structured clone.
  const fixtures = (names: readonly string[]) => names.map(name => ({ name, size: 123, lastModified: 1 } as File))
  await saveBrowserModelImport('image', fixtures(imageComponentNames))
  await saveBrowserModelImport('music', fixtures(musicComponentNames))
  await saveBrowserModelImport('video', fixtures(browserWanFiles))

  const { discoverBrowserAutoTuneProbes } = await import('./auto-tune-registry')
  const probes = await discoverBrowserAutoTuneProbes()
  expect(probes.map(probe => probe.task).sort()).toEqual(['image', 'music', 'video'])
  expect(probes.find(probe => probe.task === 'image')?.model).toBe(imageComponentNames[0])
})
