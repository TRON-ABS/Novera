import { useSyncExternalStore } from 'react'
import { browserRuntime } from '@/services/browser-preview/runtime'
import { browserCatalog } from '@/services/browser-preview/config'
import { useModelProvider } from '@/hooks/useModelProvider'

export function BrowserPreviewNotice() {
  const state = useSyncExternalStore(browserRuntime.subscribe, browserRuntime.snapshot)
  const selected = useModelProvider(store => store.selectedModel)
  const select = useModelProvider(store => store.selectModelProvider)
  const spec = browserCatalog.find(model => model.id === (state.modelId || selected?.id)) ?? browserCatalog[0]
  const busy = state.phase === 'loading' || state.phase === 'generating'
  return <aside aria-label="Novera Web en préparation" className="border-b border-border px-4 py-2 text-xs bg-muted/50 text-foreground shrink-0">
    <div className="flex flex-wrap items-center gap-2">
      <strong>Novera Web · préparation</strong>
      <span>Calcul sur cet appareil · sans clé API</span>
      <span>{spec.name} · {(spec.bytes / 1e9).toFixed(2)} Go au premier chargement</span>
      {state.phase === 'loading' ? <>
        <progress aria-label="Chargement du modèle" max={1} value={state.progress ?? 0} />
        <button className="underline" onClick={() => browserRuntime.cancelLoad()}>Annuler le chargement</button>
      </> : !busy && state.phase !== 'ready' ? <button className="underline" onClick={() => {
        select('llamacpp', spec.id)
        void browserRuntime.load(spec.id).catch(() => {})
      }}>Charger le modèle</button> : <span role="status">{state.phase === 'generating' ? 'Réponse en cours…' : 'Modèle prêt'}</span>}
      <a className="underline ml-auto" href="https://github.com/TRON-ABS/Novera/releases" target="_blank" rel="noreferrer">Novera Desktop</a>
    </div>
    {state.error && <p role="alert" className="text-destructive mt-1">{state.error}</p>}
    <details className="mt-1 text-muted-foreground"><summary className="cursor-pointer">Fonctions et données de cette préparation</summary>
      <p className="mt-1">Les discussions sont conservées dans ce navigateur, sans synchronisation de compte. Choisissez un autre modèle du catalogue depuis le sélecteur Novera. Cette première intégration valide le texte ; voix et pièces jointes restent à adapter. La création d’images, de musique et de vidéos nécessite encore Novera Desktop ou une connexion adaptée.</p>
      <p>Le modèle est téléchargé depuis Hugging Face puis mis en cache localement.{spec.projector ? ' Le modèle principal reste en Q4_K_M ; le projecteur audio est en Q8, format requis par ce moteur Web.' : ''} La mémoire nécessaire dépasse la taille du téléchargement. Le mode hors connexion complet reste à vérifier. <a href={spec.licenseUrl} className="underline" target="_blank" rel="noreferrer">Licence du modèle LiquidAI</a>.</p>
    </details>
  </aside>
}
