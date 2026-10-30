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
  it('resolves music as a persistent creation and displays a full-width audio player',async()=>{
    const music=reference.replace('image/','music/').replace('.png','.wav')
    mocks.invoke.mockResolvedValue('C:/Music/Novera musique/test.wav')
    const {container}=render(<GeneratedCreation url={music} threadId="music-thread"/>)
    await waitFor(()=>expect(container.querySelector('audio')).toHaveAttribute('src','asset:C:/Music/Novera musique/test.wav'))
    expect(container.querySelector('audio')).not.toHaveAttribute('controls')
    expect(screen.getByRole('button', { name: 'chat:player.play' })).toBeEnabled()
    expect(container.querySelector('audio')).toHaveClass('w-full')
    expect(container.querySelector('video')).not.toBeInTheDocument()
  })
  it('fits videos to available space and offers a larger responsive player', async () => {
    const video = reference.replace('image/', 'video/').replace('.png', '.mp4')
    const { container } = render(<GeneratedCreation url={video} threadId="video-thread" />)
    await waitFor(() => expect(container.querySelector('video')).toBeInTheDocument())
    expect(container.querySelector('video')).toHaveClass('w-full', 'h-auto', 'object-contain', 'max-h-[75dvh]')
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.expand' }))
    expect(screen.getByRole('dialog').querySelector('video')).toHaveClass('w-full', 'max-h-[80dvh]', 'object-contain')
  })
  beforeEach(() => {
    vi.clearAllMocks()
    useCreation.setState({ modes: {}, sources: {}, progress: {}, videoSettings: undefined })
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
  it('keeps the filename in the player header and puts timing immediately after the variant action', async () => {
    const { container } = render(
      <GeneratedCreation url={reference} threadId="compact" timing={{ totalMs: 38000 }} />
    )
    await waitFor(() => expect(screen.getByText('chat:creation.variant')).toBeEnabled())
    const filename = 'Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.png'
    expect(screen.getAllByText(filename)).toHaveLength(1)
    expect(container.querySelector('figcaption')).not.toHaveTextContent(filename)
    const variant = screen.getByText('chat:creation.variant')
    const timing = screen.getByText(/chat:creation.totalTime/).parentElement!
    expect(variant.nextElementSibling).toBe(timing)
    expect(timing.parentElement).toBe(variant.parentElement)
    expect(timing).toHaveTextContent('38 sec')
  })
  it('keeps image variants available without offering image animation through the text-only Q4 video pack', async () => {
    useCreation.getState().setVideoSettings({ videoEngine: 'sdcpp', videoModel: 'D:/wan.gguf' })
    render(<GeneratedCreation url={reference} threadId="q4" />)
    await waitFor(() => expect(screen.getByText('chat:creation.variant')).toBeEnabled())
    expect(screen.queryByText('chat:creation.video')).not.toBeInTheDocument()
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
        expect(container.querySelector('video')).not.toHaveAttribute('controls')
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
  it('recovers recorded timings from an older creation sidecar after restart', async () => {
    mocks.invoke.mockImplementation(async command => command === 'creation_info'
      ? { totalMs: 36000, generationMs: 30000, seed: 42 }
      : 'C:/Pictures/Novera image/test.png')
    const { container } = render(<GeneratedCreation url={reference} />)
    await waitFor(() => expect(container.querySelector('figcaption')).toHaveTextContent('chat:creation.totalTime: 36 sec'))
    expect(container.querySelector('figcaption')).toHaveTextContent('chat:creation.generationTime: 30 sec')
  })
  it('uses exact saved conversation timings before falling back to older engine records', async () => {
    render(<GeneratedCreation url={reference} timing={{ totalMs: 40000 }} />)
    await waitFor(() => expect(screen.getByText('chat:creation.openFolder')).toBeEnabled())
    expect(mocks.invoke).not.toHaveBeenCalledWith('creation_info', expect.anything())
    expect(screen.getByText(/chat:creation.totalTime/)).toHaveTextContent('40 sec')
  })
})
