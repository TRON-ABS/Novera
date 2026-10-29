import { createFileRoute } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import SettingsMenu from '@/containers/SettingsMenu'
import HeaderPage from '@/containers/HeaderPage'
import { Card, CardItem } from '@/containers/Card'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { ThemeSwitcher } from '@/containers/ThemeSwitcher'
import { FontSizeSwitcher } from '@/containers/FontSizeSwitcher'
import { AccentColorPicker } from '@/containers/AccentColorPicker'
import { NotificationPositionSwitcher } from '@/containers/NotificationPositionSwitcher'
import { useInterfaceSettings } from '@/hooks/useInterfaceSettings'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const Route = createFileRoute(route.settings.interface as any)({
  component: InterfaceSettings,
})

function InterfaceSettings() {
  const { t } = useTranslation()
  const {
    resetInterface,
    showTokenSpeed,
    setShowTokenSpeed,
    coloredUserBubble,
    setColoredUserBubble,
    renderHtmlArtifacts,
    setRenderHtmlArtifacts,
    autoGenerateTitle,
    setAutoGenerateTitle,
  } = useInterfaceSettings()

  return (
    <div className="novera-interface flex flex-col h-svh min-w-0 w-full">
      <HeaderPage>
        <div className="flex items-center gap-2 w-full">
          <span className='font-medium text-base font-studio'>{t('common:settings')}</span>
        </div>
      </HeaderPage>
      <div className="novera-settings-layout flex flex-1 min-h-0">
        <SettingsMenu />
        <div className="novera-interface-content p-4 pt-0 min-w-0 w-full overflow-y-auto">
          <div className="mx-auto flex max-w-5xl flex-col gap-5 w-full pb-6">
            <header className="novera-interface-heading">
              <img src="/images/novera-logo.png" alt="" className="size-11 shrink-0" />
              <div>
                <p className="novera-settings-eyebrow">Novera</p>
                <h1 className="font-studio text-2xl font-medium">{t('settings:interface.title')}</h1>
                <p className="mt-1 text-muted-foreground">{t('settings:interface.subtitle')}</p>
              </div>
            </header>
            <Card title={t('common:appearance')}>
              <CardItem
                title={t('settings:interface.theme')}
                description={t('settings:interface.themeDesc')}
                className="flex-col items-start gap-y-3"
                classNameWrapperAction="w-full"
                actions={<ThemeSwitcher renderAsRadio />}
              />
              <CardItem
                title={t('settings:interface.fontSize')}
                description={t('settings:interface.fontSizeDesc')}
                actions={<FontSizeSwitcher />}
              />
              <CardItem
                title={t('settings:interface.accentColor')}
                description={t('settings:interface.accentColorDesc')}
                className="flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-y-2"
                actions={<AccentColorPicker />}
              />
            </Card>
            <Card title={t('settings:interface.conversation')}>
              <CardItem
                title={t('settings:interface.notificationPosition')}
                description={t('settings:interface.notificationPositionDesc')}
                actions={<NotificationPositionSwitcher />}
              />
              <CardItem
                title={t('settings:interface.showTokenSpeed')}
                description={t('settings:interface.showTokenSpeedDesc')}
                actions={
                  <Switch
                    aria-label={t('settings:interface.showTokenSpeed')}
                    checked={showTokenSpeed}
                    onCheckedChange={setShowTokenSpeed}
                  />
                }
              />
              <CardItem
                title={t('settings:interface.coloredUserBubble')}
                description={t('settings:interface.coloredUserBubbleDesc')}
                actions={
                  <Switch
                    aria-label={t('settings:interface.coloredUserBubble')}
                    checked={coloredUserBubble}
                    onCheckedChange={setColoredUserBubble}
                  />
                }
              />
              <CardItem
                title={
                  <span className="inline-flex items-center gap-2">
                    <span>{t('settings:interface.renderHtmlArtifacts')}</span>
                    <span className="text-xs bg-secondary border text-muted-foreground rounded-full py-0.5 px-2">
                      {t('common:experimental')}
                    </span>
                  </span>
                }
                description={t('settings:interface.renderHtmlArtifactsDesc')}
                actions={
                  <Switch
                    aria-label={t('settings:interface.renderHtmlArtifacts')}
                    checked={renderHtmlArtifacts}
                    onCheckedChange={setRenderHtmlArtifacts}
                  />
                }
              />
              <CardItem
                title={t('settings:interface.autoGenerateTitle')}
                description={t('settings:interface.autoGenerateTitleDesc')}
                actions={
                  <Switch
                    aria-label={t('settings:interface.autoGenerateTitle')}
                    checked={autoGenerateTitle}
                    onCheckedChange={setAutoGenerateTitle}
                  />
                }
              />
            </Card>
            <Card title={t('settings:interface.resetToDefault')}>
              <CardItem
                title={t('settings:interface.resetToDefault')}
                description={t('settings:interface.resetToDefaultDesc')}
                actions={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      resetInterface()
                      toast.success(
                        t('settings:interface.resetInterfaceSuccess'),
                        {
                          id: 'reset-interface',
                          description: t(
                            'settings:interface.resetInterfaceSuccessDesc'
                          ),
                        }
                      )
                    }}
                  >
                    {t('common:reset')}
                  </Button>
                }
              />
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
