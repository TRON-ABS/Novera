import { useLeftPanel } from '@/hooks/useLeftPanel'
import { cn } from '@/lib/utils'
import { ReactNode, memo } from 'react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { CreationInstallIndicator } from './CreationInstall'
import { useTitlebarLayout } from '@/stores/titlebar-layout-store'

type HeaderPageProps = {
  children?: ReactNode
}
const HeaderPage = memo(function HeaderPage({ children }: HeaderPageProps) {
  const { open } = useLeftPanel()
  const isMobile = useIsMobile()
  // Collapsed, this header owns the top-left strip — indent past left-anchored Linux
  // window controls (size-8 each at left-4); macOS uses the pl-24 class below.
  const leftButtons = useTitlebarLayout((s) => s.layout.left.length)
  const linuxControlsPad =
    !IS_MACOS && !open && leftButtons > 0 ? leftButtons * 32 + 24 : undefined
  // Right-anchored controls (Windows, and Linux DEs that place them there) sit at
  // right-4 above the header — keep header content clear of them at every width.
  const rightButtons = useTitlebarLayout((s) => s.layout.right.length)
  const rightControlsPad = rightButtons > 0 ? rightButtons * 32 + 24 : undefined

  return (
    <div
      className={cn(
        'h-15 flex items-center shrink-0',
        IS_MACOS && !open ? 'pl-24' : ' pl-4',
        children === undefined && 'border-none'
      )}
      style={{
        ...(linuxControlsPad ? { paddingLeft: linuxControlsPad } : {}),
        ...(rightControlsPad ? { paddingRight: rightControlsPad } : {}),
      }}
    >
      <div className={cn('flex items-center w-full gap-1')}>
        {isMobile && (
          <SidebarTrigger className="text-muted-foreground rounded-full relative z-50" />
        )}
        <div className={cn('flex-1 min-w-0')}>{children}</div>
        <CreationInstallIndicator />
      </div>
    </div>
  )
})

export default HeaderPage
