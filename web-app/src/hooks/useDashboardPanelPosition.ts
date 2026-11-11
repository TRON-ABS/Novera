import { useLayoutEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useDashboardPanel } from './useDashboardPanel'
import { androidViewportEvent, getAndroidVisibleHeight } from './useAndroidVisualViewport'

/** Use the composer stack, with a fixed fallback when the stack is absent. */
export function useDashboardPanelPosition(enabled: boolean, positioningStack = false) {
  const anchor = useDashboardPanel(state => enabled ? state.anchor : null)
  const [style, setStyle] = useState<CSSProperties>({})
  const [container, setContainer] = useState<HTMLElement | null>(null)
  useLayoutEffect(() => {
    if (!enabled) return
    let target: HTMLElement | undefined
    const apply = (next: CSSProperties) => setStyle(previous =>
      JSON.stringify(previous) === JSON.stringify(next) ? previous : next)
    const update = () => {
      const next = anchor?.isConnected ? anchor : Array.from(
        document.querySelectorAll<HTMLElement>('[data-dashboard-composer]')
      ).find(element => element.getBoundingClientRect().height > 0)
      const host = positioningStack ? null : next?.querySelector<HTMLElement>('[data-dashboard-stack]') ?? null
      setContainer(host)
      if (target !== next) {
        observer?.disconnect()
        target = next
        if (target && !host) observer?.observe(target)
      }
      if (host) return
      const android = typeof IS_ANDROID !== 'undefined' && IS_ANDROID
      const viewport = window.visualViewport
      const viewportTop = viewport?.offsetTop ?? 0
      const viewportHeight = android ? getAndroidVisibleHeight() : viewport?.height ?? window.innerHeight
      if (!target?.isConnected) {
        apply({
          left: '1rem', right: '1rem',
          ...(android
            ? { top: viewportTop + 8, maxHeight: Math.max(0, viewportHeight - 16) }
            : { top: '4rem', maxHeight: 'calc(100dvh - 5rem)' }),
        })
        return
      }
      const input = positioningStack ? target.querySelector<HTMLElement>('[data-dashboard-input]') : null
      const rect = (input ?? target).getBoundingClientRect()
      const viewportLeft = viewport?.offsetLeft ?? 0
      const viewportWidth = viewport?.width ?? window.innerWidth
      const width = Math.min(rect.width, viewportWidth - 16)
      const composerTop = android ? Math.min(rect.top, viewportTop + viewportHeight) : rect.top
      const availableAboveComposer = Math.max(0, composerTop - viewportTop - 16)
      const useViewport = android && availableAboveComposer < 112
      apply({
        left: Math.max(viewportLeft + 8, Math.min(rect.left, viewportLeft + viewportWidth - width - 8)),
        width,
        ...(useViewport
          ? { top: viewportTop + 8, maxHeight: Math.max(0, viewportHeight - 16) }
          : { bottom: window.innerHeight - composerTop + 8, maxHeight: availableAboveComposer }),
      })
    }
    const observer = typeof ResizeObserver === 'undefined' ? undefined : new ResizeObserver(update)
    const mounts = new MutationObserver(update)
    mounts.observe(document.body, { subtree: true, childList: true })
    update()
    window.addEventListener('resize', update)
    window.addEventListener(androidViewportEvent, update)
    window.addEventListener('scroll', update, true)
    window.visualViewport?.addEventListener('resize', update)
    window.visualViewport?.addEventListener('scroll', update)
    return () => {
      observer?.disconnect()
      mounts.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener(androidViewportEvent, update)
      window.removeEventListener('scroll', update, true)
      window.visualViewport?.removeEventListener('resize', update)
      window.visualViewport?.removeEventListener('scroll', update)
    }
  }, [enabled, anchor, positioningStack])
  return { style, container: enabled ? container : null }
}
