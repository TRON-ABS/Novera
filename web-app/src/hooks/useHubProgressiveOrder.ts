import { useMemo, useRef } from 'react'
import type { CatalogModel } from '@/services/models/types'
import { hubKey } from '@/lib/hubDiscovery'

/** Keep already displayed rows in place as more sorted batches arrive. */
export function useHubProgressiveOrder(models: CatalogModel[], scope: string) {
  const previous = useRef<{ scope: string; keys: string[] }>({ scope, keys: [] })
  return useMemo(() => {
    const current = new Map(models.map(model => [hubKey(model), model]))
    const keys = previous.current.scope === scope ? previous.current.keys.filter(key => current.has(key)) : []
    const known = new Set(keys)
    for (const key of current.keys()) if (!known.has(key)) keys.push(key)
    previous.current = { scope, keys }
    return keys.map(key => current.get(key)!)
  }, [models, scope])
}
