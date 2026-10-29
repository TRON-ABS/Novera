import { useTranslation as useUiLocale } from '@/i18n/react-i18next-compat'
import { ReactNode } from 'react'
import { PlatformFeature } from './types'
import { getUnavailableFeatureMessage } from './utils'
import { PlatformFeatures } from './const'

interface PlatformGuardProps {
  feature: PlatformFeature
  children: ReactNode
  fallback?: ReactNode
  showMessage?: boolean
}

export const PlatformGuard = ({
  feature,
  children,
  fallback,
  showMessage = true,
}: PlatformGuardProps) => {
  const { t: uiT } = useUiLocale()

  const isAvailable = PlatformFeatures[feature] || false

  if (isAvailable) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  if (showMessage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-center p-8">
        <div className="max-w-md">
          <h2 className="text-xl font-semibold mb-4">{uiT('ui:featureNotAvailable')}</h2>
          <p className="text-muted-foreground">
            {getUnavailableFeatureMessage(feature)}
          </p>
        </div>
      </div>
    )
  }

  return null
}
