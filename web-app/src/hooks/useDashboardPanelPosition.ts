import { useLayoutEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDashboardPanel } from './useDashboardPanel'

/** Keep the window entirely above the live composer, including after resize/scroll. */
export function useDashboardPanelPosition(enabled: boolean): CSSProperties {
  const anchor = useDashboardPanel(state => enabled ? state.anchor : null)
  const [style, setStyle] = useState<CSSProperties>({})
  useLayoutEffect(() => {
    if (!enabled) return
    let target: HTMLElement | undefined
    const apply = (next: CSSProperties) => setStyle(previous =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    const update = () => {
      const next = anchor?.isConnected ? anchor : Array.from(
        document.querySelectorAll<HTMLElement>('[data-dashboard-composer]')
      ).find(element => element.getBoundingClientRect().height > 0)
      if (target !== next) {
        observer.disconnect()
        target = next
        if (target) observer.observe(target)
      }
      if (!target?.isConnected) {
        apply({ left: '1rem', right: '1rem', top: '4rem', maxHeight: 'calc(100dvh - 5rem)' })
        return
      }
      const rect = target.getBoundingClientRect()
      const viewport = window.visualViewport
      const viewportTop = viewport?.offsetTop ?? 0
      const viewportLeft = viewport?.offsetLeft ?? 0
      const viewportWidth = viewport?.width ?? window.innerWidth
      const width = Math.min(rect.width, viewportWidth - 16)
      apply({
        left: Math.max(viewportLeft + 8, Math.min(rect.left, viewportLeft + viewportWidth - width - 8)),
        width,
        bottom: window.innerHeight - rect.top + 8,
        maxHeight: Math.max(0, rect.top - viewportTop - 16),
      })
    }
    const observer = new ResizeObserver(update)
    const mounts = new MutationObserver(update)
    mounts.observe(document.body, { subtree: true, childList: true })
    update()
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      observer.disconnect()
      mounts.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [enabled, anchor])
  return style
}
