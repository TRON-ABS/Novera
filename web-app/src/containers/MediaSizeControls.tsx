import type { CreationSettings } from '@/hooks/useCreation'
import {
  fitMediaRatio,
  inferMediaRatio,
  mediaRatios,
  mediaResolutions,
  ratioNumbers,
} from '@/modules/engines/media-size'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { cn } from '@/lib/utils'

export function MediaSizeControls({
  settings,
  setSettings,
}: {
  settings: CreationSettings
  setSettings: (s: Partial<CreationSettings>) => void
}) {
  const { t } = useTranslation()
  let ratio =
    settings.mediaRatio ?? inferMediaRatio(settings.width, settings.height)
  const extent = Math.max(settings.width, settings.height)
  let pair: [number, number]
  try {
    pair = ratioNumbers(ratio)
  } catch {
    pair = [1, 1]
    ratio = 'custom:1:1'
  }
  const custom = ratio.startsWith('custom:')
  const choose = (next: string, resolution = extent) => {
    try {
      setSettings({ ...fitMediaRatio(next, resolution), mediaRatio: next })
    } catch {
      /* Keep the last compatible dimensions while a custom value is incomplete. */
    }
  }
  return (
    <div className="space-y-3 rounded-lg border p-3">
      <div className="space-y-1">
        <p className="text-xs font-medium">{t('chat:creation.ratio')}</p>
        <div
          role="group"
          aria-label={t('chat:creation.ratio')}
          className="flex flex-wrap gap-1"
        >
          {mediaRatios.map((r) => (
            <Button
              key={r}
              size="xs"
              variant="ghost"
              aria-pressed={ratio === r}
              className={cn(
                'border border-transparent',
                ratio === r && 'composer-tool-active'
              )}
              onClick={() => choose(r)}
            >
              {r}
            </Button>
          ))}
          <Button
            size="xs"
            variant="ghost"
            aria-pressed={custom}
            className={cn(
              'border border-transparent',
              custom && 'composer-tool-active'
            )}
            onClick={() =>
              setSettings({ mediaRatio: `custom:${pair[0]}:${pair[1]}` })
            }
          >
            {t('chat:creation.customSize')}
          </Button>
        </div>
        {custom && (
          <div className="flex items-center gap-2">
            {pair.map((value, index) => (
              <label key={index} className="text-xs">
                {t('chat:creation.ratio')} · {index === 0 ? 'X' : 'Y'}
                <input
                  type="number"
                  min={1}
                  max={10000}
                  step={1}
                  value={value}
                  className="ml-2 w-20 rounded border bg-background p-1"
                  onChange={(event) => {
                    const next = [...pair]
                    next[index] = Number(event.target.value)
                    choose(`custom:${next[0]}:${next[1]}`)
                  }}
                />
              </label>
            ))}
          </div>
        )}
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium">{t('chat:creation.resolution')}</p>
        <div
          role="group"
          aria-label={t('chat:creation.resolution')}
          className="flex flex-wrap gap-1"
        >
          {mediaResolutions.map((resolution) => {
            const dims = fitMediaRatio(ratio, resolution),
              active =
                settings.width === dims.width && settings.height === dims.height
            return (
              <Button
                key={resolution}
                size="xs"
                variant="ghost"
                aria-pressed={active}
                className={cn(
                  'border border-transparent',
                  active && 'composer-tool-active'
                )}
                onClick={() => choose(ratio, resolution)}
              >
                {dims.width} × {dims.height}
              </Button>
            )
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {t('chat:creation.sizeAutoNote')} · {settings.width} × {settings.height}{' '}
        px
      </p>
    </div>
  )
}
