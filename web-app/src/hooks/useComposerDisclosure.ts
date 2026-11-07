import { useCallback, useState } from 'react'

export const COMPOSER_COLLAPSED_KEY = 'novera.composer.controlsCollapsed'

// Store only a layout preference, never message text or attachments.
export function useComposerDisclosure() {
  const [collapsed, updateCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(COMPOSER_COLLAPSED_KEY)
      if (saved === 'true' || saved === 'false') return saved === 'true'
    } catch {
      // Storage can be unavailable in private/restricted webviews.
    }
    return false
  })

  const setCollapsed = useCallback((value: boolean) => {
    updateCollapsed(value)
    try {
      localStorage.setItem(COMPOSER_COLLAPSED_KEY, String(value))
    } catch {
      // Folding still works for the current mounted surface.
    }
  }, [])

  return [collapsed, setCollapsed] as const
}
