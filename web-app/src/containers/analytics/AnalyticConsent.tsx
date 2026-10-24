import { Button } from '@/components/ui/button'
import { useAnalytic } from '@/hooks/useAnalytic'
import { useTranslation } from '@/i18n/react-i18next-compat'

/**
 * The analytics consent question with neither a heading nor positioning of its
 * own, so it can be a step on the setup wizard (which supplies its own heading)
 * as well as a floating prompt for users who upgraded past onboarding.
 */
export function AnalyticConsent() {
  const { t } = useTranslation()
  const { setProductAnalyticPrompt, setProductAnalytic, analyticsAvailable, analyticsHost } = useAnalytic()

  const handleProductAnalytics = (isAllowed: boolean) => {
    setProductAnalytic(analyticsAvailable && isAllowed)
    setProductAnalyticPrompt(false)
  }

  return (
    <div data-testid="analytic-consent">
      <p className="text-xs text-muted-foreground leading-normal">
        {t(analyticsAvailable ? 'common:telemetry.summary' : 'common:telemetry.unavailable', { host: analyticsHost })}
      </p>
      <p className="mt-2 text-sm">{t('analyticsConsentQuestion')}</p>
      <div className="mt-4 flex justify-end space-x-2">
        <Button
          data-testid="analytic-deny"
          variant="ghost"
          size="sm"
          onClick={() => handleProductAnalytics(false)}
        >
          {t('deny')}
        </Button>
        <Button
          data-testid="analytic-allow"
          disabled={!analyticsAvailable}
          size="sm"
          onClick={() => handleProductAnalytics(true)}
        >
          {t('allow')}
        </Button>
      </div>
    </div>
  )
}
