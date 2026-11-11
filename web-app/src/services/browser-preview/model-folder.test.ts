import { afterEach, expect, it, vi } from 'vitest'
import { browserLocalTextModels } from './local-text-imports'
import { watchBrowserModelFolder } from './model-folder'

const storage = vi.hoisted(() => ({
  load: vi.fn(),
  save: vi.fn(async () => {}),
}))

vi.mock('./config', () => ({ browserPreviewEnabled: () => true }))
vi.mock(import('./wasm-text'), async original => ({ ...await original(), wasmTextSupported: () => true }))
vi.mock('./runtime', () => ({ browserRuntime: {} }))
vi.mock('./media', () => ({ saveBrowserLocalMedia: vi.fn() }))
vi.mock('./model-imports', () => ({
  savedBrowserModelFolder: storage.load,
  saveBrowserModelImport: storage.save,
  restoreBrowserModelImports: async () => {},
}))

function fileHandle(name: string, valid = true) {
  const header = new ArrayBuffer(24)
  const view = new DataView(header)
  view.setUint32(0, valid ? 0x46554747 : 0, true)
  view.setUint32(4, 3, true)
  view.setBigUint64(8, 1n, true)
  view.setBigUint64(16, 1n, true)
  return { kind: 'file', name, getFile: async () => ({
    name, size: 100, lastModified: 1, slice: () => ({ arrayBuffer: async () => header }),
  }) }
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

it('scans the authorized folder at startup and adds newly downloaded GGUFs on the next scan', async () => {
  vi.useFakeTimers()
  vi.stubGlobal('showDirectoryPicker', vi.fn())
  let permission: PermissionState = 'granted'
  const downloads = [fileHandle('Nemotron-3.5-Bolt-E4B-Q4_K_M.gguf')]
  const directory = {
    kind: 'directory',
    queryPermission: async () => permission,
    async *values() { yield* downloads },
  }
  storage.load.mockResolvedValue(directory)
  const refresh = vi.fn(async () => {})
  const stop = watchBrowserModelFolder(refresh)
  try {
    await vi.advanceTimersByTimeAsync(0)
    expect(browserLocalTextModels().map(model => model.file.name)).toEqual([downloads[0].name])
    expect(refresh).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(30_000)
    expect(refresh).toHaveBeenCalledTimes(1)

    downloads.push(fileHandle('Qwen3.5-4B-Q4_K_M.gguf'), fileHandle('partial.gguf', false))
    permission = 'denied'
    await vi.advanceTimersByTimeAsync(30_000)
    expect(refresh).toHaveBeenCalledTimes(1)

    permission = 'granted'
    await vi.advanceTimersByTimeAsync(30_000)
    expect(browserLocalTextModels().map(model => model.file.name)).toEqual(downloads.slice(0, 2).map(file => file.name))
    expect(refresh).toHaveBeenCalledTimes(2)
    expect(storage.load).toHaveBeenCalledTimes(1)
  } finally { stop?.() }
})
