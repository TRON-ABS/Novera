import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { ContentType, MessageStatus } from '@janhq/core'
import { ShareButton } from '../ShareButton'
const mocks = vi.hoisted(() => ({
  fetch: vi.fn(),
  prepare: vi.fn(),
  save: vi.fn(),
  system: vi.fn(),
  copy: vi.fn(),
  copyFile: vi.fn(),
  drain: vi.fn(),
  canShare: true,
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/hooks/useThreads', () => ({
  useThreads: {
    getState: () => ({
      getThreadById: () => ({ id: 't', title: 'Test', metadata: {} }),
    }),
  },
}))
vi.mock('@/hooks/useMessages', () => ({
  waitForThreadMessageWrites: mocks.drain,
}))
vi.mock('@/hooks/useServiceHub', () => {
  const service = {
    messages: () => ({ fetchMessages: mocks.fetch }),
    core: () => ({ invoke: vi.fn(), convertFileSrc: vi.fn() }),
    dialog: () => ({}),
  }
  return { useServiceHub: () => service }
})
vi.mock('@/services/sharing', () => ({
  prepareShare: mocks.prepare,
  savePrepared: mocks.save,
  systemShare: mocks.system,
  copyPrepared: mocks.copy,
  copyShareFile: mocks.copyFile,
  canSystemShare: () => mocks.canShare,
}))
vi.mock('@/lib/platform/utils', () => ({ isPlatformTauri: () => true }))
const m = (id: string, role: string, text: string) => ({
  id,
  role,
  object: 'thread.message',
  thread_id: 't',
  status: MessageStatus.Ready,
  created_at: 1,
  completed_at: 1,
  content: [{ type: ContentType.Text, text: { value: text, annotations: [] } }],
})
describe('unified sharing preview', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.canShare = true
    mocks.drain.mockResolvedValue(undefined)
    mocks.fetch.mockResolvedValue([
      m('q', 'user', 'Older question'),
      m('a', 'assistant', 'Earlier result'),
      m('b', 'assistant', 'Latest result'),
    ])
    mocks.prepare.mockImplementation(async (input) => ({
      title: 'Test',
      format: input.format,
      text: 'Text',
      html: '<html><head></head><body>Preview</body></html>',
      filename: 'Test.html',
      mime: 'text/html',
      bytes: new Uint8Array([1]),
    }))
    mocks.save.mockResolvedValue(true)
    mocks.system.mockResolvedValue(undefined)
  })
  it('loads the full stored discussion and requires a prepared preview before sharing', async () => {
    render(<ShareButton threadId="t" conversation />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'chat:sharing.prepare' })
      ).not.toBeDisabled()
    )
    expect(mocks.drain).toHaveBeenCalledWith('t')
    expect(mocks.fetch).toHaveBeenCalledWith('t')
    expect(mocks.system).not.toHaveBeenCalled()
    expect(
      screen.queryByRole('button', { name: 'chat:sharing.system' })
    ).not.toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.prepare' })
    )
    await screen.findByTitle('chat:sharing.preview')
    expect(
      mocks.prepare.mock.calls[0][0].entries.map((e: { id: string }) => e.id)
    ).toEqual(['q', 'a', 'b'])
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.system' }))
    await waitFor(() => expect(mocks.system).toHaveBeenCalledTimes(1))
  })
  it.each([
    ['image', 'png', 'image/png', 'img'],
    ['video', 'mp4', 'video/mp4', 'video'],
    ['video', 'webm', 'video/webm', 'video'],
    ['music', 'mp3', 'audio/mpeg', 'audio'],
    ['music', 'wav', 'audio/wav', 'audio'],
  ])('prepares only the original %s/%s file and shows an undecorated preview', async (kind, extension, mime, tag) => {
    const url = `novera-creation:${kind}/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${extension}`
    mocks.fetch.mockResolvedValue([])
    mocks.prepare.mockImplementation(async (input) => ({
      title: 'Test', format: input.format, text: '', html: '',
      filename: input.entries[0].assets[0].name,
      mime: input.entries[0].assets[0].mime,
      original: input.entries[0].assets[0], previewUrl: 'asset:file',
    }))
    const { container } = render(<ShareButton threadId="t" assetUrl={url} />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    const prepare = await screen.findByRole('button', { name: 'chat:sharing.prepare' })
    await waitFor(() => expect(prepare).toBeEnabled())
    fireEvent.click(prepare)
    const system = await screen.findByRole('button', { name: 'chat:sharing.system' })
    expect(mocks.prepare).toHaveBeenCalledWith(expect.objectContaining({
      format: 'original', entries: [expect.objectContaining({
        text: '', assets: [expect.objectContaining({ url, mime })],
      })],
    }))
    expect(container.querySelector('.novera-media-player')).not.toBeInTheDocument()
    // The preview is in a dialog portal, so inspect the visible document too.
    expect(document.querySelector('.novera-media-player')).not.toBeInTheDocument()
    expect(document.querySelector(`${tag}[src="asset:file"]`)).toBeInTheDocument()
    expect(screen.queryByRole('iframe')).not.toBeInTheDocument()
    fireEvent.click(system)
    await waitFor(() => expect(mocks.system).toHaveBeenCalledWith(expect.objectContaining({
      format: 'original', mime, html: '', original: expect.objectContaining({ url }),
    }), expect.anything()))
  })
  it('defaults a single captioned media result to its file instead of an HTML player page', async () => {
    const url = 'novera-creation:video/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp4'
    const result = m('b', 'assistant', 'A generated video with a caption')
    mocks.fetch.mockResolvedValue([{ ...result, content: [...result.content, {
      type: ContentType.InputVideo, input_video: { data: url, format: 'video/mp4' },
    }] }])
    render(<ShareButton threadId="t" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    const prepare = await screen.findByRole('button', { name: 'chat:sharing.prepare' })
    await waitFor(() => expect(prepare).toBeEnabled())
    expect(screen.getByRole('combobox', { name: 'chat:sharing.format' })).toHaveValue('original')
    fireEvent.click(prepare)
    await waitFor(() => expect(mocks.prepare).toHaveBeenCalledWith(expect.objectContaining({
      format: 'original', entries: [expect.objectContaining({ text: '', assets: [expect.objectContaining({ url })] })],
    })))
  })
  it('uses a text file by default for a single text result while conversations keep rich export', async () => {
    render(<ShareButton threadId="t" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    await waitFor(() => expect(screen.getByRole('combobox', { name: 'chat:sharing.format' })).toHaveValue('txt'))
  })
  it('shares the clicked result or a deliberate selection rather than other messages', async () => {
    render(<ShareButton threadId="t" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'chat:sharing.prepare' })
      ).not.toBeDisabled()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.prepare' })
    )
    await screen.findByTitle('chat:sharing.preview')
    expect(
      mocks.prepare.mock.calls[0][0].entries.map((e: { id: string }) => e.id)
    ).toEqual(['b'])
    fireEvent.change(
      screen.getByRole('combobox', { name: 'chat:sharing.scope' }),
      { target: { value: 'selection' } }
    )
    fireEvent.click(screen.getByRole('checkbox', { name: /Earlier result/ }))
    fireEvent.click(screen.getByRole('checkbox', { name: /Latest result/ }))
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.prepare' })
    )
    await screen.findByTitle('chat:sharing.preview')
    expect(
      mocks.prepare.mock.calls
        .at(-1)![0]
        .entries.map((e: { id: string }) => e.id)
    ).toEqual(['a'])
  })
  it('keeps failed media exports out of the share/save actions', async () => {
    mocks.prepare.mockRejectedValue(new Error('SHARE_MEDIA_MISSING'))
    render(<ShareButton threadId="t" conversation />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'chat:sharing.prepare' })
      ).not.toBeDisabled()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.prepare' })
    )
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'chat:sharing.failed'
    )
    expect(mocks.system).not.toHaveBeenCalled()
    expect(mocks.save).not.toHaveBeenCalled()
  })
  it('keeps file copy and close usable when the Windows system flyout is unavailable', async () => {
    mocks.canShare = false
    mocks.copyFile.mockResolvedValue(undefined)
    render(<ShareButton threadId="t" conversation />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'chat:sharing.prepare' })
      ).not.toBeDisabled()
    )
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.prepare' })
    )
    await screen.findByTitle('chat:sharing.preview')
    const system = screen.getByRole('button', { name: 'chat:sharing.system' })
    expect(system).toBeDisabled()
    expect(screen.getByText('chat:sharing.fallback')).toBeInTheDocument()
    fireEvent.click(system)
    expect(mocks.system).not.toHaveBeenCalled()
    fireEvent.click(
      screen.getByRole('button', { name: 'chat:sharing.copyFile' })
    )
    await waitFor(() => expect(mocks.copyFile).toHaveBeenCalledTimes(1))
    fireEvent.click(screen.getByRole('button', { name: 'common:close' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    )
  })
  it('releases the controls after a native preparation failure so file copy and closing remain possible', async () => {
    mocks.system.mockRejectedValueOnce(new Error('SHARE_UNSUPPORTED: Windows file preparation timed out'))
    render(<ShareButton threadId="t" conversation />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    const prepare = await screen.findByRole('button', { name: 'chat:sharing.prepare' })
    await waitFor(() => expect(prepare).toBeEnabled())
    fireEvent.click(prepare)
    const system = await screen.findByRole('button', { name: 'chat:sharing.system' })
    fireEvent.click(system)
    expect(await screen.findByRole('alert')).toHaveTextContent('chat:sharing.failed')
    expect(screen.getByRole('button', { name: 'chat:sharing.system' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'chat:sharing.copyFile' })).toBeEnabled()
    fireEvent.click(screen.getByRole('button', { name: 'common:close' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })
  it('removes the modal and pointer lock before opening the native sheet, and keeps it closed on return', async () => {
    mocks.system.mockImplementationOnce(async () => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
      expect(document.body.style.pointerEvents).not.toBe('none')
    })
    render(<ShareButton threadId="t" conversation />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:sharing.share' }))
    const prepare = await screen.findByRole('button', { name: 'chat:sharing.prepare' })
    await waitFor(() => expect(prepare).toBeEnabled())
    fireEvent.click(prepare)
    fireEvent.click(await screen.findByRole('button', { name: 'chat:sharing.system' }))
    await waitFor(() => expect(mocks.system).toHaveBeenCalledOnce())
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(document.body.style.pointerEvents).not.toBe('none')
  })
})
