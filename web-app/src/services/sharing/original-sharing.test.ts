import { describe, expect, it, vi } from 'vitest'
import { prepareShare, systemShare } from './index'
import type { CoreService } from '@/services/core/types'

vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
const labels = { user: 'User', assistant: 'Assistant', sources: 'Sources', parameters: 'Parameters' }

describe('original files passed to system sharing', () => {
  it.runIf(IS_WINDOWS).each([
    ['image', 'png', 'image/png'], ['video', 'mp4', 'video/mp4'],
    ['video', 'webm', 'video/webm'], ['music', 'mp3', 'audio/mpeg'], ['music', 'wav', 'audio/wav'],
  ])('passes the %s/%s reference without capturing or exporting the player', async (task, extension, mime) => {
    const filename = `Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${extension}`
    const url = `novera-creation:${task}/${filename}`
    const core = {
      invoke: vi.fn().mockResolvedValue('C:/Media/' + filename),
      convertFileSrc: vi.fn().mockReturnValue('asset:original'),
    } as unknown as CoreService
    const prepared = await prepareShare({
      title: 'Test', format: 'original', labels, core,
      entries: [{ id: 'a', role: 'assistant', text: '', assets: [{ id: 'file', url, mime, name: filename, messageId: 'a' }] }],
    })
    expect(prepared).toMatchObject({ format: 'original', mime, filename, html: '', previewUrl: 'asset:original' })
    expect(prepared.bytes).toBeUndefined()
    await systemShare(prepared, core)
    expect(core.invoke).toHaveBeenLastCalledWith('sharing_native', {
      title: 'Test', text: '', payload: { filename, mime, base64: null, asset: { task, name: filename } },
    })
    expect(core.invoke).toHaveBeenCalledTimes(2)
  })
  it.runIf(IS_WINDOWS)('shares text as one file without appending a duplicate text message', async () => {
    const core = { invoke: vi.fn().mockResolvedValue(undefined) } as unknown as CoreService
    const prepared = await prepareShare({
      title: 'Test', format: 'txt', labels, core,
      entries: [{ id: 'a', role: 'assistant', text: 'Only the requested text.', assets: [] }],
    })
    await systemShare(prepared, core)
    expect(prepared.mime).toBe('text/plain')
    const payload = vi.mocked(core.invoke).mock.calls[0][1] as { text: string; payload: { filename: string; base64: string; asset: null } }
    expect(payload.text).toBe('')
    expect(payload.payload.filename).toBe('Test.txt')
    expect(payload.payload.asset).toBeNull()
    expect(atob(payload.payload.base64)).toContain('Only the requested text.')
    expect(atob(payload.payload.base64)).not.toContain('<html')
  })
})
