import { Clock3, ChevronDown } from 'lucide-react'
import type { CreationSettings } from '@/hooks/useCreation'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { musicDurationFromPrompt } from '@/modules/engines/music'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

export function VideoDurationControl({ settings, setSettings, disabled, prompt = '' }: {
  settings: CreationSettings
  setSettings: (value: Partial<CreationSettings>) => void
  disabled: boolean
  prompt?: string
}) {
  const { t } = useTranslation()
  const autoDuration = settings.durationAuto !== false
  const requestedDuration = autoDuration ? musicDurationFromPrompt(prompt) : undefined
  const seconds = requestedDuration ?? settings.durationSeconds ?? 5
  const [draft, setDraft] = useState<string>()
  const format = (value: number) => value >= 3600
    ? t('common:duration.hours', { count: value / 3600 })
    : value >= 60 && value % 60 === 0
      ? t('common:duration.minutes', { count: value / 60 })
      : t('common:duration.seconds', { count: value })
  const update = (value: number) => {
    if (Number.isFinite(value)) setSettings({ durationSeconds: value, durationAuto: false })
  }
  return <Popover>
    <PopoverTrigger asChild>
      <Button className="composer-setting" variant="ghost" size="xs" disabled={disabled}
        aria-label={`${t('chat:creation.videoDuration')}: ${format(seconds)}`}>
        <Clock3 size={14} aria-hidden="true" />{autoDuration && `${t('chat:creation.auto')} · `}{format(seconds)}<ChevronDown size={12} aria-hidden="true" />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-72 space-y-3" align="end">
      <label className="flex items-center justify-between gap-3 text-sm">
        {t('chat:creation.auto')}
        <Switch aria-label={`${t('chat:creation.videoDuration')} · ${t('chat:creation.auto')}`}
          checked={autoDuration} disabled={disabled}
          onCheckedChange={(durationAuto) => { setDraft(undefined); setSettings({ durationAuto }) }} />
      </label>
      <label className="block space-y-1 text-sm">
        {t('chat:creation.videoDuration')} · {format(1)} – {format(3600)}
        <input aria-label={t('chat:creation.videoDuration')} className="w-full rounded border bg-background p-2"
          type="number" inputMode="numeric" min={1} max={3600} step={1} value={draft ?? seconds} disabled={disabled}
          aria-invalid={!Number.isSafeInteger(seconds) || seconds < 1 || seconds > 3600}
          onBlur={() => setDraft(undefined)}
          onChange={(event) => { setDraft(event.target.value); update(Number(event.target.value)) }} />
      </label>
      <div className="flex flex-wrap gap-1">
        {[1, 3, 5, 10, 30, 60, 300, 600, 1800, 3600].map((value) => <Button key={value}
          variant={seconds === value ? 'default' : 'outline'} size="xs" disabled={disabled}
          onClick={() => { setDraft(undefined); update(value) }}>{format(value)}</Button>)}
      </div>
      <p className="text-xs text-muted-foreground">{t('chat:creation.videoDurationNote')}</p>
    </PopoverContent>
  </Popover>
}
