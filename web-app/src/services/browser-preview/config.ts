import catalog from './catalog.json'

/** Opt-in preparation build; never selects a browser backend inside Tauri. */
export function browserPreviewEnabled() {
  return import.meta.env.VITE_NOVERA_WEB_PREVIEW === 'true' &&
    typeof window !== 'undefined' && !('__TAURI_INTERNALS__' in window)
}

export const nativeOmniQ8 = 'LFM3-Omni-2B-Q8_0'
export const browserCatalog = import.meta.env.VITE_NOVERA_PRIVATE_NATIVE_CONVERSATION === 'true'
  ? catalog.map(model => model.id === nativeOmniQ8
    ? { ...model, name: 'LFM3-Omni-2B Q8_0 (local)', browserCapabilities: [] }
    : model)
  : catalog.filter(model => model.id !== nativeOmniQ8)
export type BrowserModelSpec = typeof catalog[number]
export function browserModel(id: string): BrowserModelSpec {
  const spec = browserCatalog.find(model => model.id === id)
  if (!spec) throw new Error('Ce modèle ne dispose pas encore de moteur navigateur validé dans cette préparation.')
  return spec
}
