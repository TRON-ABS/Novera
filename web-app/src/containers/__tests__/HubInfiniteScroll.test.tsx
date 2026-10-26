import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { HubInfiniteScroll } from '../HubInfiniteScroll'

vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
const observers: { notify: (visible: boolean) => void; disconnect: ReturnType<typeof vi.fn>; options?: IntersectionObserverInit }[] = []
beforeEach(() => {
  observers.length = 0
  vi.stubGlobal('IntersectionObserver', class {
    disconnect = vi.fn()
    observe = vi.fn()
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      observers.push({ notify: visible => callback([{ isIntersecting: visible } as IntersectionObserverEntry], this as unknown as IntersectionObserver), disconnect: this.disconnect, options })
    }
  })
})
afterEach(() => vi.unstubAllGlobals())
const root = { current: document.createElement('div') }

describe('Hub progressive scrolling', () => {
  it('loads near the bottom once per page without a Next button', () => {
    const load = vi.fn()
    const { rerender } = render(<HubInfiniteScroll root={root} pageKey="image:1" hasMore loading={false} paused={false} onLoadMore={load} />)
    expect(screen.queryByRole('button')).toBeNull()
    expect(observers[0].options).toMatchObject({ root: root.current, rootMargin: '0px 0px 400px 0px' })
    act(() => observers[0].notify(false))
    expect(load).not.toHaveBeenCalled()
    act(() => { observers[0].notify(true); observers[0].notify(true) })
    expect(load).toHaveBeenCalledTimes(1)
    rerender(<HubInfiniteScroll root={root} pageKey="image:2" hasMore loading={false} paused={false} onLoadMore={load} />)
    act(() => observers[1].notify(true))
    expect(load).toHaveBeenCalledTimes(2)
  })
  it('ignores old observers after a category change and uses the new request', () => {
    const image = vi.fn(), video = vi.fn()
    const { rerender, unmount } = render(<HubInfiniteScroll root={root} pageKey="image:1" hasMore loading={false} paused={false} onLoadMore={image} />)
    rerender(<HubInfiniteScroll root={root} pageKey="video:1" hasMore loading={false} paused={false} onLoadMore={video} />)
    expect(observers[0].disconnect).toHaveBeenCalled()
    act(() => observers[0].notify(true))
    expect(image).not.toHaveBeenCalled()
    expect(video).not.toHaveBeenCalled()
    act(() => observers[1].notify(true))
    expect(video).toHaveBeenCalledTimes(1)
    unmount()
    expect(observers[1].disconnect).toHaveBeenCalled()
  })
  it('waits during loading, pauses on errors and stops at the end', () => {
    const load = vi.fn()
    const { rerender } = render(<HubInfiniteScroll root={root} pageKey="text:1" hasMore loading paused={false} onLoadMore={load} />)
    expect(screen.getByRole('status')).toHaveTextContent('hub:loadingModels')
    expect(observers).toHaveLength(0)
    rerender(<HubInfiniteScroll root={root} pageKey="text:1" hasMore loading={false} paused onLoadMore={load} />)
    expect(observers).toHaveLength(0)
    rerender(<HubInfiniteScroll root={root} pageKey="text:1" hasMore={false} loading={false} paused={false} onLoadMore={load} />)
    expect(observers).toHaveLength(0)
    expect(screen.queryByRole('status')).toBeNull()
    expect(load).not.toHaveBeenCalled()
  })
})
