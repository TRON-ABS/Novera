import { createFileRoute } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import HeaderPage from '@/containers/HeaderPage'
import SettingsMenu from '@/containers/SettingsMenu'
import { NoveraInstructionsGuide } from '@/containers/NoveraInstructionsGuide'
import { useTranslation } from '@/i18n/react-i18next-compat'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute(route.settings.assistant as any)({
  component: AssistantContent,
})

export function AssistantContent() {
  const { t } = useTranslation()
  return (
    <div className="flex h-svh w-full flex-col">
      <HeaderPage><span className="font-studio text-base font-medium">{t('common:settings')}</span></HeaderPage>
      <div className="flex min-h-0 flex-1">
        <SettingsMenu />
        <div className="min-w-0 flex-1 overflow-y-auto p-4">
          <NoveraInstructionsGuide />
        </div>
      </div>
    </div>
  )
}
