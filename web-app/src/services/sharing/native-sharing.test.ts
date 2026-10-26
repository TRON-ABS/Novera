import { describe, expect, it, vi } from 'vitest'
import {
  canSystemShare,
  copyShareFile,
  systemShare,
  type PreparedShare,
} from './index'
import type { CoreService } from '@/services/core/types'
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
const value: PreparedShare = {
  title: 'Test',
  format: 'png',
  html: '',
  text: '',
  filename: 'Novera.png',
  mime: 'image/png',
  bytes: new Uint8Array([1, 2, 3]),
}

describe('native sharing recovery', () => {
  it
    .runIf(IS_WINDOWS || IS_MACOS || IS_LINUX || IS_ANDROID || IS_IOS)
    .each(['html', 'docx', 'zip', 'png', 'mp4'])(
    'hands a portable %s name to both native sharing and file copy',
    async (format) => {
      const core = {
        invoke: vi.fn().mockResolvedValue(undefined),
      } as unknown as CoreService
      const exported = {
        ...value,
        title: 'Cœur étoilé 世界',
        filename: `Cœur étoilé 世界.${format}`,
      }
      await systemShare(exported, core)
      await copyShareFile(exported, core)
      expect(core.invoke).toHaveBeenNthCalledWith(
        1,
        'sharing_native',
        expect.objectContaining({
          title: exported.title,
          payload: expect.objectContaining({
            filename: `Coeur-etoile.${format}`,
            base64: 'AQID',
          }),
        })
      )
      expect(core.invoke).toHaveBeenNthCalledWith(
        2,
        'sharing_copy_file',
        expect.objectContaining({
          payload: expect.objectContaining({
            filename: `Coeur-etoile.${format}`,
            base64: 'AQID',
          }),
        })
      )
      expect(exported.filename).toBe(`Cœur étoilé 世界.${format}`)
    }
  )
  it.runIf(IS_WINDOWS)(
    'hands Windows system sharing to the native adapter without a browser fallback',
    async () => {
      const core = {
        invoke: vi.fn().mockResolvedValue(undefined),
      } as unknown as CoreService
      expect(canSystemShare(value)).toBe(true)
      await systemShare(value, core)
      expect(core.invoke).toHaveBeenCalledWith('sharing_native', {
        title: 'Test',
        text: '',
        payload: {
          filename: 'Novera.png',
          mime: 'image/png',
          base64: 'AQID',
          asset: null,
        },
      })
    }
  )
  it('keeps copying the actual export file available for attachment', async () => {
    const core = {
      invoke: vi.fn().mockResolvedValue(undefined),
    } as unknown as CoreService
    await copyShareFile(value, core)
    expect(core.invoke).toHaveBeenCalledWith('sharing_copy_file', {
      payload: {
        filename: 'Novera.png',
        mime: 'image/png',
        base64: 'AQID',
        asset: null,
      },
    })
  })
})
