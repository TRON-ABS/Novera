import { useSyncExternalStore } from 'react'
import { browserRuntime, BROWSER_CONTEXT_TOKENS } from '@/services/browser-preview/runtime'
import { browserCatalog } from '@/services/browser-preview/config'
import { useModelProvider } from '@/hooks/useModelProvider'
import { BrowserUpdateNotice } from './BrowserUpdateNotice'

export function BrowserPreviewNotice() {
  const state = useSyncExternalStore(browserRuntime.subscribe, browserRuntime.snapshot)
  const selected = useModelProvider(store => store.selectedModel)
  const select = useModelProvider(store => store.selectModelProvider)
  const spec = browserCatalog.find(model => model.id === (state.modelId || selected?.id)) ?? browserCatalog[0]
  const busy = state.phase === 'loading' || state.phase === 'generating'
  return <aside aria-label="Novera Web en préparation" className="border-b border-border px-4 py-2 text-xs bg-muted/50 text-foreground shrink-0">
    <div className="flex flex-wrap items-center gap-2">
      <strong>Novera Web · préparation</strong>
      <span>Texte sur cet appareil · sans clé API</span>
      <span>{spec.name} · {(spec.bytes / 1e9).toFixed(2)} Go au premier chargement</span>
      <span>Contexte · {BROWSER_CONTEXT_TOKENS.toLocaleString('fr-FR')} tokens</span>
      {state.phase === 'loading' ? <>
        <progress aria-label="Chargement du modèle" max={1} value={state.progress ?? 0} />
        <button className="underline" onClick={() => browserRuntime.cancelLoad()}>Annuler le chargement</button>
      </> : !busy && state.phase !== 'ready' ? <button className="underline" onClick={() => {
        select('llamacpp', spec.id)
        void browserRuntime.load(spec.id).catch(() => {})
      }}>Charger le modèle</button> : <span role="status">{state.phase === 'generating' ? 'Réponse en cours…' : 'Modèle prêt'}</span>}
      <a className="underline ml-auto" href="https://github.com/TRON-ABS/Novera/releases" target="_blank" rel="noreferrer">Novera Desktop</a>
    </div>
    <BrowserUpdateNotice modelBusy={busy} />
    {state.error && <p role="alert" className="text-destructive mt-1">{state.error}</p>}
    <details className="mt-1 text-muted-foreground"><summary className="cursor-pointer">Fonctions et données de cette préparation</summary>
      {state.lastGeneration && <p role="status">Dernier texte · {state.lastGeneration.firstTextMs === undefined ? 'Aucun texte affiché' : `Premier affichage : ${(state.lastGeneration.firstTextMs / 1000).toFixed(2)} s`} · Total : {(state.lastGeneration.totalMs / 1000).toFixed(2)} s{state.lastGeneration.tokensPerSecond === undefined ? '' : ` · ${state.lastGeneration.tokensPerSecond.toFixed(1)} tokens/s`}{state.lastGeneration.completionTokens === undefined ? '' : ` · ${state.lastGeneration.completionTokens} tokens produits`}{state.lastGeneration.cachedTokens === undefined ? '' : ` · ${state.lastGeneration.cachedTokens} tokens réutilisés`}. Mesure après chargement du modèle.</p>}
      <p className="mt-1">Les discussions et fichiers créés sont conservés dans ce navigateur, sans synchronisation de compte. Choisissez un autre modèle depuis le sélecteur Novera. Le texte local fonctionne sans clé API ; voix et pièces jointes restent à adapter.</p>
      <p>Image, musique et vidéo locales : adaptation des moteurs FLUX.2 Klein, ACE-Step et Wan en cours. Les fichiers Desktop GGUF ne disposent pas encore ici de moteur navigateur validé.</p>
      <p>Option cloud : choisissez un modèle fal dans les réglages du format et saisissez votre clé personnelle dans <a href="#/settings/providers/fal" className="underline">les paramètres fal</a>. La clé reste en mémoire pour cette session. Ces créations utilisent le service fal, ses tarifs et ses quotas ; elles ne sont pas exécutées localement. Aucune clé partagée n’est fournie par le site.</p>
      <p>Le modèle est téléchargé depuis Hugging Face puis mis en cache localement.{spec.projector ? ' Le modèle principal reste en Q4_K_M ; le projecteur audio est en Q8, format requis par ce moteur Web.' : ''} La mémoire nécessaire dépasse la taille du téléchargement. Le mode hors connexion complet reste à vérifier. <a href={spec.licenseUrl} className="underline" target="_blank" rel="noreferrer">Licence du modèle LiquidAI</a>.</p>
    </details>
  </aside>
}
