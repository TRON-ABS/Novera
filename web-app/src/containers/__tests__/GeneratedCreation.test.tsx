import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GeneratedCreation } from '../GeneratedCreation'
import { useCreation } from '@/hooks/useCreation'
import { usePrompt } from '@/hooks/usePrompt'
const mocks = vi.hoisted(() => ({ invoke: vi.fn(), reveal: vi.fn() }))
vi.mock('@/hooks/useServiceHub', () => {
  const service = {
    core: () => ({
      invoke: mocks.invoke,
      convertFileSrc: (path: string) => 'asset:' + path,
    }),
    opener: () => ({ revealItemInDir: mocks.reveal }),
  }
  return { useServiceHub: () => service }
})
vi.mock('@/i18n/react-i18next-compat', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@/lib/backendStorage', () => ({
  backendStorage: {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  },
}))
const reference =
  'novera-creation:image/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png'
describe('saved creation in the conversation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useCreation.setState({ modes: {}, sources: {}, progress: {} })
    mocks.invoke.mockResolvedValue('C:/Pictures/Novera image/test.png')
  })
  it('resolves a saved file, reveals it, and prepares a variant in the same thread', async () => {
    render(<GeneratedCreation url={reference} threadId="thread1" />)
    await waitFor(() =>
      expect(screen.getByRole('img')).toHaveAttribute(
        'src',
        'asset:C:/Pictures/Novera image/test.png'
      )
    )
    fireEvent.click(screen.getByText('chat:creation.openFolder'))
    expect(mocks.reveal).toHaveBeenCalledWith(
      'C:/Pictures/Novera image/test.png'
    )
    fireEvent.click(screen.getByText('chat:creation.variant'))
    expect(useCreation.getState().modes.thread1).toBe('image')
    expect(useCreation.getState().sources.thread1).toBe(reference)
    expect(usePrompt.getState().prompt).toBe('chat:creation.variantPrompt')
    fireEvent.click(screen.getByText('chat:creation.video'))
    expect(useCreation.getState().modes.thread1).toBe('video')
    expect(useCreation.getState().sources.thread1).toBe(reference)
    expect(usePrompt.getState().prompt).toBe('chat:creation.animatePrompt')
  })
  it('keeps a missing file explicit without pretending an output exists', async () => {
    mocks.invoke.mockRejectedValue(new Error('Missing'))
    render(<GeneratedCreation url={reference} threadId="thread2" />)
    await screen.findByText('chat:creation.missing')
    expect(screen.getByText('chat:creation.openFolder')).toBeDisabled()
  })
  it.each(['image', 'video'] as const)(
    'shows persisted total and measured generation time below a %s',
    async (task) => {
      const url =
        task === 'image'
          ? reference
          : reference.replace('image/', 'video/').replace('.png', '.mp4')
      const timing = JSON.parse(
        JSON.stringify({ totalMs: 65000, generationMs: 2500 })
      )
      const { container } = render(
        <GeneratedCreation url={url} timing={timing} />
      )
      const caption = container.querySelector('figcaption')!
      expect(caption).toHaveTextContent('chat:creation.totalTime: 1 min 5 sec')
      expect(caption).toHaveTextContent('chat:creation.generationTime: 2.5 sec')
      await waitFor(() =>
        expect(screen.getByText('chat:creation.openFolder')).toBeEnabled()
      )
      if (task === 'video')
        expect(container.querySelector('video')).toHaveAttribute('controls')
    }
  )
  it('does not invent timings for older or malformed creations', async () => {
    render(<GeneratedCreation url={reference} timing={{ totalMs: Infinity }} />)
    expect(
      screen.queryByText(/chat:creation.totalTime/)
    ).not.toBeInTheDocument()
    await waitFor(() =>
      expect(screen.getByText('chat:creation.openFolder')).toBeEnabled()
    )
  })
})
