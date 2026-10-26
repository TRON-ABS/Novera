import { Scan, Images, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { MediaSizeControls } from './MediaSizeControls'
import type { CreationSettings } from '@/hooks/useCreation'
import { inferMediaRatio } from '@/modules/engines/media-size'
import { useTranslation } from '@/i18n/react-i18next-compat'

export function ComposerSizeButton({ kind, settings, setSettings, disabled }: {
  kind: 'ratio' | 'resolution'; settings: CreationSettings
  setSettings: (value: Partial<CreationSettings>) => void; disabled: boolean
}) {
  const { t } = useTranslation()
  const Icon = kind === 'ratio' ? Scan : Images
  return <Popover>
    <PopoverTrigger asChild>
      <Button size="xs" variant="ghost" className="composer-setting composer-dimension" disabled={disabled} aria-label={t(`chat:creation.${kind}`)}>
        <Icon aria-hidden="true" size={16} />
        {kind === 'ratio'
          ? (settings.mediaRatio ?? inferMediaRatio(settings.width, settings.height)).replace(/^custom:/, '')
          : `${settings.width} × ${settings.height}`}
        <ChevronDown aria-hidden="true" size={12} />
      </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[min(380px,calc(100vw-24px))] p-2" align="end">
      <MediaSizeControls settings={settings} setSettings={setSettings} />
    </PopoverContent>
  </Popover>
}
