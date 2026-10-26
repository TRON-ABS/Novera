import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { Database, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
export function MemoryModeControl({ scope }: { scope: string }) {
  const { t } = useTranslation()
  const { policy, setPolicy, waiting } = useMemoryPolicy()
  if (
    (typeof IS_ANDROID !== 'undefined' && IS_ANDROID) ||
    (typeof IS_IOS !== 'undefined' && IS_IOS)
  )
    return null
  return (
    <Popover>
      <PopoverTrigger asChild>
      <Button size="xs" variant="ghost" className="composer-memory min-w-0 max-w-44" aria-label={t('chat:memory.title')} title={`${t('chat:memory.title')} · ${t(`chat:memory.${policy}`)}`}>
        <Database size={14} aria-hidden="true" />
        <span className="min-w-0 truncate">{t('chat:memory.compactTitle', { defaultValue: t('chat:memory.title') })}</span>
        <span className="composer-memory-state shrink-0" data-active={policy === 'auto'} aria-hidden="true">● {policy === 'auto' ? 'ON' : 'OFF'}</span>
        <ChevronDown size={12} aria-hidden="true" />
        {waiting[scope] && (
          <span role="status" className="max-w-20 shrink-0 truncate"> · {t('chat:memory.waiting')}</span>
        )}
      </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 space-y-2 text-xs">
        <select
          className="w-full border rounded bg-background p-2"
          aria-label={t('chat:memory.title')}
          value={policy}
          onChange={(event) =>
            setPolicy(event.target.value === 'manual' ? 'manual' : 'auto')
          }
        >
          <option value="auto">{t('chat:memory.auto')}</option>
          <option value="manual">{t('chat:memory.manual')}</option>
        </select>
        <p>{t(`chat:memory.${policy}Note`)}</p>
        <p className="text-muted-foreground">{t('chat:memory.preserve')}</p>
      </PopoverContent>
    </Popover>
  )
}
