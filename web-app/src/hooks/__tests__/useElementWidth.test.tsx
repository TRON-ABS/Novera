import { act, render } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import { useLayoutEffect } from 'react'
import { useElementWidth } from '../useElementWidth'

it('measures before the first paint and follows width changes without remounting', () => {
  let width = 420
  let notify: ResizeObserverCallback = () => {}
  const disconnect = vi.fn()
  const observer = globalThis.ResizeObserver
  globalThis.ResizeObserver = class {
    constructor(callback: ResizeObserverCallback) { notify = callback }
    observe = vi.fn()
    unobserve = vi.fn()
    disconnect = disconnect
  } as unknown as typeof ResizeObserver
  const bounds = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(() => ({ width }) as DOMRect)
  const beforePaint: (number | null)[] = []
  function Probe() {
    const [ref, measured] = useElementWidth<HTMLDivElement>()
    useLayoutEffect(() => { beforePaint.push(measured) }, [measured])
    return <div ref={ref} data-width={measured ?? ''} />
  }
  try {
    const view = render(<Probe />)
    expect(beforePaint.at(-1)).toBe(420)
    const element = view.container.firstElementChild
    width = 900
    act(() => notify([], {} as ResizeObserver))
    expect(view.container.firstElementChild).toBe(element)
    expect(element).toHaveAttribute('data-width', '900')
    view.unmount()
    expect(disconnect).toHaveBeenCalledTimes(1)
  } finally { bounds.mockRestore(); globalThis.ResizeObserver = observer }
})
