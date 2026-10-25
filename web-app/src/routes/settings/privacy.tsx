import { createFileRoute } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import SettingsMenu from '@/containers/SettingsMenu'
import HeaderPage from '@/containers/HeaderPage'
import { Switch } from '@/components/ui/switch'
import { Card, CardItem } from '@/containers/Card'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useAnalytic } from '@/hooks/useAnalytic'
import { useErrorTracking } from '@/hooks/useErrorTracking'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute(route.settings.privacy as any)({
  component: Privacy,
})

function Privacy() {
  const { t } = useTranslation()
  const { setProductAnalytic, productAnalytic, analyticsAvailable, analyticsHost } = useAnalytic()
  const { enabled: errorTracking, setEnabled: setErrorTracking } = useErrorTracking()

  return (
    <div className="flex flex-col h-svh w-full">
      <HeaderPage>
        <div className="flex items-center gap-2 w-full">
          <span className='font-medium text-base font-studio'>{t('common:settings')}</span>
        </div>
      </HeaderPage>
      <div className="flex h-[calc(100%-60px)]">
        <SettingsMenu />
        <div className="p-4 pt-0 w-full overflow-y-auto">
          <div className="flex flex-col justify-between gap-4 gap-y-3 w-full">
            <Card
              header={
                <div className="flex items-center justify-between mb-4">
                  <h1 className="font-medium text-foreground text-base">
                    {t('settings:privacy.analytics')}
                  </h1>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={analyticsAvailable && productAnalytic}
                      disabled={!analyticsAvailable}
                      onCheckedChange={(state) => {
                        setProductAnalytic(analyticsAvailable && state)
                      }}
                    />
                  </div>
                </div>
              }
            >
              <CardItem
                title={t('settings:privacy.helpUsImprove')}
                description={<p>{t(analyticsAvailable ? 'common:telemetry.summary' : 'common:telemetry.unavailable', { host: analyticsHost })}</p>}
                align="start"
              />
            </Card>
            <Card header={
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-medium text-foreground text-base" id="error-tracking-label">
                  {t('common:errorTracking.title')}
                </h2>
                <Switch
                  aria-labelledby="error-tracking-label"
                  checked={analyticsAvailable && errorTracking}
                  disabled={!analyticsAvailable}
                  onCheckedChange={(enabled) => setErrorTracking(analyticsAvailable && enabled)}
                />
              </div>
            }>
              <CardItem description={<p>{t(analyticsAvailable ? 'common:errorTracking.summary' : 'common:errorTracking.unavailable', { host: analyticsHost })}</p>} align="start" />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
