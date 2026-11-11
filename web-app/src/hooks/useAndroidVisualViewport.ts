import { useLayoutEffect, useRef } from 'react'

export const androidViewportEvent = 'novera-android-viewport'

export function getAndroidVisibleHeight() {
  const viewport = window.visualViewport
  const browserHeight = viewport?.scale === 1 && viewport.height > 0
    ? viewport.height
    : window.innerHeight
  const nativeHeight = (window as Window & { __noveraAndroidVisibleHeight?: number })
    .__noveraAndroidVisibleHeight
  return nativeHeight && nativeHeight > 0 ? Math.min(browserHeight, nativeHeight) : browserHeight
}

export function useAndroidVisualViewport() {
  const workspace = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = workspace.current
    const viewport = window.visualViewport
    if (!IS_ANDROID || !root) return

    const resize = () => {
      const height = Math.floor(getAndroidVisibleHeight()) + 'px'
      root.style.height = height
      root.style.setProperty('--novera-visual-height', height)
    }

    resize()
    viewport?.addEventListener('resize', resize)
    window.addEventListener('resize', resize)
    window.addEventListener(androidViewportEvent, resize)
    return () => {
      viewport?.removeEventListener('resize', resize)
      window.removeEventListener('resize', resize)
      window.removeEventListener(androidViewportEvent, resize)
      root.style.removeProperty('height')
      root.style.removeProperty('--novera-visual-height')
    }
  }, [])
  return workspace
}
