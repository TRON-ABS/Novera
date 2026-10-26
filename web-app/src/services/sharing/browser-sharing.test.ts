import { afterEach, expect, it, vi } from 'vitest'
import { canSystemShare, systemShare, type PreparedShare } from './index'
import type { CoreService } from '@/services/core/types'
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => false }))
afterEach(() => vi.unstubAllGlobals())

it('uses the same portable browser file for capability detection and sharing', async () => {
  const share = vi.fn().mockResolvedValue(undefined)
  const canShare = vi.fn().mockReturnValue(true)
  vi.stubGlobal('navigator', { share, canShare })
  const value: PreparedShare = {
    title: 'Cœur étoilé 世界',
    format: 'html',
    html: '<h1>Cœur étoilé 世界</h1>',
    text: '',
    filename: 'Cœur étoilé 世界.html',
    mime: 'text/html',
    bytes: new TextEncoder().encode('<h1>Cœur étoilé 世界</h1>'),
  }
  const core = { invoke: vi.fn() } as unknown as CoreService
  expect(canSystemShare(value)).toBe(true)
  await systemShare(value, core)
  const checked = canShare.mock.calls[0][0].files[0] as File
  const sent = share.mock.calls[0][0].files[0] as File
  expect(checked.name).toBe('Coeur-etoile.html')
  expect(sent.name).toBe(checked.name)
  expect(sent.type).toBe('text/html')
  expect(sent.size).toBe(value.bytes!.length)
  expect(share.mock.calls[0][0].title).toBe(value.title)
  expect(core.invoke).not.toHaveBeenCalled()
})
