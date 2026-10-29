import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { Moon, Sun, Monitor, ChevronsUpDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'

export function ThemeSwitcher({
  renderAsRadio = false,
}: {
  renderAsRadio?: boolean
}) {
  const { t } = useTranslation()

  const themeOptions = [
    { value: 'dark', label: t('common:dark'), icon: Moon },
    { value: 'light', label: t('common:light'), icon: Sun },
    { value: 'auto', label: t('common:system'), icon: Monitor },
  ]

  const { setTheme, activeTheme } = useTheme()

  if (renderAsRadio) {
    return (
      <RadioGroup
        value={activeTheme}
        onValueChange={(value) => setTheme(value as 'auto' | 'light' | 'dark')}
        aria-label={t('settings:interface.theme')}
        className="novera-theme-options grid grid-cols-1 sm:grid-cols-3 gap-3"
      >
        {themeOptions.map((item) => (
          <Label
            key={item.value}
            htmlFor={`novera-theme-${item.value}`}
            className="cursor-pointer [&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/5"
          >
            <Card className="novera-theme-card w-full border transition-colors shadow-none">
              <CardContent className="novera-theme-content flex flex-row items-center justify-start gap-4 p-4">
                <RadioGroupItem value={item.value} id={`novera-theme-${item.value}`} />
                <item.icon aria-hidden="true" className="size-5 text-violet-500 dark:text-violet-300" />
                <span className="text-sm font-medium">{item.label}</span>
              </CardContent>
            </Card>
          </Label>
        ))}
      </RadioGroup>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between" title={t('common:editTheme')}>
          {themeOptions.find(
            (item: { value: string; label: string }) => item.value === activeTheme
          )?.label || t('common:auto')}
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="novera-settings-popover">
        {themeOptions.map((item) => (
          <DropdownMenuItem
            key={item.value}
            className={cn(
              'cursor-pointer my-0.5',
              activeTheme === item.value && 'bg-secondary-foreground/8'
            )}
            onClick={() => setTheme(item.value as 'auto' | 'light' | 'dark')}
          >
            {item.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
