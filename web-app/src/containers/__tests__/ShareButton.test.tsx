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
  canSystemShare: () => true,
}))
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
})
