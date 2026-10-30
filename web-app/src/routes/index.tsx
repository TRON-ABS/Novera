/* eslint-disable @typescript-eslint/no-explicit-any */
import { createFileRoute, useSearch } from '@tanstack/react-router'
import ChatInput from '@/containers/ChatInput'
import HeaderPage from '@/containers/HeaderPage'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useTools } from '@/hooks/useTools'
import { cn } from '@/lib/utils'

import { useModelProvider } from '@/hooks/useModelProvider'
import SetupScreen from '@/containers/SetupScreen'
import { route } from '@/constants/routes'
import { hasUsableProvider } from '@/lib/providerReadiness'

type ThreadModel = {
  id: string
  provider: string
}

type SearchParams = {
  threadModel?: ThreadModel
}
import { useEffect } from 'react'
import { useThreads } from '@/hooks/useThreads'

export const Route = createFileRoute(route.home as any)({
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

  const hasValidProviders = hasUsableProvider(providers)

  useEffect(() => {
    setCurrentThreadId(undefined)
  }, [setCurrentThreadId])

  if (!hasValidProviders) {
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
          <div className={cn('min-h-0 overflow-y-auto flex flex-1 items-center justify-center text-center py-10')}>
            <h1
              className={cn(
                'text-2xl mt-2 font-studio font-medium',
              )}
            >
              {t('chat:description')}
            </h1>
          </div>
          <div className="shrink-0 py-4" data-chat-composer-dock>
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
