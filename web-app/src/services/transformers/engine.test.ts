import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import TransformersEngine from './engine'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
const mockedInvoke = vi.mocked(invoke)
const engine = new TransformersEngine('built-in', '@novera/transformers-extension')

describe('Safetensors local engine', () => {
  beforeEach(() => { mockedInvoke.mockReset() })

  it('persists the selected Python executable through backend settings', async () => {
    mockedInvoke.mockResolvedValue(null)
    await engine.updateSettings([{ key: 'python_path', controllerProps: { value: 'C:/Python315/python.exe', placeholder: '' } }])
    const call = mockedInvoke.mock.calls.find(([name]) => name === 'settings_set')!
    const settings = JSON.parse((call[1] as { value: string }).value)
    expect(settings[0].controllerProps.value).toBe('C:/Python315/python.exe')
  })

  it('loads with the configured Python and context, leaving other engine options out', async () => {
    mockedInvoke.mockImplementation(async name => name === 'settings_get'
      ? JSON.stringify([{ key: 'python_path', controllerProps: { value: 'python315' } }])
      : { port: 1234, model_id: 'tiny' })
    await engine.load('tiny', { ctx_size: '128', ngl: 99 })
    expect(mockedInvoke).toHaveBeenCalledWith('transformers_load', { modelId: 'tiny', pythonPath: 'python315', ctxSize: 128, device: 'auto' })
  })

  it('registers folders and unregisters models through the native engine', async () => {
    mockedInvoke.mockResolvedValue(undefined)
    await engine.import('tiny', { modelPath: 'C:/models/tiny' })
    expect(mockedInvoke).toHaveBeenCalledWith('transformers_import', { modelId: 'tiny', modelPath: 'C:/models/tiny' })
    await engine.delete('tiny')
    expect(mockedInvoke).toHaveBeenCalledWith('transformers_delete', { modelId: 'tiny' })
  })

  it('does not advertise tools and returns only live model sessions', async () => {
    expect(await engine.isToolSupported()).toBe(false)
    mockedInvoke.mockResolvedValue(null)
    expect(await engine.getLoadedModels()).toEqual([])
    mockedInvoke.mockResolvedValue({ model_id: 'tiny' })
    expect(await engine.getLoadedModels()).toEqual(['tiny'])
    await engine.onUnload()
    expect(mockedInvoke).toHaveBeenCalledWith('transformers_unload', { modelId: 'tiny' })
  })
})
