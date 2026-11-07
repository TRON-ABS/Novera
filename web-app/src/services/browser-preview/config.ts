import catalog from './catalog.json'

/** Opt-in preparation build; never selects a browser backend inside Tauri. */
export function browserPreviewEnabled() {
  return import.meta.env.VITE_NOVERA_WEB_PREVIEW === 'true' &&
    typeof window !== 'undefined' && !('__TAURI_INTERNALS__' in window)
}

export const browserCatalog = catalog
export type BrowserModelSpec = typeof catalog[number]
export function browserModel(id: string): BrowserModelSpec {
  const spec = catalog.find(model => model.id === id)
  if (!spec) throw new Error('Ce modèle ne dispose pas encore de moteur navigateur validé dans cette préparation.')
  return spec
}
