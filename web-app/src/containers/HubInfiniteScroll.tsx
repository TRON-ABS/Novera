import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from '@/i18n/react-i18next-compat'

/** Observe the end of the virtual list inside the Hub's own scroll viewport. */
export function HubInfiniteScroll({ root, pageKey, hasMore, loading, paused, onLoadMore }: {
  root: RefObject<HTMLDivElement | null>
  pageKey: string
  hasMore: boolean
  loading: boolean
  paused: boolean
  onLoadMore: () => unknown
}) {
  const { t } = useTranslation()
  const sentinel = useRef<HTMLDivElement>(null)
  const requested = useRef<string | null>(null)
  const latestLoad = useRef(onLoadMore)
  latestLoad.current = onLoadMore

  useEffect(() => {
    if (!hasMore || loading || paused || !sentinel.current || !root.current) return
    let active = true
    const observer = new IntersectionObserver(entries => {
      if (!active || !entries.some(entry => entry.isIntersecting) || requested.current === pageKey) return
      // Observer callbacks can repeat before React renders the loading state.
      requested.current = pageKey
      latestLoad.current()
    }, { root: root.current, rootMargin: '0px 0px 400px 0px' })
    observer.observe(sentinel.current)
    return () => { active = false; observer.disconnect() }
  }, [root, pageKey, hasMore, loading, paused])

  if (!hasMore && !loading) return null
  return <div ref={sentinel} className="flex min-h-10 justify-center py-3" aria-live="polite">
    {loading && <span role="status" className="text-xs text-muted-foreground">{t('hub:loadingModels')}</span>}
  </div>
}
