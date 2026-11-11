import { useLayoutEffect, useRef } from 'react'

export function useAndroidVisualViewport() {
  const workspace = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const root = workspace.current
    const viewport = window.visualViewport
    if (!IS_ANDROID || !root || !viewport) return

    const resize = () => {
      if (viewport.scale !== 1 || viewport.height <= 0) return
      const height = Math.floor(viewport.height) + 'px'
      root.style.height = height
      root.style.setProperty('--novera-visual-height', height)
    }

    resize()
    viewport.addEventListener('resize', resize)
    return () => {
      viewport.removeEventListener('resize', resize)
      root.style.removeProperty('height')
      root.style.removeProperty('--novera-visual-height')
    }
  }, [])
  return workspace
}
