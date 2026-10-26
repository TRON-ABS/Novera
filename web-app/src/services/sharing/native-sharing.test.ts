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
  it.runIf(IS_WINDOWS)(
    'blocks the known hanging Windows flyout before IPC or browser fallback',
    async () => {
      const core = { invoke: vi.fn() } as unknown as CoreService
      expect(canSystemShare(value)).toBe(false)
      await expect(systemShare(value, core)).rejects.toThrow(
        'SHARE_UNSUPPORTED'
      )
      expect(core.invoke).not.toHaveBeenCalled()
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
