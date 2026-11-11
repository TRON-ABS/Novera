/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, Navigate, useSearch } from '@tanstack/react-router'
import { isTauri } from '@tauri-apps/api/core'
import ChatInput from '@/containers/ChatInput'
import { useDesktopAutoTuneEnabled } from '@/containers/AutoTuneControl'
import { getAutoTuneProgress, getInitialAutoTuneProgress, subscribeAutoTuneProgress } from '@/services/creation/auto-tune'
import HeaderPage from '@/containers/HeaderPage'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useTools } from '@/hooks/useTools'
import { cn } from '@/lib/utils'

import { useModelProvider } from '@/hooks/useModelProvider'
import SetupScreen from '@/containers/SetupScreen'
import { route } from '@/constants/routes'
import { hasUsableProvider } from '@/lib/providerReadiness'
import { browserPreviewEnabled } from '@/services/browser-preview/config'

type ThreadModel = {
  id: string
  provider: string
}

type SearchParams = {
  threadModel?: ThreadModel
}
import { useEffect, useSyncExternalStore } from 'react'
import { useThreads } from '@/hooks/useThreads'

export const Route = createFileRoute("/")({
  component: Index,
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    const result: SearchParams = {
      threadModel: search.threadModel as ThreadModel | undefined,
    }

    return result
  },
})

function Index() {
  const { t } = useTranslation()
  const { providers } = useModelProvider()
  const search = useSearch({ from: route.home as any })
  const threadModel = search.threadModel
  const { setCurrentThreadId } = useThreads()
  useTools()

  const autoTuneEnabled = useDesktopAutoTuneEnabled()
  const { active, remaining, total, browserComplete, standby } = useSyncExternalStore(subscribeAutoTuneProgress, getAutoTuneProgress, getInitialAutoTuneProgress)
  const hasValidProviders = hasUsableProvider(providers)

  let heading = t('chat:description')
  if (autoTuneEnabled) {
    if (active) {
      heading = t('ui:autoTuneHomeTesting', {
        model: active.model.split(/[\\/]/).at(-1) || active.model,
        category: t(`chat:creation.${active.task}`),
      })
    } else {
      const status = standby ? 'ui:autoTuneWaiting' : browserComplete ? 'ui:autoTuneBrowserComplete' : remaining === 0
        ? (total > 0 ? 'ui:autoTuneBetweenPasses' : 'ui:autoTuneNoSelection')
        : 'ui:autoTuneWaiting'
      heading = `Auto Tune · ${t(status)}`
    }
  }

  useEffect(() => {
    setCurrentThreadId(undefined)
  }, [setCurrentThreadId])

  if (!hasValidProviders && !browserPreviewEnabled()) {
    if (!isTauri()) {
      return <Navigate to={route.settings.model_providers as any} replace />
    }
    return <SetupScreen />
  }

  return (
    <div className="novera-canvas flex h-full min-h-0 flex-col overflow-hidden" data-chat-workspace>
      <HeaderPage />
      <div
        className={cn(
          'min-h-0 flex-1 flex flex-col px-3 md:px-6'
        )}
      >
        <div
          className={cn(
            'mx-auto flex min-h-0 flex-1 w-full flex-col',
          )}
        >
          <div className={cn('flex min-w-0 items-center justify-center text-center', autoTuneEnabled ? 'shrink-0 py-2' : 'min-h-0 flex-1 overflow-y-auto py-10')}>
            <h1 aria-live="polite"
              className={cn(
                'min-w-0 font-studio font-medium',
                autoTuneEnabled ? 'text-base sm:text-lg leading-snug [overflow-wrap:anywhere]' : 'mt-2 text-2xl',
              )}
            >
              {heading}
            </h1>
          </div>
          <div className="mt-auto flex min-h-0 max-h-full shrink flex-col overflow-y-auto py-4" data-chat-composer-dock>
            <ChatInput
              showSpeedToken={false}
              model={threadModel}
              initialMessage={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
