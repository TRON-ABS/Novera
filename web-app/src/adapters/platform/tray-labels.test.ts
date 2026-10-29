import { beforeEach, describe, expect, it, vi } from 'vitest'
import { invoke } from '@tauri-apps/api/core'
import { isPlatformTauri } from '@/lib/platform/utils'
import { syncTrayLabels } from './tray-labels'

vi.mock('@tauri-apps/api/core', () => ({ invoke: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: vi.fn() }))
beforeEach(() => vi.clearAllMocks())
describe('native tray localization adapter', () => {
  it('passes translated labels to the native menu', async () => {
    vi.mocked(isPlatformTauri).mockReturnValue(true)
    await syncTrayLabels('Ouvrir Novera', 'Quitter Novera')
    expect(invoke).toHaveBeenCalledWith('set_tray_labels', { open: 'Ouvrir Novera', quit: 'Quitter Novera' })
  })
  it('does not invoke a native command in the browser', async () => {
    vi.mocked(isPlatformTauri).mockReturnValue(false)
    await syncTrayLabels('Open Novera', 'Quit Novera')
    expect(invoke).not.toHaveBeenCalled()
  })
})
