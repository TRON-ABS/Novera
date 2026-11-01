import { useTranslation } from '@/i18n/react-i18next-compat'

/** Explicit diagnostic field labels, already translated in all 80 catalogs. */
export function ErrorTrackingDetails() {
  const { t } = useTranslation()
  return <p className="mt-2 text-xs text-muted-foreground">
    {t('common:errorDialog.details')}: {t('settings:hardware.version')} · {t('settings:hardware.os')} · {t('settings:hardware.architecture')} · {t('hub:catalog.engine')} · {t('chat:creation.output')}
  </p>
}
