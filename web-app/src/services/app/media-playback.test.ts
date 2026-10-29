import { afterEach, describe, expect, it, vi } from 'vitest'
import { installExclusiveMediaPlayback } from './media-playback'

afterEach(() => {
  document.body.replaceChildren()
  vi.restoreAllMocks()
})

describe('exclusive audio and video playback', () => {
  it.each([['audio', 'audio'], ['audio', 'video'], ['video', 'audio'], ['video', 'video']])(
    'pauses the current %s when a new %s starts without resetting its position', (oldKind, newKind) => {
      const previous = document.createElement(oldKind) as HTMLMediaElement
      const next = document.createElement(newKind) as HTMLMediaElement
      const idle = document.createElement('audio')
      document.body.append(previous, next, idle)
      previous.currentTime = 12
      Object.defineProperty(previous, 'paused', { value: false })
      Object.defineProperty(next, 'paused', { value: false })
      const pausePrevious = vi.spyOn(previous, 'pause').mockImplementation(() => {})
      const pauseNext = vi.spyOn(next, 'pause').mockImplementation(() => {})
      const pauseIdle = vi.spyOn(idle, 'pause').mockImplementation(() => {})
      const dispose = installExclusiveMediaPlayback()
      try {
        next.dispatchEvent(new Event('play'))
        expect(pausePrevious).toHaveBeenCalledOnce()
        expect(previous.currentTime).toBe(12)
        expect(pauseNext).not.toHaveBeenCalled()
        expect(pauseIdle).not.toHaveBeenCalled()
        dispose()
        next.dispatchEvent(new Event('play'))
        expect(pausePrevious).toHaveBeenCalledOnce()
      } finally {
        dispose()
      }
    }
  )
  it('ignores a queued play event from a player that is already paused', () => {
    const previous = document.createElement('video')
    const paused = document.createElement('audio')
    Object.defineProperty(previous, 'paused', { value: false })
    document.body.append(previous, paused)
    const pause = vi.spyOn(previous, 'pause').mockImplementation(() => {})
    const dispose = installExclusiveMediaPlayback()
    try {
      paused.dispatchEvent(new Event('play'))
      expect(pause).not.toHaveBeenCalled()
    } finally {
      dispose()
    }
  })
})
