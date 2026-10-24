import catalog from './noveraHubCatalog.json'
import type { CatalogModel } from '@/services/models/types'
import type { HardwareData } from '@/hooks/useHardware'
import { selectDefaultQuant } from './models'
import { DEFAULT_MODEL_QUANTIZATIONS } from '@/constants/models'
import { DEFAULT_CTX_LENGTH, estimateModelFit, estimateKvCacheBytes, parseFileSize, sumMlxModelBytes } from './modelCompatibility'
import { isSpecSidecar } from './specDraft'
import { intlLocale } from '@/utils/intlLocale'

export const NOVERA_HUB_MODELS: CatalogModel[] = catalog
export const hubKey = (m: CatalogModel) => `${m.developer ?? ''}/${m.model_name}`.toLowerCase()
export function hubFormatBytes(value: number | null | undefined, locale: string): string {
  if (value == null || value <= 0) return '—'
  return new Intl.NumberFormat(intlLocale(locale), { style: 'unit', unit: value < 1e9 ? 'megabyte' : 'gigabyte', maximumFractionDigits: 2 }).format(value / (value < 1e9 ? 1e6 : 1e9))
}
const family = (m: CatalogModel) => hubKey(m).replace(/-gguf$/i, '')

// Keep the pinned Novera variants if the inherited feed lists the same family.
// Never merge bare model names across publishers (or text and MLX formats).
export function mergeHubCatalog(sources: CatalogModel[]): CatalogModel[] {
  const curated = new Set(NOVERA_HUB_MODELS.map(family))
  return [...NOVERA_HUB_MODELS, ...sources.filter(m => m.is_mlx || !curated.has(family(m)))]
}

export function hubWeight(m: CatalogModel): number | null {
  const size = m.is_mlx ? sumMlxModelBytes(m) : parseFileSize(selectDefaultQuant(m.quants?.filter(q => !isSpecSidecar(q)), DEFAULT_MODEL_QUANTIZATIONS)?.file_size)
  return size && size > 0 ? size : null
}
export function hubMemory(m: CatalogModel): number | null {
  const size = hubWeight(m)
  return size ? size + estimateKvCacheBytes(size, DEFAULT_CTX_LENGTH) : null
}
export function hubSizeMatches(m: CatalogModel, band: string): boolean {
  if (band === 'all') return true
  const size = hubWeight(m)
  if (size === null) return false
  if (band === 'under1') return size < 1e9
  if (band === 'from1to2') return size >= 1e9 && size < 2e9
  if (band === 'from2to4') return size >= 2e9 && size < 4e9
  return size >= 4e9
}
export function sortHubModels(sources: CatalogModel[], sort: string, hardware: HardwareData): CatalogModel[] {
  const weight = (m: CatalogModel) => hubWeight(m) ?? Infinity
  const ranks = { green: 0, yellow: 1, unknown: 2, red: 3 }
  const fit = (m: CatalogModel) => ranks[estimateModelFit(hubWeight(m), DEFAULT_CTX_LENGTH, hardware)]
  return [...sources].sort((a,b) => {
    if (sort === 'adapted') {
      const order = fit(a) - fit(b) || Number(!!b.hub) - Number(!!a.hub) || Number(!!b.hub?.recommended) - Number(!!a.hub?.recommended)
      if (order) return order
    }
    if (sort === 'smallest' || sort === 'adapted') {
      const delta = weight(a) - weight(b)
      return Number.isNaN(delta) ? hubKey(a).localeCompare(hubKey(b)) : delta || hubKey(a).localeCompare(hubKey(b))
    }
    if (sort === 'most-downloaded') return (b.downloads || 0) - (a.downloads || 0)
    const date = (m: CatalogModel) => Number.isFinite(Date.parse(m.created_at ?? '')) ? Date.parse(m.created_at!) : 0
    return date(b) - date(a)
  })
}
