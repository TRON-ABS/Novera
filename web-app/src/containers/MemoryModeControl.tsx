import { useMemoryPolicy } from '@/hooks/useMemoryPolicy'
import { useTranslation } from '@/i18n/react-i18next-compat'
export function MemoryModeControl({ scope }: { scope: string }) {
  const { t } = useTranslation()
  const { policy, setPolicy, waiting } = useMemoryPolicy()
  if (
    (typeof IS_ANDROID !== 'undefined' && IS_ANDROID) ||
    (typeof IS_IOS !== 'undefined' && IS_IOS)
  )
    return null
  return (
    <details className="text-xs rounded-lg border p-2">
      <summary className="cursor-pointer">
        {t('chat:memory.title')} · {t(`chat:memory.${policy}`)}
        {waiting[scope] && (
          <span role="status"> · {t('chat:memory.waiting')}</span>
        )}
      </summary>
      <div className="mt-2 space-y-2">
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
      </div>
    </details>
  )
}
