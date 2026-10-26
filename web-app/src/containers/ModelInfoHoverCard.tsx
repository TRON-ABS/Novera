import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card'
import { IconDeviceDesktopQuestion } from '@tabler/icons-react'
import type { CatalogModel, ModelQuant } from '@/services/models/types'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useHubDiagnosis } from './HubHardwareDiagnostic'
import { hubFormatBytes } from '@/lib/hubDiscovery'
import { cn } from '@/lib/utils'

interface ModelInfoHoverCardProps {
  model: CatalogModel
  variant?: ModelQuant
  isDefaultVariant?: boolean
  defaultModelQuantizations: readonly string[]
  children?: React.ReactNode
}

/** Share the engine and memory assessment with the pre-download review. */
export const ModelInfoHoverCard = ({ model, variant, isDefaultVariant, children }: ModelInfoHoverCardProps) => {
  const { t, i18n } = useTranslation()
  const diagnosis = useHubDiagnosis(model, variant)
  const label = t(`hub:catalog.${diagnosis.memory}`)
  return <HoverCard openDelay={150}>
    <HoverCardTrigger asChild>{children ?? <button type="button"
      className={cn('inline-flex items-center gap-1 rounded px-2 py-1 text-xs',
        diagnosis.memory === 'fits' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
        diagnosis.memory === 'unknown' ? 'bg-secondary text-muted-foreground' : 'bg-amber-500/10 text-amber-700 dark:text-amber-400')}
      aria-label={`${t('hub:catalog.inspect')}: ${label}`}>
      <IconDeviceDesktopQuestion size={14} />
      {isDefaultVariant && <span>{label}</span>}
    </button>}</HoverCardTrigger>
    <HoverCardContent className="w-80 space-y-3 p-4 text-xs" side="left">
      <p className="font-semibold">{variant?.model_id ?? model.display_name ?? model.model_name}</p>
      <p>{label}</p>
      <p>{t(`hub:catalog.${diagnosis.engineState}`)}</p>
      <p>{t('hub:discovery.memory')}: {hubFormatBytes(diagnosis.requiredBytes, i18n.language)}</p>
      {diagnosis.memory === 'unknown' && <p>{t('hub:catalog.metadataMissing')}</p>}
      <p className="text-muted-foreground">{t('hub:catalog.estimateNote')}</p>
    </HoverCardContent>
  </HoverCard>
}
