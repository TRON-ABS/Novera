import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Tracks the rendered width of an element via ResizeObserver. `width` is null
 * until the first measurement, and 0 in environments without layout (jsdom),
 * so callers gate responsive collapse on a positive value.
 */
export function useElementWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState<number | null>(null)

  // Measure before paint so remounting on a thread does not briefly show the
  // wide toolbar and then collapse it, changing the entire composer's height.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setWidth(el.getBoundingClientRect().width)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, width] as const
}
