import { useSyncExternalStore } from 'react'
import { useWebSearchConfig } from '@/hooks/useWebSearchConfig'
import { browserSearch, BROWSER_SEARCH_ENDPOINT } from '@/services/browser-preview/web-search'

export function BrowserSearchNotice() {
  const enabled = useWebSearchConfig(state => state.webSearchEnabled)
  const provider = useWebSearchConfig(state => state.searchProvider)
  const state = useSyncExternalStore(browserSearch.subscribe, browserSearch.snapshot)
  if (provider === 'duckduckgo') return <div className="flex flex-wrap items-center gap-2 mt-1" aria-label="État de la recherche Internet">
    <span role="status">Internet · DuckDuckGo · {enabled ? 'réponses directes à la demande' : 'désactivé'}</span>
    <span className="text-muted-foreground">Sans clé · recherches envoyées à DuckDuckGo. Réponses directes et sujets associés ; recherche complète et actualité non couvertes. La lecture d’une page dépend de son autorisation CORS.</span>
  </div>
  const label = !enabled ? 'désactivé' : provider !== 'exa' ? 'choisir Exa dans les paramètres' :
    state.phase === 'ready' ? 'connexion prête' : state.phase === 'preparing' ? 'préparation en cours…' :
      state.phase === 'error' ? 'indisponible' : 'en attente'
  return <div className="flex flex-wrap items-center gap-2 mt-1" aria-label="État de la recherche Internet">
    <span role="status">Internet · Exa · {label}{enabled && state.phase === 'ready' && state.preparationMs !== undefined ? ` · préparation ${(state.preparationMs / 1000).toFixed(2)} s` : ''}</span>
    {enabled && provider === 'exa' && state.phase === 'error' && <>
      <span className="text-destructive">{state.error}</span>
      <button className="underline" onClick={() => { void browserSearch.prepare(BROWSER_SEARCH_ENDPOINT).catch(() => {}) }}>Réessayer la connexion</button>
    </>}
    <span className="text-muted-foreground">Sans clé · quota gratuit du fournisseur. Préparer la connexion ne lance aucune recherche. Les requêtes de recherche et les URL à lire sont envoyées à Exa.</span>
  </div>
}
