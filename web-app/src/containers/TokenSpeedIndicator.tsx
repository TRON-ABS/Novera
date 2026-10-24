import { memo } from 'react'
import { toNumber } from '@/utils/number'
import { Gauge } from 'lucide-react'
import { useInterfaceSettings } from '@/hooks/useInterfaceSettings'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { intlLocale } from '@/utils/intlLocale'
import { ActionTooltip } from '@/components/ActionTooltip'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

interface TokenUsage {
  inputTokens?: number
  outputTokens?: number
  totalTokens?: number
}

interface TokenSpeedMeta {
  tokenSpeed: number
  promptSpeed?: number
  tokenCount?: number
  durationMs?: number
}

interface TokenSpeedIndicatorProps {
  metadata?: Record<string, unknown>
  streaming?: boolean
}

export const TokenSpeedIndicator = memo(
  ({ metadata, streaming }: TokenSpeedIndicatorProps) => {
    const showTokenSpeed = useInterfaceSettings((s) => s.showTokenSpeed)
    const { t, i18n } = useTranslation()
    const numbers = new Intl.NumberFormat(intlLocale(i18n?.language ?? 'en'), { maximumFractionDigits: 2 })
    const rate = (value: number) => `${numbers.format(value)} ${t('chat:messageStats.perSecond')}`

    const nonStreamingAssistantParam =
      typeof metadata?.assistant === 'object' &&
      metadata?.assistant !== null &&
      'parameters' in metadata.assistant
        ? (metadata.assistant as { parameters?: { stream?: boolean } })
            .parameters?.stream === false
        : undefined

    if (nonStreamingAssistantParam) return null
    if (streaming) return null

    const persisted = metadata?.tokenSpeed as TokenSpeedMeta | undefined
    const usage = metadata?.usage as TokenUsage | undefined
    const rawSpeed = toNumber(persisted?.tokenSpeed ?? 0)
    const displaySpeed = Math.round(rawSpeed)
    const displayTokenCount = usage?.outputTokens ?? persisted?.tokenCount ?? 0
    const promptSpeed = persisted?.promptSpeed

    if (displaySpeed === 0 && displayTokenCount === 0) return null

    return (
      <Popover>
        <ActionTooltip label={t('chat:messageStats.details')}>
        <PopoverTrigger asChild>
          <button
            type="button"
            aria-label={t('chat:messageStats.details')}
            className="inline-flex items-center gap-2 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors"
          >
            <Gauge size={16} aria-hidden="true" />
            {showTokenSpeed && displaySpeed > 0 && <span>{rate(displaySpeed)}</span>}
            {showTokenSpeed && displayTokenCount > 0 && (
              <span>({t('chat:messageStats.tokens')}: {numbers.format(displayTokenCount)})</span>
            )}
          </button>
        </PopoverTrigger>
        </ActionTooltip>
        <PopoverContent align="start" className="w-auto p-3 text-xs">
          <div className="flex flex-col gap-1">
            {rawSpeed > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t('chat:messageStats.generation')}</span>
                <span className="font-mono">{rate(rawSpeed)}</span>
              </div>
            )}
            {promptSpeed && promptSpeed > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t('chat:messageStats.reading')}</span>
                <span className="font-mono">{rate(promptSpeed)}</span>
              </div>
            )}
            {displayTokenCount > 0 && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-muted-foreground">{t('chat:messageStats.tokens')}</span>
                <span className="font-mono">{numbers.format(displayTokenCount)}</span>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    )
  }
)

export default memo(TokenSpeedIndicator)
