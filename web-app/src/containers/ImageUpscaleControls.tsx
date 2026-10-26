import { Button } from '@/components/ui/button'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { CreationInstallButton } from './CreationInstall'

export function ImageUpscaleControls() {
  const { t } = useTranslation()
  const state = useImageUpscale()
  const service = useServiceHub()
  const name = `RealESRGAN_x${state.factor}plus.pth`
  return (
    <div className="space-y-2 rounded-lg border p-3 text-xs">
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={state.enabled}
          onChange={(e) => state.setEnabled(e.target.checked)}
        />
        {t('chat:creation.upscaleTitle')}
      </label>
      {state.enabled && (
        <>
          <label className="block space-y-1">
            {t('chat:creation.upscaleFactor')}
            <select
              className="block w-full rounded border bg-background p-2"
              value={state.factor}
              onChange={(e) => state.setFactor(e.target.value === '4' ? 4 : 2)}
            >
              <option value={2}>×2 · RealESRGAN_x2plus</option>
              <option value={4}>×4 · RealESRGAN_x4plus</option>
            </select>
          </label>
          <p className="text-muted-foreground">
            {t('chat:creation.upscaleNote')}
          </p>
          <label className="block space-y-1">
            {t('chat:creation.upscaleModel')}
            <input
              className="block w-full rounded border bg-background p-2"
              readOnly
              value={state.models[state.factor] || state.installedModels[state.factor]}
              placeholder={`${t('chat:creation.auto')} · ${name}`}
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => state.setModel(state.factor, '')}
            >
              {t('chat:creation.auto')}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={async () => {
                const path = await service
                  .dialog()
                  .open({
                    directory: false,
                    multiple: false,
                    filters: [{ name: 'Real-ESRGAN', extensions: ['pth'] }],
                  })
                if (typeof path === 'string') state.setModel(state.factor, path)
              }}
            >
              {t('common:browse')}
            </Button>
          </div>
          <CreationInstallButton variant="upscale" />
        </>
      )}
    </div>
  )
}
