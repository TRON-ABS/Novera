import { Button } from '@/components/ui/button'
import { useAnalytic } from '@/hooks/useAnalytic'
import { useErrorTracking } from '@/hooks/useErrorTracking'
import { useTranslation } from '@/i18n/react-i18next-compat'

/** A separate decision; accepting usage statistics never answers this question. */
export function ErrorTrackingConsent() {
  const { t } = useTranslation()
  const { analyticsAvailable, analyticsHost } = useAnalytic()
  const setEnabled = useErrorTracking((state) => state.setEnabled)

  return (
    <div data-testid="error-tracking-consent">
      <p className="text-xs text-muted-foreground leading-normal">
        {t(analyticsAvailable ? 'common:errorTracking.summary' : 'common:errorTracking.unavailable', { host: analyticsHost })}
      </p>
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => setEnabled(false)}>
          {t('common:deny')}
        </Button>
        <Button size="sm" disabled={!analyticsAvailable} onClick={() => setEnabled(analyticsAvailable)}>
          {t('common:allow')}
        </Button>
      </div>
    </div>
  )
}
