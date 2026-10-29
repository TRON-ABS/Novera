import { isOriginalPublisher } from '@/services/models/huggingfaceCatalog'
import catalog from './noveraHubCatalog.json'
import type { CatalogModel, ModelQuant } from '@/services/models/types'
import type { HardwareData, SystemUsage } from '@/hooks/useHardware'
import { selectDefaultQuant } from './models'
import { DEFAULT_MODEL_QUANTIZATIONS } from '@/constants/models'
import { DEFAULT_CTX_LENGTH, parseFileSize, sumMlxModelBytes } from './modelCompatibility'
import { diagnoseHubModel, estimateHubMemory, estimateHubKvCache, type HubHardware } from '@/modules/engines/hub-catalog'
import { isSpecSidecar, pickSpecSibling } from './specDraft'
import { intlLocale } from '@/utils/intlLocale'

export const NOVERA_HUB_MODELS: CatalogModel[] = catalog
export const hubKey = (m: CatalogModel) => `${m.developer ?? ''}/${m.model_name}`.toLowerCase()
export function hubFormatBytes(value: number | null | undefined, locale: string): string {
  if (value == null || value <= 0) return '—'
  return new Intl.NumberFormat(intlLocale(locale), { style: 'unit', unit: value < 1e9 ? 'megabyte' : 'gigabyte', maximumFractionDigits: 2 }).format(value / (value < 1e9 ? 1e6 : 1e9))
}
const family = (m: CatalogModel) => {
  const repo = m.hub?.repo ?? m.model_name
  const parts = repo.split('/')
  return `${parts.length > 1 ? parts[0] : m.developer ?? ''}/${parts.at(-1)}`.replace(/-gguf$/i, '').toLowerCase()
}

// Keep the pinned Novera variants if the inherited feed lists the same family.
// Never merge bare model names across publishers (or text and MLX formats).
export function mergeHubCatalog(sources: CatalogModel[]): CatalogModel[] {
  const curated = new Set(NOVERA_HUB_MODELS.map(family))
  return [...NOVERA_HUB_MODELS, ...sources.filter(m => m.is_mlx || !curated.has(family(m)))]
}

export function hubWeight(m: CatalogModel): number | null {
  if ((m.is_mlx || !m.quants?.length) && m.safetensors_files?.some(file => !parseFileSize(file.file_size))) return null
  const size = m.is_mlx || (!m.quants?.length && m.safetensors_files?.length) ? sumMlxModelBytes(m) : parseFileSize(selectDefaultQuant(m.quants?.filter(q => !isSpecSidecar(q)), DEFAULT_MODEL_QUANTIZATIONS)?.file_size)
  return size && size > 0 ? size : null
}
/** Use the same live capacity for Hub ranking and per-variant diagnosis. */
export function hubHardwareSnapshot(hardware: HardwareData, usage?: SystemUsage): HubHardware {
  const MiB = 1024 ** 2
  return {
    platform: hardware.os_type,
    ramBytes: hardware.total_memory > 0 ? hardware.total_memory * MiB : null,
    availableRamBytes: usage && usage.total_memory > 0
      ? Math.max(0, Math.min(hardware.total_memory || usage.total_memory, usage.total_memory) - usage.used_memory) * MiB
      : null,
    gpus: hardware.gpus.filter(gpu => gpu.activated !== false).map(gpu => {
      const live = usage?.gpus.find(item => item.uuid === gpu.uuid)
      return {
        name: gpu.name, vendor: gpu.vendor, totalBytes: gpu.total_memory * MiB,
        computeCapability: gpu.nvidia_info?.compute_capability,
        sharedMemory: /integrated/i.test(gpu.vulkan_info?.device_type ?? '') ||
          (hardware.os_type === 'macos' && hardware.cpu.arch === 'aarch64'),
        ...(live && live.total_memory > 0 ? { availableBytes: Math.max(0, Math.min(gpu.total_memory, live.total_memory) - live.used_memory) * MiB } : {}),
      }
    }),
  }
}

export function hubMemoryOptions(model: CatalogModel, variant?: Partial<ModelQuant>, context = DEFAULT_CTX_LENGTH) {
  const selected = variant?.path
    ? model.quants?.find(quant => quant.path === variant.path) ?? variant
    : selectDefaultQuant(model.quants?.filter(quant => !isSpecSidecar(quant)), DEFAULT_MODEL_QUANTIZATIONS)
  const projector = model.mmproj_models?.find(file => file.model_id.toLowerCase() === 'mmproj-f16') ?? model.mmproj_models?.[0]
  const draft = selected?.model_id && selected.path && selected.file_size
    ? pickSpecSibling(model.specQuants ?? model.quants, selected as ModelQuant) : undefined
  const projectorBytes = projector ? parseFileSize(projector.file_size) : 0
  const draftBytes = draft ? parseFileSize(draft.quant.file_size) : 0
  return {
    weightsBytes: selected ? parseFileSize(selected.file_size) : hubWeight(model),
    variantPath: selected?.path,
    projectorBytes: projectorBytes === null || draftBytes === null ? null : projectorBytes + draftBytes,
    context,
  }
}

export function hubMemory(m: CatalogModel): number | null {
  const options = hubMemoryOptions(m)
  return estimateHubMemory(options.weightsBytes, options.context, options.projectorBytes, estimateHubKvCache(m, options.context))
}
export const HUB_SIZE_BANDS = [
  { id: 'under1', min: 0, max: 1 },
  { id: 'from1to2', min: 1, max: 2 },
  { id: 'from2to4', min: 2, max: 4 },
  { id: 'from4to8', min: 4, max: 8 },
  { id: 'from8to16', min: 8, max: 16 },
  { id: 'from16to32', min: 16, max: 32 },
  { id: 'from32to64', min: 32, max: 64 },
  { id: 'from64to128', min: 64, max: 128 },
  { id: 'from128to256', min: 128, max: 256 },
  { id: 'from256to500', min: 256, max: 500 },
  { id: 'over500', min: 500, max: Infinity },
] as const

export function hubSizeMatches(m: CatalogModel, band: string): boolean {
  if (band === 'all') return true
  const size = hubWeight(m)
  if (size === null) return false
  // Retain the old broad band for saved callers, but reject invalid filters.
  if (band === 'over4') return size >= 4e9
  const range = HUB_SIZE_BANDS.find(range => range.id === band)
  return !!range && size >= range.min * 1e9 && size < range.max * 1e9
}
export function sortHubModels(sources: CatalogModel[], sort: string, hardware: HardwareData, usage?: SystemUsage): CatalogModel[] {
  const weight = (m: CatalogModel) => hubWeight(m) ?? Infinity
  const ranks = { fits: 0, tight: 1, unknown: 2, insufficient: 3 }
  const snapshot = sort === 'adapted' ? hubHardwareSnapshot(hardware, usage) : null
  const fit = (m: CatalogModel) => {
    const diagnosis = diagnoseHubModel(m, snapshot!, hubMemoryOptions(m))
    if (diagnosis.engineState === 'platform') return 5
    if (diagnosis.engineState === 'planned') return 4
    return ranks[diagnosis.memory]
  }
  // Diagnose once per model rather than on every comparator invocation.
  const fits = sort === 'adapted' ? new Map(sources.map(m => [m, fit(m)])) : new Map<CatalogModel, number>()
  const date = (m: CatalogModel) => {
    for (const value of [m.created_at, m.updated_at]) {
      const parsed = Date.parse(value ?? '')
      if (Number.isFinite(parsed)) return parsed
    }
    return 0
  }
  return [...sources].sort((a,b) => {
    if (sort === 'smallest') {
      const delta = weight(a) - weight(b)
      return (Number.isNaN(delta) ? 0 : delta) || hubKey(a).localeCompare(hubKey(b))
    }
    if (sort === 'most-downloaded') return (b.downloads || 0) - (a.downloads || 0) || hubKey(a).localeCompare(hubKey(b))
    if (sort === 'newest') return date(b) - date(a) || hubKey(a).localeCompare(hubKey(b))
    if (sort === 'adapted' && fits.get(a) !== fits.get(b)) return fits.get(a)! - fits.get(b)!
    const owner = (model: CatalogModel) => model.hub?.repo.split('/')[0] ?? model.developer
    const publisherOrder = Number(isOriginalPublisher(owner(b))) - Number(isOriginalPublisher(owner(a)))
    if (publisherOrder) return publisherOrder
    if (sort === 'adapted') {
      const order = Number(!!b.hub) - Number(!!a.hub) || Number(!!b.hub?.recommended) - Number(!!a.hub?.recommended)
      if (order) return order
    }
    if (sort === 'adapted') {
      const delta = weight(a) - weight(b)
      return Number.isNaN(delta) ? hubKey(a).localeCompare(hubKey(b)) : delta || hubKey(a).localeCompare(hubKey(b))
    }
    return date(b) - date(a)
  })
}
