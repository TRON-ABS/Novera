import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { MediaPlayer } from '../MediaPlayer'
import { installExclusiveMediaPlayback } from '@/services/app/media-playback'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: true })
    this.dispatchEvent(new Event('pause'))
  })
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockImplementation(async function (this: HTMLMediaElement) {
    Object.defineProperty(this, 'paused', { configurable: true, value: false })
    this.dispatchEvent(new Event('play'))
    this.dispatchEvent(new Event('playing'))
  })
})
afterEach(() => { cleanup(); vi.restoreAllMocks() })

describe('Novera media controls', () => {
  it.each(['music', 'video'] as const)('controls %s without exposing the system toolbar', async (kind) => {
    const { container } = render(<MediaPlayer src="asset:test" kind={kind} />)
    const element = container.querySelector('audio,video') as HTMLMediaElement
    expect(element).not.toHaveAttribute('controls')
    expect(element).not.toHaveAttribute('autoplay')
    expect(screen.queryByRole('combobox', { name: 'chat:player.speed' })).not.toBeInTheDocument()
    expect(element.playbackRate).toBe(1)
    if (kind === 'video') expect(element).toHaveAttribute('playsinline')
    fireEvent.click(screen.getByRole('button', { name: 'chat:player.play' }))
    await waitFor(() => expect(screen.getByRole('button', { name: 'chat:player.pause' })).toBeEnabled())
    fireEvent.click(screen.getByRole('button', { name: 'chat:player.pause' }))
    expect(element.pause).toHaveBeenCalledOnce()
    expect(screen.getByRole('button', { name: 'chat:player.play' })).toBeEnabled()
  })
  it('does not claim playback started if the browser refuses play', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new DOMException('Blocked', 'NotAllowedError'))
    render(<MediaPlayer src="asset:test" kind="music" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:player.play' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('common:preview.unsupported')
    expect(screen.getByRole('button', { name: 'chat:player.play' })).toBeEnabled()
  })
  it('seeks only after metadata provides a finite duration, and reflects external media events', () => {
    const { container } = render(<MediaPlayer src="asset:test" kind="music" />)
    const element = container.querySelector('audio')!
    const seek = screen.getByRole('slider', { name: 'chat:player.seek' })
    expect(seek).toBeDisabled()
    Object.defineProperty(element, 'duration', { configurable: true, value: Infinity })
    fireEvent.durationChange(element)
    expect(seek).toBeDisabled()
    Object.defineProperty(element, 'duration', { configurable: true, value: 360 })
    fireEvent.loadedMetadata(element)
    expect(seek).toBeEnabled()
    fireEvent.change(seek, { target: { value: '97' } })
    expect(element.currentTime).toBe(97)
    expect(seek).toHaveAttribute('aria-valuetext', '1:37 / 6:00')
    element.currentTime = 240
    fireEvent.timeUpdate(element)
    expect(seek).toHaveValue('240')
  })
  it('sets volume and mute on the actual media element', () => {
    const { container } = render(<MediaPlayer src="asset:test" kind="music" />)
    const element = container.querySelector('audio')!
    fireEvent.change(screen.getByRole('slider', { name: 'chat:player.volume' }), { target: { value: '0.4' } })
    expect(element.volume).toBe(0.4)
    fireEvent.click(screen.getByRole('button', { name: 'chat:player.mute' }))
    expect(element.muted).toBe(true)
    fireEvent.volumeChange(element)
    expect(screen.getByRole('button', { name: 'chat:player.mute' })).toHaveAttribute('aria-pressed', 'true')
  })
  it('stops the old source and resets controls when its URL changes', async () => {
    const { container, rerender } = render(<MediaPlayer src="asset:first" kind="music" />)
    const first = container.querySelector('audio')!
    fireEvent.click(screen.getByRole('button', { name: 'chat:player.play' }))
    await waitFor(() => expect(first.paused).toBe(false))
    rerender(<MediaPlayer src="asset:second" kind="music" />)
    expect(first.pause).toHaveBeenCalled()
    expect(first.paused).toBe(true)
    expect(container.querySelector('audio')).toHaveAttribute('src', 'asset:second')
    expect(screen.getByRole('button', { name: 'chat:player.play' })).toBeEnabled()
    expect(screen.getByRole('slider', { name: 'chat:player.seek' })).toBeDisabled()
  })
  it('uses native iPhone fullscreen when standard fullscreen is unavailable', () => {
    const { container } = render(<MediaPlayer src="asset:test" kind="video" />)
    const element = container.querySelector('video')! as HTMLVideoElement & { webkitEnterFullscreen: () => void }
    element.webkitEnterFullscreen = vi.fn()
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.expand' }))
    expect(element.webkitEnterFullscreen).toHaveBeenCalledOnce()
  })
  it('expands in-app if fullscreen is unavailable, and Escape closes the fallback', () => {
    const { container } = render(<MediaPlayer src="asset:test" kind="video" />)
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.expand' }))
    expect(container.firstChild).toHaveClass('novera-media-expanded')
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(container.firstChild).not.toHaveClass('novera-media-expanded')
  })
  it('recovers from a fullscreen API rejection without leaving a broken control', async () => {
    const { container } = render(<MediaPlayer src="asset:test" kind="video" />)
    const root = container.firstChild as HTMLElement
    root.requestFullscreen = vi.fn().mockRejectedValue(new Error('Denied'))
    fireEvent.click(screen.getByRole('button', { name: 'chat:creation.expand' }))
    await waitFor(() => expect(root).toHaveClass('novera-media-expanded'))
  })
  it('zooms an image and restores its fitted view', () => {
    render(<MediaPlayer src="asset:picture" kind="image" name="Photo.png" />)
    fireEvent.click(screen.getByRole('button', { name: 'settings:shortcuts.zoomIn' }))
    expect(screen.getByRole('img')).toHaveStyle({ width: '125%' })
    fireEvent.click(screen.getByRole('button', { name: 'common:reset' }))
    expect(screen.getByRole('img')).toHaveStyle({ width: '100%' })
  })
  it('allows only one custom player to play, including a video beside music', async () => {
    const dispose = installExclusiveMediaPlayback()
    const { container } = render(<><MediaPlayer src="asset:audio" kind="music" /><MediaPlayer src="asset:video" kind="video" /></>)
    try {
      const [audio, video] = container.querySelectorAll('audio,video') as NodeListOf<HTMLMediaElement>
      const buttons = screen.getAllByRole('button', { name: 'chat:player.play' })
      await act(async () => { fireEvent.click(buttons[0]) })
      expect(audio.paused).toBe(false)
      await act(async () => { fireEvent.click(buttons[1]) })
      expect(audio.paused).toBe(true)
      expect(video.paused).toBe(false)
      expect(screen.getAllByRole('button', { name: 'chat:player.pause' })).toHaveLength(1)
    } finally { dispose() }
  })
})
