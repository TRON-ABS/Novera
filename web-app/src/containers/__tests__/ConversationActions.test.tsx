import { act, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, expect, it, vi } from 'vitest'
import { ConversationActions } from '../ConversationActions'
const mock = vi.hoisted(() => ({
  remove: vi.fn(),
  drain: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  setPrompt: vi.fn(),
  resetHistory: vi.fn(),
  clearQueue: vi.fn(),
  clearAttachments: vi.fn(),
  setMessages: vi.fn(),
  reset: vi.fn(),
  save: vi.fn(),
  print: vi.fn(),
  fetch: vi.fn(),
  subscriber: undefined as undefined | ((state: any, previous: any) => void),
  current: 't' as string | undefined,
  messages: {} as Record<string, unknown[]>,
}))
vi.mock('@tanstack/react-router', () => ({ useNavigate: () => vi.fn() }))
vi.mock('sonner', () => ({
  toast: { error: mock.error, success: mock.success },
}))
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/hooks/useServiceHub', () => ({
  useServiceHub: () => ({
    messages: () => ({ fetchMessages: mock.fetch }),
    dialog: () => ({}),
    core: () => ({}),
  }),
}))
vi.mock('@/hooks/useThreads', () => ({
  useThreads: {
    getState: () => ({
      currentThreadId: mock.current,
      deleteThread: mock.remove,
    }),
    subscribe: (callback: typeof mock.subscriber) => {
      mock.subscriber = callback
      return () => {
        mock.subscriber = undefined
      }
    },
  },
}))
vi.mock('@/hooks/useMessages', () => ({
  useMessages: {
    getState: () => ({ messages: mock.messages }),
    setState: mock.setMessages,
  },
  waitForThreadMessageWrites: mock.drain,
}))
vi.mock('@/hooks/usePrompt', () => ({
  usePrompt: {
    getState: () => ({
      setPrompt: mock.setPrompt,
      resetHistoryNavigation: mock.resetHistory,
    }),
  },
}))
vi.mock('@/stores/message-queue-store', () => ({
  useMessageQueue: { getState: () => ({ clearQueue: mock.clearQueue }) },
}))
vi.mock('@/hooks/useChatAttachments', () => ({
  NEW_THREAD_ATTACHMENT_KEY: '__new-thread__',
  useChatAttachments: {
    getState: () => ({ clearAttachments: mock.clearAttachments }),
  },
}))
vi.mock('@/adapters/platform/conversation-files', () => ({
  saveConversationFile: mock.save,
  printConversation: mock.print,
}))
const thread = { id: 't', title: 'Test', updated: 1 }
const renderActions = (busy = false) =>
  render(
    <ConversationActions thread={thread} busy={busy} onReset={mock.reset} />
  )
const confirm = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'common:deleteThread' }))
  await act(async () =>
    fireEvent.click(screen.getByTestId('confirm-delete-thread'))
  )
}
beforeEach(() => {
  vi.clearAllMocks()
  localStorage.clear()
  mock.current = 't'
  mock.messages = { t: [] }
  mock.remove.mockResolvedValue(undefined)
  mock.drain.mockResolvedValue(undefined)
  mock.save.mockResolvedValue(true)
})
it('places share and save before trash and disables them during generation', () => {
  renderActions(true)
  const buttons = screen.getAllByRole('button')
  expect(buttons.map((b) => b.getAttribute('aria-label'))).toEqual([
    'chat:sharing.share',
    'common:save',
    'common:deleteThread',
  ])
  expect(buttons.every((b) => b.hasAttribute('disabled'))).toBe(true)
})
it('keeps empty-home actions disabled', () => {
  render(<ConversationActions busy={false} onReset={mock.reset} />)
  expect(screen.getByRole('button', { name: 'common:save' })).toBeDisabled()
  expect(
    screen.getByRole('button', { name: 'common:deleteThread' })
  ).toBeDisabled()
})
it('closes the save menu on an outside click even if the composer consumes the event', async () => {
  const outside = vi.fn()
  render(
    <>
      <ConversationActions thread={thread} busy={false} onReset={mock.reset} />
      <button
        onPointerDown={(event) => {
          event.stopPropagation()
          outside()
        }}
      >
        Outside
      </button>
    </>
  )
  fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
    key: 'ArrowDown',
  })
  expect(
    await screen.findByRole('menuitem', { name: 'TXT (.txt)' })
  ).toBeInTheDocument()
  fireEvent.pointerDown(screen.getByRole('button', { name: 'Outside' }))
  await waitFor(() =>
    expect(
      screen.queryByRole('menuitem', { name: 'TXT (.txt)' })
    ).not.toBeInTheDocument()
  )
  expect(outside).toHaveBeenCalledOnce()
  expect(mock.save).not.toHaveBeenCalled()
})
it('closes the save menu when focus moves to another interface control', async () => {
  render(
    <>
      <ConversationActions thread={thread} busy={false} onReset={mock.reset} />
      <input aria-label="Other field" />
    </>
  )
  fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
    key: 'ArrowDown',
  })
  await screen.findByRole('menuitem', { name: 'TXT (.txt)' })
  fireEvent.focusIn(screen.getByRole('textbox', { name: 'Other field' }))
  await waitFor(() =>
    expect(
      screen.queryByRole('menuitem', { name: 'TXT (.txt)' })
    ).not.toBeInTheDocument()
  )
})
it('requires confirmation and allows cancellation without deleting', () => {
  renderActions()
  fireEvent.click(screen.getByRole('button', { name: 'common:deleteThread' }))
  expect(mock.remove).not.toHaveBeenCalled()
  fireEvent.click(screen.getByRole('button', { name: 'common:cancel' }))
  expect(mock.remove).not.toHaveBeenCalled()
  expect(mock.reset).not.toHaveBeenCalled()
})
it('awaits persistence and backend deletion before clearing the current conversation', async () => {
  let finish!: () => void
  mock.remove.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve
      })
  )
  renderActions()
  await confirm()
  expect(mock.drain).toHaveBeenCalledWith('t')
  expect(mock.remove).toHaveBeenCalledWith('t')
  expect(mock.reset).not.toHaveBeenCalled()
  expect(mock.clearQueue).not.toHaveBeenCalled()
  await act(async () => finish())
  expect(mock.clearQueue).toHaveBeenCalledWith('t')
  expect(mock.clearAttachments).toHaveBeenCalledWith('t')
  expect(mock.setPrompt).toHaveBeenCalledWith('')
  expect(mock.resetHistory).toHaveBeenCalledOnce()
  expect(mock.reset).toHaveBeenCalledOnce()
  const update = mock.setMessages.mock.calls[0][0]
  expect(update({ messages: { t: [1], other: [2] } })).toEqual({
    messages: { other: [2] },
  })
})
it('retains the conversation and draft when deletion fails', async () => {
  mock.remove.mockRejectedValueOnce(new Error('Permission denied'))
  renderActions()
  await confirm()
  expect(mock.error).toHaveBeenCalled()
  expect(mock.clearQueue).not.toHaveBeenCalled()
  expect(mock.setPrompt).not.toHaveBeenCalled()
  expect(mock.reset).not.toHaveBeenCalled()
  expect(screen.getByTestId('confirm-delete-thread')).toBeEnabled()
})
it('does not reset another conversation selected while deletion is pending', async () => {
  mock.remove.mockImplementationOnce(async () => {
    mock.current = 'other'
  })
  renderActions()
  await confirm()
  expect(mock.reset).not.toHaveBeenCalled()
  expect(mock.setPrompt).not.toHaveBeenCalled()
})
it('preserves the setup discussion until onboarding is complete', () => {
  render(
    <ConversationActions
      thread={{ ...thread, title: 'What is Novera?' }}
      busy={false}
      onReset={mock.reset}
    />
  )
  expect(
    screen.getByRole('button', { name: 'common:deleteThread' })
  ).toBeDisabled()
})
it('exports a snapshot of the selected discussion through the save menu', async () => {
  renderActions()
  fireEvent.pointerDown(screen.getByRole('button', { name: 'common:save' }), {
    button: 0,
    ctrlKey: false,
  })
  // Radix also opens via keyboard, including in browsers without PointerEvent.
  if (!screen.queryByRole('menuitem', { name: 'JSON (.json)' }))
    fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
      key: 'ArrowDown',
    })
  fireEvent.click(await screen.findByRole('menuitem', { name: 'JSON (.json)' }))
  await waitFor(() => expect(mock.save).toHaveBeenCalledOnce())
  expect(JSON.parse(mock.save.mock.calls[0][0].content).thread.id).toBe('t')
})

it('surfaces export errors without deleting or resetting anything', async () => {
  mock.save.mockRejectedValueOnce(new Error('disk full'))
  renderActions()
  fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
    key: 'ArrowDown',
  })
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'Markdown (.md)' })
  )
  await waitFor(() => expect(mock.error).toHaveBeenCalled())
  expect(mock.reset).not.toHaveBeenCalled()
  expect(mock.remove).not.toHaveBeenCalled()
})
it('loads messages from storage when they are not cached', async () => {
  mock.messages = {}
  mock.fetch.mockResolvedValueOnce([])
  renderActions()
  fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
    key: 'ArrowDown',
  })
  fireEvent.click(await screen.findByRole('menuitem', { name: 'JSON (.json)' }))
  await waitFor(() => expect(mock.save).toHaveBeenCalled())
  expect(mock.fetch).toHaveBeenCalledWith('t')
})
it('routes the PDF item to the print dialog rather than writing a false PDF file', async () => {
  renderActions()
  fireEvent.keyDown(screen.getByRole('button', { name: 'common:save' }), {
    key: 'ArrowDown',
  })
  fireEvent.click(
    await screen.findByRole('menuitem', { name: 'common:composer.printPdf' })
  )
  await waitFor(() => expect(mock.print).toHaveBeenCalledOnce())
  expect(mock.print.mock.calls[0][0]).toContain('<!doctype html>')
  expect(mock.save).not.toHaveBeenCalled()
})

it('preserves a new home draft when the user navigated home while deletion was pending', async () => {
  mock.remove.mockImplementationOnce(async () => {
    mock.current = undefined
    mock.subscriber?.(
      { currentThreadId: undefined, threads: { t: thread } },
      { currentThreadId: 't' }
    )
  })
  renderActions()
  await confirm()
  expect(mock.reset).not.toHaveBeenCalled()
  expect(mock.setPrompt).not.toHaveBeenCalled()
})
