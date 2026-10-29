import { useTranslation } from '@/i18n/react-i18next-compat'
import { normalizeGenerationCount } from '@/modules/engines/generation-count'

export function GenerationCountControl({ value, disabled, onChange }: {
  value?: number
  disabled: boolean
  onChange: (count: number) => void
}) {
  const { t } = useTranslation()
  return (
    <label className="composer-setting inline-flex items-center gap-1 text-xs" title={t('ui:generationCountHint')}>
      {t('ui:generationCount')}
      <select className="rounded border bg-background px-1 py-0.5 tabular-nums"
        aria-label={t('ui:generationCount')} value={normalizeGenerationCount(value)} disabled={disabled}
        onChange={event => onChange(normalizeGenerationCount(Number(event.target.value)))}>
        {Array.from({ length: 10 }, (_, index) => index + 1).map(count => <option key={count} value={count}>{count}</option>)}
      </select>
    </label>
  )
}
