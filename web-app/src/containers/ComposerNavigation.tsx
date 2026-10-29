import { Blocks, FolderPlus, Search, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'
import { useSearchDialog } from '@/hooks/useSearchDialog'
import { useTranslation } from '@/i18n/react-i18next-compat'

export function ComposerNavigation({ side }: { side: 'left' | 'right' }) {
  const { t } = useTranslation()
  const panel = useDashboardPanel(state => state.panel)
  const items = side === 'left' ? [
    { id: 'search', label: t('common:search'), icon: Search,
      onClick: () => useSearchDialog.getState().setOpen(true) },
    { id: 'project', label: t('settings:shortcuts.newProject'), icon: FolderPlus,
      onClick: () => { window.dispatchEvent(new Event('novera-new-workspace-project')) } },
  ] : [
    { id: 'models', label: t('providers:models'), icon: Blocks,
      onClick: () => useDashboardPanel.getState().openPanel('models') },
    { id: 'settings', label: t('common:settings'), icon: Settings,
      onClick: () => useDashboardPanel.getState().openPanel('settings') },
  ]

  return (
    <div className={`composer-navigation-rail composer-navigation-${side}`}>
      {items.map(({ id, label, icon: Icon, onClick }) => (
        <Tooltip key={id}>
          <TooltipTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm"
              className="composer-navigation-button" data-testid={`composer-nav-${id}`}
              aria-label={label} aria-expanded={panel === id} onClick={event => {
                useDashboardPanel.setState({ anchor: event.currentTarget.closest<HTMLElement>('[data-dashboard-composer]') })
                onClick()
              }}>
              <Icon className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent><p>{label}</p></TooltipContent>
        </Tooltip>
      ))}
    </div>
  )
}
