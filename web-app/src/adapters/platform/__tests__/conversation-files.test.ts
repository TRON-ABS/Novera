import { beforeEach, describe, expect, it, vi } from 'vitest'
import { saveConversationFile, printConversation } from '../conversation-files'
import type { CoreService } from '@/services/core/types'
import type { DialogService } from '@/services/dialog/types'
const platform = vi.hoisted(() => ({ native: true }))
vi.mock('@/lib/platform/utils', () => ({
  isPlatformTauri: () => platform.native,
}))
const save = vi.fn()
const invoke = vi.fn()
const dialog = { save } as unknown as DialogService
const core = { invoke } as unknown as CoreService
const file = {
  filename: 'École.txt',
  mime: 'text/plain;charset=utf-8',
  content: 'Bonjour 世界',
}
beforeEach(() => {
  vi.clearAllMocks()
  platform.native = true
})
describe('conversation destination', () => {
  it('does not write anything when the native save dialog is cancelled', async () => {
    save.mockResolvedValueOnce(null)
    expect(await saveConversationFile(file, dialog, core)).toBe(false)
    expect(invoke).not.toHaveBeenCalled()
  })
  it('writes exact Unicode content to the user-selected path', async () => {
    save.mockResolvedValueOnce('C:\\Users\\person\\export')
    await saveConversationFile(file, dialog, core)
    expect(invoke).toHaveBeenCalledWith('write_file_sync', {
      args: ['C:\\Users\\person\\export.txt', file.content],
    })
    expect(save).toHaveBeenCalledWith({
      filters: [{ name: 'Novera (txt)', extensions: ['txt'] }],
    })
  })
  it('keeps a user-selected filename with an extension', async () => {
    save.mockResolvedValueOnce('C:/export/custom.txt')
    await saveConversationFile(file, dialog, core)
    expect(invoke).toHaveBeenCalledWith('write_file_sync', {
      args: ['C:/export/custom.txt', file.content],
    })
  })
  it('surfaces write failures instead of pretending the file was saved', async () => {
    save.mockResolvedValueOnce('C:/export.txt')
    invoke.mockRejectedValueOnce(new Error('disk full'))
    await expect(saveConversationFile(file, dialog, core)).rejects.toThrow(
      'disk full'
    )
  })
  it('downloads a Blob in web mode without invoking native services', async () => {
    platform.native = false
    vi.useFakeTimers()
    const create = vi.fn(() => 'blob:export')
    const revoke = vi.fn()
    vi.stubGlobal('URL', { createObjectURL: create, revokeObjectURL: revoke })
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    try {
      expect(await saveConversationFile(file, dialog, core)).toBe(true)
      expect(click).toHaveBeenCalledOnce()
      expect(save).not.toHaveBeenCalled()
      expect(invoke).not.toHaveBeenCalled()
      expect(document.querySelector('a[download]')).toBeNull()
      await vi.advanceTimersByTimeAsync(60_000)
      expect(revoke).toHaveBeenCalledWith('blob:export')
    } finally {
      click.mockRestore()
      vi.unstubAllGlobals()
      vi.useRealTimers()
    }
  })
})

it('prints an isolated escaped document and removes the preview after printing', async () => {
  const printing = printConversation(
    '<!doctype html><html><head><title>Test</title></head><body><p>Safe</p></body></html>'
  )
  const frame = document.querySelector('iframe')!
  expect(frame.srcdoc).toContain('<title>Test</title>')
  expect(frame.srcdoc).toContain('<link rel="stylesheet"')
  const print = vi.fn()
  const focus = vi.fn()
  Object.defineProperty(frame.contentWindow, 'print', {
    value: print,
    configurable: true,
  })
  Object.defineProperty(frame.contentWindow, 'focus', {
    value: focus,
    configurable: true,
  })
  frame.dispatchEvent(new Event('load'))
  await printing
  expect(print).toHaveBeenCalledOnce()
  frame.contentWindow!.dispatchEvent(new Event('afterprint'))
  expect(document.querySelector('iframe')).toBeNull()
})
