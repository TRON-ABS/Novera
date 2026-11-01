import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { componentAction, componentCompatibility, invokeWithComponents, managedDefault, recommendedComponents, type ComponentProfile } from './components'
import { safeDiagnosticContext } from '@/lib/noveraDiagnostics'
vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/i18n', () => ({ default: { t: (key: string) => key } }))
const p: ComponentProfile = { id: 'transformers-cpu', family: 'transformers', backend: 'cpu', python: '3.12.12', downloadBytes: 1, requiredBytes: 4, supported: true }
beforeEach(() => vi.mocked(invoke).mockReset())
describe('managed component contracts', () => {
  it('keeps custom interpreters and recognises managed defaults', () => {
    for (const value of ['', 'python', 'python.exe', 'auto', 'managed:onnx-cpu']) expect(managedDefault(value)).toBe(true)
    expect(managedDefault('C:/Python privé/python.exe')).toBe(false)
  })
  it('never proposes CUDA on hardware without NVIDIA or an unsupported OS', () => {
    expect(componentCompatibility(p, false)).toBe(true)
    expect(componentCompatibility({ ...p, backend: 'cu130' }, false)).toBe(false)
    expect(componentCompatibility({ ...p, backend: 'cu130' }, true)).toBe(true)
    expect(componentCompatibility({ ...p, supported: false }, true)).toBe(false)
  })
  it('sends only an identifier and a fixed operation', async () => {
    await componentAction('onnx-cpu', 'verify')
    expect(invoke).toHaveBeenCalledWith('components_action', { profileId: 'onnx-cpu', action: 'verify' })
  })
  it('keeps the selected profile and recommends CPU when no NVIDIA GPU is known', () => {
    const rows = [
      { profile: p, state: 'absent' as const, selected: false },
      { profile: { ...p, id: 'transformers-cuda', backend: 'cu130' }, state: 'ready' as const, selected: false },
    ]
    expect([...recommendedComponents(rows, false)]).toEqual(['transformers-cpu'])
    expect([...recommendedComponents(rows, true)]).toEqual(['transformers-cuda'])
    rows[0].selected = true
    expect([...recommendedComponents(rows, true)]).toEqual(['transformers-cpu'])
  })
  it('reports only fixed component reason codes without local paths', () => {
    const result = safeDiagnosticContext(new Error('COMPONENT_SPACE C:/Users/private/models'), { operation: 'configuration' })
    expect(result.error_code).toBe('storage')
    expect(result.reason_code).toBe('COMPONENT_SPACE')
    expect(JSON.stringify(result)).not.toContain('private')
  })
  it('localises component errors without masking unrelated engine failures', async () => {
    vi.mocked(invoke).mockRejectedValueOnce('COMPONENT_REQUIRED')
    await expect(invokeWithComponents('onnx_probe')).rejects.toThrow('common:components.required')
    vi.mocked(invoke).mockRejectedValueOnce('model invalid')
    await expect(invokeWithComponents('onnx_load')).rejects.toBe('model invalid')
    expect(invoke).toHaveBeenCalledTimes(2)
  })
})
